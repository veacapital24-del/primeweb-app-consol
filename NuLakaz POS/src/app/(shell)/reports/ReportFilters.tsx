'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { SELECT_CLASS } from '@/components/ui'
import { localDateStr } from './lib'

type Preset = 'today' | 'yesterday' | '7d' | '30d' | 'custom'

export function ReportFilters({
  fromStr,
  toStr,
  activeLocId,
  locations,
}: {
  fromStr: string
  toStr: string
  activeLocId: string | null
  locations: { id: string; code: string; name: string }[]
}) {
  const router = useRouter()
  const sp = useSearchParams()
  const [isPending, start] = useTransition()

  const activePreset = detectPreset(fromStr, toStr)

  function navigate(next: { from?: string; to?: string; location?: string | null }) {
    const url = new URLSearchParams(sp.toString())
    if (next.from !== undefined) url.set('from', next.from)
    if (next.to !== undefined) url.set('to', next.to)
    if (next.location !== undefined) {
      if (next.location) url.set('location', next.location)
      else url.delete('location')
    }
    start(() => router.push('/reports?' + url.toString()))
  }

  function applyPreset(days: 0 | 1 | 7 | 30) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const to = new Date(today)
    const from = new Date(today)
    if (days === 1) {
      from.setDate(from.getDate() - 1)
      to.setDate(to.getDate() - 1)
    } else if (days > 0) {
      from.setDate(from.getDate() - (days - 1))
    }
    navigate({ from: localDateStr(from), to: localDateStr(to) })
  }

  const presets: { id: Preset; label: string; days?: 0 | 1 | 7 | 30 }[] = [
    { id: 'today', label: 'Today', days: 0 },
    { id: 'yesterday', label: 'Yesterday', days: 1 },
    { id: '7d', label: '7 days', days: 7 },
    { id: '30d', label: '30 days', days: 30 },
  ]

  return (
    <section className="glass-card p-3 sm:p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-500">Period</span>
          {presets.map((p) => {
            const on = activePreset === p.id
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => p.days !== undefined && applyPreset(p.days)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition active:scale-[0.98] ${
                  on
                    ? 'bg-prime-700 text-paper shadow-sm shadow-prime-900/20'
                    : 'border border-ink-300/60 bg-paper text-ink-700 hover:border-prime-300 hover:bg-prime-50'
                }`}
              >
                {p.label}
              </button>
            )
          })}
          {activePreset === 'custom' ? (
            <span className="rounded-lg border border-dashed border-prime-400/60 bg-prime-50/50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-prime-800">
              Custom
            </span>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 rounded-xl border border-ink-300/70 bg-paper px-3 py-2 text-xs shadow-sm">
            <CalendarIcon />
            <input
              type="date"
              value={fromStr}
              onChange={(e) => navigate({ from: e.target.value, to: toStr })}
              className="bg-transparent font-semibold text-ink-900 outline-none"
              aria-label="From date"
            />
            <span className="text-ink-400">→</span>
            <input
              type="date"
              value={toStr}
              onChange={(e) => navigate({ from: fromStr, to: e.target.value })}
              className="bg-transparent font-semibold text-ink-900 outline-none"
              aria-label="To date"
            />
          </label>

          {locations.length > 1 ? (
            <select
              value={activeLocId ?? ''}
              onChange={(e) => navigate({ location: e.target.value || null })}
              className={SELECT_CLASS + ' !w-auto min-w-[10rem] py-2 text-xs font-semibold'}
              aria-label="Location filter"
            >
              <option value="">All locations</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.code} · {l.name}
                </option>
              ))}
            </select>
          ) : null}

          {isPending ? (
            <span className="inline-flex items-center gap-1.5 px-2 text-xs font-medium text-ink-500">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-prime-200 border-t-prime-700" />
              Updating…
            </span>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function detectPreset(fromStr: string, toStr: string): Preset {
  const today = localDateStr(new Date())
  const yesterday = localDateStr(new Date(Date.now() - 86_400_000))

  if (fromStr === today && toStr === today) return 'today'
  if (fromStr === yesterday && toStr === yesterday) return 'yesterday'

  const end = new Date(`${toStr}T12:00:00`)
  const start = new Date(`${fromStr}T12:00:00`)
  const diffDays = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1

  if (toStr === today && diffDays === 7) return '7d'
  if (toStr === today && diffDays === 30) return '30d'

  return 'custom'
}

function CalendarIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0 text-prime-600"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  )
}
