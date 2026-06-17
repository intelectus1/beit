import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { Shield, User, Check, X, Clock, RefreshCw } from 'lucide-react'

export default function SuperAdminPage() {
  const { user } = useAuth()
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState({})

  function fetchPending() {
    setLoading(true)
    api.get('/admin/teachers/pending')
      .then((res) => setTeachers(res.data))
      .catch(() => toast.error('Error al cargar profesores pendientes'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchPending() }, [])

  async function handleAction(teacherId, action) {
    setProcessing((p) => ({ ...p, [teacherId]: action }))
    try {
      await api.put(`/admin/teachers/${teacherId}/${action}`)
      setTeachers((prev) => prev.filter((t) => t.id !== teacherId))
      toast.success(action === 'approve' ? 'Profesor aprobado exitosamente' : 'Solicitud rechazada')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al procesar la solicitud')
    } finally {
      setProcessing((p) => ({ ...p, [teacherId]: null }))
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 animate-fade-up" style={{ '--i': 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="bg-indigo-500/20 p-2 rounded-lg">
            <Shield size={22} className="text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Panel de Super Admin</h1>
        </div>
        <p className="text-zinc-400 mt-1 ml-1">
          Sesión como <span className="text-white font-medium">{user?.name}</span> · Gestión de aprobaciones de profesores
        </p>
      </div>

      {/* Stats card */}
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-6 flex items-center justify-between animate-fade-up"
        style={{ '--i': 1 }}
      >
        <div className="flex items-center gap-3">
          <div className="bg-yellow-500/20 p-3 rounded-lg">
            <Clock size={20} className="text-yellow-400" />
          </div>
          <div>
            <p className="text-sm text-zinc-400">Profesores pendientes de aprobación</p>
            <p className="text-3xl font-bold text-white">{loading ? '—' : teachers.length}</p>
          </div>
        </div>
        <button
          onClick={fetchPending}
          disabled={loading}
          className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-3 py-2 rounded-lg transition-colors disabled:opacity-40"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </div>

      {/* Table / List */}
      <div className="animate-fade-up" style={{ '--i': 2 }}>
        <h2 className="text-base font-semibold text-white mb-3">Solicitudes pendientes</h2>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-zinc-900 border border-zinc-800 animate-pulse" />
            ))}
          </div>
        ) : teachers.length === 0 ? (
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-12 text-center">
            <Check size={36} className="text-green-500/50 mx-auto mb-3" />
            <p className="text-zinc-300 font-medium">No hay solicitudes pendientes</p>
            <p className="text-zinc-500 text-sm mt-1">Todas las cuentas de profesor han sido revisadas</p>
          </div>
        ) : (
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 divide-y divide-zinc-800 overflow-hidden">
            {teachers.map((teacher, i) => (
              <div
                key={teacher.id}
                className="flex items-center justify-between p-4 gap-4 animate-fade-up"
                style={{ '--i': i + 3 }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                    <User size={16} className="text-indigo-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-white truncate">{teacher.name}</p>
                    <p className="text-sm text-zinc-500 truncate">{teacher.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="hidden sm:inline-flex items-center gap-1 text-xs text-zinc-500">
                    <Clock size={11} />
                    {new Date(teacher.createdAt).toLocaleDateString('es-PE', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAction(teacher.id, 'approve')}
                      disabled={!!processing[teacher.id]}
                      className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    >
                      {processing[teacher.id] === 'approve'
                        ? <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        : <Check size={14} />}
                      Aprobar
                    </button>
                    <button
                      onClick={() => handleAction(teacher.id, 'reject')}
                      disabled={!!processing[teacher.id]}
                      className="flex items-center gap-1.5 bg-red-500/15 hover:bg-red-500/25 disabled:opacity-50 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    >
                      {processing[teacher.id] === 'reject'
                        ? <span className="w-3 h-3 border-2 border-red-400/40 border-t-red-400 rounded-full animate-spin" />
                        : <X size={14} />}
                      Rechazar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
