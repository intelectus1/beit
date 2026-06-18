import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import toast from 'react-hot-toast'
import {
  Shield, User, Check, X, Clock, RefreshCw, Users, BookOpen,
  Search, Edit2, Power, ChevronDown, ChevronUp, Save,
} from 'lucide-react'

// ── Edit Teacher Modal ────────────────────────────────────────────────────────
function EditTeacherModal({ teacher, onClose, onSaved }) {
  const [form, setForm] = useState({ name: teacher.name, email: teacher.email })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.put(`/admin/teachers/${teacher.id}`, form)
      onSaved(data)
      toast.success('Profesor actualizado')
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al actualizar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-white">Editar profesor</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Nombre</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="flex-1 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Teacher Row ───────────────────────────────────────────────────────────────
function TeacherRow({ teacher, onEdit, onToggle, onToggleExpand, expanded }) {
  const [toggling, setToggling] = useState(false)
  const isActive = teacher.status === 'ACTIVE'
  const courses = teacher.coursesCreated || []
  const totalStudents = courses.reduce((a, c) => a + (c._count?.enrollments || 0), 0)

  async function handleToggle() {
    setToggling(true)
    try {
      await onToggle(teacher.id)
    } finally {
      setToggling(false)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between p-4 gap-3 hover:bg-zinc-800/30 transition-colors">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
            <User size={16} className="text-indigo-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium text-white truncate">{teacher.name}</p>
              <span className={`text-xs px-1.5 py-0.5 rounded-full border ${
                isActive ? 'text-green-400 bg-green-500/10 border-green-500/20' :
                teacher.status === 'PENDING_APPROVAL' ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' :
                'text-red-400 bg-red-500/10 border-red-500/20'
              }`}>
                {isActive ? 'Activo' : teacher.status === 'PENDING_APPROVAL' ? 'Pendiente' : 'Inactivo'}
              </span>
            </div>
            <p className="text-sm text-zinc-500 truncate">{teacher.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-4 text-xs text-zinc-500 mr-2">
            <span className="flex items-center gap-1"><BookOpen size={11} /> {courses.length} cursos</span>
            <span className="flex items-center gap-1"><Users size={11} /> {totalStudents} alumnos</span>
          </div>
          <button
            onClick={() => onEdit(teacher)}
            className="p-2 text-zinc-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
            title="Editar"
          >
            <Edit2 size={15} />
          </button>
          <button
            onClick={handleToggle}
            disabled={toggling}
            className={`p-2 rounded-lg transition-colors ${
              isActive ? 'text-zinc-500 hover:text-red-400 hover:bg-red-500/10' : 'text-zinc-500 hover:text-green-400 hover:bg-green-500/10'
            }`}
            title={isActive ? 'Desactivar' : 'Activar'}
          >
            {toggling ? <span className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin inline-block" /> : <Power size={15} />}
          </button>
          {courses.length > 0 && (
            <button
              onClick={() => onToggleExpand(teacher.id)}
              className="p-2 text-zinc-500 hover:text-white rounded-lg transition-colors"
            >
              {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
          )}
        </div>
      </div>

      {/* Expanded courses */}
      {expanded && courses.length > 0 && (
        <div className="border-t border-zinc-800 bg-zinc-950/50 px-4 py-3">
          <p className="text-xs text-zinc-600 mb-2 uppercase tracking-wider">Cursos asignados</p>
          <div className="space-y-1.5">
            {courses.map((course) => (
              <div key={course.id} className="flex items-center justify-between gap-2">
                <span className="text-sm text-zinc-300 truncate">{course.title}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-zinc-600">{course._count?.enrollments || 0} alumnos</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${course.isPublished ? 'text-green-400 bg-green-500/10' : 'text-yellow-400 bg-yellow-500/10'}`}>
                    {course.isPublished ? 'Publicado' : 'Borrador'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

// ── Pending Tab ───────────────────────────────────────────────────────────────
function PendingTab({ teachers, loading, processing, onAction, onRefresh }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-yellow-500/20 p-2.5 rounded-lg">
            <Clock size={18} className="text-yellow-400" />
          </div>
          <div>
            <p className="text-sm text-zinc-400">Solicitudes pendientes</p>
            <p className="text-2xl font-bold text-white">{loading ? '—' : teachers.length}</p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-3 py-2 rounded-lg transition-colors disabled:opacity-40"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-zinc-900 border border-zinc-800 animate-pulse" />)}</div>
      ) : teachers.length === 0 ? (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-12 text-center">
          <Check size={36} className="text-green-500/50 mx-auto mb-3" />
          <p className="text-zinc-300 font-medium">No hay solicitudes pendientes</p>
          <p className="text-zinc-500 text-sm mt-1">Todas las cuentas de profesor han sido revisadas</p>
        </div>
      ) : (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 divide-y divide-zinc-800 overflow-hidden">
          {teachers.map((teacher) => (
            <div key={teacher.id} className="flex items-center justify-between p-4 gap-4">
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
                  {new Date(teacher.createdAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => onAction(teacher.id, 'approve')}
                    disabled={!!processing[teacher.id]}
                    className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  >
                    {processing[teacher.id] === 'approve' ? <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Check size={14} />}
                    Aprobar
                  </button>
                  <button
                    onClick={() => onAction(teacher.id, 'reject')}
                    disabled={!!processing[teacher.id]}
                    className="flex items-center gap-1.5 bg-red-500/15 hover:bg-red-500/25 disabled:opacity-50 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  >
                    {processing[teacher.id] === 'reject' ? <span className="w-3 h-3 border-2 border-red-400/40 border-t-red-400 rounded-full animate-spin" /> : <X size={14} />}
                    Rechazar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function SuperAdminPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('teachers')
  const [pendingTeachers, setPendingTeachers] = useState([])
  const [allTeachers, setAllTeachers] = useState([])
  const [pendingLoading, setPendingLoading] = useState(true)
  const [teachersLoading, setTeachersLoading] = useState(true)
  const [processing, setProcessing] = useState({})
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [editingTeacher, setEditingTeacher] = useState(null)
  const [expandedTeachers, setExpandedTeachers] = useState({})

  const fetchPending = useCallback(() => {
    setPendingLoading(true)
    api.get('/admin/teachers/pending')
      .then((res) => setPendingTeachers(res.data))
      .catch(() => toast.error('Error al cargar solicitudes'))
      .finally(() => setPendingLoading(false))
  }, [])

  const fetchAllTeachers = useCallback((q = '') => {
    setTeachersLoading(true)
    api.get(`/admin/teachers${q ? `?search=${encodeURIComponent(q)}` : ''}`)
      .then((res) => setAllTeachers(res.data))
      .catch(() => toast.error('Error al cargar profesores'))
      .finally(() => setTeachersLoading(false))
  }, [])

  useEffect(() => {
    fetchPending()
    fetchAllTeachers()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => fetchAllTeachers(search), 400)
    return () => clearTimeout(timer)
  }, [search])

  async function handleAction(teacherId, action) {
    setProcessing((p) => ({ ...p, [teacherId]: action }))
    try {
      await api.put(`/admin/teachers/${teacherId}/${action}`)
      setPendingTeachers((prev) => prev.filter((t) => t.id !== teacherId))
      fetchAllTeachers(search)
      toast.success(action === 'approve' ? 'Profesor aprobado' : 'Solicitud rechazada')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al procesar')
    } finally {
      setProcessing((p) => ({ ...p, [teacherId]: null }))
    }
  }

  async function handleToggle(teacherId) {
    try {
      const { data } = await api.put(`/admin/teachers/${teacherId}/toggle-status`)
      setAllTeachers((prev) => prev.map((t) => (t.id === teacherId ? { ...t, status: data.status } : t)))
      toast.success(data.status === 'ACTIVE' ? 'Cuenta activada' : 'Cuenta desactivada')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error')
    }
  }

  function handleTeacherSaved(updatedTeacher) {
    setAllTeachers((prev) => prev.map((t) => (t.id === updatedTeacher.id ? { ...t, ...updatedTeacher } : t)))
  }

  const filteredTeachers = allTeachers.filter((t) => {
    if (filterStatus === 'active') return t.status === 'ACTIVE'
    if (filterStatus === 'inactive') return t.status !== 'ACTIVE'
    return true
  })

  const tabs = [
    { key: 'teachers', label: 'Profesores', icon: <Users size={15} />, badge: pendingTeachers.length },
    { key: 'pending', label: 'Aprobaciones', icon: <Clock size={15} />, badge: pendingTeachers.length },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 animate-fade-up" style={{ '--i': 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="bg-indigo-500/20 p-2 rounded-lg">
            <Shield size={22} className="text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Panel de Super Admin</h1>
        </div>
        <p className="text-zinc-400 mt-1 ml-1">
          Sesión como <span className="text-white font-medium">{user?.name}</span> · Administración completa de la plataforma
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-zinc-900 border border-zinc-800 rounded-xl p-1 animate-fade-up" style={{ '--i': 1 }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 text-sm font-medium rounded-lg transition-colors ${
              activeTab === tab.key ? 'bg-indigo-500 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.badge > 0 && (
              <span className="bg-yellow-400 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Teachers Tab */}
      {activeTab === 'teachers' && (
        <div className="animate-fade-up" style={{ '--i': 2 }}>
          {/* Search + Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex-1 relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre o email..."
                className="w-full bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Solo activos</option>
              <option value="inactive">Solo inactivos</option>
            </select>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: 'Total profesores', value: allTeachers.length, color: 'text-white' },
              { label: 'Activos', value: allTeachers.filter((t) => t.status === 'ACTIVE').length, color: 'text-green-400' },
              { label: 'Inactivos', value: allTeachers.filter((t) => t.status !== 'ACTIVE').length, color: 'text-red-400' },
            ].map((s) => (
              <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
                <p className={`text-xl font-bold ${s.color}`}>{teachersLoading ? '—' : s.value}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {teachersLoading ? (
            <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-zinc-900 border border-zinc-800 animate-pulse" />)}</div>
          ) : filteredTeachers.length === 0 ? (
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-12 text-center">
              <Users size={36} className="mx-auto mb-3 text-zinc-700" />
              <p className="text-zinc-400">No se encontraron profesores</p>
            </div>
          ) : (
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 divide-y divide-zinc-800 overflow-hidden">
              {filteredTeachers.map((teacher) => (
                <TeacherRow
                  key={teacher.id}
                  teacher={teacher}
                  onEdit={setEditingTeacher}
                  onToggle={handleToggle}
                  onToggleExpand={(id) => setExpandedTeachers((e) => ({ ...e, [id]: !e[id] }))}
                  expanded={!!expandedTeachers[teacher.id]}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pending Tab */}
      {activeTab === 'pending' && (
        <div className="animate-fade-up" style={{ '--i': 2 }}>
          <PendingTab
            teachers={pendingTeachers}
            loading={pendingLoading}
            processing={processing}
            onAction={handleAction}
            onRefresh={fetchPending}
          />
        </div>
      )}

      {editingTeacher && (
        <EditTeacherModal
          teacher={editingTeacher}
          onClose={() => setEditingTeacher(null)}
          onSaved={handleTeacherSaved}
        />
      )}
    </div>
  )
}
