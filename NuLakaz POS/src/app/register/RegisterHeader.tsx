'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { AppCockpit, Divider } from '@/components/AppCockpit'

export type HeaderShift = {
  id: string
  opened_at: string
  register_code: string
  register_name: string
  location_code: string
  location_name: string
}

export function RegisterHeader({
  shift,
  cashierName,
  cashierEmail,
}: {
  shift: HeaderShift
  cashierName: string
  cashierEmail: string | null
}) {
  return (
    <AppCockpit cashierName={cashierName} cashierEmail={cashierEmail}>
      <Chip code={shift.location_code} label={shift.location_name} />
      <span className="text-ink-400">/</span>
      <Chip code={shift.register_code} label={shift.register_name} />
      <Divider className="hidden sm:inline-block" />
      <ShiftTimer openedAt={shift.opened_at} />
      <Link
        href={`/shifts/${shift.id}`}
        className="ml-2 hidden h-9 items-center rounded-lg border border-ink-300/80 bg-prime-50 px-3 text-xs font-bold text-prime-800 transition hover:border-prime-300 hover:bg-prime-100 lg:inline-flex"
      >
        Shift
        <span className="ml-1 text-prime-600">→</span>
      </Link>
    </AppCockpit>
  )
}

function Chip({ code, label }: { code: string; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-ink-300/80 bg-prime-50/90 px-2.5 py-1.5 shadow-sm">
      <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-prime-700">
        {code}
      </span>
      <span className="hidden text-xs font-semibold text-ink-800 sm:inline">{label}</span>
    </div>
  )
}

function ShiftTimer({ openedAt }: { openedAt: string }) {
  const [elapsed, setElapsed] = useState<string | null>(null)

  useEffect(() => {
    const tick = () => {
      const ms = Date.now() - new Date(openedAt).getTime()
      const h = Math.floor(ms / 3_600_000)
      const m = Math.floor((ms % 3_600_000) / 60_000)
      setElapsed(`${h}h ${String(m).padStart(2, '0')}m`)
    }
    tick()
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [openedAt])

  return (
    <div className="flex items-center gap-2">
      <span className="relative inline-flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint-500 opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-mint-500" />
      </span>
      <span className="hidden text-[10px] font-bold uppercase tracking-widest text-ink-500 sm:inline">
        Open
      </span>
      <span className="font-mono text-sm font-bold tabular-nums text-ink-900">{elapsed ?? '—'}</span>
    </div>
  )
}
