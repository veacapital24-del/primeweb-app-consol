import type { ReactNode } from 'react'
import { ButtonLink } from './ButtonLink'

export function EmptyState({
  title,
  description,
  action,
  compact,
}: {
  title: string
  description?: string
  action?: { label: string; href: string }
  compact?: boolean
}) {
  return (
    <div
      className={`rounded-2xl border border-dashed border-ink-300/80 bg-paper text-center shadow-sm ${
        compact ? 'p-6' : 'p-10'
      }`}
    >
      <div className={`font-display font-black tracking-tight text-ink-900 ${compact ? 'text-lg' : 'text-xl'}`}>
        {title}
      </div>
      {description && <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{description}</p>}
      {action && (
        <div className="mt-5">
          <ButtonLink href={action.href} size="md">
            {action.label}
          </ButtonLink>
        </div>
      )}
    </div>
  )
}


export function InlineEmpty({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-ink-300/80 bg-paper-dim/30 px-4 py-8 text-center text-sm text-ink-500">
      {children}
    </div>
  )
}
