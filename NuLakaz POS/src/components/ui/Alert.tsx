import type { ReactNode } from 'react'

const VARIANTS = {
  error: 'border-flash-500/40 bg-flash-50 text-flash-700',
  success: 'border-mint-500/30 bg-mint-100 text-mint-600',
  info: 'border-prime-300/60 bg-prime-50 text-ink-900',
} as const

export function Alert({
  children,
  variant = 'error',
  className = '',
}: {
  children: ReactNode
  variant?: keyof typeof VARIANTS
  className?: string
}) {
  return (
    <div
      role="alert"
      className={`rounded-xl border px-4 py-3 text-sm font-medium ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </div>
  )
}
