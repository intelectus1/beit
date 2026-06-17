import { Suspense, lazy, useState, useEffect } from 'react'

const Spline = lazy(() => import('@splinetool/react-spline'))

function RobotFallback({ className }) {
  return (
    <div className={`${className} flex items-center justify-center relative`}>
      <div className="absolute w-64 h-64 rounded-full bg-indigo-600/20 blur-3xl animate-pulse" />
      <div className="absolute w-40 h-40 rounded-full bg-purple-500/30 blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }} />
      <div className="absolute w-24 h-24 rounded-full bg-blue-400/40 blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
      <svg viewBox="0 0 120 160" className="relative w-36 h-48 opacity-80" fill="none">
        <ellipse cx="60" cy="30" rx="22" ry="22" fill="url(#head)" />
        <rect x="38" y="52" width="44" height="56" rx="10" fill="url(#body)" />
        <rect x="18" y="54" width="16" height="44" rx="8" fill="url(#arm)" />
        <rect x="86" y="54" width="16" height="44" rx="8" fill="url(#arm)" />
        <rect x="42" y="108" width="14" height="40" rx="7" fill="url(#leg)" />
        <rect x="64" y="108" width="14" height="40" rx="7" fill="url(#leg)" />
        <ellipse cx="52" cy="27" rx="4" ry="4" fill="#818cf8" opacity="0.9" />
        <ellipse cx="68" cy="27" rx="4" ry="4" fill="#818cf8" opacity="0.9" />
        <defs>
          <linearGradient id="head" x1="38" y1="8" x2="82" y2="52" gradientUnits="userSpaceOnUse">
            <stop stopColor="#4f46e5" /><stop offset="1" stopColor="#7c3aed" />
          </linearGradient>
          <linearGradient id="body" x1="38" y1="52" x2="82" y2="108" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3730a3" /><stop offset="1" stopColor="#4c1d95" />
          </linearGradient>
          <linearGradient id="arm" x1="18" y1="54" x2="34" y2="98" gradientUnits="userSpaceOnUse">
            <stop stopColor="#4338ca" /><stop offset="1" stopColor="#5b21b6" />
          </linearGradient>
          <linearGradient id="leg" x1="42" y1="108" x2="56" y2="148" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3730a3" /><stop offset="1" stopColor="#4c1d95" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

export function SplineScene({ scene, className }) {
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    setIsDesktop(window.matchMedia('(min-width: 768px)').matches)
  }, [])

  if (!isDesktop) return <RobotFallback className={className} />

  return (
    <Suspense fallback={<RobotFallback className={className} />}>
      <Spline scene={scene} className={className} />
    </Suspense>
  )
}
