'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { isNavActive, POS_NAV, type NavItem } from '@/lib/nav'
import { NavIcon } from './NavIcon'

type Me = {
  id: string
  email: string | null
  full_name: string | null
  role: string
}

function NavLink({ item, active, onNavigate }: { item: NavItem; active: boolean; onNavigate?: () => void }) {
  const base =
    'nav-motion group relative flex items-center gap-3 rounded-xl px-2 py-1.5 outline-offset-2 transition-[background-color,box-shadow,color,transform] duration-200 ease-out active:scale-[0.99]'
  const activeClass = 'bg-prime-50 text-prime-800 shadow-sm ring-1 ring-inset ring-prime-200/90'
  const idleClass = 'text-ink-700 hover:bg-ink-100/80 hover:text-ink-900'
  const disabledClass = 'cursor-not-allowed text-ink-500/80'

  const iconWrap = (activeState: boolean) =>
    `grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-colors duration-200 ${
      activeState
        ? 'bg-prime-700 text-paper shadow-sm shadow-prime-900/20'
        : 'bg-paper-dim text-ink-500 ring-1 ring-ink-200/60 group-hover:bg-paper group-hover:text-prime-700 group-hover:ring-prime-200/80'
    }`

  if (item.disabled || !item.href) {
    return (
      <div className={`${base} ${disabledClass}`} aria-disabled>
        <span className={iconWrap(false)}>
          <NavIcon id={item.icon} />
        </span>
        <span className="min-w-0 flex-1 truncate font-medium">{item.label}</span>
        <span className="ml-auto shrink-0 rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-bold leading-none text-ink-600">
          Soon
        </span>
      </div>
    )
  }

  const className = `${base} ${active ? activeClass : idleClass}`
  const inner = (
    <>
      {active && (
        <span
          className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-prime-600"
          aria-hidden
        />
      )}
      <span className={iconWrap(active)}>
        <NavIcon id={item.icon} />
      </span>
      <span className={`min-w-0 flex-1 truncate font-medium ${active ? 'text-prime-900' : ''}`}>
        {item.label}
      </span>
    </>
  )

  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onClick={onNavigate}
      >
        {inner}
      </a>
    )
  }

  return (
    <Link href={item.href} className={className} onClick={onNavigate} aria-current={active ? 'page' : undefined}>
      {inner}
    </Link>
  )
}

export function PosSidebar({ me }: { me: Me }) {
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

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-ink-300/50 bg-paper/90 px-4 py-3 backdrop-blur-md supports-[backdrop-filter]:bg-paper/80 md:hidden">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center rounded-lg outline-offset-4">
            <Image
              src="/nulakaz-wordmark.webp"
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
            aria-controls="pos-sidebar"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="nav-motion grid h-10 w-10 place-items-center rounded-xl border border-ink-300/80 bg-paper text-ink-700 shadow-sm transition hover:border-prime-300 hover:bg-prime-50 hover:text-prime-800 active:scale-[0.97]"
          >
            <MenuIcon open={open} />
          </button>
        </div>
      </header>

      <aside
        id="pos-sidebar"
        aria-label="POS modules"
        className={`nav-motion fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-ink-300/50 bg-paper shadow-[4px_0_24px_-8px_rgba(92,51,66,0.12)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] md:sticky md:top-0 md:z-auto md:h-screen md:translate-x-0 md:shadow-none ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
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
              src="/nulakaz-wordmark.webp"
              alt="NuLakaz"
              width={3139}
              height={1015}
              className="h-8 w-auto"
            />
          </Link>
          <span className="shrink-0 rounded-full bg-prime-700 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-paper shadow-sm shadow-prime-900/15">
            POS
          </span>
        </div>

        <nav className="nav-scrollbar flex-1 overflow-y-auto overscroll-contain px-2.5 pb-3 pt-3 text-sm">
          {POS_NAV.map((section, si) => (
            <section key={section.title} className={si === 0 ? 'mt-0.5' : 'mt-4'}>
              <div className="mb-1.5 flex items-center gap-2 px-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-500">
                  {section.title}
                </span>
                <span className="h-px flex-1 bg-gradient-to-r from-ink-300/70 to-transparent" aria-hidden />
              </div>
              <ul className="space-y-0.5" role="list">
                {section.items.map((item) => (
                  <li key={item.id}>
                    <NavLink
                      item={item}
                      active={!!(item.href && !item.external && isNavActive(pathname, item.href))}
                      onNavigate={close}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </nav>

        <footer className="shrink-0 space-y-2 border-t border-ink-300/50 bg-gradient-to-t from-paper-dim/80 to-paper p-3">
          <Link
            href="/shifts/open"
            onClick={close}
            className="nav-motion flex h-10 items-center justify-center gap-2 rounded-xl border border-ink-300/80 bg-paper text-sm font-semibold text-ink-800 shadow-sm transition hover:border-prime-300 hover:bg-prime-50 active:scale-[0.99]"
          >
            <NavIcon id="shifts" className="h-4 w-4" />
            Open shift
          </Link>
          <Link
            href="/register"
            onClick={close}
            className="nav-motion flex h-11 items-center justify-center gap-2 rounded-xl bg-prime-700 text-sm font-bold text-paper shadow-md shadow-prime-900/20 transition hover:bg-prime-600 active:scale-[0.98]"
          >
            <NavIcon id="register" className="h-4 w-4" />
            Open register
          </Link>
          <SignedInChip me={me} />
        </footer>
      </aside>

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

function SignedInChip({ me }: { me: Me }) {
  const initial = (me.full_name?.[0] ?? me.email?.[0] ?? '?').toUpperCase()
  const display = me.full_name ?? me.email ?? 'User'
  const roleColor =
    me.role === 'admin'
      ? 'text-flash-700'
      : me.role === 'manager'
        ? 'text-prime-700'
        : me.role === 'cashier'
          ? 'text-mint-600'
          : 'text-ink-500'

  return (
    <div className="nav-motion flex items-center gap-2.5 rounded-xl border border-ink-300/60 bg-paper p-2 shadow-sm ring-1 ring-ink-200/30">
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
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
      </div>
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

function IconLogout() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 17l5-5-5-5" />
      <path d="M20 12H8" />
      <path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" />
    </svg>
  )
}
