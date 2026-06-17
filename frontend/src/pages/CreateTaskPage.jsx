import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../lib/api'
import toast from 'react-hot-toast'

export default function CreateTaskPage() {
  const { courseId } = useParams()
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', maxScore: 100 })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post(`/courses/${courseId}/tasks`, form)
      toast.success('Tarea creada exitosamente')
      navigate(`/courses/${courseId}`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al crear la tarea')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors [color-scheme:dark]'

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Nueva tarea</h1>
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
              placeholder="Ej: Ejercicio de práctica #1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              Instrucciones <span className="text-red-400">*</span>
            </label>
            <textarea
              rows={5}
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={`${inputClass} resize-y`}
              placeholder="Describe las instrucciones de la tarea..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Fecha de entrega</label>
              <input
                type="datetime-local"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Puntaje máximo</label>
              <input
                type="number"
                min={1}
                max={1000}
                value={form.maxScore}
                onChange={(e) => setForm({ ...form, maxScore: Number(e.target.value) })}
                className={inputClass}
              />
            </div>
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
              {loading ? 'Guardando...' : 'Crear tarea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
