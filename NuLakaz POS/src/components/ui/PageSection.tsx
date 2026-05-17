import type { ReactNode } from 'react'

export function PageSection({
  title,
  count,
  description,
  children,
  actions,
}: {
  title: string
  count?: number
  description?: string
  children: ReactNode
  actions?: ReactNode
}) {
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-ink-500">{title}</h2>
            {count !== undefined && (
              <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-bold tabular-nums text-ink-700">
                {count}
              </span>
            )}
          </div>
          {description && <p className="mt-0.5 text-sm text-ink-700">{description}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  )
}
