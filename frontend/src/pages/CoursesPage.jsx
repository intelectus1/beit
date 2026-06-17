import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { BookOpen, Users, Search, GraduationCap } from 'lucide-react'

export default function CoursesPage() {
  const [courses, setCourses] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/courses')
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : []
        setCourses(data)
        setFiltered(data)
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(
      courses.filter(
        (c) => c.title.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q)
      )
    )
  }, [search, courses])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Catálogo de cursos</h1>
        <p className="text-zinc-400 mt-1">Explora todos los cursos disponibles</p>
      </div>

      <div className="relative mb-6">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          placeholder="Buscar cursos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 rounded-xl bg-zinc-900 border border-zinc-800 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen size={48} className="text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-400">No se encontraron cursos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((course) => (
            <Link
              key={course.id}
              to={`/courses/${course.id}`}
              className="block group cursor-pointer"
              aria-label={`Ver curso: ${course.title}`}
              data-testid={`course-card-${course.id}`}
            >
              <div className="bg-zinc-900 rounded-xl border border-zinc-800 group-hover:border-zinc-700 transition-all overflow-hidden h-full">
                <div className="h-36 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <GraduationCap size={48} className="text-white opacity-80" />
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-white mb-1 line-clamp-2">{course.title}</h3>
                  <p className="text-sm text-zinc-400 mb-3 line-clamp-2">
                    {course.description || 'Sin descripción'}
                  </p>
                  <div className="flex items-center justify-between text-xs text-zinc-500 mb-3">
                    <span className="font-medium text-zinc-300">Prof. {course.teacher?.name}</span>
                    <div className="flex items-center gap-3">
                      <span>{course._count?.lessons || 0} lecciones</span>
                      <div className="flex items-center gap-1">
                        <Users size={12} />
                        {course._count?.enrollments || 0}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-indigo-400 group-hover:text-indigo-300 transition-colors">
                    Ver detalles →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
