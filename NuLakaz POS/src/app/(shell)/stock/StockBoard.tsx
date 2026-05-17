'use client'

import Image from 'next/image'
import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Alert,
  Badge,
  Button,
  FILTER_CHIP,
  InlineEmpty,
  INPUT_CLASS,
  SELECT_CLASS,
  StatCard,
  StatGrid,
  ToolbarPanel,
} from '@/components/ui'
import { adjustOnHand, setOnHand } from './actions'
import { HistoryDialog } from './HistoryDialog'
import { ReceiveDialog } from './ReceiveDialog'

export type StockItem = {
  product_id: string
  sku: string
  name: string
  image_url: string | null
  retail_price_mur: number
  on_hand: number | null
  threshold: number
  last_delta: number | null
  last_at: string | null
}

type Filter = 'all' | 'in_stock' | 'low' | 'out' | 'untracked'
type Sort = 'name' | 'sku' | 'on_hand_desc' | 'on_hand_asc' | 'last_at'

export function StockBoard({
  items,
  locationId,
  locationLabel,
}: {
  items: StockItem[]
  locationId: string
  locationLabel: string
}) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [sort, setSort] = useState<Sort>('name')
  const [historyFor, setHistoryFor] = useState<StockItem | null>(null)
  const [receiveOpen, setReceiveOpen] = useState(false)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    let rows = items
    if (q) {
      rows = rows.filter(
        (r) =>
          r.sku.toLowerCase().includes(q) ||
          r.name.toLowerCase().includes(q),
      )
    }
    rows = rows.filter((r) => {
      const hand = r.on_hand
      if (filter === 'untracked') return hand === null
      if (filter === 'out') return hand !== null && hand <= 0
      if (filter === 'low') return hand !== null && hand > 0 && hand <= r.threshold
      if (filter === 'in_stock') return hand !== null && hand > r.threshold
      return true
    })
    rows = [...rows].sort((a, b) => {
      switch (sort) {
        case 'sku':
          return a.sku.localeCompare(b.sku)
        case 'on_hand_desc':
          return (b.on_hand ?? -1) - (a.on_hand ?? -1)
        case 'on_hand_asc':
          return (a.on_hand ?? Number.MAX_SAFE_INTEGER) - (b.on_hand ?? Number.MAX_SAFE_INTEGER)
        case 'last_at':
          return (
            new Date(b.last_at ?? 0).getTime() - new Date(a.last_at ?? 0).getTime()
          )
        case 'name':
        default:
          return a.name.localeCompare(b.name)
      }
    })
    return rows
  }, [items, search, filter, sort])

  const counts = useMemo(() => {
    const stats = { all: items.length, in_stock: 0, low: 0, out: 0, untracked: 0 }
    for (const r of items) {
      if (r.on_hand === null) stats.untracked += 1
      else if (r.on_hand <= 0) stats.out += 1
      else if (r.on_hand <= r.threshold) stats.low += 1
      else stats.in_stock += 1
    }
    return stats
  }, [items])

  const totalUnits = items.reduce((s, r) => s + (r.on_hand ?? 0), 0)
  const totalValue = items.reduce(
    (s, r) => s + (r.on_hand ?? 0) * Number(r.retail_price_mur),
    0,
  )

  const productOptions = useMemo(
    () => items.map((i) => ({ id: i.product_id, sku: i.sku, name: i.name })),
    [items],
  )

  return (
    <>
      <StatGrid cols={5}>
        <StatCard label="Tracked" value={counts.in_stock + counts.low + counts.out} hint={`of ${counts.all} products`} />
        <StatCard label="In stock" value={counts.in_stock} tone="prime" />
        <StatCard label="Low stock" value={counts.low} tone={counts.low > 0 ? 'amber' : 'default'} />
        <StatCard label="Sold out" value={counts.out} tone={counts.out > 0 ? 'flash' : 'default'} />
        <StatCard
          label="Stock value"
          value={`Rs ${Math.round(totalValue).toLocaleString()}`}
          hint={`${totalUnits} units`}
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
              placeholder="Search by name or SKU…"
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
              { key: 'in_stock' as const, label: `In stock · ${counts.in_stock}` },
              { key: 'low' as const, label: `Low · ${counts.low}` },
              { key: 'out' as const, label: `Out · ${counts.out}` },
              { key: 'untracked' as const, label: `Untracked · ${counts.untracked}` },
            ].map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setFilter(opt.key)}
                className={`${FILTER_CHIP} ${
                  filter === opt.key
                    ? 'bg-prime-700 text-paper'
                    : 'text-ink-700 hover:bg-paper-dim'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className={SELECT_CLASS}
          >
            <option value="name">Sort: Name A–Z</option>
            <option value="sku">Sort: SKU A–Z</option>
            <option value="on_hand_desc">Sort: Most stock</option>
            <option value="on_hand_asc">Sort: Least stock</option>
            <option value="last_at">Sort: Recent activity</option>
          </select>

          <Button type="button" onClick={() => setReceiveOpen(true)}>
            + Receive stock
          </Button>
        </div>
      </ToolbarPanel>

      <section>
        {filtered.length === 0 ? (
          <InlineEmpty>No products match this filter.</InlineEmpty>
        ) : (
          <ul className="grid gap-2">
            {filtered.map((row) => (
              <StockRow
                key={row.product_id}
                row={row}
                locationId={locationId}
                onShowHistory={() => setHistoryFor(row)}
              />
            ))}
          </ul>
        )}
      </section>

      <ReceiveDialog
        open={receiveOpen}
        onClose={() => setReceiveOpen(false)}
        locationId={locationId}
        locationLabel={locationLabel}
        products={productOptions}
      />

      {historyFor && (
        <HistoryDialog
          open={true}
          onClose={() => setHistoryFor(null)}
          productId={historyFor.product_id}
          locationId={locationId}
          productName={historyFor.name}
          productSku={historyFor.sku}
        />
      )}
    </>
  )
}

function StockRow({
  row,
  locationId,
  onShowHistory,
}: {
  row: StockItem
  locationId: string
  onShowHistory: () => void
}) {
  const router = useRouter()
  const [isPending, start] = useTransition()
  const [editing, setEditing] = useState(false)
  const [target, setTarget] = useState(String(row.on_hand ?? 0))
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [optimistic, setOptimistic] = useState<number | null>(null)

  const hand = optimistic ?? row.on_hand
  const tone = statusTone(hand, row.threshold)

  function bump(delta: number) {
    setError(null)
    setOptimistic((hand ?? 0) + delta)
    start(async () => {
      const result = await adjustOnHand(row.product_id, locationId, delta, 'Quick adjust')
      if (!result.ok) {
        setError(result.error)
        setOptimistic(null)
      } else {
        setOptimistic(result.on_hand)
        router.refresh()
      }
    })
  }

  function save() {
    const t = Number(target)
    setError(null)
    start(async () => {
      const result = await setOnHand(row.product_id, locationId, t, reason || null)
      if (!result.ok) {
        setError(result.error)
        return
      }
      setOptimistic(result.on_hand)
      setEditing(false)
      setReason('')
      router.refresh()
    })
  }

  return (
    <li className="rounded-2xl border border-ink-300/60 bg-paper p-3 transition hover:border-ink-300">
      <div className="grid items-center gap-3 sm:grid-cols-[auto_1fr_auto_auto] md:grid-cols-[auto_1fr_140px_auto_auto]">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-paper-dim/60">
          {row.image_url ? (
            <Image src={row.image_url} alt={row.name} fill className="object-cover" sizes="56px" />
          ) : (
            <div className="grid h-full w-full place-items-center text-2xl text-ink-300">▦</div>
          )}
        </div>

        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{row.name}</div>
          <div className="mt-0.5 flex items-baseline gap-2">
            <span className="font-mono text-[10px] text-ink-500">{row.sku}</span>
            <span className="text-[11px] text-ink-500">Rs {Number(row.retail_price_mur).toFixed(2)}</span>
          </div>
        </div>

        <div className="hidden md:block">
          <div className="flex items-baseline gap-2">
            <span className={`font-display text-2xl font-black tabular-nums ${tone.text}`}>
              {hand === null ? '—' : hand}
            </span>
            <span className="text-[10px] text-ink-500">on hand</span>
          </div>
          <div className="mt-0.5 flex items-center gap-2">
            <Badge variant={tone.variant}>{tone.label}</Badge>
            <span className="text-[10px] text-ink-500">≤ {row.threshold}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => bump(-1)}
            disabled={isPending || (hand ?? 0) <= 0}
            className="grid h-9 w-9 place-items-center rounded-lg border border-ink-300 bg-paper text-base font-bold text-ink-700 transition hover:border-flash-500 hover:text-flash-700 disabled:opacity-30"
            aria-label="Decrement"
          >
            −
          </button>
          <div className="md:hidden">
            <span className={`font-display text-lg font-black tabular-nums ${tone.text}`}>
              {hand === null ? '—' : hand}
            </span>
          </div>
          <button
            type="button"
            onClick={() => bump(+1)}
            disabled={isPending}
            className="grid h-9 w-9 place-items-center rounded-lg border border-ink-300 bg-paper text-base font-bold text-ink-700 transition hover:border-prime-500 hover:text-prime-700 disabled:opacity-30"
            aria-label="Increment"
          >
            +
          </button>
        </div>

        <div className="flex items-center gap-1">
          {editing ? (
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min={0}
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className={`w-20 ${INPUT_CLASS} py-1.5 text-right tabular-nums`}
                autoFocus
              />
              <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason"
                className={`w-28 ${INPUT_CLASS} py-1.5`}
              />
              <Button type="button" size="sm" onClick={save} disabled={isPending}>
                {isPending ? '…' : 'Save'}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => {
                  setEditing(false)
                  setTarget(String(hand ?? 0))
                  setReason('')
                  setError(null)
                }}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => {
                  setTarget(String(hand ?? 0))
                  setEditing(true)
                }}
              >
                Set
              </Button>
              <Button type="button" size="sm" variant="secondary" onClick={onShowHistory}>
                History
              </Button>
            </>
          )}
        </div>
      </div>

      {row.last_at && (
        <div className="mt-2 flex items-center justify-between border-t border-ink-300/60 pt-2 text-[11px] text-ink-500">
          <span>
            Last move{' '}
            <span
              className={`font-mono font-bold ${
                (row.last_delta ?? 0) > 0
                  ? 'text-mint-600'
                  : (row.last_delta ?? 0) < 0
                  ? 'text-flash-700'
                  : 'text-ink-700'
              }`}
            >
              {(row.last_delta ?? 0) > 0 ? '+' : ''}
              {row.last_delta ?? 0}
            </span>
          </span>
          <span>{relativeTime(row.last_at)}</span>
        </div>
      )}

      {error ? (
        <Alert className="mt-2 px-2.5 py-1.5 text-[11px]">{error}</Alert>
      ) : null}
    </li>
  )
}

function statusTone(hand: number | null, threshold: number) {
  if (hand === null) return { text: 'text-ink-500', variant: 'muted' as const, label: 'Untracked' }
  if (hand <= 0) return { text: 'text-flash-700', variant: 'danger' as const, label: 'Sold out' }
  if (hand <= threshold) return { text: 'text-amber-700', variant: 'warning' as const, label: 'Low' }
  return { text: 'text-prime-700', variant: 'success' as const, label: 'In stock' }
}

function relativeTime(iso: string) {
  const ms = Date.now() - new Date(iso).getTime()
  const min = Math.floor(ms / 60_000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const d = Math.floor(hr / 24)
  if (d < 30) return `${d}d ago`
  const mo = Math.floor(d / 30)
  return `${mo}mo ago`
}
