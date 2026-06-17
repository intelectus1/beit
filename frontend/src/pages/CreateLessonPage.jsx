import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../lib/api'
import toast from 'react-hot-toast'

export default function CreateLessonPage() {
  const { courseId } = useParams()
  const [form, setForm] = useState({ title: '', content: '', videoUrl: '', order: 0 })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post(`/courses/${courseId}/lessons`, form)
      toast.success('Lección creada exitosamente')
      navigate(`/courses/${courseId}`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al crear la lección')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors'

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Nueva lección</h1>
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              Título <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={inputClass}
              placeholder="Ej: Introducción a variables"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              Contenido <span className="text-red-400">*</span>
            </label>
            <textarea
              rows={8}
              required
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className={`${inputClass} resize-y`}
              placeholder="Escribe el contenido de la lección..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              URL del video <span className="text-zinc-600">(opcional)</span>
            </label>
            <input
              type="url"
              value={form.videoUrl}
              onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
              className={inputClass}
              placeholder="https://youtube.com/..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Orden</label>
            <input
              type="number"
              min={0}
              value={form.order}
              onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
              className={inputClass}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 border border-zinc-700 text-zinc-300 py-2.5 rounded-lg font-medium hover:bg-zinc-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white py-2.5 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Guardando...' : 'Crear lección'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
