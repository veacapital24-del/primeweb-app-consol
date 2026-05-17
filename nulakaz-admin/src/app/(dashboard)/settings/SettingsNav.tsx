'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const SECTIONS = [
  { href: '/settings/business',     label: 'Business',     desc: 'Trade name, contact, VAT' },
  { href: '/settings/shipping',     label: 'Shipping',     desc: 'Free threshold, fees' },
  { href: '/settings/pos',          label: 'POS',          desc: 'Receipts, shifts, defaults' },
  { href: '/settings/whatsapp',     label: 'WhatsApp',     desc: 'Channel + Cloud API' },
  { href: '/settings/website',      label: 'Website',      desc: 'Maintenance mode, site config' },
  { href: '/settings/team',         label: 'Admin users',  desc: 'Admins, wholesalers, retailers' },
  { href: '/settings/integrations', label: 'Integrations', desc: 'Supabase, edge functions' },
]

export function SettingsNav() {
  const pathname = usePathname()
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  return (
    <>
      {/* Desktop: vertical rail */}
      <nav className="hidden md:block">
        <div className="space-y-0.5">
          {SECTIONS.map((s) => {
            const active = isActive(s.href)
            return (
              <Link
                key={s.href}
                href={s.href}
                className={`flex flex-col gap-0.5 rounded-xl px-3 py-2.5 transition ${
                  active
                    ? 'bg-prime-700 text-paper shadow-sm shadow-prime-900/10 ring-1 ring-prime-600/30'
                    : 'hover:bg-prime-50/50 ring-1 ring-transparent hover:ring-prime-200/60'
                }`}
              >
                <span className={`text-sm font-bold ${active ? 'text-paper' : 'text-ink-900'}`}>
                  {s.label}
                </span>
                <span className={`text-[11px] ${active ? 'text-paper/75' : 'text-ink-500'}`}>{s.desc}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Mobile: horizontal pill scroll */}
      <nav className="-mx-4 overflow-x-auto px-4 md:hidden">
        <div className="flex gap-2 pb-2 text-xs font-semibold">
          {SECTIONS.map((s) => {
            const active = isActive(s.href)
            return (
              <Link
                key={s.href}
                href={s.href}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  active
                    ? 'bg-prime-700 text-paper shadow-sm'
                    : 'bg-paper text-ink-700 ring-1 ring-ink-200/80 hover:ring-prime-200/80'
                }`}
              >
                {s.label}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
