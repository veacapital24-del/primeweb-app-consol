'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SETTINGS_GROUPS, SETTINGS_SECTIONS, type SettingsSection } from './config'

function NavIcon({ name }: { name: SettingsSection['href'] }) {
  const cls = 'h-4 w-4 shrink-0'
  switch (name) {
    case '/settings/business':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case '/settings/shipping':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <path d="M1 8h11v8H1zM12 10h4l3 3v3h-7V10z" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="5.5" cy="18" r="2" /><circle cx="17.5" cy="18" r="2" />
        </svg>
      )
    case '/settings/pos':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <path d="M2 10h20M7 15h2M11 15h2" strokeLinecap="round" />
        </svg>
      )
    case '/settings/whatsapp':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <path d="M21 11.5a8.5 8.5 0 0 1-12.9 7.3L3 21l2.2-5.1A8.5 8.5 0 1 1 21 11.5z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case '/settings/website':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" strokeLinecap="round" />
        </svg>
      )
    case '/settings/team':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <circle cx="9" cy="8" r="3" /><path d="M2 21c0-3.3 3.1-6 7-6s7 2.7 7 6" strokeLinecap="round" />
          <path d="M16 11h6M19 8v6" strokeLinecap="round" />
        </svg>
      )
    default:
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
        </svg>
      )
  }
}

export function SettingsNav() {
  const pathname = usePathname()
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  return (
    <>
      {/* Mobile: segmented scroll tabs */}
      <nav className="settings-nav-mobile md:hidden" aria-label="Settings sections">
        <div className="settings-nav-mobile-track">
          {SETTINGS_SECTIONS.map((s) => {
            const active = isActive(s.href)
            return (
              <Link
                key={s.href}
                href={s.href}
                className={`settings-nav-mobile-tab ${active ? 'settings-nav-mobile-tab-active' : ''}`}
              >
                <NavIcon name={s.href} />
                <span>{s.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Desktop: grouped rail */}
      <nav className="settings-nav-rail hidden md:block" aria-label="Settings">
        {SETTINGS_GROUPS.map((group) => {
          const items = SETTINGS_SECTIONS.filter((s) => s.group === group.id)
          if (items.length === 0) return null
          return (
            <div key={group.id} className="settings-nav-group">
              <p className="settings-nav-group-label">{group.label}</p>
              <ul className="settings-nav-list">
                {items.map((s) => {
                  const active = isActive(s.href)
                  return (
                    <li key={s.href}>
                      <Link
                        href={s.href}
                        className={`settings-nav-link ${active ? 'settings-nav-link-active' : ''}`}
                        aria-current={active ? 'page' : undefined}
                      >
                        <span className="settings-nav-link-icon" aria-hidden>
                          <NavIcon name={s.href} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="settings-nav-link-title">{s.label}</span>
                          <span className="settings-nav-link-desc">{s.desc}</span>
                        </span>
                        {active && <span className="settings-nav-link-dot" aria-hidden />}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </nav>
    </>
  )
}
