'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

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
    items: [{ href: '/', label: 'Dashboard', icon: <IconHome /> }],
  },
  {
    heading: 'Catalog',
    items: [
      { href: '/products', label: 'Products', icon: <IconBox /> },
      { href: '/brands', label: 'Brands', icon: <IconTag /> },
      { href: '/categories', label: 'Categories', icon: <IconGrid /> },
      { href: '/reels', label: 'Reels', icon: <IconPlay /> },
    ],
  },
  {
    heading: 'Operations',
    items: [
      { href: '/inventory', label: 'Warehouse', icon: <IconWarehouse /> },
      { href: '/locations', label: 'Locations', icon: <IconPin /> },
      { href: '/orders', label: 'Orders', icon: <IconClipboard /> },
    ],
  },
  {
    heading: 'People',
    items: [{ href: '/customers', label: 'Customers', icon: <IconShopper /> }],
  },
  {
    heading: 'Channels',
    items: [{ href: '/whatsapp', label: 'WhatsApp', icon: <IconChat /> }],
  },
  {
    heading: 'Admin',
    items: [{ href: '/settings', label: 'Settings', icon: <IconCog /> }],
  },
]

export function Sidebar({ me }: { me?: Me }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    close()
  }, [pathname, close])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, close])

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)

  return (
    <>
      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 border-b border-ink-300/50 bg-paper/90 px-4 py-3 backdrop-blur-md supports-[backdrop-filter]:bg-paper/80 md:hidden">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center rounded-lg outline-offset-4">
            <Image
              src="/logo/nulakaz-wordmark.webp"
              alt="NuLakaz"
              width={3139}
              height={1015}
              className="h-7 w-auto"
              priority
            />
          </Link>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="app-sidebar"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="nav-motion grid h-10 w-10 place-items-center rounded-xl border border-ink-300/80 bg-paper text-ink-700 shadow-sm transition hover:border-prime-300 hover:bg-prime-50 hover:text-prime-800 active:scale-[0.97]"
          >
            <MenuIcon open={open} />
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        id="app-sidebar"
        data-admin-chrome
        aria-label="Main navigation"
        className={`nav-motion fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-ink-300/50 bg-paper shadow-[4px_0_24px_-8px_rgba(92,51,66,0.12)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] md:sticky md:top-0 md:z-auto md:h-screen md:translate-x-0 md:shadow-none ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="relative flex h-[3.75rem] shrink-0 items-center justify-between gap-2 border-b border-ink-300/50 px-4">
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-prime-300/60 to-transparent"
            aria-hidden
          />
          <Link
            href="/"
            className="flex min-w-0 items-center rounded-lg outline-offset-4 transition-opacity hover:opacity-90"
          >
            <Image
              src="/logo/nulakaz-wordmark.webp"
              alt="NuLakaz"
              width={3139}
              height={1015}
              className="h-8 w-auto"
            />
          </Link>
          <span className="shrink-0 rounded-full bg-prime-700 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-paper shadow-sm shadow-prime-900/15">
            admin
          </span>
        </div>

        {/* Quick search */}
        <div className="shrink-0 px-3 pb-1 pt-3">
          <label className="group relative block">
            <span className="sr-only">Quick search</span>
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500 transition group-focus-within:text-prime-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              type="search"
              placeholder="Quick search…"
              className="nav-motion w-full rounded-xl border border-ink-300/80 bg-canvas/80 py-2.5 pl-9 pr-12 text-xs text-ink-900 shadow-inner shadow-ink-900/[0.03] placeholder:text-ink-500 transition focus:border-prime-400 focus:bg-paper focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-prime-200)_65%,transparent)] focus:outline-none"
            />
            <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded-md border border-ink-300/80 bg-paper px-1.5 py-0.5 font-sans text-[10px] font-medium text-ink-500 shadow-sm sm:inline">
              ⌘K
            </kbd>
          </label>
        </div>

        {/* Nav */}
        <nav className="nav-scrollbar flex-1 overflow-y-auto overscroll-contain px-2.5 pb-3 pt-1 text-sm">
          {NAV.map((group, gi) => (
            <section key={group.heading} className={gi === 0 ? 'mt-0.5' : 'mt-4'}>
              <div className="mb-1.5 flex items-center gap-2 px-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-500">
                  {group.heading}
                </span>
                <span className="h-px flex-1 bg-gradient-to-r from-ink-300/70 to-transparent" aria-hidden />
              </div>
              <ul className="space-y-0.5" role="list">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <NavLink item={item} active={isActive(item.href)} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </nav>

        {/* Footer */}
        <footer className="shrink-0 border-t border-ink-300/50 bg-gradient-to-t from-paper-dim/80 to-paper p-3">
          {me ? <SignedInChip me={me} /> : <SignedOutPrompt />}
        </footer>
      </aside>

      {/* Mobile backdrop */}
      <div
        className={`nav-motion fixed inset-0 z-30 bg-ink-950/30 backdrop-blur-[2px] transition-opacity duration-300 md:hidden ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden={!open}
        onClick={close}
      />
    </>
  )
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      aria-current={active ? 'page' : undefined}
      className={`nav-motion group relative flex items-center gap-3 rounded-xl px-2 py-1.5 outline-offset-2 transition-[background-color,box-shadow,color,transform] duration-200 ease-out active:scale-[0.99] ${
        active
          ? 'bg-prime-50 text-prime-800 shadow-sm ring-1 ring-inset ring-prime-200/90'
          : 'text-ink-700 hover:bg-ink-100/80 hover:text-ink-900'
      }`}
    >
      {active && (
        <span
          className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-prime-600"
          aria-hidden
        />
      )}
      <span
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-colors duration-200 ${
          active
            ? 'bg-prime-700 text-paper shadow-sm shadow-prime-900/20'
            : 'bg-paper-dim text-ink-500 ring-1 ring-ink-200/60 group-hover:bg-paper group-hover:text-prime-700 group-hover:ring-prime-200/80'
        }`}
      >
        {item.icon}
      </span>
      <span className={`min-w-0 flex-1 truncate font-medium ${active ? 'text-prime-900' : ''}`}>
        {item.label}
      </span>
      {item.badge && (
        <span className="ml-auto shrink-0 rounded-full bg-flash-500 px-2 py-0.5 text-[10px] font-bold leading-none text-white shadow-sm">
          {item.badge}
        </span>
      )}
    </Link>
  )
}

function SignedOutPrompt() {
  return (
    <Link
      href="/login"
      className="nav-motion flex items-center justify-between gap-3 rounded-xl border border-prime-200/80 bg-prime-50/90 p-3 text-xs shadow-sm transition hover:border-prime-300 hover:bg-prime-100 active:scale-[0.99]"
    >
      <div>
        <div className="font-bold text-prime-800">Not signed in</div>
        <p className="mt-0.5 text-ink-600">Click to sign in</p>
      </div>
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-prime-700 text-paper" aria-hidden>
        →
      </span>
    </Link>
  )
}

function SignedInChip({ me }: { me: NonNullable<Me> }) {
  const initial = (me.full_name?.[0] ?? me.email?.[0] ?? '?').toUpperCase()
  const display = me.full_name ?? me.email ?? 'User'
  const roleColor =
    me.role === 'admin'
      ? 'text-flash-700'
      : me.role === 'wholesaler'
        ? 'text-prime-700'
        : me.role === 'retailer'
          ? 'text-amber-700'
          : 'text-ink-500'

  return (
    <div className="nav-motion flex items-center gap-2.5 rounded-xl border border-ink-300/60 bg-paper p-2 shadow-sm ring-1 ring-ink-200/30">
      <Link
        href={`/settings/team/${me.id}`}
        className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg outline-offset-2 transition hover:bg-canvas/60"
        title="Edit your profile"
      >
        <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-prime-600 to-prime-800 text-sm font-black text-paper shadow-md shadow-prime-900/25">
          {initial}
          <span
            className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-paper bg-mint-500"
            title="Online"
            aria-hidden
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs font-semibold text-ink-900">{display}</div>
          <div className={`text-[10px] font-bold uppercase tracking-[0.12em] ${roleColor}`}>{me.role}</div>
        </div>
      </Link>
      <a
        href="/logout"
        title="Sign out"
        aria-label="Sign out"
        className="nav-motion grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-ink-300/80 bg-paper text-ink-500 transition hover:border-flash-500/80 hover:bg-flash-50 hover:text-flash-700 active:scale-95"
      >
        <IconLogout />
      </a>
    </div>
  )
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
      {open ? (
        <>
          <path d="M6 6l12 12" />
          <path d="M18 6L6 18" />
        </>
      ) : (
        <>
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </>
      )}
    </svg>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const ic = 'h-4 w-4'
function IconHome() {
  return (
    <svg viewBox="0 0 24 24" className={ic} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10v10h14V10" />
    </svg>
  )
}
function IconBox() {
  return (
    <svg viewBox="0 0 24 24" className={ic} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
      <path d="m3.3 8 8.7 5 8.7-5" />
      <path d="M12 13v9" />
    </svg>
  )
}
function IconPlay() {
  return (
    <svg viewBox="0 0 24 24" className={ic} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="m10 8 6 4-6 4z" fill="currentColor" stroke="none" />
    </svg>
  )
}
function IconWarehouse() {
  return (
    <svg viewBox="0 0 24 24" className={ic} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21V9l9-5 9 5v12" />
      <path d="M9 21v-8h6v8" />
    </svg>
  )
}
function IconClipboard() {
  return (
    <svg viewBox="0 0 24 24" className={ic} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="4" width="12" height="18" rx="2" />
      <path d="M9 4V2h6v2" />
      <path d="M9 10h6M9 14h6M9 18h4" />
    </svg>
  )
}
function IconChat() {
  return (
    <svg viewBox="0 0 24 24" className={ic} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a8 8 0 1 1-3.6-6.7L21 4l-1 4A8 8 0 0 1 21 12Z" />
      <path d="M8 11h8M8 14h5" />
    </svg>
  )
}
function IconCog() {
  return (
    <svg viewBox="0 0 24 24" className={ic} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A1.7 1.7 0 0 0 19.4 9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
    </svg>
  )
}
function IconLogout() {
  return (
    <svg viewBox="0 0 24 24" className={ic} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 17l5-5-5-5" />
      <path d="M20 12H8" />
      <path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" />
    </svg>
  )
}
function IconShopper() {
  return (
    <svg viewBox="0 0 24 24" className={ic} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 8h14l-1.4 10.4A2 2 0 0 1 15.6 20H8.4a2 2 0 0 1-2-1.6L5 8Z" />
      <path d="M9 8V6a3 3 0 1 1 6 0v2" />
    </svg>
  )
}
function IconTag() {
  return (
    <svg viewBox="0 0 24 24" className={ic} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41 13 21a2 2 0 0 1-2.83 0L3 13.83V4a1 1 0 0 1 1-1h9.83a2 2 0 0 1 1.41.59l6.35 6.35a2 2 0 0 1 0 2.47Z" />
      <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor" />
    </svg>
  )
}
function IconGrid() {
  return (
    <svg viewBox="0 0 24 24" className={ic} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  )
}
function IconPin() {
  return (
    <svg viewBox="0 0 24 24" className={ic} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}
