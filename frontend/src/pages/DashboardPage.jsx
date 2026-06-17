import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import { BookOpen, Users, ClipboardList, Plus, ArrowRight } from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/courses/my')
      .then((res) => setCourses(Array.isArray(res.data) ? res.data : []))
      .finally(() => setLoading(false))
  }, [])

  const isTeacher = user?.role === 'TEACHER' || user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 animate-fade-up" style={{ '--i': 0 }}>
        <h1 className="text-2xl font-bold text-white">
          Bienvenido, {user?.name}
        </h1>
        <p className="text-zinc-400 mt-1">
          {isTeacher ? 'Gestiona tus cursos y alumnos' : 'Continúa aprendiendo'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {[
          {
            icon: <BookOpen size={22} className="text-indigo-400" />,
            bg: 'bg-indigo-500/20',
            label: isTeacher ? 'Cursos creados' : 'Cursos inscritos',
            value: courses.length,
          },
          {
            icon: <Users size={22} className="text-green-400" />,
            bg: 'bg-green-500/20',
            label: isTeacher ? 'Total alumnos' : 'Lecciones disponibles',
            value: isTeacher
              ? courses.reduce((acc, c) => acc + (c._count?.enrollments || 0), 0)
              : courses.reduce((acc, c) => acc + (c._count?.lessons || 0), 0),
          },
          {
            icon: <ClipboardList size={22} className="text-yellow-400" />,
            bg: 'bg-yellow-500/20',
            label: 'Rol',
            value: user?.role === 'TEACHER'
              ? 'Profesor'
              : user?.role === 'ADMIN'
              ? 'Administrador'
              : user?.role === 'SUPER_ADMIN'
              ? 'Super Admin'
              : 'Alumno',
            small: true,
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-zinc-900 rounded-xl border border-zinc-800 p-5 animate-fade-up"
            style={{ '--i': i + 1 }}
          >
            <div className="flex items-center gap-3">
              <div className={`${stat.bg} p-3 rounded-lg`}>{stat.icon}</div>
              <div>
                <p className="text-sm text-zinc-400">{stat.label}</p>
                <p className={`font-bold text-white ${stat.small ? 'text-xl' : 'text-2xl'}`}>{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Courses header */}
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
            Explorar cursos <ArrowRight size={14} />
          </Link>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-52 rounded-xl bg-zinc-900 border border-zinc-800 animate-pulse" />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course, i) => (
            <Link
              key={course.id}
              to={`/courses/${course.id}`}
              className="block group cursor-pointer animate-fade-up"
              style={{ '--i': i + 5 }}
              aria-label={`Ver curso: ${course.title}`}
            >
              <div className="bg-zinc-900 rounded-xl border border-zinc-800 group-hover:border-zinc-700 transition-all overflow-hidden">
                <div className="h-32 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <BookOpen size={40} className="text-white opacity-80" />
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-white line-clamp-2">{course.title}</h3>
                    {!course.isPublished && (
                      <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded-full ml-2 shrink-0">
                        Borrador
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-zinc-400 line-clamp-2 mb-3">
                    {course.description || 'Sin descripción'}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                      <span>{course._count?.lessons || 0} lecciones</span>
                      {isTeacher && <span>{course._count?.enrollments || 0} alumnos</span>}
                    </div>
                    <span className="text-xs text-indigo-400 group-hover:text-indigo-300 transition-colors">
                      Ver detalles →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
