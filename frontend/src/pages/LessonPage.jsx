import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import toast from 'react-hot-toast'
import {
  ArrowLeft, Video, ExternalLink, Edit2, Save, X, Upload,
  FileText, Download, Trash2, File, Image, RefreshCw,
} from 'lucide-react'

// ── File type helpers ─────────────────────────────────────────────────────────
function fileIcon(mimeType) {
  if (mimeType?.startsWith('image/')) return <Image size={16} className="text-blue-400" />
  if (mimeType === 'application/pdf') return <FileText size={16} className="text-red-400" />
  return <File size={16} className="text-zinc-400" />
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ── Materials Section ─────────────────────────────────────────────────────────
function MaterialsSection({ lessonId, isOwner }) {
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState({})
  const fileInputRef = useRef(null)

  useEffect(() => {
    api.get(`/lessons/${lessonId}/materials`)
      .then((res) => setMaterials(Array.isArray(res.data) ? res.data : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [lessonId])

  async function handleFileUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const { data } = await api.post(`/lessons/${lessonId}/materials`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setMaterials((prev) => [data, ...prev])
      toast.success('Material subido exitosamente')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al subir el archivo')
    } finally {
      setUploading(false)
    }
  }

  async function handleDownload(material) {
    try {
      const response = await api.get(`/lessons/${lessonId}/materials/${material.id}/download`, {
        responseType: 'blob',
      })
      const url = URL.createObjectURL(response.data)
      const a = document.createElement('a')
      a.href = url
      a.download = material.originalName
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Error al descargar el archivo')
    }
  }

  async function handleDelete(materialId) {
    if (!confirm('¿Eliminar este material?')) return
    setDeleting((d) => ({ ...d, [materialId]: true }))
    try {
      await api.delete(`/lessons/${lessonId}/materials/${materialId}`)
      setMaterials((prev) => prev.filter((m) => m.id !== materialId))
      toast.success('Material eliminado')
    } catch {
      toast.error('Error al eliminar')
    } finally {
      setDeleting((d) => ({ ...d, [materialId]: false }))
    }
  }

  function canPreview(material) {
    return material.mimeType?.startsWith('image/') || material.mimeType === 'application/pdf'
  }

  async function handlePreview(material) {
    try {
      const response = await api.get(`/lessons/${lessonId}/materials/${material.id}/download`, {
        responseType: 'blob',
      })
      const url = URL.createObjectURL(response.data)
      window.open(url, '_blank')
      setTimeout(() => URL.revokeObjectURL(url), 10000)
    } catch {
      toast.error('Error al previsualizar')
    }
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Materiales de la Lección</h2>
        {isOwner && (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {uploading
              ? <><RefreshCw size={14} className="animate-spin" /> Subiendo...</>
              : <><Upload size={14} /> Subir archivo</>
            }
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.webp,.zip"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {isOwner && (
        <p className="text-xs text-zinc-600 mb-4">
          Formatos: PDF, Word, Excel, PowerPoint, imágenes (JPG, PNG, GIF, WebP), ZIP. Máx: 50 MB.
        </p>
      )}

      {loading ? (
        <div className="space-y-2">
          {[...Array(2)].map((_, i) => <div key={i} className="h-14 rounded-xl bg-zinc-800 animate-pulse" />)}
        </div>
      ) : materials.length === 0 ? (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 text-center">
          <File size={32} className="mx-auto mb-2 text-zinc-700" />
          <p className="text-zinc-500 text-sm">
            {isOwner ? 'No hay materiales. Sube archivos usando el botón de arriba.' : 'No hay materiales disponibles para esta lección.'}
          </p>
        </div>
      ) : (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 divide-y divide-zinc-800 overflow-hidden">
          {materials.map((material) => (
            <div key={material.id} className="flex items-center gap-4 p-4 hover:bg-zinc-800/40 transition-colors">
              <div className="shrink-0 w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center">
                {fileIcon(material.mimeType)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{material.originalName}</p>
                <div className="flex items-center gap-3 text-xs text-zinc-500 mt-0.5">
                  <span>{formatSize(material.size)}</span>
                  <span>·</span>
                  <span>{new Date(material.uploadedAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {canPreview(material) && (
                  <button
                    onClick={() => handlePreview(material)}
                    className="p-1.5 text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                    title="Vista previa"
                  >
                    <ExternalLink size={14} />
                  </button>
                )}
                <button
                  onClick={() => handleDownload(material)}
                  className="p-1.5 text-zinc-500 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                  title="Descargar"
                >
                  <Download size={14} />
                </button>
                {isOwner && (
                  <button
                    onClick={() => handleDelete(material.id)}
                    disabled={deleting[material.id]}
                    className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-40"
                    title="Eliminar"
                  >
                    {deleting[material.id] ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function LessonPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [lesson, setLesson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get(`/lessons/${id}`)
      .then((res) => {
        setLesson(res.data)
        setEditForm({
          title: res.data.title,
          description: res.data.description || '',
          content: res.data.content,
          videoUrl: res.data.videoUrl || '',
        })
      })
      .catch(() => {
        toast.error('Lección no encontrada')
        navigate(-1)
      })
      .finally(() => setLoading(false))
  }, [id])

  const isOwner = lesson?.isOwner || false

  async function handleSave(e) {
    e.preventDefault()
    if (!editForm.title.trim() || !editForm.content.trim()) {
      return toast.error('Título y contenido son requeridos')
    }
    setSaving(true)
    try {
      const { data } = await api.put(`/lessons/${id}`, editForm)
      setLesson((prev) => ({ ...prev, ...data }))
      setEditing(false)
      toast.success('Lección actualizada')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al actualizar')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-center py-16 text-zinc-400">Cargando lección...</div>
  if (!lesson) return null

  const inputClass = 'w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent'

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 text-sm transition-colors"
      >
        <ArrowLeft size={16} /> Volver al curso
      </button>

      <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
        {lesson.videoUrl && !editing && (
          <div className="bg-black aspect-video flex items-center justify-center border-b border-zinc-800">
            <div className="text-center">
              <Video size={48} className="mx-auto mb-3 text-zinc-600" />
              <a
                href={lesson.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
              >
                Ver video <ExternalLink size={14} />
              </a>
            </div>
          </div>
        )}

        <div className="p-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-6">
            {editing ? (
              <form onSubmit={handleSave} className="flex-1 space-y-4">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">Título *</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">Descripción corta</label>
                  <input
                    type="text"
                    value={editForm.description}
                    onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                    className={inputClass}
                    placeholder="Resumen breve de la lección"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">Contenido *</label>
                  <textarea
                    rows={10}
                    value={editForm.content}
                    onChange={(e) => setEditForm((f) => ({ ...f, content: e.target.value }))}
                    className={`${inputClass} resize-y`}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">URL de video</label>
                  <input
                    type="url"
                    value={editForm.videoUrl}
                    onChange={(e) => setEditForm((f) => ({ ...f, videoUrl: e.target.value }))}
                    className={inputClass}
                    placeholder="https://youtube.com/..."
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                  >
                    <X size={14} /> Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-1.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Save size={14} /> {saving ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold text-white mb-2">{lesson.title}</h1>
                  {lesson.description && (
                    <p className="text-zinc-400 text-sm">{lesson.description}</p>
                  )}
                </div>
                {isOwner && (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-2 rounded-lg text-sm transition-colors shrink-0"
                  >
                    <Edit2 size={14} /> Editar
                  </button>
                )}
              </>
            )}
          </div>

          {!editing && (
            <div className="text-zinc-300 leading-relaxed whitespace-pre-wrap">{lesson.content}</div>
          )}
        </div>
      </div>

      {/* Materials section */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 mt-6">
        <MaterialsSection lessonId={id} isOwner={isOwner} />
      </div>
    </div>
  )
}
