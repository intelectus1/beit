import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import toast from 'react-hot-toast'
import {
  BookOpen,
  Users,
  ChevronRight,
  Plus,
  Edit,
  ClipboardList,
  ChevronDown,
  User,
  Check,
  X,
  Star,
  Link2,
} from 'lucide-react'

// ── Edit Course Modal ──────────────────────────────────────────────────────────
function EditCourseModal({ course, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: course.title,
    description: course.description || '',
    teamsLink: course.teamsLink || '',
  })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim()) return toast.error('El título es requerido')
    setLoading(true)
    try {
      const payload = {
        title: form.title,
        description: form.description,
        teamsLink: form.teamsLink.trim() || null,
      }
      const { data } = await api.put(`/courses/${course.id}`, payload)
      onSaved(data)
      toast.success('Curso actualizado')
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al actualizar el curso')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-white">Editar curso</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Título</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              placeholder="Título del curso"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Descripción</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-colors"
              placeholder="Descripción del curso..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Link2 size={13} className="text-blue-400" />
                Enlace de clase en Teams (opcional)
              </span>
            </label>
            <input
              type="url"
              value={form.teamsLink}
              onChange={(e) => setForm((f) => ({ ...f, teamsLink: e.target.value }))}
              className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              placeholder="https://teams.microsoft.com/l/meetup-join/..."
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
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
      toast.error(err.response?.data?.error || 'Error al procesar la solicitud')
    } finally {
      setProcessing((p) => ({ ...p, [enrollmentId]: false }))
    }
  }

  if (loading) return <div className="text-zinc-400 text-center py-12">Cargando solicitudes...</div>

  if (requests.length === 0) {
    return (
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-10 text-center">
        <Users size={36} className="mx-auto mb-3 text-zinc-700" />
        <p className="text-zinc-400">No hay solicitudes pendientes</p>
      </div>
    )
  }

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
            <button
              onClick={() => handleAction(req.id, 'ACCEPTED')}
              disabled={processing[req.id]}
              className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
              <Check size={14} /> Aceptar
            </button>
            <button
              onClick={() => handleAction(req.id, 'REJECTED')}
              disabled={processing[req.id]}
              className="flex items-center gap-1.5 bg-red-500/15 hover:bg-red-500/25 disabled:opacity-50 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
              <X size={14} /> Rechazar
            </button>
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

  async function handleGrade(submissionId, score, maxScore) {
    if (score === '' || score === undefined) return
    const numScore = Number(score)
    if (isNaN(numScore) || numScore < 0 || numScore > maxScore) {
      return toast.error(`La nota debe estar entre 0 y ${maxScore}`)
    }
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

  if (loading) return <div className="text-zinc-400 text-center py-12">Cargando estudiantes...</div>

  if (students.length === 0) {
    return (
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-10 text-center">
        <Users size={36} className="mx-auto mb-3 text-zinc-700" />
        <p className="text-zinc-400">No hay estudiantes aceptados aún</p>
        <p className="text-zinc-600 text-sm mt-1">Acepta solicitudes en la pestaña "Solicitudes"</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {students.map((student) => (
        <div key={student.id} className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <button
            onClick={() => setExpanded((e) => ({ ...e, [student.id]: !e[student.id] }))}
            className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/40 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                <User size={14} className="text-indigo-400" />
              </div>
              <div className="text-left">
                <p className="font-medium text-white">{student.name}</p>
                <p className="text-xs text-zinc-500">{student.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-600">
                {student.tasks.filter((t) => t.status === 'GRADED').length}/{student.tasks.length} calificadas
              </span>
              <ChevronDown
                size={16}
                className={`text-zinc-500 transition-transform duration-200 ${expanded[student.id] ? 'rotate-180' : ''}`}
              />
            </div>
          </button>

          {expanded[student.id] && (
            <div className="border-t border-zinc-800">
              {student.tasks.length === 0 ? (
                <p className="text-zinc-600 text-sm text-center py-4">Sin tareas en este curso</p>
              ) : (
                student.tasks.map((task) => (
                  <div
                    key={task.taskId}
                    className="flex items-center gap-4 px-5 py-3 border-b border-zinc-800/60 last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{task.taskTitle}</p>
                    </div>
                    <span className="text-xs text-zinc-600 shrink-0">Máx: {task.maxScore}</span>

                    {task.submissionId ? (
                      task.status === 'GRADED' ? (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Star size={13} className="text-yellow-400" />
                          <span className="text-green-400 text-sm font-semibold">
                            {task.score}/{task.maxScore}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 shrink-0">
                          <input
                            type="number"
                            min={0}
                            max={task.maxScore}
                            value={scores[task.submissionId] ?? ''}
                            onChange={(e) =>
                              setScores((s) => ({ ...s, [task.submissionId]: e.target.value }))
                            }
                            className="w-16 bg-zinc-800 border border-zinc-700 text-white rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 [color-scheme:dark]"
                            placeholder="Pts"
                          />
                          <button
                            onClick={() =>
                              handleGrade(task.submissionId, scores[task.submissionId], task.maxScore)
                            }
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

// ── My Grades Section (student) ────────────────────────────────────────────────
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
                {!grade.submitted
                  ? 'Sin entregar'
                  : grade.status === 'GRADED'
                  ? 'Calificado'
                  : 'Entregado — pendiente de revisión'}
              </p>
            </div>
            <div className="text-right shrink-0">
              {grade.status === 'GRADED' ? (
                <div>
                  <span className="text-green-400 font-semibold">
                    {grade.score}/{grade.maxScore}
                  </span>
                  {grade.feedback && (
                    <p className="text-xs text-zinc-500 mt-0.5 max-w-[180px] truncate">{grade.feedback}</p>
                  )}
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

// ── Enrollment Status Button (student sidebar) ─────────────────────────────────
function EnrollmentButton({ status, enrolling, onEnroll, isPublished }) {
  if (status === 'ACCEPTED') {
    return (
      <div className="text-center py-2.5 text-green-400 font-medium bg-green-500/10 border border-green-500/20 rounded-lg text-sm">
        ✓ Ya estás inscrito
      </div>
    )
  }
  if (status === 'PENDING') {
    return (
      <div className="text-center py-2.5 text-yellow-400 font-medium bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm">
        Solicitud pendiente de aprobación
      </div>
    )
  }
  if (!isPublished) {
    return (
      <div className="text-center py-3 px-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm text-yellow-200">
        Este curso aún no está publicado. Solo podrás solicitar inscripción cuando el profesor lo publique.
      </div>
    )
  }

  if (status === 'REJECTED') {
    return (
      <div className="space-y-2">
        <div className="text-center py-2.5 text-red-400 font-medium bg-red-500/10 border border-red-500/20 rounded-lg text-sm">
          Solicitud rechazada
        </div>
        <button
          onClick={onEnroll}
          disabled={enrolling}
          className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
        >
          {enrolling ? 'Enviando...' : 'Volver a solicitar'}
        </button>
      </div>
    )
  }
  return (
    <button
      onClick={onEnroll}
      disabled={enrolling}
      className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {enrolling ? 'Enviando solicitud...' : 'Solicitar Inscripción'}
    </button>
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

  // Load course + preload requests count for owner
  useEffect(() => {
    api
      .get(`/courses/${id}`)
      .then((res) => {
        setCourse(res.data)
        // If owner, preload requests so badge shows immediately
        const isCourseOwner =
          user && (user.id === res.data.teacherId || user.role === 'ADMIN')
        if (isCourseOwner) {
          api
            .get(`/courses/${id}/enrollment-requests`)
            .then((r) => setEnrollmentRequests(r.data))
            .catch(() => {})
        }
      })
      .catch(() => toast.error('Curso no encontrado'))
      .finally(() => setLoading(false))
  }, [id, user])

  // Load enrollment status for students
  useEffect(() => {
    if (user?.role !== 'STUDENT') return
    api
      .get(`/courses/${id}/my-enrollment`)
      .then((res) => {
        if (res.data) setEnrollmentStatus(res.data.status)
      })
      .catch(() => {})
  }, [id, user])

  // Load student grades when ACCEPTED
  useEffect(() => {
    if (user?.role !== 'STUDENT' || enrollmentStatus !== 'ACCEPTED') return
    api
      .get(`/courses/${id}/my-grades`)
      .then((res) => setMyGrades(res.data))
      .catch(() => {})
  }, [id, user, enrollmentStatus])

  function handleTabChange(tab) {
    setActiveTab(tab)
    if (tab === 'requests') {
      setRequestsLoading(true)
      api
        .get(`/courses/${id}/enrollment-requests`)
        .then((res) => setEnrollmentRequests(res.data))
        .catch(() => {})
        .finally(() => setRequestsLoading(false))
    } else if (tab === 'students') {
      setStudentsLoading(true)
      api
        .get(`/courses/${id}/students`)
        .then((res) => setCourseStudents(res.data))
        .catch(() => {})
        .finally(() => setStudentsLoading(false))
    }
  }

  function handleRequestAction(enrollmentId, status) {
    setEnrollmentRequests((reqs) => reqs.filter((r) => r.id !== enrollmentId))
    if (status === 'ACCEPTED') {
      setCourse((c) => ({
        ...c,
        _count: { ...c._count, enrollments: (c._count?.enrollments || 0) + 1 },
      }))
    }
  }

  function refreshStudents() {
    api
      .get(`/courses/${id}/students`)
      .then((res) => setCourseStudents(res.data))
      .catch(() => {})
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
    { key: 'requests', label: 'Solicitudes', badge: enrollmentRequests.length },
    { key: 'students', label: 'Estudiantes y Calificaciones' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Main content ── */}
        <div className="lg:col-span-2">
          {/* Hero card */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-8 text-white mb-6">
            <div className="flex items-start justify-between mb-4">
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${
                  course.isPublished
                    ? 'bg-green-400/20 text-green-300 border border-green-400/30'
                    : 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/30'
                }`}
              >
                {course.isPublished ? 'Publicado' : 'Borrador'}
              </span>
              {isOwner && (
                <div className="flex gap-2">
                  <button
                    onClick={handlePublish}
                    className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {course.isPublished ? 'Despublicar' : 'Publicar'}
                  </button>
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Edit size={12} /> Editar
                  </button>
                </div>
              )}
            </div>
            <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
            <p className="text-indigo-200 mb-4">{course.description || 'Sin descripción'}</p>
            <div className="flex items-center gap-4 text-sm text-indigo-200">
              <span>Prof. {course.teacher?.name}</span>
              <span className="flex items-center gap-1">
                <Users size={14} /> {course._count?.enrollments || 0} alumnos
              </span>
              <span>{course.lessons?.length || 0} lecciones</span>
            </div>
          </div>

          {/* Teacher tab bar */}
          {isOwner && (
            <div className="flex gap-1 mb-6 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
              {teacherTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`flex-1 py-2 px-2 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                    activeTab === tab.key
                      ? 'bg-indigo-500 text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
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

          {/* ── CONTENT TAB (default for teacher, always for student) ── */}
          {(!isOwner || activeTab === 'content') && (
            <>
              {/* Teams link — only shown to enrolled students when set */}
              {!isOwner && isAccepted && course.teamsLink && (
                <a
                  href={course.teamsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-xl p-4 mb-6 group transition-colors animate-fade-up"
                  style={{ '--i': 0 }}
                >
                  <div className="bg-blue-500/20 p-2.5 rounded-lg shrink-0">
                    <Link2 size={18} className="text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-blue-300 group-hover:text-blue-200 transition-colors">
                      Clase en TEAMS con el instructor
                    </p>
                    <p className="text-xs text-blue-400/70 mt-0.5 truncate">{course.teamsLink}</p>
                  </div>
                  <ChevronRight size={16} className="text-blue-400/60 group-hover:text-blue-300 shrink-0 transition-colors" />
                </a>
              )}

              {/* Lessons */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">Lecciones</h2>
                  {isOwner && (
                    <Link
                      to={`/courses/${id}/lessons/create`}
                      className="flex items-center gap-1 text-sm bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Plus size={14} /> Nueva lección
                    </Link>
                  )}
                </div>

                {!course.lessons?.length ? (
                  <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 text-center text-zinc-400">
                    <BookOpen size={32} className="mx-auto mb-2 text-zinc-700" />
                    No hay lecciones aún
                  </div>
                ) : (
                  <div className="bg-zinc-900 rounded-xl border border-zinc-800 divide-y divide-zinc-800">
                    {course.lessons.map((lesson, i) => (
                      <div
                        key={lesson.id}
                        className="flex items-center gap-4 p-4 hover:bg-zinc-800/50 transition-colors animate-fade-up"
                        style={{ '--i': i + 1 }}
                      >
                        <span className="w-8 h-8 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center text-sm font-medium shrink-0">
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white truncate">{lesson.title}</p>
                        </div>
                        {(isOwner || isAccepted) ? (
                          <Link
                            to={`/lessons/${lesson.id}`}
                            className="text-zinc-500 hover:text-indigo-400 transition-colors"
                          >
                            <ChevronRight size={18} />
                          </Link>
                        ) : (
                          <span className="text-zinc-700">
                            <ChevronRight size={18} />
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tasks */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">Tareas</h2>
                  {isOwner && (
                    <Link
                      to={`/courses/${id}/tasks/create`}
                      className="flex items-center gap-1 text-sm bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-lg transition-colors"
                    >
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
                        <Link
                          key={task.id}
                          to={`/tasks/${task.id}`}
                          className="flex items-center gap-4 p-4 hover:bg-zinc-800/50 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-white">{task.title}</p>
                            {task.dueDate && (
                              <p className="text-xs text-zinc-500 mt-0.5">
                                Entrega: {new Date(task.dueDate).toLocaleDateString('es-PE')}
                              </p>
                            )}
                          </div>
                          <span className="text-sm text-zinc-500 shrink-0">Máx: {task.maxScore}</span>
                          <ChevronRight size={18} className="text-zinc-600 shrink-0" />
                        </Link>
                      ) : (
                        <div
                          key={task.id}
                          className="flex items-center gap-4 p-4 opacity-60 cursor-default"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-white">{task.title}</p>
                            {task.dueDate && (
                              <p className="text-xs text-zinc-500 mt-0.5">
                                Entrega: {new Date(task.dueDate).toLocaleDateString('es-PE')}
                              </p>
                            )}
                          </div>
                          <span className="text-sm text-zinc-500 shrink-0">Máx: {task.maxScore}</span>
                          <ChevronRight size={18} className="text-zinc-700 shrink-0" />
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* Student: Mis Calificaciones */}
              {user?.role === 'STUDENT' && isAccepted && (
                <MyGradesSection grades={myGrades} />
              )}
            </>
          )}

          {/* ── REQUESTS TAB ── */}
          {isOwner && activeTab === 'requests' && (
            <EnrollmentRequestsTab
              courseId={id}
              requests={enrollmentRequests}
              loading={requestsLoading}
              onAction={handleRequestAction}
            />
          )}

          {/* ── STUDENTS TAB ── */}
          {isOwner && activeTab === 'students' && (
            <StudentsGradesTab
              students={courseStudents}
              loading={studentsLoading}
              courseId={id}
              onRefresh={refreshStudents}
            />
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
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-zinc-500">{label}</span>
                  <span className="font-medium text-white">{value}</span>
                </div>
              ))}
            </div>

            {user && !isTeacher && !isOwner && (
              <EnrollmentButton
                status={enrollmentStatus}
                enrolling={enrolling}
                onEnroll={handleEnroll}
                isPublished={course.isPublished}
              />
            )}

            {!user && (
              <Link
                to="/login"
                className="block w-full text-center bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-lg font-medium transition-colors"
              >
                Inicia sesión para inscribirte
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Edit Modal ── */}
      {showEditModal && (
        <EditCourseModal
          course={course}
          onClose={() => setShowEditModal(false)}
          onSaved={(updated) =>
            setCourse((c) => ({
              ...c,
              title: updated.title,
              description: updated.description,
              teamsLink: updated.teamsLink,
            }))
          }
        />
      )}
    </div>
  )
}
