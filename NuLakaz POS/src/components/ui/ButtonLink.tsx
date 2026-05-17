import Link from 'next/link'
import type { ReactNode } from 'react'

const VARIANTS = {
  primary:
    'bg-prime-700 text-paper shadow-sm ring-1 ring-prime-800/20 hover:bg-prime-800 hover:shadow-md active:scale-[0.98]',
  secondary:
    'border border-ink-300/70 bg-paper text-ink-900 hover:border-prime-400/60 hover:bg-prime-50/40 active:scale-[0.98]',
  ghost: 'text-prime-700 hover:bg-prime-50/60',
} as const

const SIZES = {
  sm: 'h-9 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-sm',
} as const

export function ButtonLink({
  href,
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  external,
}: {
  href: string
  children: ReactNode
  variant?: keyof typeof VARIANTS
  size?: keyof typeof SIZES
  className?: string
  external?: boolean
}) {
  const cls = `inline-flex items-center justify-center gap-2 rounded-xl font-bold transition ${VARIANTS[variant]} ${SIZES[size]} ${className}`

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {children}
      </a>
    )
  }

  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  )
}
