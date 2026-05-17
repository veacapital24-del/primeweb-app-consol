'use client'

import type { ButtonHTMLAttributes, ReactNode } from 'react'

const VARIANTS = {
  primary:
    'bg-prime-700 text-paper shadow-sm ring-1 ring-prime-800/20 hover:bg-prime-800 disabled:opacity-50',
  secondary:
    'border border-ink-300/70 bg-paper text-ink-900 hover:border-prime-400/60 hover:bg-prime-50/40 disabled:opacity-50',
  danger: 'bg-flash-700 text-paper hover:bg-flash-700/90 disabled:opacity-50',
} as const

const SIZES = {
  sm: 'h-9 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-sm',
  full: 'h-11 w-full px-4 text-sm',
} as const

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  variant?: keyof typeof VARIANTS
  size?: keyof typeof SIZES
}) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-bold transition active:scale-[0.98] ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function SubmitButton({
  children,
  pending,
  variant = 'primary',
  size = 'md',
  className = '',
}: {
  children: ReactNode
  pending?: boolean
  variant?: keyof typeof VARIANTS
  size?: keyof typeof SIZES
  className?: string
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-bold transition active:scale-[0.98] disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
    >
      {children}
    </button>
  )
}
