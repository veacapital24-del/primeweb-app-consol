import Link from 'next/link'

type Crumb = { label: string; href?: string }

export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
}: {
  title: string
  subtitle?: string
  breadcrumbs?: Crumb[]
  actions?: React.ReactNode
}) {
  return (
    <div className="mb-8 flex flex-col gap-3 border-b border-ink-300/60 pb-6 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <ol className="mb-2 flex flex-wrap items-center gap-1.5 text-xs text-ink-500">
            {breadcrumbs.map((c, i) => (
              <li key={i} className="flex items-center gap-1.5">
                {c.href ? <Link href={c.href} className="hover:text-ink-900">{c.label}</Link> : <span>{c.label}</span>}
                {i < breadcrumbs.length - 1 && <span className="text-ink-300">/</span>}
              </li>
            ))}
          </ol>
        )}
        <h1 className="font-display text-2xl font-black tracking-tight md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}
