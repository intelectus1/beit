import { useState, useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Home,
  BookOpen,
  LogIn,
  UserPlus,
  Zap,
  Users,
  Award,
  ChevronRight,
  ArrowRight,
  GraduationCap,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import { TubelightNavbar } from '../components/TubelightNavbar'
import { SplineScene } from '../components/SplineScene'
import { Spotlight } from '../components/Spotlight'
import { GooeyText } from '../components/GooeyText'
import { ContainerScroll } from '../components/ContainerScrollAnimation'
import { TestimonialSlider } from '../components/TestimonialSlider'

const NAV_ITEMS = [
  { name: 'Inicio', url: '/', icon: Home },
  { name: 'Cursos', url: '/courses', icon: BookOpen },
  { name: 'Ingresar', url: '/login', icon: LogIn },
  { name: 'Registro', url: '/register', icon: UserPlus },
]

const FEATURES = [
  {
    icon: Zap,
    title: 'Aprendizaje Acelerado',
    description:
      'Metodología práctica orientada a resultados reales. Proyectos que puedes mostrar desde el primer día.',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    icon: Users,
    title: 'Mentores Expertos',
    description:
      'Aprende directamente de profesionales activos en la industria. Feedback real, no teórico.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Award,
    title: 'Certificaciones',
    description:
      'Obtén certificados que los empleadores reconocen. Valida tus habilidades en el mercado.',
    color: 'from-purple-500 to-pink-500',
  },
]

const GOOEY_TEXTS = ['React', 'Node.js', 'Python', 'Cloud', 'AI', 'Web3']

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Valentina Ríos',
    affiliation: 'Desarrolladora Full Stack · egresada 2025',
    quote: 'En tres meses pasé de no saber nada de programación a conseguir mi primer trabajo. beit.academy cambió mi vida.',
    imageSrc: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=600&fit=crop&q=80',
    thumbnailSrc: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=120&fit=crop&q=80',
  },
  {
    id: 2,
    name: 'Carlos Mendoza',
    affiliation: 'Ingeniero de Software',
    quote: 'Los mentores son profesionales activos en la industria. Aprendes lo que realmente se usa en producción.',
    imageSrc: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&q=80',
    thumbnailSrc: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=120&fit=crop&q=80',
  },
  {
    id: 3,
    name: 'Sofía Paredes',
    affiliation: 'Data Scientist · estudiante activa',
    quote: 'El contenido de Machine Learning es de nivel mundial. Aprendí en semanas lo que hubiera tomado un año en la universidad.',
    imageSrc: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&q=80',
    thumbnailSrc: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=120&fit=crop&q=80',
  },
  {
    id: 4,
    name: 'Rodrigo Castillo',
    affiliation: 'DevOps Engineer · certificado 2024',
    quote: 'La certificación de Cloud me abrió puertas que creía imposibles. Ahora trabajo en una empresa Fortune 500.',
    imageSrc: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=600&fit=crop&q=80',
    thumbnailSrc: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=120&fit=crop&q=80',
  },
  {
    id: 5,
    name: 'Isabela Torres',
    affiliation: 'Frontend Developer · freelancer',
    quote: 'Desde que tomé el curso de React, mis proyectos freelance se triplicaron. La inversión se pagó sola.',
    imageSrc: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop&q=80',
    thumbnailSrc: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&h=120&fit=crop&q=80',
  },
]

