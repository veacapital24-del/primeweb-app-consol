import type { ReactNode } from 'react'

export function PageMain({
  children,
  className = '',
  spacing = 'default',
}: {
  children: ReactNode
  className?: string
  spacing?: 'default' | 'tight' | 'loose'
}) {
  const gap = spacing === 'tight' ? 'space-y-4' : spacing === 'loose' ? 'space-y-10' : 'space-y-6'
  return <div className={`${gap} ${className}`}>{children}</div>
}

export function PageStack({
  children,
  width = '2xl',
  className = '',
}: {
  children: ReactNode
  width?: '2xl' | '3xl' | '4xl' | 'full'
  className?: string
}) {
  const max =
    width === 'full'
      ? 'max-w-none'
      : width === '4xl'
        ? 'max-w-4xl'
        : width === '3xl'
          ? 'max-w-3xl'
          : 'max-w-2xl'
  return <div className={`mx-auto w-full ${max} space-y-6 ${className}`}>{children}</div>
}
