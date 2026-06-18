import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { ImagePlus, X } from 'lucide-react'

export default function CreateCoursePage() {
  const [form, setForm] = useState({ title: '', description: '' })
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const inputClass =
    'w-full bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors'

  function handleCoverChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverFile(file)
    const url = URL.createObjectURL(file)
    setCoverPreview(url)
  }

  function removeCover() {
    setCoverFile(null)
    if (coverPreview) URL.revokeObjectURL(coverPreview)
    setCoverPreview('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const { data: course } = await api.post('/courses', {
        title: form.title,
        description: form.description,
      })

      if (coverFile) {
        const fd = new FormData()
        fd.append('cover', coverFile)
        try {
          await api.put(`/courses/${course.id}/cover`, fd)
        } catch {
          toast.error('Curso creado, pero la imagen de portada no se pudo subir')
        }
      }

      toast.success('Curso creado exitosamente')
      navigate(`/courses/${course.id}`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al crear el curso')
    } finally {
      setLoading(false)
    }
  }

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

          {/* Cover image upload */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              Imagen de portada
            </label>
            {coverPreview ? (
              <div className="relative rounded-xl overflow-hidden h-40 bg-zinc-800">
                <img src={coverPreview} alt="Portada" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={removeCover}
                  className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-32 border-2 border-dashed border-zinc-700 hover:border-indigo-500 rounded-xl flex flex-col items-center justify-center gap-2 text-zinc-500 hover:text-indigo-400 transition-colors"
              >
                <ImagePlus size={24} />
                <span className="text-sm">Seleccionar imagen de portada</span>
                <span className="text-xs text-zinc-600">JPG, PNG, WebP — máx 10 MB</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleCoverChange}
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
