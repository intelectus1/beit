import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { ArrowLeft, Video, ExternalLink } from 'lucide-react'

export default function LessonPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [lesson, setLesson] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/lessons/${id}`)
      .then((res) => setLesson(res.data))
      .catch(() => {
        toast.error('Lección no encontrada')
        navigate(-1)
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="text-center py-16 text-zinc-400">Cargando lección...</div>
  if (!lesson) return null

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 text-sm transition-colors"
      >
        <ArrowLeft size={16} /> Volver al curso
      </button>

      <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
        {lesson.videoUrl && (
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
          <h1 className="text-2xl font-bold text-white mb-6">{lesson.title}</h1>
          <div className="text-zinc-300 leading-relaxed whitespace-pre-wrap">{lesson.content}</div>
        </div>
      </div>
    </div>
  )
}
