'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  Badge,
  Button,
  ButtonLink,
  FILTER_CHIP,
  InlineEmpty,
  SELECT_CLASS,
  StatCard,
  StatGrid,
  ToolbarPanel,
} from '@/components/ui'

export type RegisterItem = {
  id: string
  code: string
  name: string
  active: boolean
  location_id: string
  location_code: string
  location_name: string
  open_shift_id: string | null
  open_shift_started_at: string | null
  open_shift_cashier: string | null
  today_sales: number
  today_revenue: number
  today_units: number
}

type Filter = 'all' | 'active' | 'in_session' | 'idle' | 'retired'
type Sort = 'code' | 'name' | 'location' | 'busy_today'

const fmt = (n: number) => `Rs ${n.toFixed(2)}`

export function RegistersBoard({
  items,
  locations,
  activeLocationId,
}: {
  items: RegisterItem[]
  locations: { id: string; code: string; name: string }[]
  activeLocationId: string | null
}) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [sort, setSort] = useState<Sort>('code')

  const counts = useMemo(() => {
    const stats = { all: items.length, active: 0, retired: 0, in_session: 0, idle: 0 }
    for (const r of items) {
      if (!r.active) stats.retired += 1
      else stats.active += 1
      if (r.open_shift_id) stats.in_session += 1
      else if (r.active) stats.idle += 1
    }
    return stats
  }, [items])

  const totalRevenueToday = items.reduce((s, r) => s + r.today_revenue, 0)
  const totalSalesToday = items.reduce((s, r) => s + r.today_sales, 0)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    let rows = items
    if (q) {
      rows = rows.filter(
        (r) =>
          r.code.toLowerCase().includes(q) ||
          r.name.toLowerCase().includes(q) ||
          r.location_code.toLowerCase().includes(q) ||
          r.location_name.toLowerCase().includes(q),
      )
    }
    rows = rows.filter((r) => {
      if (filter === 'retired') return !r.active
      if (filter === 'in_session') return !!r.open_shift_id
      if (filter === 'idle') return r.active && !r.open_shift_id
      if (filter === 'active') return r.active
      return true
    })
    rows = [...rows].sort((a, b) => {
      switch (sort) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'location':
          return (
            a.location_code.localeCompare(b.location_code) ||
            a.code.localeCompare(b.code)
          )
        case 'busy_today':
          return b.today_revenue - a.today_revenue
        case 'code':
        default:
          return a.code.localeCompare(b.code)
      }
    })
    return rows
  }, [items, search, filter, sort])

  return (
    <>
      <StatGrid cols={5}>
        <StatCard label="Registers" value={counts.all} hint={`${counts.active} active · ${counts.retired} retired`} />
        <StatCard
          label="Open sessions"
          value={counts.in_session}
          tone={counts.in_session > 0 ? 'mint' : 'default'}
          hint={counts.idle > 0 ? `${counts.idle} idle` : undefined}
        />
        <StatCard label="Sales · today" value={totalSalesToday} />
        <StatCard label="Revenue · today" value={fmt(totalRevenueToday)} tone="prime" />
        <StatCard
          label="Avg / session"
          value={counts.in_session > 0 ? fmt(totalRevenueToday / counts.in_session) : '—'}
          hint="Today's revenue per open register"
        />
      </StatGrid>

      <ToolbarPanel>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-ink-300/70 bg-paper px-3 py-2 shadow-sm">
            <svg className="h-4 w-4 shrink-0 text-ink-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search registers, locations…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-ink-500"
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} className="text-xs text-ink-500 hover:text-ink-900">
                Clear
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1 rounded-xl border border-ink-300/70 bg-paper p-1 text-xs font-bold shadow-sm">
            {[
              { key: 'all' as const, label: `All · ${counts.all}` },
              { key: 'in_session' as const, label: `In session · ${counts.in_session}` },
              { key: 'idle' as const, label: `Idle · ${counts.idle}` },
              { key: 'retired' as const, label: `Retired · ${counts.retired}` },
            ].map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setFilter(opt.key)}
                className={`${FILTER_CHIP} ${
                  filter === opt.key ? 'bg-prime-700 text-paper' : 'text-ink-700 hover:bg-paper-dim'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {locations.length > 1 && (
            <form className="flex items-center gap-2">
              <select
                name="location"
                defaultValue={activeLocationId ?? ''}
                className={SELECT_CLASS}
              >
                <option value="">All locations</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.code} · {l.name}
                  </option>
                ))}
              </select>
              <Button type="submit" variant="secondary" size="sm">
                Switch
              </Button>
            </form>
          )}

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className={SELECT_CLASS}
          >
            <option value="code">Sort: Code</option>
            <option value="name">Sort: Name</option>
            <option value="location">Sort: Location</option>
            <option value="busy_today">Sort: Busiest today</option>
          </select>

          <ButtonLink href="/registers/new">+ New register</ButtonLink>
        </div>
      </ToolbarPanel>

      <section>
        {filtered.length === 0 ? (
          <InlineEmpty>No registers match this filter.</InlineEmpty>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((r) => (
              <RegisterCard key={r.id} reg={r} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}

function RegisterCard({ reg }: { reg: RegisterItem }) {
  const inSession = !!reg.open_shift_id
  const status = !reg.active ? 'retired' : inSession ? 'in_session' : 'idle'

  const statusStyles = {
    in_session: 'border-mint-500/40 bg-mint-100/40',
    idle: 'border-ink-300/60 bg-paper',
    retired: 'border-ink-300/60 bg-paper-dim/40 opacity-80',
  } as const

  return (
    <article className={`flex flex-col rounded-2xl border p-4 transition hover:shadow-md ${statusStyles[status]}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-prime-700">
              {reg.code}
            </span>
            {inSession && <PulseDot />}
            {!reg.active && <Badge variant="muted">Retired</Badge>}
          </div>
          <h3 className="mt-1 truncate font-display text-lg font-black tracking-tight">{reg.name}</h3>
          <Link
            href={`/locations/${reg.location_id}`}
            className="mt-0.5 inline-block text-xs text-ink-500 hover:text-ink-900"
          >
            <span className="font-mono">{reg.location_code}</span>
            <span className="ml-1.5">{reg.location_name}</span>
          </Link>
        </div>

        <ButtonLink href={`/registers/${reg.id}`} variant="secondary" size="sm">
          Edit
        </ButtonLink>
      </div>

      <div className="mt-3 rounded-xl bg-ink-900 p-3 text-paper">
        {inSession ? (
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-widest text-ink-500">Session</div>
              <div className="mt-0.5 truncate text-xs font-semibold text-paper">
                {reg.open_shift_cashier ?? '—'}
              </div>
              <LiveDuration startedAt={reg.open_shift_started_at!} />
            </div>
            <ButtonLink href={`/shifts/${reg.open_shift_id}`} size="sm">
              View →
            </ButtonLink>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-ink-500">Session</div>
              <div className="mt-0.5 text-xs font-semibold text-paper">
                {reg.active ? 'Idle — no open shift' : 'Retired register'}
              </div>
            </div>
            {reg.active && (
              <ButtonLink href="/shifts/open" size="sm">
                Open shift
              </ButtonLink>
            )}
          </div>
        )}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl border border-ink-300/60 bg-paper p-3">
        <Stat label="Sales" value={String(reg.today_sales)} />
        <Stat label="Units" value={String(reg.today_units)} />
        <Stat label="Revenue" value={fmt(reg.today_revenue)} bold />
      </div>
    </article>
  )
}

function PulseDot() {
  return (
    <span className="relative inline-flex h-2 w-2" aria-hidden>
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint-500 opacity-60" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-mint-500" />
    </span>
  )
}

function LiveDuration({ startedAt }: { startedAt: string }) {
  const [text, setText] = useState<string | null>(null)
  useEffect(() => {
    const tick = () => {
      const ms = Date.now() - new Date(startedAt).getTime()
      const h = Math.floor(ms / 3_600_000)
      const m = Math.floor((ms % 3_600_000) / 60_000)
      setText(`open ${h}h ${String(m).padStart(2, '0')}m`)
    }
    tick()
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [startedAt])
  return (
    <div className="mt-0.5 font-mono text-[11px] tabular-nums text-ink-500">{text ?? '…'}</div>
  )
}

function Stat({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-ink-500">{label}</div>
      <div
        className={`mt-0.5 font-mono tabular-nums ${bold ? 'text-base font-black text-prime-700' : 'text-sm font-semibold text-ink-900'}`}
      >
        {value}
      </div>
    </div>
  )
}
