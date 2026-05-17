'use client'

import Link from 'next/link'
import type { Location } from '@/lib/types'
import { ORDER_STATUS_TONES, orderStatusLabel } from '@/lib/order-status'

export type OrderListRow = {
  kind: 'online' | 'pos'
  id: string
  number: string
  status: string
  total: number
  units: number
  is_wholesale: boolean
  customer: string | null
  phone: string | null
  channel: string
  created_at: string
  location: Pick<Location, 'id' | 'code' | 'name' | 'kind'> | null
}

export function orderHref(row: Pick<OrderListRow, 'kind' | 'id'>) {
  return row.kind === 'pos'
    ? `/orders/${row.id}?source=pos`
    : `/orders/${row.id}`
}

const LOCATION_KIND_TINT: Record<Location['kind'], { bg: string; fg: string }> = {
  store: { bg: '#f5e7c4', fg: '#a98937' },
  warehouse: { bg: '#cfdfeb', fg: '#3a6f93' },
  kiosk: { bg: '#dde7c5', fg: '#5e7f54' },
  popup: { bg: '#e7d3da', fg: '#82445a' },
}

const CHANNEL_TINT: Record<string, { bg: string; fg: string; label: string }> = {
  web: { bg: '#ecdee3', fg: '#82445a', label: 'Web' },
  whatsapp: { bg: '#dde7c5', fg: '#5e7f54', label: 'WhatsApp' },
  reel: { bg: '#e7d3da', fg: '#82445a', label: 'Reel' },
}

const DESKTOP_COLS =
  'grid grid-cols-[minmax(5.5rem,0.9fr)_minmax(7rem,1.4fr)_4rem_minmax(5rem,1fr)_5.5rem_minmax(5rem,0.9fr)_minmax(6.5rem,1.1fr)] items-center gap-x-3'

export function OrdersList({ rows }: { rows: OrderListRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="glass-card px-4 py-12 text-center text-sm text-ink-500">
        No orders in this view.
      </div>
    )
  }

  return (
    <>
      <ul className="space-y-2 sm:hidden">
        {rows.map((row) => (
          <MobileRow key={`${row.kind}-${row.id}`} row={row} />
        ))}
      </ul>

      <div className="glass-card hidden min-w-0 overflow-x-auto sm:block">
        <div className="min-w-[760px]">
        <div className={`${DESKTOP_COLS} border-b border-ink-300/60 bg-paper-dim/60 px-4 py-3 text-left text-xs uppercase tracking-wider text-ink-500`}>
          <span>Order</span>
          <span>Customer</span>
          <span>Items</span>
          <span>Source</span>
          <span>Total</span>
          <span>Status</span>
          <span>When</span>
        </div>
        <div className="divide-y divide-ink-300/60">
          {rows.map((row) => (
            <DesktopRow key={`${row.kind}-${row.id}`} row={row} />
          ))}
        </div>
      </div>
        </div>
    </>
  )
}

function MobileRow({ row }: { row: OrderListRow }) {
  const href = orderHref(row)
  const tint =
    row.kind === 'pos' && row.location
      ? LOCATION_KIND_TINT[row.location.kind]
      : null

  const className = `flex flex-col gap-2 rounded-2xl border bg-paper p-4 transition hover:border-prime-300/80 hover:bg-prime-50/40 hover:shadow-sm active:scale-[0.99]`
  const style = {
    borderColor: tint ? `${tint.fg}55` : 'rgb(207 200 188 / .6)',
    borderLeftWidth: tint ? '3px' : '1px',
  } as const

  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-mono text-xs font-bold text-prime-700">{row.number}</div>
          <div className="mt-0.5 truncate text-sm font-semibold text-ink-900">
            {row.customer ?? '—'}
          </div>
          {row.phone && (
            <div className="font-mono text-[11px] text-ink-500">{row.phone}</div>
          )}
        </div>
        <div className="text-right">
          <div className="font-semibold tabular-nums text-ink-900">
            Rs {row.total.toFixed(2)}
          </div>
          <div className="mt-0.5 text-[11px] text-ink-500">
            {row.units} unit{row.units > 1 ? 's' : ''}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 text-[11px]">
        <div className="flex items-center gap-1.5">
          <StatusPill status={row.status} />
          <SourceChip row={row} />
          {row.is_wholesale && (
            <span className="rounded-full bg-prime-50 px-1.5 py-0.5 text-[10px] font-bold text-prime-700">
              B2B
            </span>
          )}
        </div>
        <span className="text-ink-500">
          {new Date(row.created_at).toLocaleDateString()}
        </span>
      </div>
    </>
  )

  return (
    <li>
      <Link href={href} className={className} style={style}>
        {body}
      </Link>
    </li>
  )
}

function DesktopRow({ row }: { row: OrderListRow }) {
  const href = orderHref(row)
  const tint =
    row.kind === 'pos' && row.location
      ? LOCATION_KIND_TINT[row.location.kind]
      : null

  return (
    <Link
      href={href}
      className={`${DESKTOP_COLS} px-4 py-3 text-sm transition hover:bg-prime-50/40 focus-visible:bg-prime-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-prime-400`}
      style={{
        boxShadow: tint ? `inset 3px 0 0 0 ${tint.fg}` : undefined,
      }}
    >
      <span className="font-mono text-xs font-bold text-prime-700">{row.number}</span>
      <span className="min-w-0">
        <span className="block truncate">{row.customer ?? '—'}</span>
        {row.phone && (
          <span className="block font-mono text-[11px] text-ink-500">{row.phone}</span>
        )}
      </span>
      <span className="text-xs text-ink-700">
        {row.units} unit{row.units > 1 ? 's' : ''}
      </span>
      <span className="flex flex-wrap items-center gap-1">
        <SourceChip row={row} />
        {row.is_wholesale && (
          <span className="rounded-full bg-prime-50 px-1.5 py-0.5 text-[10px] font-bold text-prime-700">
            B2B
          </span>
        )}
      </span>
      <span className="font-semibold tabular-nums">Rs {row.total.toFixed(2)}</span>
      <StatusPill status={row.status} />
      <span className="text-xs text-ink-500">
        {new Date(row.created_at).toLocaleString()}
      </span>
    </Link>
  )
}

function SourceChip({ row }: { row: OrderListRow }) {
  if (row.kind === 'pos' && row.location) {
    const tint = LOCATION_KIND_TINT[row.location.kind]
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest"
        style={{ backgroundColor: tint.bg, color: tint.fg }}
      >
        <span
          aria-hidden
          className="block h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: tint.fg }}
        />
        POS · {row.location.code}
      </span>
    )
  }
  if (row.kind === 'pos') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-ink-700">
        POS
      </span>
    )
  }
  const c = CHANNEL_TINT[row.channel] ?? {
    bg: '#ecdee3',
    fg: '#82445a',
    label: row.channel || 'Web',
  }
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest"
      style={{ backgroundColor: c.bg, color: c.fg }}
    >
      <span
        aria-hidden
        className="block h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: c.fg }}
      />
      {c.label}
    </span>
  )
}

function StatusPill({ status }: { status: string }) {
  const c = ORDER_STATUS_TONES[status] ?? ORDER_STATUS_TONES.pending
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[11px] font-bold"
      style={{ backgroundColor: c.bg, color: c.fg }}
    >
      {orderStatusLabel(status)}
    </span>
  )
}
