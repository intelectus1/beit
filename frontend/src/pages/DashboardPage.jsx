import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import { BookOpen, Users, Calendar, Plus, ArrowRight, TrendingUp, CheckSquare, Clock } from 'lucide-react'

function ProgressBar({ value, className = '' }) {
  return (
    <div className={`h-1.5 bg-zinc-800 rounded-full overflow-hidden ${className}`}>
      <div
        className="h-full bg-indigo-500 rounded-full transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}

function CourseCard({ course, isTeacher, index }) {
  const progress = course.curriculum?.length > 0
    ? Math.round((course.curriculum.filter((i) => i.completed).length / course.curriculum.length) * 100)
    : null

  const nextSchedule = course.schedules?.length > 0 ? course.schedules[0] : null

  return (
    <Link
      to={`/courses/${course.id}`}
      className="block group cursor-pointer animate-fade-up"
      style={{ '--i': index + 5 }}
      aria-label={`Ver curso: ${course.title}`}
    >
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 group-hover:border-zinc-700 transition-all overflow-hidden h-full">
        <div className="h-28 relative overflow-hidden">
          {course.coverImage ? (
            <img src={course.coverImage} alt={course.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <BookOpen size={36} className="text-white opacity-80" />
            </div>
          )}
          {!course.isPublished && (
            <span className="absolute top-3 right-3 text-xs bg-yellow-500/30 text-yellow-300 border border-yellow-500/30 px-2 py-0.5 rounded-full backdrop-blur-sm">
              Borrador
            </span>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-white line-clamp-2 mb-2">{course.title}</h3>

          {progress !== null && (
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-zinc-500">Progreso currículo</span>
                <span className="text-xs text-indigo-400 font-medium">{progress}%</span>
              </div>
              <ProgressBar value={progress} />
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-zinc-500">
            <div className="flex items-center gap-3">
              <span>{course._count?.lessons || 0} lecciones</span>
              {isTeacher && <span>{course._count?.enrollments || 0} alumnos</span>}
            </div>
            {nextSchedule && (
              <span className="text-indigo-400 flex items-center gap-1">
                <Clock size={10} /> {nextSchedule.dayOfWeek}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [courses, setCourses] = useState([])
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)

  const isTeacher = user?.role === 'TEACHER' || user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'

  useEffect(() => {
    Promise.all([
      api.get('/courses/my'),
      api.get('/schedules/my').catch(() => ({ data: [] })),
    ])
      .then(([coursesRes, schedulesRes]) => {
        setCourses(Array.isArray(coursesRes.data) ? coursesRes.data : [])
        setSchedules(Array.isArray(schedulesRes.data) ? schedulesRes.data : [])
      })
      .finally(() => setLoading(false))
  }, [])

  const totalStudents = courses.reduce((acc, c) => acc + (c._count?.enrollments || 0), 0)
  const totalLessons = courses.reduce((acc, c) => acc + (c._count?.lessons || 0), 0)
  const upcomingCount = schedules.length

  const DAYS_ORDER = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
  const today = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][new Date().getDay()]
  const todayIndex = DAYS_ORDER.indexOf(today)
  const upcomingSchedules = [...schedules]
    .sort((a, b) => {
      const da = DAYS_ORDER.indexOf(isTeacher ? a.dayOfWeek : a.course?.dayOfWeek || a.dayOfWeek)
      const db = DAYS_ORDER.indexOf(isTeacher ? b.dayOfWeek : b.course?.dayOfWeek || b.dayOfWeek)
      return da - db
    })
    .slice(0, 5)

  const teacherStats = [
    {
      icon: <BookOpen size={22} className="text-indigo-400" />,
      bg: 'bg-indigo-500/20',
      label: 'Cursos activos',
      value: courses.filter((c) => c.isPublished).length,
    },
    {
      icon: <Users size={22} className="text-green-400" />,
      bg: 'bg-green-500/20',
      label: 'Total estudiantes',
      value: totalStudents,
    },
    {
      icon: <Calendar size={22} className="text-blue-400" />,
      bg: 'bg-blue-500/20',
      label: 'Clases programadas',
      value: upcomingCount,
    },
    {
      icon: <TrendingUp size={22} className="text-purple-400" />,
      bg: 'bg-purple-500/20',
      label: 'Cursos con currículo',
      value: courses.filter((c) => c.curriculum?.length > 0).length,
    },
  ]

  const studentStats = [
    {
      icon: <BookOpen size={22} className="text-indigo-400" />,
      bg: 'bg-indigo-500/20',
      label: 'Cursos inscritos',
      value: courses.length,
    },
    {
      icon: <CheckSquare size={22} className="text-green-400" />,
      bg: 'bg-green-500/20',
      label: 'Lecciones disponibles',
      value: totalLessons,
    },
    {
      icon: <Calendar size={22} className="text-blue-400" />,
      bg: 'bg-blue-500/20',
      label: 'Clases esta semana',
      value: upcomingCount,
    },
  ]

  const stats = isTeacher ? teacherStats : studentStats

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 animate-fade-up" style={{ '--i': 0 }}>
        <h1 className="text-2xl font-bold text-white">Mis Cursos</h1>
        <p className="text-zinc-400 mt-1">
          Bienvenido, <span className="text-white">{user?.name}</span> ·{' '}
          {isTeacher ? 'Gestiona tus cursos y alumnos' : 'Continúa aprendiendo'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-zinc-900 rounded-xl border border-zinc-800 p-4 animate-fade-up"
            style={{ '--i': i + 1 }}
          >
            <div className="flex items-center gap-3">
              <div className={`${stat.bg} p-2.5 rounded-lg shrink-0`}>{stat.icon}</div>
              <div>
                <p className="text-xs text-zinc-400">{stat.label}</p>
                <p className="text-xl font-bold text-white">{loading ? '—' : stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Courses */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4 animate-fade-up" style={{ '--i': 4 }}>
            <h2 className="text-lg font-semibold text-white">
              {isTeacher ? 'Mis cursos' : 'Cursos inscritos'}
            </h2>
            {isTeacher ? (
              <Link
                to="/courses/create"
                className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Plus size={16} />
                Nuevo curso
              </Link>
            ) : (
              <Link
                to="/courses"
                className="text-indigo-400 text-sm font-medium hover:text-indigo-300 transition-colors flex items-center gap-1"
              >
                Explorar <ArrowRight size={14} />
              </Link>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-48 rounded-xl bg-zinc-900 border border-zinc-800 animate-pulse" />
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-12 text-center animate-fade-up" style={{ '--i': 5 }}>
              <BookOpen size={40} className="text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-400 mb-4">
                {isTeacher ? 'Aún no has creado ningún curso' : 'Aún no estás inscrito en ningún curso'}
              </p>
              {isTeacher ? (
                <Link
                  to="/courses/create"
                  className="inline-block bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Crear primer curso
                </Link>
              ) : (
                <Link
                  to="/courses"
                  className="inline-block bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Explorar cursos
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map((course, i) => (
                <CourseCard key={course.id} course={course} isTeacher={isTeacher} index={i} />
              ))}
            </div>
          )}
        </div>

        {/* Upcoming schedules sidebar */}
        <div className="lg:col-span-1">
          <div className="animate-fade-up" style={{ '--i': 5 }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Calendar size={18} className="text-blue-400" />
                Próximas clases
              </h2>
              <Link to="/schedules" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                Ver todo →
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 rounded-xl bg-zinc-900 border border-zinc-800 animate-pulse" />
                ))}
              </div>
            ) : upcomingSchedules.length === 0 ? (
              <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 text-center">
                <Calendar size={32} className="mx-auto mb-2 text-zinc-700" />
                <p className="text-zinc-500 text-sm">Sin horarios programados</p>
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingSchedules.map((sch) => {
                  const courseName = isTeacher
                    ? courses.find((c) => c.id === sch.courseId)?.title
                    : sch.course?.title
                  return (
                    <div key={sch.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
                      <p className="text-white text-sm font-medium truncate">{courseName || 'Curso'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-blue-400">{sch.dayOfWeek}</span>
                        <span className="text-xs text-zinc-500">{sch.startTime} – {sch.endTime}</span>
                        <span className="text-xs text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded">{sch.modality}</span>
                      </div>
                      {sch.classLink && (
                        <a
                          href={sch.classLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-indigo-400 hover:text-indigo-300 mt-1 inline-block"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Unirse a clase →
                        </a>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
