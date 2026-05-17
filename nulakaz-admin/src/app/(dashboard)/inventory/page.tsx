import Link from 'next/link'
import { adminClient } from '@/lib/supabase'
import { PageHeader } from '@/components/PageHeader'
import {
  BtnSecondary,
  FilterPill,
  StatCard,
} from '@/components/admin/ui'
import { InventoryClient } from './InventoryClient'
import { InventorySearchForm } from './InventorySearchForm'
import type { Location } from '@/lib/types'

export const dynamic = 'force-dynamic'

type Row = {
  id: string
  sku: string
  name: string
  image_url: string | null
  available: number
  low_stock_threshold: number
}

type Movement = {
  id: number
  product_id: string
  delta: number
  reason: string | null
  before_qty: number | null
  after_qty: number | null
  created_at: string
  products: { name: string } | null
}

type SearchParams = {
  filter?: 'all' | 'low' | 'out' | 'in-stock'
  q?: string
  location?: string
}

export default async function WarehousePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const { filter = 'all', q = '', location: locParam } = await searchParams
  const sb = adminClient()

  const { data: locations } = await sb
    .from('locations')
    .select('*')
    .eq('active', true)
    .order('name', { ascending: true })
    .returns<Location[]>()

  const isAllLocations =
    !locParam || locParam === 'all' || locParam === 'warehouse'
  const isLocationScope = !!locParam && !isAllLocations
  const activeLocation = isLocationScope
    ? (locations ?? []).find((l) => l.id === locParam) ?? null
    : null
  const scopeLabel = activeLocation
    ? `${activeLocation.code} · ${activeLocation.name}`
    : 'All locations'

  const matchingProductIds = q.trim()
    ? await findProductIdsBySearch(sb, q)
    : null

  let rows: Row[] = []
  let stockUpdatedAt = new Map<string, string | null>()

  if (isLocationScope && activeLocation) {
    if (matchingProductIds !== null && matchingProductIds.length === 0) {
      rows = []
    } else {
      type Joined = {
        product_id: string
        on_hand: number
        reserved: number
        low_stock_threshold: number
        updated_at: string | null
        products: { sku: string; name: string; image_url: string | null } | null
      }
      let lq = sb
        .from('location_stock')
        .select(
          'product_id, on_hand, reserved, low_stock_threshold, updated_at, products!inner(sku, name, image_url, active)',
        )
        .eq('location_id', activeLocation.id)
        .eq('products.active', true)
        .order('on_hand', { ascending: true })

      if (matchingProductIds !== null && matchingProductIds.length > 0) {
        lq = lq.in('product_id', matchingProductIds)
      }

      const { data: locRows } = await lq.returns<Joined[]>()
      const all = (locRows ?? []).map((r) => {
        const available = Math.max(0, (r.on_hand ?? 0) - (r.reserved ?? 0))
        stockUpdatedAt.set(r.product_id, r.updated_at)
        return {
          id: r.product_id,
          sku: r.products?.sku ?? '',
          name: r.products?.name ?? '—',
          image_url: r.products?.image_url ?? null,
          available,
          low_stock_threshold: r.low_stock_threshold ?? 5,
        }
      })

      rows = all.filter((r) => matchFilter(r, filter))
    }
  } else if (matchingProductIds !== null && matchingProductIds.length === 0) {
    rows = []
  } else {
    let query = sb
      .from('product_stock')
      .select('id, sku, name, image_url, available, low_stock_threshold')
      .order('available', { ascending: true })

    if (matchingProductIds !== null && matchingProductIds.length > 0) {
      query = query.in('id', matchingProductIds)
    }
    if (filter === 'out') query = query.eq('available', 0)
    if (filter === 'low') query = query.gt('available', 0).lte('available', 5)
    if (filter === 'in-stock') query = query.gt('available', 5)

    const { data } = await query.returns<Row[]>()
    rows = data ?? []

    const ids = rows.map((r) => r.id)
    if (ids.length > 0) {
      const { data: invMeta } = await sb
        .from('inventory')
        .select('product_id, updated_at')
        .in('product_id', ids)
      stockUpdatedAt = new Map((invMeta ?? []).map((r) => [r.product_id, r.updated_at]))
    }
  }

  const enrichedRows = rows.map((r) => ({
    ...r,
    updated_at: stockUpdatedAt.get(r.id) ?? null,
  }))

  let totals: Array<{ available: number }> = []
  if (isLocationScope && activeLocation) {
    const { data } = await sb
      .from('location_stock')
      .select('on_hand, reserved')
      .eq('location_id', activeLocation.id)
    totals = (data ?? []).map((r) => ({
      available: Math.max(0, (r.on_hand ?? 0) - (r.reserved ?? 0)),
    }))
  } else {
    const { data } = await sb.from('product_stock').select('available')
    totals = data ?? []
  }

  const counts = {
    all: totals.length,
    out: totals.filter((r) => r.available === 0).length,
    low: totals.filter((r) => r.available > 0 && r.available <= 5).length,
    inStock: totals.filter((r) => r.available > 5).length,
    units: totals.reduce((s, r) => s + Math.max(0, r.available), 0),
  }

  const tabs = [
    { key: 'all' as const, label: 'All', count: counts.all },
    { key: 'in-stock' as const, label: 'In stock', count: counts.inStock },
    { key: 'low' as const, label: 'Low', count: counts.low },
    { key: 'out' as const, label: 'Sold out', count: counts.out },
  ]

  let movesQuery = sb
    .from('stock_movements')
    .select('id, product_id, delta, reason, before_qty, after_qty, created_at, products(name)')
    .order('created_at', { ascending: false })
    .limit(6)
  if (isLocationScope && activeLocation) {
    movesQuery = movesQuery.ilike('reason', `%@${activeLocation.code}%`)
  }
  const { data: moves } = await movesQuery.returns<Movement[]>()

  const buildHref = (overrides: Partial<SearchParams> & { location?: string | null }) => {
    const params = new URLSearchParams()
    const nextFilter = overrides.filter ?? filter
    const nextQ = overrides.q ?? q
    const nextLocation =
      'location' in overrides ? overrides.location : locParam
    if (nextQ) params.set('q', nextQ)
    if (nextFilter && nextFilter !== 'all') params.set('filter', nextFilter)
    if (
      nextLocation &&
      nextLocation !== 'all' &&
      nextLocation !== 'warehouse'
    ) {
      params.set('location', nextLocation)
    }
    return `/inventory${params.toString() ? `?${params.toString()}` : ''}`
  }

  const searchLocation = isAllLocations ? undefined : activeLocation?.id ?? locParam

  return (
    <div className="space-y-6">
      <PageHeader
        title="Warehouse"
        subtitle={
          activeLocation
            ? `${counts.units.toLocaleString()} units at ${activeLocation.name}`
            : `${counts.units.toLocaleString()} units · all locations (storefront stock)`
        }
        breadcrumbs={[
          { label: 'Operations' },
          { label: 'Warehouse', href: '/inventory' },
          ...(activeLocation
            ? [{ label: activeLocation.name }]
            : [{ label: 'All locations' }]),
        ]}
        actions={
          <BtnSecondary href="/locations">Locations</BtnSecondary>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Units on hand" value={counts.units.toLocaleString()} accent="prime" />
        <StatCard label="In stock" value={counts.inStock} accent="mint" />
        <StatCard label="Low" value={counts.low} accent="amber" />
        <StatCard label="Sold out" value={counts.out} accent={counts.out > 0 ? 'flash' : undefined} />
      </div>

      {/* Scope + search + filters — one toolbar */}
      <div className="glass-card space-y-4 p-4 md:p-5">
        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5">
          <ScopePill
            href={buildHref({ location: undefined })}
            active={isAllLocations}
            label="All locations"
          />
          {(locations ?? []).map((l) => (
            <ScopePill
              key={l.id}
              href={buildHref({ location: l.id })}
              active={activeLocation?.id === l.id}
              label={l.code}
            />
          ))}
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <InventorySearchForm
            defaultQ={q}
            filter={filter}
            location={searchLocation}
          />
          <div className="flex flex-wrap gap-1.5">
            {tabs.map((t) => (
              <FilterPill
                key={t.key}
                href={buildHref({ filter: t.key === 'all' ? undefined : t.key })}
                active={t.key === filter}
                label={t.label}
                count={t.count}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_280px]">
        <InventoryClient
          rows={enrichedRows}
          locationId={activeLocation?.id ?? null}
          locationLabel={scopeLabel}
          emptyMessage={
            q
              ? `No products match "${q}"`
              : filter !== 'all'
                ? 'No products in this filter.'
                : 'No stock records yet.'
          }
        />

        <aside className="glass-card flex flex-col overflow-hidden">
          <header className="border-b border-ink-200/60 px-4 py-3">
            <h2 className="font-display text-sm font-bold text-ink-900">Recent activity</h2>
            <p className="mt-0.5 text-xs text-ink-500">
              {activeLocation ? `@${activeLocation.code}` : 'Latest adjustments'}
            </p>
          </header>
          <ol className="flex-1 divide-y divide-ink-200/50">
            {(moves ?? []).map((m) => (
              <li key={m.id} className="flex gap-3 px-4 py-3">
                <span
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold ${
                    m.delta > 0
                      ? 'bg-mint-50 text-mint-700 ring-1 ring-mint-500/25'
                      : 'bg-flash-50 text-flash-700 ring-1 ring-flash-500/25'
                  }`}
                >
                  {m.delta > 0 ? '+' : '−'}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-ink-900">
                      {m.products?.name ?? 'Product'}
                    </span>
                    <span
                      className={`shrink-0 text-sm font-bold tabular-nums ${
                        m.delta > 0 ? 'text-mint-700' : 'text-flash-700'
                      }`}
                    >
                      {m.delta > 0 ? '+' : ''}
                      {m.delta}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-ink-500">
                    {m.reason ?? 'Adjustment'}
                    {m.before_qty != null && m.after_qty != null && (
                      <span className="text-ink-400"> · {m.before_qty}→{m.after_qty}</span>
                    )}
                  </p>
                  <p className="text-[11px] text-ink-400">{relativeTime(m.created_at)}</p>
                </div>
              </li>
            ))}
            {(!moves || moves.length === 0) && (
              <li className="px-4 py-10 text-center text-sm text-ink-500">No recent movements.</li>
            )}
          </ol>
        </aside>
      </div>
    </div>
  )
}

function matchFilter(
  r: { available: number; low_stock_threshold: number },
  filter: SearchParams['filter'],
) {
  if (filter === 'out') return r.available === 0
  if (filter === 'low') return r.available > 0 && r.available <= r.low_stock_threshold
  if (filter === 'in-stock') return r.available > r.low_stock_threshold
  return true
}

function ScopePill({
  href,
  active,
  label,
}: {
  href: string
  active: boolean
  label: string
}) {
  return (
    <Link
      href={href}
      className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
        active
          ? 'bg-prime-700 text-paper shadow-sm shadow-prime-900/15'
          : 'bg-paper text-ink-700 ring-1 ring-ink-200/80 hover:bg-prime-50/50'
      }`}
    >
      {label}
    </Link>
  )
}

async function findProductIdsBySearch(
  sb: ReturnType<typeof adminClient>,
  q: string,
): Promise<string[]> {
  const pat = `%${q.replace(/[%_]/g, '')}%`
  const { data } = await sb
    .from('products')
    .select('id')
    .eq('active', true)
    .or(`name.ilike.${pat},sku.ilike.${pat}`)
  return (data ?? []).map((p) => p.id)
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'Just now'
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const d = Math.floor(hr / 24)
  if (d < 7) return `${d}d ago`
  return new Date(iso).toLocaleDateString()
}
