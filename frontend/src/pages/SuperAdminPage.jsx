import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import toast from 'react-hot-toast'
import {
  Shield, User, Check, X, Clock, RefreshCw, Users, BookOpen,
  Search, Edit2, Power, ChevronDown, ChevronUp, GraduationCap,
  LayoutGrid, CheckCircle, XCircle, Eye, Trash2, AlertTriangle,
  RotateCcw, UserX,
} from 'lucide-react'
import { FlowHoverButton } from '../components/ui/flow-hover-button'

// ── Edit Teacher Modal ────────────────────────────────────────────────────────
function EditTeacherModal({ teacher, onClose, onSaved }) {
  const [form, setForm] = useState({ name: teacher.name, email: teacher.email })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.put(`/admin/teachers/${teacher.id}`, form)
      onSaved(data)
      toast.success('Profesor actualizado')
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al actualizar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-white">Editar profesor</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Nombre</label>
            <input
              type="text" required value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Email</label>
            <input
              type="email" required value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <FlowHoverButton type="button" onClick={onClose} variant="secondary" className="flex-1 py-2.5 text-sm">
              Cancelar
            </FlowHoverButton>
            <FlowHoverButton type="submit" disabled={loading} variant="primary" className="flex-1 py-2.5 text-sm">
              {loading ? 'Guardando...' : 'Guardar'}
            </FlowHoverButton>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Teacher Row ───────────────────────────────────────────────────────────────
function TeacherRow({ teacher, onEdit, onToggle, onToggleExpand, expanded }) {
  const [toggling, setToggling] = useState(false)
  const isActive = teacher.status === 'ACTIVE'
  const courses = teacher.coursesCreated || []
  const totalStudents = courses.reduce((a, c) => a + (c._count?.enrollments || 0), 0)

  async function handleToggle() {
    setToggling(true)
    try { await onToggle(teacher.id) }
    finally { setToggling(false) }
  }

  return (
    <>
      <div className="flex items-center justify-between p-4 gap-3 hover:bg-zinc-800/30 transition-colors">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
            <User size={16} className="text-indigo-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium text-white truncate">{teacher.name}</p>
              <span className={`text-xs px-1.5 py-0.5 rounded-full border ${
                isActive ? 'text-green-400 bg-green-500/10 border-green-500/20'
                : teacher.status === 'PENDING_APPROVAL' ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
                : 'text-red-400 bg-red-500/10 border-red-500/20'
              }`}>
                {isActive ? 'Activo' : teacher.status === 'PENDING_APPROVAL' ? 'Pendiente' : 'Inactivo'}
              </span>
            </div>
            <p className="text-sm text-zinc-500 truncate">{teacher.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-4 text-xs text-zinc-500 mr-2">
            <span className="flex items-center gap-1"><BookOpen size={11} /> {courses.length} cursos</span>
            <span className="flex items-center gap-1"><Users size={11} /> {totalStudents} alumnos</span>
          </div>
          <button onClick={() => onEdit(teacher)} className="p-2 text-zinc-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors" title="Editar">
            <Edit2 size={15} />
          </button>
          <button
            onClick={handleToggle} disabled={toggling}
            className={`p-2 rounded-lg transition-colors ${isActive ? 'text-zinc-500 hover:text-red-400 hover:bg-red-500/10' : 'text-zinc-500 hover:text-green-400 hover:bg-green-500/10'}`}
            title={isActive ? 'Desactivar' : 'Activar'}
          >
            {toggling ? <span className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin inline-block" /> : <Power size={15} />}
          </button>
          {courses.length > 0 && (
            <button onClick={() => onToggleExpand(teacher.id)} className="p-2 text-zinc-500 hover:text-white rounded-lg transition-colors">
              {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
          )}
        </div>
      </div>
      {expanded && courses.length > 0 && (
        <div className="border-t border-zinc-800 bg-zinc-950/50 px-4 py-3">
          <p className="text-xs text-zinc-600 mb-2 uppercase tracking-wider">Cursos asignados</p>
          <div className="space-y-1.5">
            {courses.map((course) => (
              <div key={course.id} className="flex items-center justify-between gap-2">
                <span className="text-sm text-zinc-300 truncate">{course.title}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-zinc-600">{course._count?.enrollments || 0} alumnos</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${course.isPublished ? 'text-green-400 bg-green-500/10' : 'text-yellow-400 bg-yellow-500/10'}`}>
                    {course.isPublished ? 'Publicado' : 'Borrador'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

// ── Pending Tab ───────────────────────────────────────────────────────────────
function PendingTab({ teachers, loading, processing, onAction, onRefresh }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-yellow-500/20 p-2.5 rounded-lg">
            <Clock size={18} className="text-yellow-400" />
          </div>
          <div>
            <p className="text-sm text-zinc-400">Solicitudes pendientes</p>
            <p className="text-2xl font-bold text-white">{loading ? '—' : teachers.length}</p>
          </div>
        </div>
        <FlowHoverButton onClick={onRefresh} disabled={loading} variant="secondary" icon={<RefreshCw size={14} className={loading ? 'animate-spin' : ''} />} className="text-sm px-3 py-2">
          Actualizar
        </FlowHoverButton>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-zinc-900 border border-zinc-800 animate-pulse" />)}</div>
      ) : teachers.length === 0 ? (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-12 text-center">
          <Check size={36} className="text-green-500/50 mx-auto mb-3" />
          <p className="text-zinc-300 font-medium">No hay solicitudes pendientes</p>
          <p className="text-zinc-500 text-sm mt-1">Todas las cuentas de profesor han sido revisadas</p>
        </div>
      ) : (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 divide-y divide-zinc-800 overflow-hidden">
          {teachers.map((teacher) => (
            <div key={teacher.id} className="flex items-center justify-between p-4 gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                  <User size={16} className="text-indigo-400" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-white truncate">{teacher.name}</p>
                  <p className="text-sm text-zinc-500 truncate">{teacher.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="hidden sm:inline-flex items-center gap-1 text-xs text-zinc-500">
                  <Clock size={11} />
                  {new Date(teacher.createdAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
                <div className="flex gap-2">
                  <FlowHoverButton
                    onClick={() => onAction(teacher.id, 'approve')}
                    disabled={!!processing[teacher.id]}
                    variant="success"
                    icon={processing[teacher.id] === 'approve' ? <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Check size={14} />}
                    className="text-sm px-3 py-1.5"
                  >
                    Aprobar
                  </FlowHoverButton>
                  <FlowHoverButton
                    onClick={() => onAction(teacher.id, 'reject')}
                    disabled={!!processing[teacher.id]}
                    variant="danger"
                    icon={processing[teacher.id] === 'reject' ? <span className="w-3 h-3 border-red-400/40 border-t-red-400 rounded-full animate-spin border-2" /> : <X size={14} />}
                    className="text-sm px-3 py-1.5"
                  >
                    Rechazar
                  </FlowHoverButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Students Tab ──────────────────────────────────────────────────────────────
function StudentsTab() {
  const [students, setStudents] = useState([])
  const [deletedStudents, setDeletedStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletedLoading, setDeletedLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState({})
  const [showDeleted, setShowDeleted] = useState(false)
  const [deleting, setDeleting] = useState({})
  const [restoring, setRestoring] = useState({})

  const fetchStudents = useCallback((q = '') => {
    setLoading(true)
    api.get(`/admin/students${q ? `?search=${encodeURIComponent(q)}` : ''}`)
      .then((res) => setStudents(res.data))
      .catch(() => toast.error('Error al cargar alumnos'))
      .finally(() => setLoading(false))
  }, [])

  const fetchDeletedStudents = useCallback(() => {
    setDeletedLoading(true)
    api.get('/admin/students/deleted')
      .then((res) => setDeletedStudents(res.data))
      .catch(() => toast.error('Error al cargar papelera'))
      .finally(() => setDeletedLoading(false))
  }, [])

  useEffect(() => { fetchStudents() }, [])
  useEffect(() => {
    const t = setTimeout(() => fetchStudents(search), 400)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    if (showDeleted) fetchDeletedStudents()
  }, [showDeleted])

  async function handleDelete(studentId) {
    if (!confirm('¿Eliminar este alumno? Podrá restaurarlo desde la papelera.')) return
    setDeleting((d) => ({ ...d, [studentId]: true }))
    try {
      await api.delete(`/admin/students/${studentId}`)
      setStudents((prev) => prev.filter((s) => s.id !== studentId))
      toast.success('Alumno eliminado')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al eliminar')
    } finally {
      setDeleting((d) => ({ ...d, [studentId]: false }))
    }
  }

  async function handleRestore(studentId) {
    setRestoring((r) => ({ ...r, [studentId]: true }))
    try {
      await api.put(`/admin/students/${studentId}/restore`)
      setDeletedStudents((prev) => prev.filter((s) => s.id !== studentId))
      toast.success('Alumno restaurado')
      fetchStudents(search)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al restaurar')
    } finally {
      setRestoring((r) => ({ ...r, [studentId]: false }))
    }
  }

  const accepted = (s) => s.enrollments?.filter((e) => e.status === 'ACCEPTED').length || 0
  const pending = (s) => s.enrollments?.filter((e) => e.status === 'PENDING').length || 0

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o email..."
            className="w-full bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button
          onClick={() => setShowDeleted((v) => !v)}
          className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors border ${
            showDeleted
              ? 'bg-red-500/20 border-red-500/40 text-red-400'
              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
          }`}
        >
          <UserX size={14} />
          Papelera {deletedStudents.length > 0 && !showDeleted && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{deletedStudents.length}</span>
          )}
        </button>
        <FlowHoverButton
          onClick={() => showDeleted ? fetchDeletedStudents() : fetchStudents(search)}
          disabled={loading || deletedLoading}
          variant="secondary"
          icon={<RefreshCw size={14} className={(loading || deletedLoading) ? 'animate-spin' : ''} />}
          className="text-sm px-3 py-2.5"
        >
          Actualizar
        </FlowHoverButton>
      </div>

      {/* Papelera - alumnos eliminados */}
      {showDeleted ? (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-red-500/20 p-1.5 rounded-lg">
              <UserX size={15} className="text-red-400" />
            </div>
            <h3 className="text-sm font-semibold text-red-400">Alumnos eliminados (Soft Delete)</h3>
          </div>
          {deletedLoading ? (
            <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-14 rounded-xl bg-zinc-900 border border-zinc-800 animate-pulse" />)}</div>
          ) : deletedStudents.length === 0 ? (
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-10 text-center">
              <RotateCcw size={32} className="mx-auto mb-3 text-zinc-700" />
              <p className="text-zinc-400 text-sm">La papelera está vacía</p>
            </div>
          ) : (
            <div className="bg-zinc-900 rounded-xl border border-red-500/20 divide-y divide-zinc-800 overflow-hidden">
              {deletedStudents.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-4 gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                      <GraduationCap size={15} className="text-red-400/60" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-zinc-400 truncate line-through">{student.name}</p>
                      <p className="text-sm text-zinc-600 truncate">{student.email}</p>
                      <p className="text-xs text-red-400/60 mt-0.5">
                        Eliminado: {new Date(student.deletedAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRestore(student.id)}
                    disabled={restoring[student.id]}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 rounded-lg text-sm transition-colors disabled:opacity-50 shrink-0"
                  >
                    {restoring[student.id]
                      ? <span className="w-3 h-3 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin" />
                      : <RotateCcw size={13} />
                    }
                    Restaurar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: 'Total alumnos', value: students.length, color: 'text-white' },
              { label: 'Con cursos', value: students.filter((s) => accepted(s) > 0).length, color: 'text-green-400' },
              { label: 'Sin cursos', value: students.filter((s) => accepted(s) === 0).length, color: 'text-zinc-500' },
            ].map((s) => (
              <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
                <p className={`text-xl font-bold ${s.color}`}>{loading ? '—' : s.value}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {loading ? (
            <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-14 rounded-xl bg-zinc-900 border border-zinc-800 animate-pulse" />)}</div>
          ) : students.length === 0 ? (
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-12 text-center">
              <GraduationCap size={36} className="mx-auto mb-3 text-zinc-700" />
              <p className="text-zinc-400">No se encontraron alumnos</p>
            </div>
          ) : (
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 divide-y divide-zinc-800 overflow-hidden">
              {students.map((student) => {
                const acc = accepted(student)
                const pend = pending(student)
                return (
                  <div key={student.id}>
                    <div className="flex items-center justify-between p-4 gap-3 hover:bg-zinc-800/30 transition-colors">
                      <div
                        className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                        onClick={() => setExpanded((e) => ({ ...e, [student.id]: !e[student.id] }))}
                      >
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                          {student.avatarUrl
                            ? <img src={student.avatarUrl} alt={student.name} className="w-full h-full object-cover" />
                            : <GraduationCap size={15} className="text-indigo-400" />
                          }
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-white truncate">{student.name}</p>
                          <p className="text-sm text-zinc-500 truncate">{student.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="hidden sm:flex items-center gap-3 text-xs">
                          <span className="flex items-center gap-1 text-green-400"><CheckCircle size={11} /> {acc} cursos</span>
                          {pend > 0 && <span className="flex items-center gap-1 text-yellow-400"><Clock size={11} /> {pend} pend.</span>}
                        </div>
                        <button
                          onClick={() => handleDelete(student.id)}
                          disabled={deleting[student.id]}
                          className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-40"
                          title="Eliminar alumno (se puede restaurar)"
                        >
                          {deleting[student.id]
                            ? <span className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin inline-block" />
                            : <Trash2 size={14} />
                          }
                        </button>
                        {student.enrollments?.length > 0 && (
                          <button onClick={() => setExpanded((e) => ({ ...e, [student.id]: !e[student.id] }))} className="p-1 text-zinc-600 hover:text-white">
                            {expanded[student.id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        )}
                      </div>
                    </div>
                    {expanded[student.id] && student.enrollments?.length > 0 && (
                      <div className="border-t border-zinc-800 bg-zinc-950/50 px-4 py-3">
                        <p className="text-xs text-zinc-600 mb-2 uppercase tracking-wider">Inscripciones</p>
                        <div className="space-y-1.5">
                          {student.enrollments.map((enr) => (
                            <div key={enr.id} className="flex items-center justify-between gap-2">
                              <span className="text-sm text-zinc-300 truncate">{enr.course?.title}</span>
                              <span className={`text-xs px-1.5 py-0.5 rounded border ${
                                enr.status === 'ACCEPTED' ? 'text-green-400 bg-green-500/10 border-green-500/20'
                                : enr.status === 'PENDING' ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
                                : 'text-red-400 bg-red-500/10 border-red-500/20'
                              }`}>
                                {enr.status === 'ACCEPTED' ? 'Aceptado' : enr.status === 'PENDING' ? 'Pendiente' : 'Rechazado'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ── Delete Course Modal ───────────────────────────────────────────────────────
function DeleteCourseModal({ course, onClose, onDeleted }) {
  const [confirmText, setConfirmText] = useState('')
  const [loading, setLoading] = useState(false)
  const REQUIRED = 'ELIMINAR'

  async function handleDelete() {
    if (confirmText !== REQUIRED) return
    setLoading(true)
    try {
      await api.delete(`/admin/courses/${course.id}`)
      toast.success('Curso eliminado permanentemente')
      onDeleted(course.id)
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al eliminar el curso')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-red-500/30 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="bg-red-500/20 p-2 rounded-lg shrink-0">
            <AlertTriangle size={20} className="text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Eliminar curso</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Acción permanente e irreversible</p>
          </div>
          <button onClick={onClose} className="ml-auto text-zinc-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-5 space-y-2">
          <p className="text-white font-semibold truncate">"{course.title}"</p>
          <p className="text-zinc-400 text-sm">Prof. {course.teacher?.name}</p>
          <div className="flex gap-4 text-xs text-zinc-500 pt-1">
            <span className="flex items-center gap-1"><BookOpen size={11} /> {course._count?.lessons || 0} lecciones</span>
            <span className="flex items-center gap-1"><Users size={11} /> {course._count?.enrollments || 0} alumnos</span>
          </div>
          <p className="text-red-400 text-xs pt-1">
            Se eliminarán todas las lecciones, materiales, tareas, entregas, horarios e inscripciones.
          </p>
        </div>

        <div className="mb-5">
          <label className="block text-sm text-zinc-300 mb-1.5">
            Escribe <span className="font-mono font-bold text-red-400">{REQUIRED}</span> para confirmar:
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && confirmText === REQUIRED) handleDelete() }}
            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
            placeholder={REQUIRED}
            autoFocus
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-2.5 rounded-lg text-sm transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            disabled={confirmText !== REQUIRED || loading}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
          >
            {loading
              ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Eliminando...</>
              : <><Trash2 size={14} /> Eliminar permanentemente</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Courses Tab ───────────────────────────────────────────────────────────────
function CoursesTab() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [deletingCourse, setDeletingCourse] = useState(null)

  useEffect(() => {
    setLoading(true)
    api.get('/admin/courses')
      .then((res) => setCourses(res.data))
      .catch(() => toast.error('Error al cargar cursos'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = courses.filter((c) => {
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.teacher?.name?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || (filter === 'published' && c.isPublished) || (filter === 'draft' && !c.isPublished)
    return matchSearch && matchFilter
  })

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título o profesor..."
            className="w-full bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={filter} onChange={(e) => setFilter(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">Todos</option>
          <option value="published">Publicados</option>
          <option value="draft">Borradores</option>
        </select>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Total cursos', value: courses.length, color: 'text-white' },
          { label: 'Publicados', value: courses.filter((c) => c.isPublished).length, color: 'text-green-400' },
          { label: 'Borradores', value: courses.filter((c) => !c.isPublished).length, color: 'text-yellow-400' },
        ].map((s) => (
          <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
            <p className={`text-xl font-bold ${s.color}`}>{loading ? '—' : s.value}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-zinc-900 border border-zinc-800 animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-12 text-center">
          <BookOpen size={36} className="mx-auto mb-3 text-zinc-700" />
          <p className="text-zinc-400">No se encontraron cursos</p>
        </div>
      ) : (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 divide-y divide-zinc-800 overflow-hidden">
          {filtered.map((course) => (
            <div key={course.id} className="flex items-center gap-4 p-4 hover:bg-zinc-800/30 transition-colors">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-indigo-500/20 flex items-center justify-center shrink-0">
                {course.coverImage
                  ? <img src={course.coverImage} alt={course.title} className="w-full h-full object-cover" />
                  : <BookOpen size={18} className="text-indigo-400" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{course.title}</p>
                <p className="text-sm text-zinc-500 truncate">Prof. {course.teacher?.name}</p>
              </div>
              <div className="hidden sm:flex items-center gap-4 text-xs text-zinc-500 shrink-0">
                <span className="flex items-center gap-1"><Users size={11} /> {course._count?.enrollments || 0}</span>
                <span className="flex items-center gap-1"><BookOpen size={11} /> {course._count?.lessons || 0}</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ${
                course.isPublished
                  ? 'text-green-400 bg-green-500/10 border-green-500/20'
                  : 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
              }`}>
                {course.isPublished ? 'Publicado' : 'Borrador'}
              </span>
              <Link
                to={`/courses/${course.id}`}
                className="p-1.5 text-zinc-600 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors shrink-0"
                title="Ver y editar curso"
              >
                <Eye size={15} />
              </Link>
              <button
                onClick={() => setDeletingCourse(course)}
                className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
                title="Eliminar curso"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      {deletingCourse && (
        <DeleteCourseModal
          course={deletingCourse}
          onClose={() => setDeletingCourse(null)}
          onDeleted={(id) => setCourses((prev) => prev.filter((c) => c.id !== id))}
        />
      )}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function SuperAdminPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('teachers')
  const [pendingTeachers, setPendingTeachers] = useState([])
  const [allTeachers, setAllTeachers] = useState([])
  const [pendingLoading, setPendingLoading] = useState(true)
  const [teachersLoading, setTeachersLoading] = useState(true)
  const [processing, setProcessing] = useState({})
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [editingTeacher, setEditingTeacher] = useState(null)
  const [expandedTeachers, setExpandedTeachers] = useState({})

  const fetchPending = useCallback(() => {
    setPendingLoading(true)
    api.get('/admin/teachers/pending')
      .then((res) => setPendingTeachers(res.data))
      .catch(() => toast.error('Error al cargar solicitudes'))
      .finally(() => setPendingLoading(false))
  }, [])

  const fetchAllTeachers = useCallback((q = '') => {
    setTeachersLoading(true)
    api.get(`/admin/teachers${q ? `?search=${encodeURIComponent(q)}` : ''}`)
      .then((res) => setAllTeachers(res.data))
      .catch(() => toast.error('Error al cargar profesores'))
      .finally(() => setTeachersLoading(false))
  }, [])

  useEffect(() => { fetchPending(); fetchAllTeachers() }, [])
  useEffect(() => {
    const t = setTimeout(() => fetchAllTeachers(search), 400)
    return () => clearTimeout(t)
  }, [search])

  async function handleAction(teacherId, action) {
    setProcessing((p) => ({ ...p, [teacherId]: action }))
    try {
      await api.put(`/admin/teachers/${teacherId}/${action}`)
      setPendingTeachers((prev) => prev.filter((t) => t.id !== teacherId))
      fetchAllTeachers(search)
      toast.success(action === 'approve' ? 'Profesor aprobado' : 'Solicitud rechazada')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al procesar')
    } finally {
      setProcessing((p) => ({ ...p, [teacherId]: null }))
    }
  }

  async function handleToggle(teacherId) {
    try {
      const { data } = await api.put(`/admin/teachers/${teacherId}/toggle-status`)
      setAllTeachers((prev) => prev.map((t) => (t.id === teacherId ? { ...t, status: data.status } : t)))
      toast.success(data.status === 'ACTIVE' ? 'Cuenta activada' : 'Cuenta desactivada')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error')
    }
  }

  function handleTeacherSaved(updated) {
    setAllTeachers((prev) => prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t)))
  }

  const filteredTeachers = allTeachers.filter((t) => {
    if (filterStatus === 'active') return t.status === 'ACTIVE'
    if (filterStatus === 'inactive') return t.status !== 'ACTIVE'
    return true
  })

  const tabs = [
    { key: 'teachers', label: 'Profesores', icon: <Users size={15} /> },
    { key: 'students', label: 'Alumnos', icon: <GraduationCap size={15} /> },
    { key: 'courses', label: 'Cursos', icon: <LayoutGrid size={15} /> },
    { key: 'pending', label: 'Aprobaciones', icon: <Clock size={15} />, badge: pendingTeachers.length },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8 animate-fade-up" style={{ '--i': 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="bg-indigo-500/20 p-2 rounded-lg">
            <Shield size={22} className="text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Panel de Super Admin</h1>
        </div>
        <p className="text-zinc-400 mt-1 ml-1">
          Sesión como <span className="text-white font-medium">{user?.name}</span> · Administración completa de la plataforma
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-zinc-900 border border-zinc-800 rounded-xl p-1 overflow-x-auto animate-fade-up" style={{ '--i': 1 }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-shrink-0 flex-1 flex items-center justify-center gap-2 py-2.5 px-3 text-sm font-medium rounded-lg transition-colors ${
              activeTab === tab.key ? 'bg-indigo-500 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
            {tab.badge > 0 && (
              <span className="bg-yellow-400 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Teachers Tab */}
      {activeTab === 'teachers' && (
        <div className="animate-fade-up" style={{ '--i': 2 }}>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex-1 relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre o email..."
                className="w-full bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <select
              value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Solo activos</option>
              <option value="inactive">Solo inactivos</option>
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: 'Total profesores', value: allTeachers.length, color: 'text-white' },
              { label: 'Activos', value: allTeachers.filter((t) => t.status === 'ACTIVE').length, color: 'text-green-400' },
              { label: 'Inactivos', value: allTeachers.filter((t) => t.status !== 'ACTIVE').length, color: 'text-red-400' },
            ].map((s) => (
              <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
                <p className={`text-xl font-bold ${s.color}`}>{teachersLoading ? '—' : s.value}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {teachersLoading ? (
            <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-zinc-900 border border-zinc-800 animate-pulse" />)}</div>
          ) : filteredTeachers.length === 0 ? (
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-12 text-center">
              <Users size={36} className="mx-auto mb-3 text-zinc-700" />
              <p className="text-zinc-400">No se encontraron profesores</p>
            </div>
          ) : (
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 divide-y divide-zinc-800 overflow-hidden">
              {filteredTeachers.map((teacher) => (
                <TeacherRow
                  key={teacher.id} teacher={teacher}
                  onEdit={setEditingTeacher} onToggle={handleToggle}
                  onToggleExpand={(id) => setExpandedTeachers((e) => ({ ...e, [id]: !e[id] }))}
                  expanded={!!expandedTeachers[teacher.id]}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'students' && <div className="animate-fade-up" style={{ '--i': 2 }}><StudentsTab /></div>}
      {activeTab === 'courses' && <div className="animate-fade-up" style={{ '--i': 2 }}><CoursesTab /></div>}

      {activeTab === 'pending' && (
        <div className="animate-fade-up" style={{ '--i': 2 }}>
          <PendingTab teachers={pendingTeachers} loading={pendingLoading} processing={processing} onAction={handleAction} onRefresh={fetchPending} />
        </div>
      )}

      {editingTeacher && (
        <EditTeacherModal teacher={editingTeacher} onClose={() => setEditingTeacher(null)} onSaved={handleTeacherSaved} />
      )}
    </div>
  )
}
