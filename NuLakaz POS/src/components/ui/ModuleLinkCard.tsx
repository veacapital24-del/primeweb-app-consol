import Link from 'next/link'
import type { ReactNode } from 'react'

export function ModuleLinkCard({
  href,
  icon,
  label,
  description,
}: {
  href: string
  icon: ReactNode
  label: string
  description?: string
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl border border-ink-300/50 bg-paper px-4 py-3.5 shadow-sm transition hover:border-prime-400/60 hover:bg-prime-50/30 hover:shadow-md"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-prime-50 text-prime-700 ring-1 ring-prime-200/80 transition group-hover:bg-prime-100">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-ink-900 group-hover:text-prime-700">{label}</span>
        {description ? (
          <span className="mt-0.5 block truncate text-xs text-ink-500">{description}</span>
        ) : null}
      </span>
      <span className="text-prime-700 transition group-hover:translate-x-0.5" aria-hidden>
        →
      </span>
    </Link>
  )
}
