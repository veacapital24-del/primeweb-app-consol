'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

type NavItem = { href: string; label: string; icon: React.ReactNode; badge?: string }
type NavGroup = { heading: string; items: NavItem[] }

type Me = {
  id: string
  email: string | null
  full_name: string | null
  role: string
} | null

const NAV: NavGroup[] = [
  {
    heading: 'Overview',
    items: [
      { href: '/', label: 'Dashboard', icon: <IconHome /> },
    ],
  },
  {
    heading: 'Catalog',
    items: [
      { href: '/products',   label: 'Products',   icon: <IconBox /> },
      { href: '/brands',     label: 'Brands',     icon: <IconTag /> },
      { href: '/categories', label: 'Categories', icon: <IconGrid /> },
      { href: '/reels',      label: 'Reels',      icon: <IconPlay /> },
    ],
  },
  {
    heading: 'Operations',
    items: [
      { href: '/inventory', label: 'Warehouse', icon: <IconWarehouse /> },
      { href: '/locations', label: 'Locations', icon: <IconPin /> },
      { href: '/orders',    label: 'Orders',    icon: <IconClipboard /> },
    ],
  },
  {
    heading: 'People',
    items: [
      { href: '/customers', label: 'Customers', icon: <IconShopper /> },
    ],
  },
  {
    heading: 'Channels',
    items: [
      { href: '/whatsapp', label: 'WhatsApp', icon: <IconChat /> },
    ],
  },
  {
    heading: 'Admin',
    items: [
      { href: '/settings', label: 'Settings', icon: <IconCog /> },
    ],
  },
]

