import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { GraduationCap, AtSign, Lock, ChevronLeft, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { FloatingPaths } from '../components/FloatingPaths'

function FieldError({ message }) {
  if (!message) return null
  return <p className="mt-1.5 text-xs text-red-400">{message}</p>
}

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  function validate() {
    const errs = {}
    if (!form.email.trim()) errs.email = 'El email es requerido'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Ingresa un email válido'
    if (!form.password) errs.password = 'La contraseña es requerida'
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
      const { data } = await api.post('/auth/login', form)
      login(data.user, data.token)
      toast.success(`Bienvenido, ${data.user.name}`)
      navigate(data.user.role === 'SUPER_ADMIN' ? '/superadmin' : '/dashboard')
    } catch (err) {
      setServerError(err.response?.data?.error || 'Credenciales incorrectas. Verifica tu email y contraseña.')
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
            "En tres meses pasé de no saber nada de programación a conseguir mi primer trabajo como desarrollador. beit.academy lo hizo posible."
          </p>
          <footer className="text-zinc-400 text-sm font-mono">
            — Valentina Ríos · Desarrolladora Full Stack, egresada 2025
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

        <div className="w-full max-w-sm mx-auto space-y-6">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <GraduationCap size={22} className="text-indigo-400" />
            <span className="text-white text-lg font-bold">beit.academy</span>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Bienvenido de vuelta</h1>
            <p className="text-zinc-400 text-sm mt-1">Inicia sesión en tu cuenta</p>
          </div>

          {serverError && (
            <div className="bg-red-500/10 border border-red-500/25 rounded-lg px-4 py-3 text-red-400 text-sm">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="••••••••"
                  autoComplete="current-password"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {loading ? 'Iniciando sesión...' : <><span>Iniciar sesión</span><ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-500">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Regístrate gratis
            </Link>
          </p>

          {/* Test credentials */}
          <div className="border border-zinc-800 rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Usuarios de prueba</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500 w-16 shrink-0">Profesor</span>
                <code className="text-zinc-300 bg-zinc-800 px-2 py-1 rounded text-[11px] truncate">
                  profesor@beit.academy
                </code>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500 w-16 shrink-0">Alumno</span>
                <code className="text-zinc-300 bg-zinc-800 px-2 py-1 rounded text-[11px] truncate">
                  alumno@beit.academy
                </code>
              </div>
              <p className="text-xs text-zinc-600 pt-1">
                Contraseña: <code className="text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">beit2025</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
