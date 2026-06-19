import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Shield, Eye, EyeOff } from 'lucide-react'
import api from '../../lib/api'
import { useAuth } from '../../context/AuthContext'

export default function SecureDocumentViewer({ lessonId, material, onClose }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [blobUrl, setBlobUrl] = useState(null)
  const [blurred, setBlurred] = useState(false)
  const [pdfLoaded, setPdfLoaded] = useState(false)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [scale, setScale] = useState(1.5)

  const canvasRef = useRef(null)
  const pdfDocRef = useRef(null)

  const isPDF = material.mimeType === 'application/pdf'
  const isImage = material.mimeType?.startsWith('image/')

  const watermark = useMemo(
    () => `${user?.name ?? ''} · ${user?.email ?? ''} · ${new Date().toLocaleDateString('es-PE')}`,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user?.name, user?.email],
  )

  // Fetch file as authenticated blob
  useEffect(() => {
    let objectUrl = null
    api
      .get(`/lessons/${lessonId}/materials/${material.id}/stream`, { responseType: 'blob' })
      .then((res) => {
        objectUrl = URL.createObjectURL(res.data)
        setBlobUrl(objectUrl)
      })
      .catch(() => setError('No se pudo cargar el documento'))
      .finally(() => setLoading(false))
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [lessonId, material.id])

  // Load PDF with pdfjs-dist — fixed cleanup to prevent t.destroy race condition
  useEffect(() => {
    if (!blobUrl || !isPDF) return
    let cancelled = false

    const load = async () => {
      try {
        const pdfjs = await import('pdfjs-dist')
        if (cancelled) return
        if (!pdfjs.GlobalWorkerOptions.workerSrc) {
          pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
        }
        const res = await fetch(blobUrl)
        if (cancelled) return
        const buf = await res.arrayBuffer()
        if (cancelled) return
        const doc = await pdfjs.getDocument({ data: buf }).promise
        if (cancelled) {
          try { doc.destroy() } catch { /* ignore */ }
          return
        }
        pdfDocRef.current = doc
        setTotalPages(doc.numPages)
        setPdfLoaded(true)
      } catch {
        if (!cancelled) setError('Error al procesar el PDF')
      }
    }

    load()

    return () => {
      cancelled = true
      setPdfLoaded(false)
      // Clear ref immediately before destroying to prevent renderPage from using a dead doc
      const doc = pdfDocRef.current
      pdfDocRef.current = null
      if (doc && typeof doc.destroy === 'function') {
        try { doc.destroy() } catch { /* ignore */ }
      }
    }
  }, [blobUrl, isPDF])

  // Render PDF page and bake watermark directly into canvas pixels
  const renderPage = useCallback(async (pageNum, currentScale, wm) => {
    if (!pdfDocRef.current || !canvasRef.current) return
    try {
      const page = await pdfDocRef.current.getPage(pageNum)
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      const viewport = page.getViewport({ scale: currentScale })
      canvas.width = viewport.width
      canvas.height = viewport.height
      await page.render({ canvasContext: ctx, viewport }).promise

      // Bake user-identifying watermark into the canvas — visible in any screenshot
      if (wm && canvas) {
        ctx.save()
        ctx.globalAlpha = 0.07
        ctx.fillStyle = '#1e1b4b'
        ctx.font = `bold ${Math.round(12 * currentScale)}px Arial, sans-serif`
        const tw = ctx.measureText(wm).width
        const sx = tw + 50 * currentScale
        const sy = 65 * currentScale
        for (let row = 0; row * sy < canvas.height + sy; row++) {
          const offset = (row % 2 === 0 ? 0 : sx / 2)
          for (let col = -1; col * sx < canvas.width + sx; col++) {
            ctx.save()
            ctx.translate(col * sx + offset, row * sy)
            ctx.rotate(-Math.PI / 8)
            ctx.fillText(wm, 0, 0)
            ctx.restore()
          }
        }
        ctx.restore()
      }
    } catch { /* component unmounted or pdf destroyed — safe to ignore */ }
  }, [])

  useEffect(() => {
    if (pdfLoaded) renderPage(currentPage, scale, watermark)
  }, [pdfLoaded, currentPage, scale, renderPage, watermark])

  // Blur on visibility loss (Alt+Tab, screenshot tool opening, etc.)
  useEffect(() => {
    const onHide = () => setBlurred(true)
    const onShow = () => setBlurred(false)
    document.addEventListener('visibilitychange', () => { if (document.hidden) onHide() })
    window.addEventListener('blur', onHide)
    window.addEventListener('focus', onShow)
    return () => {
      document.removeEventListener('visibilitychange', onHide)
      window.removeEventListener('blur', onHide)
      window.removeEventListener('focus', onShow)
    }
  }, [])

  // Block Ctrl+P, Ctrl+S, PrintScreen; also inject print-blocking style
  useEffect(() => {
    const style = document.createElement('style')
    style.id = 'secure-doc-no-print'
    style.textContent = '@media print { body { display: none !important; } }'
    document.head.appendChild(style)

    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && ['p', 's', 'a'].includes(e.key.toLowerCase())) {
        e.preventDefault()
        e.stopPropagation()
      }
      if (e.key === 'PrintScreen') {
        e.preventDefault()
        setBlurred(true)
        setTimeout(() => setBlurred(false), 2500)
      }
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey, true)
    // keyup for PrintScreen (some browsers fire only on keyup)
    const onKeyUp = (e) => {
      if (e.key === 'PrintScreen') {
        setBlurred(true)
        setTimeout(() => setBlurred(false), 2500)
      }
    }
    document.addEventListener('keyup', onKeyUp, true)

    return () => {
      document.getElementById('secure-doc-no-print')?.remove()
      document.removeEventListener('keydown', onKey, true)
      document.removeEventListener('keyup', onKeyUp, true)
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 bg-zinc-950 flex flex-col"
      onContextMenu={(e) => e.preventDefault()}
      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="bg-indigo-500/20 p-1.5 rounded-lg shrink-0">
            <Shield size={16} className="text-indigo-400" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{material.originalName}</p>
            <p className="text-xs text-zinc-500">Modo de visualización segura · Descarga no permitida</p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {isPDF && pdfLoaded && (
            <>
              <button
                onClick={() => setScale((s) => Math.max(0.5, +(s - 0.25).toFixed(2)))}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg transition-colors"
                title="Reducir zoom"
              >
                <ZoomOut size={15} />
              </button>
              <span className="text-xs text-zinc-400 w-11 text-center select-none">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={() => setScale((s) => Math.min(3, +(s + 0.25).toFixed(2)))}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg transition-colors"
                title="Aumentar zoom"
              >
                <ZoomIn size={15} />
              </button>
              <div className="w-px h-5 bg-zinc-800 mx-1" />
            </>
          )}
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg transition-colors"
            title="Cerrar"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-auto relative" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
        {/* Blur overlay on window/focus loss */}
        {blurred && (
          <div
            className="absolute inset-0 z-30 bg-zinc-900/95 backdrop-blur-2xl flex flex-col items-center justify-center cursor-pointer"
            onClick={() => setBlurred(false)}
          >
            <EyeOff size={48} className="text-zinc-600 mb-4" />
            <p className="text-zinc-300 font-semibold text-lg">Contenido protegido</p>
            <p className="text-zinc-500 text-sm mt-1">Haz clic aquí para continuar</p>
          </div>
        )}

        {/* CSS watermark overlay (secondary layer — canvas watermark is the primary) */}
        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
          {Array.from({ length: 24 }).map((_, i) => (
            <span
              key={i}
              className="absolute text-white whitespace-nowrap font-medium"
              style={{
                fontSize: '11px',
                opacity: 0.04,
                top: `${(i % 6) * 18 + 2}%`,
                left: `${Math.floor(i / 6) * 30 - 8}%`,
                transform: 'rotate(-35deg)',
                letterSpacing: '0.02em',
              }}
            >
              {watermark}
            </span>
          ))}
        </div>

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-zinc-400 text-sm">Cargando documento...</p>
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="flex justify-center p-6">
            {isPDF && (
              <>
                {!pdfLoaded && (
                  <div className="flex items-center justify-center min-h-64">
                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                <canvas
                  ref={canvasRef}
                  className="shadow-2xl max-w-full"
                  style={{ display: pdfLoaded ? 'block' : 'none' }}
                  draggable={false}
                />
              </>
            )}

            {isImage && blobUrl && (
              <img
                src={blobUrl}
                alt={material.originalName}
                className="max-w-full max-h-[80vh] object-contain shadow-2xl rounded"
                draggable={false}
              />
            )}

            {!isPDF && !isImage && (
              <div className="flex flex-col items-center justify-center min-h-64 text-center">
                <Eye size={40} className="text-zinc-600 mb-4" />
                <p className="text-zinc-400 font-medium">Vista previa no disponible</p>
                <p className="text-zinc-600 text-sm mt-1">
                  Este tipo de archivo no puede visualizarse en el navegador.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* PDF pagination footer */}
      {isPDF && pdfLoaded && totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 py-3 bg-zinc-900 border-t border-zinc-800 shrink-0">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="p-1.5 text-zinc-400 hover:text-white disabled:opacity-30 rounded-lg transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm text-zinc-400 select-none">
            <span className="text-white font-medium">{currentPage}</span>
            {' / '}
            <span className="text-white font-medium">{totalPages}</span>
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="p-1.5 text-zinc-400 hover:text-white disabled:opacity-30 rounded-lg transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  )
}
