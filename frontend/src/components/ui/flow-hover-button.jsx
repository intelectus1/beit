import { cn } from '../../lib/utils'

const variants = {
  primary: {
    base: 'border-indigo-600 bg-indigo-500 text-white',
    fill: 'before:bg-white',
    hoverText: 'hover:text-indigo-600',
  },
  danger: {
    base: 'border-red-500/40 bg-red-500/15 text-red-400',
    fill: 'before:bg-red-500',
    hoverText: 'hover:text-white',
  },
  success: {
    base: 'border-green-600 bg-green-500 text-white',
    fill: 'before:bg-white',
    hoverText: 'hover:text-green-600',
  },
  secondary: {
    base: 'border-zinc-700 bg-zinc-800 text-zinc-200',
    fill: 'before:bg-zinc-200',
    hoverText: 'hover:text-zinc-900',
  },
  ghost: {
    base: 'border-zinc-700 bg-transparent text-zinc-400',
    fill: 'before:bg-zinc-700',
    hoverText: 'hover:text-white',
  },
  warning: {
    base: 'border-yellow-500/40 bg-yellow-500/15 text-yellow-300',
    fill: 'before:bg-yellow-400',
    hoverText: 'hover:text-zinc-900',
  },
}

export function FlowHoverButton({ icon, children, className, variant = 'secondary', ...props }) {
  const v = variants[variant] || variants.secondary
  return (
    <button
      className={cn(
        'relative cursor-pointer z-0 flex items-center justify-center gap-2 overflow-hidden rounded-md',
        'border px-4 py-2 font-semibold transition-all duration-500',
        v.base,
        'before:absolute before:inset-0 before:-z-10 before:translate-x-[150%] before:translate-y-[150%] before:scale-[2.5]',
        'before:rounded-[100%] before:transition-transform before:duration-1000 before:content-[""]',
        v.fill,
        'hover:scale-105 hover:before:translate-x-[0%] hover:before:translate-y-[0%] active:scale-95',
        v.hoverText,
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
        className
      )}
      {...props}
    >
      {icon && <span className="shrink-0 flex items-center">{icon}</span>}
      {children && <span>{children}</span>}
    </button>
  )
}
