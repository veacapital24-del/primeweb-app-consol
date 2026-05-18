'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getActiveSection } from './config'

export function SettingsContentHeader() {
  const pathname = usePathname()
  const section = getActiveSection(pathname)

  if (!section) return null

  return (
    <header className="settings-section-header mb-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-prime-600">
            Configuration
          </p>
          <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink-900 md:text-[1.65rem]">
            {section.label}
          </h2>
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-ink-500">{section.desc}</p>
        </div>
        <div className="hidden shrink-0 sm:block">
          <span className="settings-section-chip">{section.label}</span>
        </div>
      </div>
    </header>
  )
}

export function SettingsPanel({
  title,
  subtitle,
  badge,
  children,
  className = '',
}: {
  title?: string
  subtitle?: string
  badge?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={`settings-panel ${className}`}>
      {(title || badge) && (
        <header className="settings-panel-header">
          <div className="min-w-0">
            {title && (
              <h3 className="font-display text-base font-semibold tracking-tight text-ink-900 md:text-lg">
                {title}
              </h3>
            )}
            {subtitle && <p className="mt-1 text-sm text-ink-500">{subtitle}</p>}
          </div>
          {badge}
        </header>
      )}
      <div className="settings-panel-body">{children}</div>
    </section>
  )
}

export function SettingsStatusPill({
  tone,
  children,
}: {
  tone: 'mint' | 'amber' | 'prime' | 'flash'
  children: React.ReactNode
}) {
  const tones = {
    mint: 'bg-mint-100/90 text-mint-600 ring-mint-500/20',
    amber: 'bg-amber-50 text-amber-700 ring-amber-500/25',
    prime: 'bg-prime-100 text-prime-800 ring-prime-500/20',
    flash: 'bg-flash-50 text-flash-700 ring-flash-500/25',
  }
  const dots = {
    mint: 'bg-mint-500',
    amber: 'bg-amber-500',
    prime: 'bg-prime-600',
    flash: 'bg-flash-500',
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${tones[tone]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dots[tone]}`} aria-hidden />
      {children}
    </span>
  )
}

export type FilterTab = { key: string; label: string; count?: number; href: string }

export function SettingsFilterTabs({
  tabs,
  activeKey,
}: {
  tabs: FilterTab[]
  activeKey: string
}) {
  return (
    <div className="settings-filter-tabs" role="tablist" aria-label="Filter">
      {tabs.map((t) => {
        const isActive = t.key === activeKey
        return (
          <Link
            key={t.key}
            href={t.href}
            role="tab"
            aria-selected={isActive}
            className={`settings-filter-tab ${isActive ? 'settings-filter-tab-active' : ''}`}
          >
            <span>{t.label}</span>
            {t.count !== undefined && (
              <span className="settings-filter-tab-count">{t.count}</span>
            )}
          </Link>
        )
      })}
    </div>
  )
}