export default function Landing() {
  const { user } = useAuth()
  const shouldReduceMotion = useReducedMotion()
  const [courses, setCourses] = useState([])
  const [loadingCourses, setLoadingCourses] = useState(true)

  useEffect(() => {
    api
      .get('/courses')
      .then((res) => setCourses(Array.isArray(res.data) ? res.data.slice(0, 6) : []))
      .catch(() => {})
      .finally(() => setLoadingCourses(false))
  }, [])

  return (
    <div className="bg-black text-white overflow-x-hidden">
      <TubelightNavbar items={NAV_ITEMS} />

      {/* ── MOBILE HERO (< 768 px) ───────────────────── */}
      <section
        className="flex flex-col md:hidden relative overflow-hidden bg-black"
        style={{ minHeight: '100svh' }}
      >
        {/* Deep purple-black ambient background */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0c0018] via-[#06000e] to-black" />
          <div
            className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[380px] h-[380px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.30) 0%, transparent 70%)' }}
          />
          <div
            className="absolute top-[8%] right-[-70px] w-[260px] h-[260px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(79,70,229,0.18) 0%, transparent 70%)' }}
          />
          <div
            className="absolute bottom-[28%] left-[-70px] w-[210px] h-[210px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.14) 0%, transparent 70%)' }}
          />
        </div>

        <div className="relative z-10 flex flex-col items-center px-5 pt-[72px] pb-8">

          {/* ── Hero image ─────────────────────────── */}
          <motion.div
            className="relative w-full max-w-[320px] mx-auto"
            style={{ height: 'clamp(200px, 38vh, 280px)' }}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Purple/indigo glow halo */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse 80% 80% at 50% 65%, rgba(139,92,246,0.45) 0%, rgba(99,102,241,0.22) 48%, transparent 80%)',
                transform: 'scale(1.45)',
                filter: 'blur(28px)',
              }}
            />
            {/* Floating image */}
            <motion.div
              className="relative w-full h-full"
              animate={shouldReduceMotion ? {} : { y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
            >
              <img
                src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=640&h=500&fit=crop&q=90"
                alt="Desarrollo de software con inteligencia artificial"
                className="w-full h-full object-cover object-top rounded-2xl"
                loading="eager"
                style={{
                  maskImage: 'linear-gradient(to bottom, black 48%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, black 48%, transparent 100%)',
                }}
              />
            </motion.div>
          </motion.div>

          {/* ── Status badge ───────────────────────── */}
          <motion.div
            className="mt-5 flex items-center gap-2 border border-white/[0.12] rounded-full px-4 py-1.5 backdrop-blur-md"
            style={{ background: 'rgba(255,255,255,0.05)' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.45, ease: 'easeOut' }}
          >
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shrink-0" />
            <span className="text-[11px] text-white/60 font-medium tracking-wide">
              Nueva era del aprendizaje tech
            </span>
          </motion.div>

          {/* ── Headline ───────────────────────────── */}
          <motion.h1
            className="mt-4 font-extrabold text-white text-center leading-[1.07] tracking-[-0.02em]"
            style={{ fontSize: 'clamp(2rem, 10.5vw, 2.6rem)', textWrap: 'balance' }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.55, ease: 'easeOut' }}
          >
            Domina la<br />
            tecnología con<br />
            IA y Software
          </motion.h1>

          {/* ── Description ────────────────────────── */}
          <motion.p
            className="mt-3 text-[13px] text-white/45 text-center leading-relaxed max-w-[260px]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42, duration: 0.5, ease: 'easeOut' }}
          >
            Cursos intensivos, mentores activos y proyectos reales.{' '}
            <span className="text-white/65 font-semibold">beit.academy</span>.
          </motion.p>

          {/* ── CTAs ───────────────────────────────── */}
          <motion.div
            className="mt-6 flex flex-col items-stretch gap-3 w-full max-w-[300px]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.54, duration: 0.5, ease: 'easeOut' }}
          >
            {user ? (
              <Link
                to="/dashboard"
                className="flex items-center justify-center gap-2 bg-white text-black font-bold py-[15px] rounded-[14px] text-[15px] shadow-lg shadow-white/10 active:scale-[0.97] transition-transform duration-150"
              >
                Ir al Dashboard
                <ArrowRight size={17} />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="flex items-center justify-center gap-2 bg-white text-black font-bold py-[15px] rounded-[14px] text-[15px] shadow-lg shadow-white/10 active:scale-[0.97] transition-transform duration-150"
                >
                  Comenzar gratis
                  <ArrowRight size={17} />
                </Link>
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 border border-white/[0.18] text-white/65 py-[13px] rounded-[14px] text-[13px] active:scale-[0.97] transition-transform duration-150"
                >
                  Iniciar sesión
                </Link>
              </>
            )}
          </motion.div>
        </div>

        {/* Bottom fade into next section */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black to-transparent pointer-events-none" />
      </section>

      {/* ── HERO (desktop ≥ 768 px) ──────────────────── */}
      <section className="relative min-h-screen hidden md:flex items-center overflow-hidden">
        <Spotlight className="-top-40 left-0 md:left-40 md:-top-20" fill="white" />

        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center gap-2 md:gap-8 pt-24 md:pt-28 pb-6 md:pb-16">
          {/* Robot — first on mobile, right on desktop */}
          <div className="order-1 md:order-2 md:flex-1 w-full h-[56vw] min-h-[300px] sm:h-[420px] md:h-[560px] relative">
            <SplineScene
              scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
              className="w-full h-full"
            />
          </div>

          {/* Text — second on mobile, left on desktop */}
          <div className="order-2 md:order-1 md:flex-1 z-10 space-y-5 md:space-y-6 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm text-white/70">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Nueva era del aprendizaje tech
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight">
              Domina la
              <br />
              tecnología
            </h1>

            {/* GooeyText morphing — tech stack words */}
            <div className="relative h-16 sm:h-20 w-full overflow-hidden">
              <GooeyText
                texts={GOOEY_TEXTS}
                morphTime={1.2}
                cooldownTime={2}
                className="h-full w-full"
                textClassName="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white"
              />
            </div>

            <p className="text-base sm:text-lg text-white/50 max-w-md mx-auto md:mx-0 leading-relaxed">
              Cursos intensivos, mentores activos y proyectos reales. Impulsa
              tu carrera en tecnología con{' '}
              <span className="text-white font-semibold">beit.academy</span>.
            </p>

            <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-1 md:pt-2">
              {user ? (
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 bg-white text-black font-semibold px-8 py-3.5 rounded-full hover:bg-white/90 transition-all shadow-lg shadow-white/10"
                >
                  Ir al Dashboard
                  <ArrowRight size={18} />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="flex items-center gap-2 bg-white text-black font-semibold px-8 py-3.5 rounded-full hover:bg-white/90 transition-all shadow-lg shadow-white/10"
                  >
                    Comenzar gratis
                    <ArrowRight size={18} />
                  </Link>
                  <Link
                    to="/login"
                    className="flex items-center gap-2 border border-white/20 text-white/80 px-8 py-3.5 rounded-full hover:bg-white/10 hover:text-white transition-all"
                  >
                    Iniciar sesión
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />
      </section>

      {/* ── FEATURES ─────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <p className="text-white/40 text-sm uppercase tracking-widest mb-3">
              ¿Por qué beit.academy?
            </p>
            <h2 className="text-4xl md:text-5xl font-bold">
              Todo lo que necesitas para
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                crecer en tech
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, description, color }) => (
              <div
                key={title}
                className="group p-7 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/20 transition-all duration-300"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-5 shadow-lg`}
                >
                  <Icon className="text-white" size={22} />
                </div>
                <h3 className="text-xl font-semibold mb-3">{title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLATFORM PREVIEW — ContainerScrollAnimation ── */}
      <section className="bg-black">
        <ContainerScroll
          titleComponent={
            <div className="mb-8">
              <p className="text-white/40 text-sm uppercase tracking-widest mb-4">
                La plataforma más completa
              </p>
              <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                Tu aula virtual,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                  reinventada.
                </span>
              </h2>
            </div>
          }
        >
          <img
            src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1400&q=80"
            alt="beit.academy platform preview"
            className="w-full h-full object-cover object-top rounded-xl"
          />
        </ContainerScroll>
      </section>

      {/* ── COURSES ──────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="container mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-white/40 text-sm uppercase tracking-widest mb-2">
                Catálogo
              </p>
              <h2 className="text-4xl font-bold">Cursos destacados</h2>
            </div>
            <Link
              to="/courses"
              className="hidden md:flex items-center gap-1.5 text-white/50 hover:text-white transition-colors text-sm"
            >
              Ver todos
              <ChevronRight size={16} />
            </Link>
          </div>

          {loadingCourses ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-52 rounded-2xl bg-white/[0.04] animate-pulse"
                />
              ))}
            </div>
          ) : courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Link
                  key={course.id}
                  to={`/courses/${course.id}`}
                  className="group block p-6 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/20 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
                      <GraduationCap size={16} className="text-white" />
                    </div>
                    <span className="text-xs text-white/30 uppercase tracking-widest">
                      Curso
                    </span>
                  </div>
                  <h3 className="text-base font-semibold mb-2 group-hover:text-white transition-colors line-clamp-2">
                    {course.title}
                  </h3>
                  {course.description && (
                    <p className="text-white/35 text-sm line-clamp-2 mb-4">
                      {course.description}
                    </p>
                  )}
                  <div className="flex items-center gap-1 text-xs text-white/40 group-hover:text-white/70 transition-colors">
                    Ver curso
                    <ChevronRight size={13} />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border border-white/10 rounded-2xl">
              <BookOpen size={40} className="mx-auto mb-4 text-white/20" />
              <p className="text-white/30">Pronto habrá cursos disponibles.</p>
            </div>
          )}

          <div className="mt-8 text-center md:hidden">
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm"
            >
              Ver todos los cursos <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <p className="text-white/40 text-sm uppercase tracking-widest mb-3">Lo que dicen</p>
            <h2 className="text-4xl md:text-5xl font-bold">
              Estudiantes que{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                ya lo lograron
              </span>
            </h2>
          </div>
          <TestimonialSlider reviews={TESTIMONIALS} />
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="container mx-auto">
          <div className="relative rounded-3xl overflow-hidden border border-white/10 p-12 md:p-20 text-center">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-950/80 via-black to-purple-950/80" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.2),transparent_70%)]" />

            <div className="relative">
              <p className="text-white/40 text-sm uppercase tracking-widest mb-4">
                Empieza ahora
              </p>
              <h2 className="text-4xl md:text-6xl font-extrabold mb-5 leading-tight">
                Tu futuro en tech
                <br />
                comienza hoy.
              </h2>
              <p className="text-white/50 max-w-md mx-auto mb-10 leading-relaxed">
                Únete a la comunidad de estudiantes que ya están transformando
                su carrera con beit.academy.
              </p>
              {user ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 bg-white text-black font-bold px-12 py-4 rounded-full hover:bg-white/90 transition-all text-lg shadow-xl shadow-white/10"
                >
                  Ver mi Dashboard
                  <ArrowRight size={20} />
                </Link>
              ) : (
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 bg-white text-black font-bold px-12 py-4 rounded-full hover:bg-white/90 transition-all text-lg shadow-xl shadow-white/10"
                  >
                    Crear cuenta gratis
                    <ArrowRight size={20} />
                  </Link>
                  <Link
                    to="/courses"
                    className="inline-flex items-center gap-2 border border-white/20 text-white/80 px-8 py-4 rounded-full hover:bg-white/10 hover:text-white transition-all text-base"
                  >
                    Explorar cursos
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────── */}
      <footer className="border-t border-white/[0.07] py-8 px-6">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="beit.academy" className="w-6 h-6 object-contain opacity-70" />
            <span className="font-bold text-white">beit.academy</span>
          </div>
          <p className="text-white/25 text-sm">
            © 2026 beit.academy — Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-6 text-sm text-white/35">
            <Link to="/courses" className="hover:text-white transition-colors">
              Cursos
            </Link>
            <Link to="/login" className="hover:text-white transition-colors">
              Acceder
            </Link>
            <Link to="/register" className="hover:text-white transition-colors">
              Registrarse
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
