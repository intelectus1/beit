import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import toast from 'react-hot-toast'

export default function CreateCoursePage() {
  const [form, setForm] = useState({ title: '', description: '', coverImage: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/courses', form)
      toast.success('Curso creado exitosamente')
      navigate(`/courses/${data.id}`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al crear el curso')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors'

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Crear nuevo curso</h1>
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              Título del curso <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={inputClass}
              placeholder="Ej: Introducción a Python"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Descripción</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={`${inputClass} resize-none`}
              placeholder="Describe de qué trata el curso..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              URL de imagen de portada
            </label>
            <input
              type="url"
              value={form.coverImage}
              onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
              className={inputClass}
              placeholder="https://..."
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
              {loading ? 'Creando...' : 'Crear curso'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
