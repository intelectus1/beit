import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import { Calendar, Clock, MapPin, Video, Link2, BookOpen, UserCheck, ChevronDown } from 'lucide-react'
import { CoachSchedulingCard } from '../components/ui/coach-scheduling-card'

const DAYS_ORDER = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

const MODALITY_ICONS = {
  Virtual: <Video size={12} className="text-blue-400" />,
  Presencial: <MapPin size={12} className="text-green-400" />,
  Híbrido: <Link2 size={12} className="text-purple-400" />,
}

const MODALITY_COLORS = {
  Virtual: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Presencial: 'bg-green-500/10 text-green-400 border-green-500/20',
  Híbrido: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
}

const today = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][new Date().getDay()]

export default function SchedulesPage() {
  const { user } = useAuth()
  const [schedules, setSchedules] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterDay, setFilterDay] = useState('all')
  const [showBookingCard, setShowBookingCard] = useState(false)

  const isTeacher = user?.role === 'TEACHER' || user?.role === 'ADMIN'

  useEffect(() => {
    Promise.all([
      api.get('/schedules/my'),
      api.get('/courses/my').catch(() => ({ data: [] })),
    ])
      .then(([schRes, coursesRes]) => {
        setSchedules(Array.isArray(schRes.data) ? schRes.data : [])
        setCourses(Array.isArray(coursesRes.data) ? coursesRes.data : [])
      })
      .finally(() => setLoading(false))
  }, [])

  const grouped = DAYS_ORDER.reduce((acc, day) => {
    const daySchedules = schedules.filter((s) => {
      const dayField = isTeacher ? s.dayOfWeek : (s.course?.dayOfWeek || s.dayOfWeek)
      return dayField === day
    })
    if (daySchedules.length > 0) acc[day] = daySchedules
    return acc
  }, {})

  const filtered = filterDay === 'all' ? grouped : { [filterDay]: grouped[filterDay] || [] }
  const daysWithSchedules = Object.keys(grouped)

  function getCourseName(sch) {
    if (!isTeacher && sch.course?.title) return sch.course.title
    return courses.find((c) => c.id === sch.courseId)?.title || 'Curso'
  }

  function getTeacherName(sch) {
    if (!isTeacher && sch.course?.teacher?.name) return sch.course.teacher.name
    return null
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 animate-fade-up" style={{ '--i': 0 }}>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="bg-blue-500/20 p-2 rounded-lg">
            <Calendar size={22} className="text-blue-400" />
          </span>
          Horarios de Clases
        </h1>
        <p className="text-zinc-400 mt-1 ml-1">
          {isTeacher ? 'Tus horarios de clases programados' : 'Clases de tus cursos inscritos'}
        </p>
      </div>

      {/* Book private session — students only */}
      {!isTeacher && (
        <div className="mb-6 animate-fade-up" style={{ '--i': 1 }}>
          <button
            onClick={() => setShowBookingCard(!showBookingCard)}
            className="flex items-center gap-3 w-full bg-zinc-900 border border-zinc-800 hover:border-indigo-500/40 rounded-xl p-4 transition-all text-left group"
          >
            <div className="bg-indigo-500/20 p-2 rounded-lg shrink-0">
              <UserCheck size={18} className="text-indigo-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm">Reservar sesión privada</p>
              <p className="text-zinc-500 text-xs">Agenda una sesión 1:1 con un mentor disponible</p>
            </div>
            <ChevronDown
              size={16}
              className={`text-zinc-500 transition-transform shrink-0 ${showBookingCard ? 'rotate-180' : ''}`}
            />
          </button>

          {showBookingCard && (
            <div className="mt-3">
              <CoachSchedulingCard className="w-full max-w-none" />
            </div>
          )}
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6 animate-fade-up" style={{ '--i': isTeacher ? 1 : 2 }}>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{schedules.length}</p>
          <p className="text-xs text-zinc-500 mt-1">Clases totales</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-400">{daysWithSchedules.length}</p>
          <p className="text-xs text-zinc-500 mt-1">Días con clase</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-400">
            {grouped[today]?.length || 0}
          </p>
          <p className="text-xs text-zinc-500 mt-1">Clases hoy</p>
        </div>
      </div>

      {/* Filter by day */}
      {daysWithSchedules.length > 1 && (
        <div className="flex gap-2 flex-wrap mb-6 animate-fade-up" style={{ '--i': 2 }}>
          <button
            onClick={() => setFilterDay('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterDay === 'all' ? 'bg-indigo-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
          >
            Todos
          </button>
          {daysWithSchedules.map((day) => (
            <button
              key={day}
              onClick={() => setFilterDay(day)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterDay === day ? 'bg-indigo-500 text-white' : `bg-zinc-800 text-zinc-400 hover:text-white ${day === today ? 'border border-blue-500/30' : ''}`
              }`}
            >
              {day}
              {day === today && <span className="ml-1 text-xs text-blue-400">(hoy)</span>}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-zinc-900 border border-zinc-800 animate-pulse" />
          ))}
        </div>
      ) : schedules.length === 0 ? (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-16 text-center animate-fade-up" style={{ '--i': 3 }}>
          <Calendar size={48} className="text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-300 font-medium mb-2">
            {isTeacher ? 'No tienes horarios configurados' : 'Sin clases programadas'}
          </p>
          <p className="text-zinc-600 text-sm">
            {isTeacher
              ? 'Agrega horarios desde la sección de tus cursos'
              : 'Inscríbete en cursos que tengan horarios programados'}
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 mt-4 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <BookOpen size={14} /> Ir a mis cursos
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(filtered).map(([day, daySchedules], di) => (
            <div key={day} className="animate-fade-up" style={{ '--i': di + 3 }}>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-base font-semibold text-white">{day}</h2>
                {day === today && (
                  <span className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full">
                    Hoy
                  </span>
                )}
                <div className="flex-1 h-px bg-zinc-800" />
                <span className="text-xs text-zinc-600">{daySchedules.length} clase{daySchedules.length !== 1 ? 's' : ''}</span>
              </div>

              <div className="space-y-3">
                {daySchedules
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map((sch) => {
                    const teacherName = getTeacherName(sch)
                    return (
                      <div key={sch.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`inline-flex items-center gap-1 text-xs border px-2 py-0.5 rounded-full ${MODALITY_COLORS[sch.modality] || 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
                                {MODALITY_ICONS[sch.modality]}
                                {sch.modality}
                              </span>
                            </div>
                            <Link
                              to={`/courses/${sch.courseId}`}
                              className="text-white font-medium hover:text-indigo-300 transition-colors truncate block"
                            >
                              {getCourseName(sch)}
                            </Link>
                            {teacherName && (
                              <p className="text-xs text-zinc-500 mt-0.5">Prof. {teacherName}</p>
                            )}
                            {sch.location && (
                              <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                                <MapPin size={10} /> {sch.location}
                              </p>
                            )}
                          </div>
                          <div className="shrink-0 text-right">
                            <div className="flex items-center gap-1 text-blue-400 font-mono text-sm font-semibold">
                              <Clock size={13} />
                              {sch.startTime}
                            </div>
                            <div className="text-xs text-zinc-500 mt-0.5">hasta {sch.endTime}</div>
                          </div>
                        </div>
                        {sch.classLink && (
                          <div className="mt-3 pt-3 border-t border-zinc-800">
                            <a
                              href={sch.classLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              <Link2 size={11} /> Unirse a clase virtual
                            </a>
                          </div>
                        )}
                      </div>
                    )
                  })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
