import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { GraduationCap, User, AtSign, Lock, ChevronLeft, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { FloatingPaths } from '../components/FloatingPaths'

function FieldError({ message }) {
  if (!message) return null
  return <p className="mt-1.5 text-xs text-red-400">{message}</p>
}

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'STUDENT' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [pendingApproval, setPendingApproval] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  function validate() {
    const errs = {}
    if (!form.name.trim()) errs.name = 'El nombre es requerido'
    else if (form.name.trim().length < 2) errs.name = 'El nombre debe tener al menos 2 caracteres'
    if (!form.email.trim()) errs.email = 'El email es requerido'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Ingresa un email válido'
    if (!form.password) errs.password = 'La contraseña es requerida'
    else if (form.password.length < 6) errs.password = 'Debe tener al menos 6 caracteres'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    setServerError('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register', form)
      if (data.pending) {
        setPendingApproval(true)
      } else {
        login(data.user, data.token)
        toast.success('Cuenta creada exitosamente')
        navigate('/dashboard')
      }
    } catch (err) {
      setServerError(err.response?.data?.error || 'Error al crear la cuenta. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  function handleChange(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }))
    if (serverError) setServerError('')
  }

  const inputClass = (field) =>
    `w-full bg-zinc-900 border ${errors[field] ? 'border-red-500/60 focus:ring-red-500' : 'border-zinc-700 focus:ring-indigo-500'} text-white placeholder-zinc-500 rounded-lg py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-colors`

  return (
    <div className="min-h-screen bg-zinc-950 lg:grid lg:grid-cols-2">
      {/* ── Left decorative panel (desktop only) ─── */}
      <div className="relative hidden lg:flex flex-col p-10 bg-black border-r border-white/10 overflow-hidden">
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />

        <div className="relative z-10 flex items-center gap-2">
          <GraduationCap size={24} className="text-indigo-400" />
          <span className="text-white text-xl font-bold">beit.academy</span>
        </div>

        <div className="relative z-10 mt-auto space-y-3">
          <p className="text-white/80 text-xl leading-relaxed">
            "Los mentores de beit.academy son profesionales activos en la industria. Aprendes lo que realmente se usa en producción, no teoría desactualizada."
          </p>
          <footer className="text-zinc-400 text-sm font-mono">
            — Carlos Mendoza · Ingeniero de Software
          </footer>
        </div>
      </div>

      {/* ── Right form panel ─────────────────────── */}
      <div className="relative flex min-h-screen flex-col justify-center p-6 md:p-12 lg:p-16">
        <Link
          to="/"
          className="absolute top-6 left-6 flex items-center gap-1.5 text-sm text-zinc-500 hover:text-white transition-colors"
        >
          <ChevronLeft size={16} />
          Inicio
        </Link>

        <div className="w-full max-w-sm mx-auto space-y-5">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <GraduationCap size={22} className="text-indigo-400" />
            <span className="text-white text-lg font-bold">beit.academy</span>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Crea tu cuenta</h1>
            <p className="text-zinc-400 text-sm mt-1">Empieza gratis hoy mismo</p>
          </div>

          {pendingApproval ? (
            <div className="bg-yellow-500/10 border border-yellow-500/25 rounded-2xl p-6 text-center space-y-3">
              <div className="text-4xl">⏳</div>
              <h2 className="text-lg font-semibold text-white">Solicitud enviada</h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Tu cuenta de profesor ha sido creada y está <span className="text-yellow-300 font-medium">pendiente de aprobación</span>. Un administrador revisará tu solicitud y te dará acceso a la plataforma.
              </p>
              <Link
                to="/login"
                className="inline-block mt-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Volver al inicio de sesión →
              </Link>
            </div>
          ) : (
            <>
          {serverError && (
            <div className="bg-red-500/10 border border-red-500/25 rounded-lg px-4 py-3 text-red-400 text-sm">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Nombre completo</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User size={15} className="text-zinc-500" />
                </div>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={`${inputClass('name')} pl-9 pr-4`}
                  placeholder="Tu nombre completo"
                  autoComplete="name"
                />
              </div>
              <FieldError message={errors.name} />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Email</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <AtSign size={15} className="text-zinc-500" />
                </div>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`${inputClass('email')} pl-9 pr-4`}
                  placeholder="tu@email.com"
                  autoComplete="email"
                />
              </div>
              <FieldError message={errors.email} />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Contraseña</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock size={15} className="text-zinc-500" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className={`${inputClass('password')} pl-9 pr-10`}
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-500 hover:text-zinc-300 transition-colors"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <FieldError message={errors.password} />
            </div>

            {/* Role toggle */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Tipo de cuenta</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'STUDENT', label: 'Alumno' },
                  { value: 'TEACHER', label: 'Profesor' },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, role: value }))}
                    className={`py-2.5 rounded-lg text-sm font-medium border transition-all ${
                      form.role === value
                        ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                        : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 mt-1"
            >
              {loading ? 'Creando cuenta...' : <><span>Crear cuenta</span><ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-500">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Inicia sesión
            </Link>
          </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
