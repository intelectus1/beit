import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import toast from 'react-hot-toast'
import {
  ArrowLeft, Video, Edit2, Save, X, Upload,
  FileText, Download, Trash2, File, Image, RefreshCw, Eye,
  ClipboardList, Plus, Clock, ChevronRight, CheckCircle,
} from 'lucide-react'
import SecureDocumentViewer from '../components/ui/SecureDocumentViewer'

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
  const [viewingMaterial, setViewingMaterial] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    api.get(`/lessons/${lessonId}/materials`)
      .then((res) => setMaterials(Array.isArray(res.data) ? res.data : []))
      .catch(() => toast.error('No se pudieron cargar los materiales'))
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

  function canView(material) {
    return material.mimeType?.startsWith('image/') || material.mimeType === 'application/pdf'
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
                {canView(material) && (
                  <button
                    onClick={() => setViewingMaterial(material)}
                    className="p-1.5 text-zinc-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                    title="Ver documento"
                  >
                    <Eye size={14} />
                  </button>
                )}
                {isOwner && (
                  <button
                    onClick={() => handleDownload(material)}
                    className="p-1.5 text-zinc-500 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                    title="Descargar"
                  >
                    <Download size={14} />
                  </button>
                )}
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

      {viewingMaterial && (
        <SecureDocumentViewer
          lessonId={lessonId}
          material={viewingMaterial}
          onClose={() => setViewingMaterial(null)}
        />
      )}
    </div>
  )
}

// ── Lesson Tasks Section ──────────────────────────────────────────────────────
function LessonTasksSection({ lessonId, isOwner }) {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', maxScore: 100 })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState({})

  const isTeacher = user?.role === 'TEACHER' || user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'

  useEffect(() => {
    api.get(`/lessons/${lessonId}/tasks`)
      .then((res) => setTasks(Array.isArray(res.data) ? res.data : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [lessonId])

  async function handleCreate(e) {
    e.preventDefault()
    if (!form.title.trim() || !form.description.trim()) {
      return toast.error('Título y descripción son requeridos')
    }
    setSaving(true)
    try {
      const { data } = await api.post(`/lessons/${lessonId}/tasks`, {
        ...form,
        maxScore: Number(form.maxScore) || 100,
        dueDate: form.dueDate || null,
      })
      setTasks((prev) => [...prev, data])
      setForm({ title: '', description: '', dueDate: '', maxScore: 100 })
      setShowForm(false)
      toast.success('Tarea creada')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al crear la tarea')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(taskId) {
    if (!confirm('¿Eliminar esta tarea? Se borrarán todas las entregas.')) return
    setDeleting((d) => ({ ...d, [taskId]: true }))
    try {
      await api.delete(`/tasks/${taskId}`)
      setTasks((prev) => prev.filter((t) => t.id !== taskId))
      toast.success('Tarea eliminada')
    } catch {
      toast.error('Error al eliminar la tarea')
    } finally {
      setDeleting((d) => ({ ...d, [taskId]: false }))
    }
  }

  const inputClass = 'w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent'

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <ClipboardList size={18} className="text-indigo-400" />
          Tareas de esta lección
        </h2>
        {isOwner && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-1.5 bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {showForm ? <><X size={14} /> Cancelar</> : <><Plus size={14} /> Nueva tarea</>}
          </button>
        )}
      </div>

      {showForm && isOwner && (
        <form onSubmit={handleCreate} className="bg-zinc-800/60 border border-zinc-700 rounded-xl p-4 mb-4 space-y-3">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Título *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className={inputClass}
              placeholder="Ej: Ejercicios del capítulo 1"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Descripción *</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className={`${inputClass} resize-y`}
              placeholder="Instrucciones para el alumno..."
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Fecha límite</label>
              <input
                type="datetime-local"
                value={form.dueDate}
                onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                className={`${inputClass} [color-scheme:dark]`}
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Puntaje máximo</label>
              <input
                type="number"
                min={1}
                max={1000}
                value={form.maxScore}
                onChange={(e) => setForm((f) => ({ ...f, maxScore: e.target.value }))}
                className={inputClass}
              />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 py-2.5 rounded-lg text-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
            >
              <Save size={13} /> {saving ? 'Guardando...' : 'Crear tarea'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-2">
          {[...Array(2)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-zinc-800 animate-pulse" />)}
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 text-center">
          <ClipboardList size={32} className="mx-auto mb-2 text-zinc-700" />
          <p className="text-zinc-500 text-sm">
            {isOwner ? 'No hay tareas. Crea una usando el botón de arriba.' : 'No hay tareas para esta lección.'}
          </p>
        </div>
      ) : (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 divide-y divide-zinc-800 overflow-hidden">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center gap-4 p-4 hover:bg-zinc-800/40 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{task.title}</p>
                <div className="flex items-center gap-3 text-xs text-zinc-500 mt-0.5">
                  {task.dueDate && (
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> {new Date(task.dueDate).toLocaleString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                  <span>Máx: {task.maxScore} pts</span>
                  {isTeacher && task._count?.submissions > 0 && (
                    <span className="text-indigo-400">{task._count.submissions} entregas</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {isOwner && (
                  <button
                    onClick={() => handleDelete(task.id)}
                    disabled={deleting[task.id]}
                    className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-40"
                    title="Eliminar tarea"
                  >
                    {deleting[task.id] ? <RefreshCw size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  </button>
                )}
                <Link
                  to={`/tasks/${task.id}`}
                  className="p-1.5 text-zinc-500 hover:text-indigo-400 transition-colors"
                  title="Ver tarea"
                >
                  <ChevronRight size={18} />
                </Link>
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

      {/* Tasks section */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 mt-6">
        <LessonTasksSection lessonId={id} isOwner={isOwner} />
      </div>

      {/* Materials section */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 mt-6">
        <MaterialsSection lessonId={id} isOwner={isOwner} />
      </div>
    </div>
  )
}
