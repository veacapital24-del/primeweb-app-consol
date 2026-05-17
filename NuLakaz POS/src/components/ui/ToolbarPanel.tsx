import type { ReactNode } from 'react'

export function ToolbarPanel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section className={'rounded-2xl border border-ink-300/50 bg-paper p-3 shadow-sm sm:p-4 ' + className}>
      {children}
    </section>
  )
}
