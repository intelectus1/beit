import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LogOut, User, Menu, X, LayoutDashboard, BookOpen, Shield } from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/')
    setMobileOpen(false)
  }

  return (
    <nav className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-white font-bold text-lg hover:text-zinc-300 transition-colors"
          >
            <img src="/logo.png" alt="beit.academy" className="w-7 h-7 object-contain opacity-90" />
            <span>beit.academy</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-5">
            {user ? (
              <>
                {user.role === 'SUPER_ADMIN' && (
                  <Link
                    to="/superadmin"
                    className="flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    <Shield size={15} />
                    Panel Admin
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  <LayoutDashboard size={15} />
                  Dashboard
                </Link>
                <Link
                  to="/courses"
                  className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  <BookOpen size={15} />
                  Cursos
                </Link>
                <div className="flex items-center gap-3 border-l border-white/10 pl-5 ml-1">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                      <User size={13} className="text-indigo-400" />
                    </div>
                    <span className="text-white font-medium">{user.name}</span>
                    <span className="text-xs bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                      {user.role === 'TEACHER'
                        ? 'Profesor'
                        : user.role === 'ADMIN'
                        ? 'Admin'
                        : user.role === 'SUPER_ADMIN'
                        ? 'Super Admin'
                        : 'Alumno'}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-red-400 transition-colors"
                  >
                    <LogOut size={14} />
                    Salir
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-zinc-400 hover:text-white transition-colors p-1"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menú"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/10 py-4 space-y-1">
            {user ? (
              <>
                <div className="flex items-center gap-3 px-2 py-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                    <User size={14} className="text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{user.name}</p>
                    <p className="text-zinc-500 text-xs">
                      {user.role === 'TEACHER'
                        ? 'Profesor'
                        : user.role === 'ADMIN'
                        ? 'Admin'
                        : user.role === 'SUPER_ADMIN'
                        ? 'Super Admin'
                        : 'Alumno'}
                    </p>
                  </div>
                </div>
                {user.role === 'SUPER_ADMIN' && (
                  <Link
                    to="/superadmin"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-2 py-2.5 text-sm text-indigo-400 hover:text-indigo-300 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <Shield size={16} /> Panel Admin
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-2 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  <LayoutDashboard size={16} /> Dashboard
                </Link>
                <Link
                  to="/courses"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-2 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  <BookOpen size={16} /> Cursos
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-2 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors w-full text-left mt-1"
                >
                  <LogOut size={16} /> Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block px-2 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="block px-2 py-2.5 text-sm bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 rounded-lg transition-colors"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
