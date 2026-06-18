import { useEffect, useRef, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import toast from 'react-hot-toast'
import {
  BookOpen, Users, ChevronRight, Plus, Edit, ClipboardList, ChevronDown,
  User, Check, X, Star, Link2, Calendar, Trash2, GripVertical,
  CheckSquare, Square, TrendingUp, Clock, MapPin, Video, Save, ImagePlus, UserMinus,
} from 'lucide-react'
import { FlowHoverButton } from '../components/ui/flow-hover-button'

// ── Progress Bar ──────────────────────────────────────────────────────────────
function ProgressBar({ value }) {
  return (
    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}

// ── Edit Course Modal ──────────────────────────────────────────────────────────
function EditCourseModal({ course, onClose, onSaved }) {
  const [form, setForm] = useState({ title: course.title, description: course.description || '', teamsLink: course.teamsLink || '' })
  const [loading, setLoading] = useState(false)
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState(course.coverImage || '')
  const [uploadingCover, setUploadingCover] = useState(false)
  const coverInputRef = useRef(null)

  function handleCoverChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverFile(file)
    const url = URL.createObjectURL(file)
    setCoverPreview(url)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim()) return toast.error('El título es requerido')
    setLoading(true)
    try {
      // Upload cover image if new file selected
      if (coverFile) {
        setUploadingCover(true)
        const fd = new FormData()
        fd.append('cover', coverFile)
        try {
          const { data: coverData } = await api.put(`/courses/${course.id}/cover`, fd)
          onSaved({ ...coverData })
        } catch {
          toast.error('No se pudo actualizar la imagen de portada')
        } finally {
          setUploadingCover(false)
        }
      }

      const { data } = await api.put(`/courses/${course.id}`, {
        ...form,
        teamsLink: form.teamsLink.trim() || null,
      })
      onSaved(data)
      toast.success('Curso actualizado')
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al actualizar el curso')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors'

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-white">Editar curso</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cover image */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <ImagePlus size={13} className="text-indigo-400" /> Imagen de portada
            </label>
            <div
              className="relative rounded-xl overflow-hidden h-32 bg-zinc-800 cursor-pointer group"
              onClick={() => coverInputRef.current?.click()}
            >
              {coverPreview ? (
                <img src={coverPreview} alt="Portada" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-600/40 to-purple-700/40 flex items-center justify-center">
                  <BookOpen size={28} className="text-zinc-500" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-sm font-medium">
                <ImagePlus size={16} /> Cambiar imagen
              </div>
            </div>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleCoverChange}
            />
            <p className="text-xs text-zinc-600 mt-1">JPG, PNG, WebP — máx 10 MB</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Título</label>
            <input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className={inputClass} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Descripción</label>
            <textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className={`${inputClass} resize-none`} />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              <span className="flex items-center gap-1.5"><Link2 size={13} className="text-blue-400" /> Enlace Teams (opcional)</span>
            </label>
            <input type="url" value={form.teamsLink} onChange={(e) => setForm((f) => ({ ...f, teamsLink: e.target.value }))} className={inputClass} placeholder="https://teams.microsoft.com/..." />
          </div>
          <div className="flex gap-3 pt-1">
            <FlowHoverButton type="button" onClick={onClose} variant="secondary" className="flex-1 py-2.5 text-sm">Cancelar</FlowHoverButton>
            <FlowHoverButton type="submit" disabled={loading || uploadingCover} variant="primary" className="flex-1 py-2.5 text-sm">
              {loading || uploadingCover ? 'Guardando...' : 'Guardar'}
            </FlowHoverButton>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Curriculum Tab ────────────────────────────────────────────────────────────
function CurriculumTab({ courseId, isOwner }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [newTitle, setNewTitle] = useState('')
  const [adding, setAdding] = useState(false)
  const [dragOver, setDragOver] = useState(null)
  const dragItem = useRef(null)

  useEffect(() => {
    api.get(`/courses/${courseId}/curriculum`)
      .then((res) => setItems(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [courseId])

  async function addItem() {
    if (!newTitle.trim()) return
    setAdding(true)
    try {
      const { data } = await api.post(`/courses/${courseId}/curriculum`, { title: newTitle.trim() })
      setItems((prev) => [...prev, data])
      setNewTitle('')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al agregar')
    } finally {
      setAdding(false)
    }
  }

  async function toggleItem(item) {
    try {
      const { data } = await api.put(`/courses/${courseId}/curriculum/${item.id}`, { completed: !item.completed })
      setItems((prev) => prev.map((i) => (i.id === item.id ? data : i)))
    } catch {
      toast.error('Error al actualizar')
    }
  }

  async function deleteItem(itemId) {
    try {
      await api.delete(`/courses/${courseId}/curriculum/${itemId}`)
      setItems((prev) => prev.filter((i) => i.id !== itemId))
    } catch {
      toast.error('Error al eliminar')
    }
  }

  function handleDragStart(e, index) {
    dragItem.current = index
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragOver(e, index) {
    e.preventDefault()
    setDragOver(index)
  }

  async function handleDrop(e, dropIndex) {
    e.preventDefault()
    setDragOver(null)
    const from = dragItem.current
    if (from === null || from === dropIndex) return

    const reordered = [...items]
    const [removed] = reordered.splice(from, 1)
    reordered.splice(dropIndex, 0, removed)
    setItems(reordered)
    dragItem.current = null

    try {
      await api.put(`/courses/${courseId}/curriculum/reorder`, { items: reordered.map((i) => i.id) })
    } catch {
      toast.error('Error al reordenar')
    }
  }

  const completed = items.filter((i) => i.completed).length
  const progress = items.length > 0 ? Math.round((completed / items.length) * 100) : 0

  if (loading) return <div className="text-zinc-400 text-center py-12">Cargando currículo...</div>

  return (
    <div>
      {/* Progress */}
      {items.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white flex items-center gap-2">
              <TrendingUp size={15} className="text-indigo-400" />
              Avance del currículo
            </span>
            <span className="text-lg font-bold text-indigo-400">{progress}%</span>
          </div>
          <ProgressBar value={progress} />
          <p className="text-xs text-zinc-500 mt-2">{completed} de {items.length} temas completados</p>
        </div>
      )}

      {/* Add new item */}
      {isOwner && (
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addItem()}
            placeholder="Agregar tema, módulo o actividad..."
            className="flex-1 bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            onClick={addItem}
            disabled={adding || !newTitle.trim()}
            className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
          >
            <Plus size={15} />
            Agregar
          </button>
        </div>
      )}

      {items.length === 0 ? (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-10 text-center">
          <CheckSquare size={36} className="mx-auto mb-3 text-zinc-700" />
          <p className="text-zinc-400">No hay elementos en el currículo</p>
          {isOwner && <p className="text-zinc-600 text-sm mt-1">Agrega módulos, temas o actividades usando el campo de arriba</p>}
        </div>
      ) : (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 divide-y divide-zinc-800 overflow-hidden">
          {items.map((item, index) => (
            <div
              key={item.id}
              draggable={isOwner}
              onDragStart={isOwner ? (e) => handleDragStart(e, index) : undefined}
              onDragOver={isOwner ? (e) => handleDragOver(e, index) : undefined}
              onDrop={isOwner ? (e) => handleDrop(e, index) : undefined}
              onDragLeave={() => setDragOver(null)}
              className={`flex items-center gap-3 p-3.5 transition-colors ${
                dragOver === index ? 'bg-indigo-500/10 border-indigo-500/30' : 'hover:bg-zinc-800/40'
              }`}
            >
              {isOwner && (
                <GripVertical size={15} className="text-zinc-700 cursor-grab shrink-0" />
              )}
              <button
                onClick={() => toggleItem(item)}
                className="shrink-0 transition-colors"
              >
                {item.completed
                  ? <CheckSquare size={18} className="text-green-400" />
                  : <Square size={18} className="text-zinc-600 hover:text-zinc-400" />
                }
              </button>
              <span className={`flex-1 text-sm ${item.completed ? 'line-through text-zinc-500' : 'text-white'}`}>
                {item.title}
              </span>
              {isOwner && (
                <button
                  onClick={() => deleteItem(item.id)}
                  className="shrink-0 p-1 text-zinc-700 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Schedules Tab ─────────────────────────────────────────────────────────────
const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
const MODALITIES = ['Presencial', 'Virtual', 'Híbrido']
const MODALITY_COLORS = { Virtual: 'text-blue-400', Presencial: 'text-green-400', Híbrido: 'text-purple-400' }

function SchedulesTab({ courseId, isOwner }) {
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ dayOfWeek: 'Lunes', startTime: '', endTime: '', modality: 'Presencial', classLink: '', location: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get(`/courses/${courseId}/schedules`)
      .then((res) => setSchedules(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [courseId])

  function openEdit(sch) {
    setForm({ dayOfWeek: sch.dayOfWeek, startTime: sch.startTime, endTime: sch.endTime, modality: sch.modality, classLink: sch.classLink || '', location: sch.location || '' })
    setEditingId(sch.id)
    setShowForm(true)
  }

  function openNew() {
    setForm({ dayOfWeek: 'Lunes', startTime: '', endTime: '', modality: 'Presencial', classLink: '', location: '' })
    setEditingId(null)
    setShowForm(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!form.startTime || !form.endTime) return toast.error('Hora de inicio y fin son requeridas')
    setSaving(true)
    try {
      if (editingId) {
        const { data } = await api.put(`/courses/${courseId}/schedules/${editingId}`, form)
        setSchedules((prev) => prev.map((s) => (s.id === editingId ? data : s)))
        toast.success('Horario actualizado')
      } else {
        const { data } = await api.post(`/courses/${courseId}/schedules`, form)
        setSchedules((prev) => [...prev, data])
        toast.success('Horario creado')
      }
      setShowForm(false)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(schId) {
    try {
      await api.delete(`/courses/${courseId}/schedules/${schId}`)
      setSchedules((prev) => prev.filter((s) => s.id !== schId))
      toast.success('Horario eliminado')
    } catch {
      toast.error('Error al eliminar')
    }
  }

  const inputClass = 'bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full'

  if (loading) return <div className="text-zinc-400 text-center py-12">Cargando horarios...</div>

  return (
    <div>
      {isOwner && (
        <div className="flex justify-end mb-4">
          <button
            onClick={showForm ? () => setShowForm(false) : openNew}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${showForm ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-indigo-500 hover:bg-indigo-600 text-white'}`}
          >
            {showForm ? <><X size={14} /> Cancelar</> : <><Plus size={14} /> Nuevo horario</>}
          </button>
        </div>
      )}

      {/* Form */}
      {showForm && isOwner && (
        <form onSubmit={handleSave} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4 space-y-3">
          <h3 className="font-medium text-white mb-3">{editingId ? 'Editar horario' : 'Nuevo horario'}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Día *</label>
              <select value={form.dayOfWeek} onChange={(e) => setForm((f) => ({ ...f, dayOfWeek: e.target.value }))} className={inputClass}>
                {DAYS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Hora inicio *</label>
              <input type="time" value={form.startTime} onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))} className={`${inputClass} [color-scheme:dark]`} required />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Hora fin *</label>
              <input type="time" value={form.endTime} onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))} className={`${inputClass} [color-scheme:dark]`} required />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Modalidad *</label>
              <select value={form.modality} onChange={(e) => setForm((f) => ({ ...f, modality: e.target.value }))} className={inputClass}>
                {MODALITIES.map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Aula / Ubicación</label>
              <input type="text" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="Ej: Aula 101" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Enlace de clase</label>
              <input type="url" value={form.classLink} onChange={(e) => setForm((f) => ({ ...f, classLink: e.target.value }))} placeholder="https://..." className={inputClass} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm transition-colors">Cancelar</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5">
              <Save size={13} /> {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      )}

      {schedules.length === 0 ? (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-10 text-center">
          <Calendar size={36} className="mx-auto mb-3 text-zinc-700" />
          <p className="text-zinc-400">No hay horarios programados</p>
          {isOwner && <p className="text-zinc-600 text-sm mt-1">Agrega los días y horas de clase</p>}
        </div>
      ) : (
        <div className="space-y-2">
          {schedules.sort((a, b) => DAYS.indexOf(a.dayOfWeek) - DAYS.indexOf(b.dayOfWeek)).map((sch) => (
            <div key={sch.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-white">{sch.dayOfWeek}</span>
                    <span className="text-blue-400 text-sm flex items-center gap-1">
                      <Clock size={12} /> {sch.startTime} – {sch.endTime}
                    </span>
                    <span className={`text-xs ${MODALITY_COLORS[sch.modality] || 'text-zinc-400'}`}>{sch.modality}</span>
                  </div>
                  {sch.location && (
                    <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1"><MapPin size={10} /> {sch.location}</p>
                  )}
                  {sch.classLink && (
                    <a href={sch.classLink} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 mt-1 inline-flex items-center gap-1">
                      <Link2 size={10} /> Enlace de clase
                    </a>
                  )}
                </div>
                {isOwner && (
                  <div className="flex gap-1.5 shrink-0">
                    <button onClick={() => openEdit(sch)} className="p-1.5 text-zinc-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors">
                      <Edit size={13} />
                    </button>
                    <button onClick={() => handleDelete(sch.id)} className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Lessons Section ───────────────────────────────────────────────────────────
function LessonsSection({ course, isOwner, isAccepted, onLessonsChange }) {
  const [lessons, setLessons] = useState(course.lessons || [])
  const [dragOver, setDragOver] = useState(null)
  const dragItem = useRef(null)
  const [deleting, setDeleting] = useState({})
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [savingEdit, setSavingEdit] = useState(false)

  useEffect(() => setLessons(course.lessons || []), [course.lessons])

  function handleDragStart(e, index) {
    dragItem.current = index
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragOver(e, index) {
    e.preventDefault()
    setDragOver(index)
  }

  async function handleDrop(e, dropIndex) {
    e.preventDefault()
    setDragOver(null)
    const from = dragItem.current
    if (from === null || from === dropIndex) return

    const reordered = [...lessons]
    const [removed] = reordered.splice(from, 1)
    reordered.splice(dropIndex, 0, removed)
    setLessons(reordered)
    dragItem.current = null

    try {
      await api.put(`/courses/${course.id}/lessons/reorder`, { lessonIds: reordered.map((l) => l.id) })
      onLessonsChange(reordered)
    } catch {
      toast.error('Error al reordenar lecciones')
    }
  }

  async function handleDelete(lessonId) {
    if (!confirm('¿Eliminar esta lección? Esta acción no se puede deshacer.')) return
    setDeleting((d) => ({ ...d, [lessonId]: true }))
    try {
      await api.delete(`/lessons/${lessonId}`)
      const updated = lessons.filter((l) => l.id !== lessonId)
      setLessons(updated)
      onLessonsChange(updated)
      toast.success('Lección eliminada')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al eliminar')
    } finally {
      setDeleting((d) => ({ ...d, [lessonId]: false }))
    }
  }

  function openEdit(lesson) {
    setEditForm({ title: lesson.title, description: lesson.description || '', content: lesson.content, videoUrl: lesson.videoUrl || '' })
    setEditingId(lesson.id)
  }

  async function handleSaveEdit(e) {
    e.preventDefault()
    setSavingEdit(true)
    try {
      const { data } = await api.put(`/lessons/${editingId}`, editForm)
      const updated = lessons.map((l) => (l.id === editingId ? { ...l, ...data } : l))
      setLessons(updated)
      onLessonsChange(updated)
      setEditingId(null)
      toast.success('Lección actualizada')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al actualizar')
    } finally {
      setSavingEdit(false)
    }
  }

  const inputClass = 'w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent'

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Lecciones</h2>
        {isOwner && (
          <Link
            to={`/courses/${course.id}/lessons/create`}
            className="flex items-center gap-1 text-sm bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus size={14} /> Nueva lección
          </Link>
        )}
      </div>

      {lessons.length === 0 ? (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 text-center text-zinc-400">
          <BookOpen size={32} className="mx-auto mb-2 text-zinc-700" />
          No hay lecciones aún
        </div>
      ) : (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 divide-y divide-zinc-800 overflow-hidden">
          {lessons.map((lesson, i) => (
            <div key={lesson.id}>
              <div
                draggable={isOwner}
                onDragStart={isOwner ? (e) => handleDragStart(e, i) : undefined}
                onDragOver={isOwner ? (e) => handleDragOver(e, i) : undefined}
                onDrop={isOwner ? (e) => handleDrop(e, i) : undefined}
                onDragLeave={() => setDragOver(null)}
                className={`flex items-center gap-4 p-4 transition-colors ${dragOver === i ? 'bg-indigo-500/10' : 'hover:bg-zinc-800/50'}`}
              >
                {isOwner && <GripVertical size={15} className="text-zinc-700 cursor-grab shrink-0" />}
                <span className="w-7 h-7 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center text-sm font-medium shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{lesson.title}</p>
                  {lesson.description && <p className="text-xs text-zinc-500 truncate mt-0.5">{lesson.description}</p>}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {isOwner && (
                    <>
                      <button
                        onClick={() => editingId === lesson.id ? setEditingId(null) : openEdit(lesson)}
                        className="p-1.5 text-zinc-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                      >
                        <Edit size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(lesson.id)}
                        disabled={deleting[lesson.id]}
                        className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-40"
                      >
                        {deleting[lesson.id] ? <span className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin inline-block" /> : <Trash2 size={13} />}
                      </button>
                    </>
                  )}
                  {(isOwner || isAccepted) ? (
                    <Link to={`/lessons/${lesson.id}`} className="p-1.5 text-zinc-500 hover:text-indigo-400 transition-colors">
                      <ChevronRight size={18} />
                    </Link>
                  ) : (
                    <span className="p-1.5 text-zinc-700"><ChevronRight size={18} /></span>
                  )}
                </div>
              </div>

              {/* Inline edit form */}
              {editingId === lesson.id && (
                <form onSubmit={handleSaveEdit} className="px-4 pb-4 pt-2 bg-zinc-800/50 border-t border-zinc-800 space-y-3">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Título</label>
                    <input value={editForm.title} onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))} className={inputClass} required />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Descripción corta</label>
                    <input value={editForm.description} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} className={inputClass} placeholder="Resumen de la lección (opcional)" />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Contenido</label>
                    <textarea rows={4} value={editForm.content} onChange={(e) => setEditForm((f) => ({ ...f, content: e.target.value }))} className={`${inputClass} resize-y`} required />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">URL de video</label>
                    <input type="url" value={editForm.videoUrl} onChange={(e) => setEditForm((f) => ({ ...f, videoUrl: e.target.value }))} className={inputClass} placeholder="https://youtube.com/..." />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button type="button" onClick={() => setEditingId(null)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-2 rounded-lg text-sm transition-colors">Cancelar</button>
                    <button type="submit" disabled={savingEdit} className="flex-1 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5">
                      <Save size={13} /> {savingEdit ? 'Guardando...' : 'Guardar'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Enrollment Requests Tab ────────────────────────────────────────────────────
function EnrollmentRequestsTab({ courseId, requests, loading, onAction }) {
  const [processing, setProcessing] = useState({})

  async function handleAction(enrollmentId, status) {
    setProcessing((p) => ({ ...p, [enrollmentId]: true }))
    try {
      await api.put(`/courses/${courseId}/enrollments/${enrollmentId}`, { status })
      onAction(enrollmentId, status)
      toast.success(status === 'ACCEPTED' ? 'Alumno aceptado' : 'Solicitud rechazada')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al procesar')
    } finally {
      setProcessing((p) => ({ ...p, [enrollmentId]: false }))
    }
  }

  if (loading) return <div className="text-zinc-400 text-center py-12">Cargando solicitudes...</div>
  if (requests.length === 0) return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-10 text-center">
      <Users size={36} className="mx-auto mb-3 text-zinc-700" />
      <p className="text-zinc-400">No hay solicitudes pendientes</p>
    </div>
  )

  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 divide-y divide-zinc-800">
      {requests.map((req) => (
        <div key={req.id} className="flex items-center justify-between p-4 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <User size={15} className="text-indigo-400" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-white truncate">{req.user.name}</p>
              <p className="text-sm text-zinc-500 truncate">{req.user.email}</p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <FlowHoverButton onClick={() => handleAction(req.id, 'ACCEPTED')} disabled={processing[req.id]} variant="success" icon={<Check size={14} />} className="text-sm px-3 py-1.5">
              Aceptar
            </FlowHoverButton>
            <FlowHoverButton onClick={() => handleAction(req.id, 'REJECTED')} disabled={processing[req.id]} variant="danger" icon={<X size={14} />} className="text-sm px-3 py-1.5">
              Rechazar
            </FlowHoverButton>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Students & Grades Tab ──────────────────────────────────────────────────────
function StudentsGradesTab({ students, loading, courseId, onRefresh }) {
  const [expanded, setExpanded] = useState({})
  const [scores, setScores] = useState({})
  const [grading, setGrading] = useState({})
  const [removing, setRemoving] = useState({})

  async function handleGrade(submissionId, score, maxScore) {
    if (score === '' || score === undefined) return
    const numScore = Number(score)
    if (isNaN(numScore) || numScore < 0 || numScore > maxScore) return toast.error(`La nota debe estar entre 0 y ${maxScore}`)
    setGrading((g) => ({ ...g, [submissionId]: true }))
    try {
      await api.put(`/tasks/submissions/${submissionId}/grade`, { score: numScore })
      toast.success('Calificación guardada')
      onRefresh()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al calificar')
    } finally {
      setGrading((g) => ({ ...g, [submissionId]: false }))
    }
  }

  async function handleRemoveStudent(studentId) {
    if (!confirm('¿Eliminar a este alumno del curso? Perderá el acceso y sus entregas serán borradas.')) return
    setRemoving((r) => ({ ...r, [studentId]: true }))
    try {
      await api.delete(`/courses/${courseId}/students/${studentId}`)
      toast.success('Alumno eliminado del curso')
      onRefresh()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al eliminar')
    } finally {
      setRemoving((r) => ({ ...r, [studentId]: false }))
    }
  }

  if (loading) return <div className="text-zinc-400 text-center py-12">Cargando estudiantes...</div>
  if (students.length === 0) return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-10 text-center">
      <Users size={36} className="mx-auto mb-3 text-zinc-700" />
      <p className="text-zinc-400">No hay estudiantes aceptados aún</p>
    </div>
  )

  return (
    <div className="space-y-2">
      {students.map((student) => (
        <div key={student.id} className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <div className="flex items-center justify-between p-4 hover:bg-zinc-800/40 transition-colors">
            <button
              onClick={() => setExpanded((e) => ({ ...e, [student.id]: !e[student.id] }))}
              className="flex items-center gap-3 flex-1 text-left"
            >
              <div className="w-9 h-9 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                <User size={14} className="text-indigo-400" />
              </div>
              <div>
                <p className="font-medium text-white">{student.name}</p>
                <p className="text-xs text-zinc-500">{student.email}</p>
              </div>
            </button>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-zinc-600 hidden sm:inline">{student.tasks.filter((t) => t.status === 'GRADED').length}/{student.tasks.length} calificadas</span>
              <button
                onClick={() => handleRemoveStudent(student.id)}
                disabled={removing[student.id]}
                className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Eliminar alumno del curso"
              >
                {removing[student.id]
                  ? <span className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin inline-block" />
                  : <UserMinus size={14} />
                }
              </button>
              <ChevronDown
                size={16}
                onClick={() => setExpanded((e) => ({ ...e, [student.id]: !e[student.id] }))}
                className={`text-zinc-500 transition-transform duration-200 cursor-pointer ${expanded[student.id] ? 'rotate-180' : ''}`}
              />
            </div>
          </div>

          {expanded[student.id] && (
            <div className="border-t border-zinc-800">
              {student.tasks.length === 0 ? (
                <p className="text-zinc-600 text-sm text-center py-4">Sin tareas en este curso</p>
              ) : (
                student.tasks.map((task) => (
                  <div key={task.taskId} className="flex items-center gap-4 px-5 py-3 border-b border-zinc-800/60 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{task.taskTitle}</p>
                    </div>
                    <span className="text-xs text-zinc-600 shrink-0">Máx: {task.maxScore}</span>
                    {task.submissionId ? (
                      task.status === 'GRADED' ? (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Star size={13} className="text-yellow-400" />
                          <span className="text-green-400 text-sm font-semibold">{task.score}/{task.maxScore}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 shrink-0">
                          <input
                            type="number" min={0} max={task.maxScore}
                            value={scores[task.submissionId] ?? ''}
                            onChange={(e) => setScores((s) => ({ ...s, [task.submissionId]: e.target.value }))}
                            className="w-16 bg-zinc-800 border border-zinc-700 text-white rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 [color-scheme:dark]"
                            placeholder="Pts"
                          />
                          <button
                            onClick={() => handleGrade(task.submissionId, scores[task.submissionId], task.maxScore)}
                            disabled={grading[task.submissionId] || scores[task.submissionId] === undefined || scores[task.submissionId] === ''}
                            className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 text-white px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
                          >
                            {grading[task.submissionId] ? '...' : 'Guardar'}
                          </button>
                        </div>
                      )
                    ) : (
                      <span className="text-zinc-600 text-xs shrink-0 italic">Sin entregar</span>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── My Grades Section ─────────────────────────────────────────────────────────
function MyGradesSection({ grades }) {
  if (grades.length === 0) return null
  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Star size={18} className="text-yellow-400" /> Mis Calificaciones
      </h2>
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 divide-y divide-zinc-800">
        {grades.map((grade) => (
          <div key={grade.taskId} className="flex items-center justify-between p-4 gap-3">
            <div className="min-w-0">
              <p className="font-medium text-white truncate">{grade.taskTitle}</p>
              <p className="text-xs text-zinc-500 mt-0.5">
                {!grade.submitted ? 'Sin entregar' : grade.status === 'GRADED' ? 'Calificado' : 'Entregado — pendiente de revisión'}
              </p>
            </div>
            <div className="text-right shrink-0">
              {grade.status === 'GRADED' ? (
                <div>
                  <span className="text-green-400 font-semibold">{grade.score}/{grade.maxScore}</span>
                  {grade.feedback && <p className="text-xs text-zinc-500 mt-0.5 max-w-[180px] truncate">{grade.feedback}</p>}
                </div>
              ) : (
                <span className="text-zinc-600 text-sm">—/{grade.maxScore}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Enrollment Button ─────────────────────────────────────────────────────────
function EnrollmentButton({ status, enrolling, onEnroll, isPublished }) {
  if (status === 'ACCEPTED') return <div className="text-center py-2.5 text-green-400 font-medium bg-green-500/10 border border-green-500/20 rounded-lg text-sm">✓ Ya estás inscrito</div>
  if (status === 'PENDING') return <div className="text-center py-2.5 text-yellow-400 font-medium bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm">Solicitud pendiente</div>
  if (!isPublished) return <div className="text-center py-3 px-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm text-yellow-200">Curso no publicado aún</div>
  if (status === 'REJECTED') return (
    <div className="space-y-2">
      <div className="text-center py-2.5 text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg text-sm">Solicitud rechazada</div>
      <FlowHoverButton onClick={onEnroll} disabled={enrolling} variant="secondary" className="w-full py-2.5 text-sm">
        {enrolling ? 'Enviando...' : 'Volver a solicitar'}
      </FlowHoverButton>
    </div>
  )
  return (
    <FlowHoverButton onClick={onEnroll} disabled={enrolling} variant="primary" className="w-full py-3">
      {enrolling ? 'Enviando...' : 'Solicitar Inscripción'}
    </FlowHoverButton>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function CourseDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [enrollmentStatus, setEnrollmentStatus] = useState(null)
  const [enrolling, setEnrolling] = useState(false)
  const [activeTab, setActiveTab] = useState('content')
  const [enrollmentRequests, setEnrollmentRequests] = useState([])
  const [requestsLoading, setRequestsLoading] = useState(false)
  const [courseStudents, setCourseStudents] = useState([])
  const [studentsLoading, setStudentsLoading] = useState(false)
  const [myGrades, setMyGrades] = useState([])
  const [showEditModal, setShowEditModal] = useState(false)

  const isOwner = user && course && (user.id === course.teacherId || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')
  const isTeacher = user?.role === 'TEACHER' || user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'
  const isAccepted = enrollmentStatus === 'ACCEPTED'

  useEffect(() => {
    api.get(`/courses/${id}`)
      .then((res) => {
        setCourse(res.data)
        const isCourseOwner = user && (user.id === res.data.teacherId || ['ADMIN', 'SUPER_ADMIN'].includes(user.role))
        if (isCourseOwner) {
          api.get(`/courses/${id}/enrollment-requests`).then((r) => setEnrollmentRequests(r.data)).catch(() => {})
        }
      })
      .catch(() => toast.error('Curso no encontrado'))
      .finally(() => setLoading(false))
  }, [id, user])

  useEffect(() => {
    if (user?.role !== 'STUDENT') return
    api.get(`/courses/${id}/my-enrollment`).then((res) => { if (res.data) setEnrollmentStatus(res.data.status) }).catch(() => {})
  }, [id, user])

  useEffect(() => {
    if (user?.role !== 'STUDENT' || enrollmentStatus !== 'ACCEPTED') return
    api.get(`/courses/${id}/my-grades`).then((res) => setMyGrades(res.data)).catch(() => {})
  }, [id, user, enrollmentStatus])

  function handleTabChange(tab) {
    setActiveTab(tab)
    if (tab === 'requests') {
      setRequestsLoading(true)
      api.get(`/courses/${id}/enrollment-requests`).then((res) => setEnrollmentRequests(res.data)).catch(() => {}).finally(() => setRequestsLoading(false))
    } else if (tab === 'students') {
      setStudentsLoading(true)
      api.get(`/courses/${id}/students`).then((res) => setCourseStudents(res.data)).catch(() => {}).finally(() => setStudentsLoading(false))
    }
  }

  function handleRequestAction(enrollmentId, status) {
    setEnrollmentRequests((reqs) => reqs.filter((r) => r.id !== enrollmentId))
    if (status === 'ACCEPTED') setCourse((c) => ({ ...c, _count: { ...c._count, enrollments: (c._count?.enrollments || 0) + 1 } }))
  }

  function refreshStudents() {
    api.get(`/courses/${id}/students`).then((res) => setCourseStudents(res.data)).catch(() => {})
  }

  async function handleEnroll() {
    setEnrolling(true)
    try {
      await api.post(`/courses/${id}/enroll`)
      setEnrollmentStatus('PENDING')
      toast.success('Solicitud enviada. El profesor revisará tu solicitud.')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al enviar la solicitud')
    } finally {
      setEnrolling(false)
    }
  }

  async function handlePublish() {
    try {
      await api.put(`/courses/${id}`, { ...course, isPublished: !course.isPublished })
      setCourse((c) => ({ ...c, isPublished: !c.isPublished }))
      toast.success(course.isPublished ? 'Curso despublicado' : 'Curso publicado')
    } catch {
      toast.error('Error al cambiar estado del curso')
    }
  }

  if (loading) return <div className="text-center py-16 text-zinc-400">Cargando...</div>
  if (!course) return <div className="text-center py-16 text-zinc-400">Curso no encontrado</div>

  const teacherTabs = [
    { key: 'content', label: 'Contenido' },
    { key: 'curriculum', label: 'Currículo' },
    { key: 'schedules', label: 'Horarios' },
    { key: 'requests', label: 'Solicitudes', badge: enrollmentRequests.length },
    { key: 'students', label: 'Estudiantes' },
  ]

  const curriculumItems = course.curriculum || []
  const curricProgress = curriculumItems.length > 0
    ? Math.round((curriculumItems.filter((i) => i.completed).length / curriculumItems.length) * 100)
    : null

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Main content ── */}
        <div className="lg:col-span-2">
          {/* Hero card */}
          <div className="rounded-2xl overflow-hidden mb-6 relative">
            {/* Background */}
            {course.coverImage ? (
              <div className="relative">
                <img src={course.coverImage} alt={course.title} className="w-full h-48 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
              </div>
            ) : (
              <div className="h-48 bg-gradient-to-br from-indigo-600 to-purple-700" />
            )}
            {/* Content overlay */}
            <div className={`p-8 text-white ${course.coverImage ? 'absolute inset-0 flex flex-col justify-end' : 'bg-gradient-to-br from-indigo-600 to-purple-700'}`}>
              <div className="flex items-start justify-between mb-3">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${course.isPublished ? 'bg-green-400/20 text-green-300 border border-green-400/30' : 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/30'}`}>
                  {course.isPublished ? 'Publicado' : 'Borrador'}
                </span>
                {isOwner && (
                  <div className="flex gap-2">
                    <button onClick={handlePublish} className="text-xs bg-white/20 hover:bg-white/30 backdrop-blur-sm px-3 py-1.5 rounded-lg transition-colors">
                      {course.isPublished ? 'Despublicar' : 'Publicar'}
                    </button>
                    <button onClick={() => setShowEditModal(true)} className="text-xs bg-white/20 hover:bg-white/30 backdrop-blur-sm px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                      <Edit size={12} /> Editar
                    </button>
                  </div>
                )}
              </div>
              <h1 className="text-3xl font-bold mb-2 drop-shadow">{course.title}</h1>
              <p className={`mb-3 text-sm ${course.coverImage ? 'text-zinc-200' : 'text-indigo-200'}`}>{course.description || 'Sin descripción'}</p>
              <div className={`flex items-center gap-4 text-sm ${course.coverImage ? 'text-zinc-300' : 'text-indigo-200'}`}>
                <span>Prof. {course.teacher?.name}</span>
                <span className="flex items-center gap-1"><Users size={14} /> {course._count?.enrollments || 0} alumnos</span>
                <span>{course.lessons?.length || 0} lecciones</span>
              </div>
              {curricProgress !== null && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-zinc-300 mb-1">
                    <span>Progreso del currículo</span>
                    <span className="font-medium">{curricProgress}%</span>
                  </div>
                  <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white/70 rounded-full transition-all" style={{ width: `${curricProgress}%` }} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Teacher tab bar */}
          {isOwner && (
            <div className="flex gap-1 mb-6 bg-zinc-900 border border-zinc-800 rounded-xl p-1 overflow-x-auto">
              {teacherTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`flex-shrink-0 py-2 px-2 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 ${activeTab === tab.key ? 'bg-indigo-500 text-white' : 'text-zinc-400 hover:text-white'}`}
                >
                  {tab.label}
                  {tab.badge > 0 && (
                    <span className="bg-yellow-400 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Content Tab */}
          {(!isOwner || activeTab === 'content') && (
            <>
              {!isOwner && isAccepted && course.teamsLink && (
                <a
                  href={course.teamsLink} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-xl p-4 mb-6 group transition-colors"
                >
                  <div className="bg-blue-500/20 p-2.5 rounded-lg shrink-0">
                    <Link2 size={18} className="text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-blue-300 group-hover:text-blue-200 transition-colors">Clase en TEAMS con el instructor</p>
                    <p className="text-xs text-blue-400/70 mt-0.5 truncate">{course.teamsLink}</p>
                  </div>
                  <ChevronRight size={16} className="text-blue-400/60 shrink-0" />
                </a>
              )}

              {/* Student Schedules Preview */}
              {!isOwner && isAccepted && course.schedules?.length > 0 && (
                <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4 mb-6">
                  <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                    <Calendar size={15} className="text-blue-400" /> Horarios de clase
                  </h3>
                  <div className="space-y-2">
                    {course.schedules.map((sch) => (
                      <div key={sch.id} className="flex items-center gap-3 text-sm">
                        <span className="text-zinc-300 font-medium w-24">{sch.dayOfWeek}</span>
                        <span className="text-blue-400">{sch.startTime} – {sch.endTime}</span>
                        <span className="text-zinc-600 text-xs">{sch.modality}</span>
                        {sch.classLink && (
                          <a href={sch.classLink} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 text-xs ml-auto">Unirse →</a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <LessonsSection
                course={course}
                isOwner={isOwner}
                isAccepted={isAccepted}
                onLessonsChange={(updated) => setCourse((c) => ({ ...c, lessons: updated }))}
              />

              {/* Tasks */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">Tareas</h2>
                  {isOwner && (
                    <Link to={`/courses/${id}/tasks/create`} className="flex items-center gap-1 text-sm bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-lg transition-colors">
                      <Plus size={14} /> Nueva tarea
                    </Link>
                  )}
                </div>

                {!course.tasks?.length ? (
                  <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 text-center text-zinc-400">
                    <ClipboardList size={32} className="mx-auto mb-2 text-zinc-700" />
                    No hay tareas aún
                  </div>
                ) : (
                  <div className="bg-zinc-900 rounded-xl border border-zinc-800 divide-y divide-zinc-800">
                    {course.tasks.map((task) =>
                      isOwner || isAccepted ? (
                        <Link key={task.id} to={`/tasks/${task.id}`} className="flex items-center gap-4 p-4 hover:bg-zinc-800/50 transition-colors">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-white">{task.title}</p>
                            {task.dueDate && <p className="text-xs text-zinc-500 mt-0.5">Entrega: {new Date(task.dueDate).toLocaleDateString('es-PE')}</p>}
                          </div>
                          <span className="text-sm text-zinc-500 shrink-0">Máx: {task.maxScore}</span>
                          <ChevronRight size={18} className="text-zinc-600 shrink-0" />
                        </Link>
                      ) : (
                        <div key={task.id} className="flex items-center gap-4 p-4 opacity-60 cursor-default">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-white">{task.title}</p>
                            {task.dueDate && <p className="text-xs text-zinc-500 mt-0.5">Entrega: {new Date(task.dueDate).toLocaleDateString('es-PE')}</p>}
                          </div>
                          <span className="text-sm text-zinc-500 shrink-0">Máx: {task.maxScore}</span>
                          <ChevronRight size={18} className="text-zinc-700 shrink-0" />
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              {user?.role === 'STUDENT' && isAccepted && <MyGradesSection grades={myGrades} />}
            </>
          )}

          {isOwner && activeTab === 'curriculum' && (
            <CurriculumTab courseId={id} isOwner={isOwner} />
          )}

          {isOwner && activeTab === 'schedules' && (
            <SchedulesTab courseId={id} isOwner={isOwner} />
          )}

          {isOwner && activeTab === 'requests' && (
            <EnrollmentRequestsTab courseId={id} requests={enrollmentRequests} loading={requestsLoading} onAction={handleRequestAction} />
          )}

          {isOwner && activeTab === 'students' && (
            <StudentsGradesTab students={courseStudents} loading={studentsLoading} courseId={id} onRefresh={refreshStudents} />
          )}
        </div>

        {/* ── Sidebar ── */}
        <div className="lg:col-span-1">
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 sticky top-20">
            <h3 className="font-semibold text-white mb-4">Acerca de este curso</h3>
            <div className="space-y-3 text-sm mb-6">
              {[
                { label: 'Instructor', value: course.teacher?.name },
                { label: 'Lecciones', value: course.lessons?.length || 0 },
                { label: 'Alumnos', value: course._count?.enrollments || 0 },
                { label: 'Tareas', value: course.tasks?.length || 0 },
                { label: 'Horarios', value: course.schedules?.length || 0 },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-zinc-500">{label}</span>
                  <span className="font-medium text-white">{value}</span>
                </div>
              ))}
            </div>

            {curricProgress !== null && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-zinc-400">Progreso currículo</span>
                  <span className="text-sm font-bold text-indigo-400">{curricProgress}%</span>
                </div>
                <ProgressBar value={curricProgress} />
              </div>
            )}

            {user && !isTeacher && !isOwner && (
              <EnrollmentButton status={enrollmentStatus} enrolling={enrolling} onEnroll={handleEnroll} isPublished={course.isPublished} />
            )}
            {!user && (
              <Link to="/login" className="block w-full text-center bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-lg font-medium transition-colors">
                Inicia sesión para inscribirte
              </Link>
            )}
          </div>
        </div>
      </div>

      {showEditModal && (
        <EditCourseModal
          course={course}
          onClose={() => setShowEditModal(false)}
          onSaved={(updated) => setCourse((c) => ({ ...c, ...updated }))}
        />
      )}
    </div>
  )
}
