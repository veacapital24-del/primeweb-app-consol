import type { ReactNode } from 'react'

export function Panel({
  title,
  right,
  children,
  className = '',
}: {
  title: string
  right?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={'glass-card p-5 sm:p-6 ' + className}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-ink-500">{title}</h2>
        {right}
      </div>
      {children}
    </section>
  )
}

export function FormPanel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={'glass-card p-5 sm:p-6 ' + className}>
      {children}
    </div>
  )
}