export function Sidebar({ me }: { me?: Me }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => { setOpen(false) }, [pathname])

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)

  return (
    <>
      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-ink-300/60 bg-paper px-4 py-3 md:hidden">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo/nulakaz-wordmark.webp"
            alt="NuLakaz"
            width={3139}
            height={1015}
            className="h-7 w-auto"
          />
        </Link>
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu"
          className="grid h-9 w-9 place-items-center rounded-lg border border-ink-300 bg-paper hover:bg-ink-100"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            {open ? <><path d="M6 6l12 12"/><path d="M18 6L6 18"/></> : <><path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/></>}
          </svg>
        </button>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-ink-300/60 bg-paper transition-transform duration-200 md:sticky md:top-0 md:h-screen md:translate-x-0 ${
          open ? 'translate-x-0 shadow-xl' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="flex h-14 items-center justify-between border-b border-ink-300/60 px-5">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo/nulakaz-wordmark.webp"
              alt="NuLakaz"
              width={3139}
              height={1015}
              className="h-8 w-auto"
            />
          </Link>
          <span className="rounded-full bg-prime-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-paper">
            admin
          </span>
        </div>

        {/* Search */}
        <div className="px-3 py-3">
          <div className="relative">
            <svg className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
            </svg>
            <input
              placeholder="Quick search…"
              className="w-full rounded-lg border border-ink-300 bg-paper-dim/60 py-1.5 pl-8 pr-2 text-xs text-ink-900 placeholder:text-ink-500 focus:border-prime-500 focus:bg-paper focus:outline-none"
            />
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 rounded border border-ink-300 bg-paper px-1 py-0.5 text-[10px] text-ink-500">⌘K</kbd>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4 text-sm">
          {NAV.map((group) => (
            <div key={group.heading} className="mt-2">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-ink-500">
                {group.heading}
              </div>
              <ul className="mt-1 space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.href)
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`group flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition ${
                          active
                            ? 'bg-prime-700 text-paper shadow-sm shadow-prime-900/20'
                            : 'text-ink-700 hover:bg-ink-100 hover:text-ink-900'
                        }`}
                      >
                        <span className={active ? 'text-prime-200' : 'text-ink-500 group-hover:text-ink-700'}>{item.icon}</span>
                        <span className="font-medium">{item.label}</span>
                        {item.badge && (
                          <span className="ml-auto rounded-full bg-flash-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer: signed-in user chip + logout */}
        <div className="border-t border-ink-300/60 p-3">
          {me ? (
            <SignedInChip me={me} />
          ) : (
            <Link
              href="/login"
              className="flex items-center justify-between rounded-xl bg-prime-50 p-3 text-xs transition hover:bg-prime-100"
            >
              <div>
                <div className="font-bold text-prime-700">Not signed in</div>
                <div className="mt-0.5 text-ink-700">Click to sign in</div>
              </div>
              <span className="text-prime-700">→</span>
            </Link>
          )}
        </div>
      </aside>

      {/* Mobile backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-ink-900/40 backdrop-blur-sm md:hidden"
          aria-hidden
        />
      )}
    </>
  )
}

// ─── Signed-in chip ───────────────────────────────────────────────────────────
function SignedInChip({ me }: { me: NonNullable<Me> }) {
  const initial = (me.full_name?.[0] ?? me.email?.[0] ?? '?').toUpperCase()
  const display = me.full_name ?? me.email ?? 'User'
  const roleColor =
    me.role === 'admin'      ? 'text-flash-700' :
    me.role === 'wholesaler' ? 'text-prime-700' :
    me.role === 'retailer'   ? 'text-amber-700' :
    'text-ink-500'

  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-paper-dim/60 p-2.5">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-prime-700 text-sm font-black text-paper">
        {initial}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-xs font-semibold text-ink-900">{display}</div>
        <div className={`text-[10px] font-bold uppercase tracking-widest ${roleColor}`}>{me.role}</div>
      </div>
      <a
        href="/logout"
        title="Sign out"
        aria-label="Sign out"
        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-ink-300 bg-paper text-ink-500 transition hover:border-flash-500 hover:bg-flash-50 hover:text-flash-700"
      >
        <IconLogout />
      </a>
    </div>
  )
}

// ─── Icons (inline SVG, no library) ───────────────────────────────────────────
const ic = 'h-4 w-4'
function IconHome()      { return <svg viewBox="0 0 24 24" className={ic} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h14V10"/></svg> }
function IconBox()       { return <svg viewBox="0 0 24 24" className={ic} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8 12 3 3 8v8l9 5 9-5V8Z"/><path d="m3.3 8 8.7 5 8.7-5"/><path d="M12 13v9"/></svg> }
function IconPlay()      { return <svg viewBox="0 0 24 24" className={ic} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="m10 8 6 4-6 4z" fill="currentColor" stroke="none"/></svg> }
function IconWarehouse() { return <svg viewBox="0 0 24 24" className={ic} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21V9l9-5 9 5v12"/><path d="M9 21v-8h6v8"/></svg> }
function IconClipboard() { return <svg viewBox="0 0 24 24" className={ic} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="12" height="18" rx="2"/><path d="M9 4V2h6v2"/><path d="M9 10h6M9 14h6M9 18h4"/></svg> }
function IconUsers()     { return <svg viewBox="0 0 24 24" className={ic} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.4 3.4-5.5 6.5-5.5s5.9 2.1 6.5 5.5"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.5c2.6.3 4.5 2.2 5 4.5"/></svg> }
function IconChat()      { return <svg viewBox="0 0 24 24" className={ic} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a8 8 0 1 1-3.6-6.7L21 4l-1 4A8 8 0 0 1 21 12Z"/><path d="M8 11h8M8 14h5"/></svg> }
function IconCog()       { return <svg viewBox="0 0 24 24" className={ic} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A1.7 1.7 0 0 0 19.4 9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></svg> }
function IconLogout()    { return <svg viewBox="0 0 24 24" className={ic} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 17l5-5-5-5"/><path d="M20 12H8"/><path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4"/></svg> }
function IconShopper()   { return <svg viewBox="0 0 24 24" className={ic} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 8h14l-1.4 10.4A2 2 0 0 1 15.6 20H8.4a2 2 0 0 1-2-1.6L5 8Z"/><path d="M9 8V6a3 3 0 1 1 6 0v2"/></svg> }
function IconTag()       { return <svg viewBox="0 0 24 24" className={ic} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41 13 21a2 2 0 0 1-2.83 0L3 13.83V4a1 1 0 0 1 1-1h9.83a2 2 0 0 1 1.41.59l6.35 6.35a2 2 0 0 1 0 2.47Z"/><circle cx="7.5" cy="7.5" r="1.5" fill="currentColor"/></svg> }
function IconGrid()      { return <svg viewBox="0 0 24 24" className={ic} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg> }
function IconPin()       { return <svg viewBox="0 0 24 24" className={ic} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg> }
