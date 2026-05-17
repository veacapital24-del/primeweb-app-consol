'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

// Light top bar for the register screen (fullscreen, no sidebar).

export function AppCockpit({
  cashierName,
  cashierEmail,
  children,
}: {
  cashierName: string
  cashierEmail: string | null
  children?: React.ReactNode
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-ink-300/50 bg-paper/90 text-ink-900 backdrop-blur-md supports-[backdrop-filter]:bg-paper/80 print:hidden">
      <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2 pr-2 sm:pr-3" aria-label="NuLakaz POS">
          <Image
            src="/nulakaz-mark.webp"
            alt="NuLakaz"
            width={32}
            height={32}
            priority
            className="h-7 w-auto object-contain"
          />
          <span className="rounded-full bg-prime-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-paper">
            POS
          </span>
        </Link>

        {children && (
          <>
            <Divider />
            {children}
          </>
        )}

        <div className="flex-1" />

        <Clock />
        <Divider className="hidden sm:inline-block" />
        <CashierMenu name={cashierName} email={cashierEmail} />
      </div>
    </header>
  )
}

export function Divider({ className = '' }: { className?: string }) {
  return <span className={`h-6 w-px bg-ink-300/70 ${className}`} aria-hidden />
}

function Clock() {
  const [time, setTime] = useState<string | null>(null)

  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString('en-GB', {
          timeZone: 'Indian/Mauritius',
          hour: '2-digit',
          minute: '2-digit',
        }),
      )
    tick()
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="hidden items-center gap-2 md:flex">
      <span className="text-[10px] font-bold uppercase tracking-widest text-ink-500">Time</span>
      <span className="font-mono text-sm font-bold tabular-nums text-ink-900">{time ?? '--:--'}</span>
    </div>
  )
}

function CashierMenu({ name, email }: { name: string; email: string | null }) {
  const [open, setOpen] = useState(false)
  const initial = (name?.[0] ?? email?.[0] ?? '?').toUpperCase()

  useEffect(() => {
    if (!open) return
    function onClickOutside(e: MouseEvent) {
      const target = e.target as HTMLElement
      if (!target.closest('[data-cashier-menu]')) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  return (
    <div className="relative" data-cashier-menu>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 items-center gap-2 rounded-lg border border-ink-300/80 bg-paper pl-1 pr-2 shadow-sm transition hover:border-prime-300 hover:bg-prime-50 sm:pr-2.5"
      >
        <div className="grid h-7 w-7 place-items-center rounded-md bg-prime-700 text-xs font-black text-paper">
          {initial}
        </div>
        <span className="hidden max-w-[120px] truncate text-xs font-semibold text-ink-900 md:inline">
          {name}
        </span>
        <svg className="hidden h-3 w-3 text-ink-500 sm:block" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m3 4.5 3 3 3-3" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-40 mt-1.5 min-w-[220px] rounded-xl border border-ink-300/80 bg-paper p-1 shadow-xl ring-1 ring-ink-200/40">
          <div className="border-b border-ink-300/60 px-3 py-2">
            <div className="text-xs font-bold text-ink-900">{name}</div>
            {email && <div className="truncate text-[11px] text-ink-500">{email}</div>}
          </div>
          <Link
            href="/"
            className="block rounded-lg px-3 py-2 text-xs font-semibold text-ink-800 transition hover:bg-prime-50"
            onClick={() => setOpen(false)}
          >
            Hub
          </Link>
          <a
            href="/logout"
            className="block rounded-lg px-3 py-2 text-xs font-semibold text-flash-700 transition hover:bg-flash-50"
          >
            Sign out
          </a>
        </div>
      )}
    </div>
  )
}
