import { useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { User, Save, Camera, Upload } from 'lucide-react'

const ROLE_LABELS = {
  STUDENT: 'Alumno',
  TEACHER: 'Profesor',
  ADMIN: 'Administrador',
  SUPER_ADMIN: 'Super Administrador',
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({ name: user?.name || '' })
  const [loading, setLoading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || '')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const inputClass =
    'w-full bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors'

  async function handleAvatarFile(e) {
    const file = e.target.files?.[0]
    if (!file) return

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file)
    setAvatarPreview(localUrl)

    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('avatar', file)
      const { data } = await api.post('/auth/avatar', fd)
      updateUser(data)
      setAvatarPreview(data.avatarUrl)
      toast.success('Foto de perfil actualizada')
    } catch (err) {
      setAvatarPreview(user?.avatarUrl || '')
      toast.error(err.response?.data?.error || 'Error al subir la imagen')
    } finally {
      setUploading(false)
      URL.revokeObjectURL(localUrl)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('El nombre es requerido')
    setLoading(true)
    try {
      const { data } = await api.put('/auth/profile', { name: form.name.trim() })
      updateUser(data)
      toast.success('Perfil actualizado correctamente')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al actualizar el perfil')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8 animate-fade-up" style={{ '--i': 0 }}>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="bg-indigo-500/20 p-2 rounded-lg">
            <User size={22} className="text-indigo-400" />
          </span>
          Mi Perfil
        </h1>
        <p className="text-zinc-400 mt-1 ml-1">Actualiza tu información personal</p>
      </div>

      {/* Avatar upload */}
      <div className="flex justify-center mb-8 animate-fade-up" style={{ '--i': 1 }}>
        <div className="relative group">
          <div
            className="w-24 h-24 rounded-full bg-zinc-800 border-2 border-zinc-700 overflow-hidden flex items-center justify-center cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt={user?.name}
                className="w-full h-full object-cover"
                onError={() => setAvatarPreview('')}
              />
            ) : (
              <User size={40} className="text-zinc-500" />
            )}
            {/* Hover overlay */}
            <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              {uploading
                ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Upload size={20} className="text-white" />
              }
            </div>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 bg-indigo-500 p-1.5 rounded-full border-2 border-zinc-950 hover:bg-indigo-600 transition-colors"
          >
            <Camera size={12} className="text-white" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleAvatarFile}
          />
        </div>
      </div>
      <p className="text-center text-xs text-zinc-500 -mt-5 mb-6">Haz clic en la foto para cambiarla</p>

      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 animate-fade-up" style={{ '--i': 2 }}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              Nombre <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className={inputClass}
              placeholder="Tu nombre completo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className={`${inputClass} opacity-50 cursor-not-allowed`}
            />
            <p className="text-xs text-zinc-600 mt-1">El email no se puede cambiar</p>
          </div>

          <div className="pt-1 flex items-center gap-3">
            <div className="flex-1 bg-zinc-800 rounded-lg p-3">
              <p className="text-xs text-zinc-500">Rol actual</p>
              <p className="text-sm text-indigo-300 font-medium mt-0.5">
                {ROLE_LABELS[user?.role] || user?.role}
              </p>
            </div>
            <div className="flex-1 bg-zinc-800 rounded-lg p-3">
              <p className="text-xs text-zinc-500">Estado</p>
              <p className="text-sm text-green-400 font-medium mt-0.5">Activo</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2.5 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <Save size={16} />
            {loading ? 'Guardando...' : 'Guardar nombre'}
          </button>
        </form>
      </div>
    </div>
  )
}
