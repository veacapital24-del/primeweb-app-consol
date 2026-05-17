import Link from 'next/link'
import { adminClient } from '@/lib/supabase'
import { PageHeader } from '@/components/PageHeader'
import { InventoryClient } from './InventoryClient'
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
  // Location scope. "warehouse" (or missing) reads the warehouse-wide
  // `inventory` table (the storefront-facing total). A UUID reads the
  // per-location `location_stock` table for that store / kiosk / warehouse.
  location?: string
}

export default async function WarehousePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const { filter = 'all', q = '', location: locParam } = await searchParams
  const sb = adminClient()

  // Always pull active locations so the switcher has an up-to-date list.
  const { data: locations } = await sb
    .from('locations')
    .select('*')
    .eq('active', true)
    .order('name', { ascending: true })
    .returns<Location[]>()

  const isLocationScope =
    locParam !== undefined && locParam !== 'warehouse'
  const activeLocation = isLocationScope
    ? (locations ?? []).find((l) => l.id === locParam) ?? null
    : null
  const scopeLabel = activeLocation
    ? `${activeLocation.code} · ${activeLocation.name}`
    : 'Warehouse total'

  // ────── Pull rows ──────
  let rows: Row[] = []
  let stockUpdatedAt: Map<string, string | null> = new Map()

  if (isLocationScope && activeLocation) {
    // Per-location stock — joined with products for name/sku/image.
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

    if (q) {
      const pat = `%${q.replace(/[%_]/g, '')}%`
      lq = lq.or(`name.ilike.${pat},sku.ilike.${pat}`, {
        foreignTable: 'products',
      })
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

    rows = all.filter((r) => {
      if (filter === 'out') return r.available === 0
      if (filter === 'low')
        return r.available > 0 && r.available <= r.low_stock_threshold
      if (filter === 'in-stock') return r.available > r.low_stock_threshold
      return true
    })
  } else {
    // Warehouse-wide — same `product_stock` view the page used before.
    let query = sb
      .from('product_stock')
      .select('id, sku, name, image_url, available, low_stock_threshold')
      .order('available', { ascending: true })

    if (q) {
      const pat = `%${q.replace(/[%_]/g, '')}%`
      query = query.or(`name.ilike.${pat},sku.ilike.${pat}`)
    }
    if (filter === 'out') query = query.eq('available', 0)
    if (filter === 'low')
      query = query.gt('available', 0).lte('available', 5)
    if (filter === 'in-stock') query = query.gt('available', 5)

    const { data } = await query.returns<Row[]>()
    rows = data ?? []

    const ids = rows.map((r) => r.id)
    if (ids.length > 0) {
      const { data: invMeta } = await sb
        .from('inventory')
        .select('product_id, updated_at')
        .in('product_id', ids)
      stockUpdatedAt = new Map(
        (invMeta ?? []).map((r) => [r.product_id, r.updated_at]),
      )
    }
  }

  const enrichedRows = rows.map((r) => ({
    ...r,
    updated_at: stockUpdatedAt.get(r.id) ?? null,
  }))

  // ────── KPIs (always reflect the active scope) ──────
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
    const { data } = await sb
      .from('product_stock')
      .select('available')
      .returns<Array<{ available: number }>>()
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
    { key: 'all',      label: 'All',       count: counts.all },
    { key: 'in-stock', label: 'In stock',  count: counts.inStock },
    { key: 'low',      label: 'Low',       count: counts.low },
    { key: 'out',      label: 'Sold out',  count: counts.out },
  ] as const

  // Recent movements — show the active scope so the activity feed makes
  // sense alongside the KPIs.
  let movesQuery = sb
    .from('stock_movements')
    .select(
      'id, product_id, delta, reason, before_qty, after_qty, created_at, products(name)',
    )
    .order('created_at', { ascending: false })
    .limit(8)
  if (isLocationScope && activeLocation) {
    // Reasons for location-scoped adjusts are tagged with `@<code>`.
    movesQuery = movesQuery.ilike('reason', `%@${activeLocation.code}%`)
  }
  const { data: moves } = await movesQuery.returns<Movement[]>()

  const buildHref = (overrides: Partial<SearchParams>) => {
    const params = new URLSearchParams()
    const next = { filter, q, location: locParam, ...overrides }
    if (next.q) params.set('q', next.q)
    if (next.filter && next.filter !== 'all') params.set('filter', next.filter)
    if (next.location && next.location !== 'warehouse')
      params.set('location', next.location)
    return `/inventory${params.toString() ? `?${params.toString()}` : ''}`
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Warehouse"
        subtitle={
          activeLocation
            ? `${counts.units.toLocaleString()} units at ${activeLocation.name} · ${counts.all} products tracked`
            : `${counts.units.toLocaleString()} units across ${counts.all} products · adjust via reason-tracked flow`
        }
        breadcrumbs={[
          { label: 'Operations' },
          { label: 'Warehouse', href: '/inventory' },
          ...(activeLocation
            ? [{ label: activeLocation.name }]
            : []),
        ]}
        actions={
          <Link
            href="/locations"
            className="rounded-xl border border-ink-300 bg-paper px-3 py-1.5 text-xs font-bold text-ink-700 transition hover:border-prime-700 hover:text-prime-700"
          >
            Manage locations →
          </Link>
        }
      />

      {/* ─── Location switcher ─────────────────────────────────────── */}
      <div className="rounded-2xl border border-ink-300/60 bg-paper p-3 sm:p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-[10.5px] font-bold uppercase tracking-widest text-ink-500">
            Stock at
          </span>
          <LocationChip
            href={buildHref({ location: 'warehouse' })}
            active={!isLocationScope}
            label="Warehouse total"
            sublabel="Storefront-facing"
          />
          {(locations ?? []).map((l) => (
            <LocationChip
              key={l.id}
              href={buildHref({ location: l.id })}
              active={activeLocation?.id === l.id}
              label={l.name}
              sublabel={l.code}
            />
          ))}
          <Link
            href="/locations/new"
            className="ml-auto rounded-full border border-dashed border-ink-300 px-3 py-1.5 text-xs font-bold text-ink-500 transition hover:border-prime-700 hover:text-prime-700"
          >
            + New location
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <Kpi label="Total units" value={counts.units.toLocaleString()} icon={<IconBox />} />
        <Kpi label="In stock"    value={counts.inStock} accent="mint"  icon={<IconCheck />} />
        <Kpi label="Low stock"   value={counts.low}     accent="amber" icon={<IconAlert />} />
        <Kpi label="Sold out"    value={counts.out}     accent={counts.out > 0 ? 'flash' : 'neutral'} icon={<IconX />} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <section className="overflow-hidden rounded-2xl border border-ink-200 bg-paper">
          <header className="flex flex-wrap items-center gap-3 border-b border-ink-200 px-5 py-3">
            <form className="relative flex-1 min-w-[200px]">
              <svg className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
              <input
                name="q"
                defaultValue={q}
                placeholder="Search by name or SKU…"
                className="w-full rounded-lg border border-ink-200 bg-paper py-1.5 pl-9 pr-3 text-sm placeholder:text-ink-500 focus:border-prime-500 focus:outline-none"
              />
              <input type="hidden" name="filter" value={filter} />
              {locParam && locParam !== 'warehouse' && (
                <input type="hidden" name="location" value={locParam} />
              )}
            </form>
            <div className="flex flex-wrap gap-1 text-xs font-semibold">
              {tabs.map((t) => {
                const active = t.key === filter
                return (
                  <Link
                    key={t.key}
                    href={buildHref({
                      filter: t.key === 'all' ? undefined : t.key,
                    })}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition ${
                      active ? 'bg-ink-900 text-paper' : 'text-ink-700 hover:bg-paper-dim/60'
                    }`}
                  >
                    {t.label}
                    <span className={active ? 'opacity-70' : 'text-ink-500'}>{t.count}</span>
                  </Link>
                )
              })}
            </div>
          </header>

          <InventoryClient
            rows={enrichedRows}
            locationId={activeLocation?.id ?? null}
            locationLabel={scopeLabel}
          />
        </section>

        <aside className="overflow-hidden rounded-2xl border border-ink-200 bg-paper">
          <header className="flex items-center justify-between border-b border-ink-200 px-5 py-3">
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-ink-500">
              Activity
            </h2>
            <span className="text-[10px] text-ink-500">
              {activeLocation ? `at ${activeLocation.code}` : 'last 8'}
            </span>
          </header>
          <ol className="divide-y divide-ink-200">
            {(moves ?? []).map((m) => (
              <li key={m.id} className="flex items-start gap-3 px-5 py-3">
                <div className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full ${m.delta > 0 ? 'bg-mint-100 text-mint-600' : 'bg-flash-50 text-flash-700'}`}>
                  {m.delta > 0 ? '↑' : '↓'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-xs font-semibold text-ink-900">{m.products?.name ?? 'Product'}</span>
                    <span className={`shrink-0 text-xs font-bold tabular-nums ${m.delta > 0 ? 'text-mint-600' : 'text-flash-700'}`}>
                      {m.delta > 0 ? '+' : ''}{m.delta}
                    </span>
                  </div>
                  <div className="text-[11px] text-ink-500">
                    {m.reason ?? 'adjustment'}
                    {m.before_qty != null && m.after_qty != null && (
                      <> · {m.before_qty}→{m.after_qty}</>
                    )}
                  </div>
                  <div className="text-[10px] text-ink-300">{relativeTime(m.created_at)}</div>
                </div>
              </li>
            ))}
            {(!moves || moves.length === 0) && (
              <li className="px-5 py-8 text-center text-xs text-ink-500">
                {activeLocation
                  ? `No adjustments at ${activeLocation.code} yet.`
                  : 'Adjustments will appear here.'}
              </li>
            )}
          </ol>
        </aside>
      </div>
    </div>
  )
}

function LocationChip({
  href,
  active,
  label,
  sublabel,
}: {
  href: string
  active: boolean
  label: string
  sublabel: string
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs transition ${
        active
          ? 'bg-prime-700 text-paper shadow-sm'
          : 'border border-ink-300 bg-paper text-ink-700 hover:border-prime-500 hover:text-prime-700'
      }`}
    >
      <span className="font-bold">{label}</span>
      <span
        className={`font-mono text-[10px] uppercase tracking-wider ${
          active ? 'opacity-70' : 'text-ink-500'
        }`}
      >
        {sublabel}
      </span>
    </Link>
  )
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const d = Math.floor(hr / 24)
  if (d < 7) return `${d}d ago`
  return new Date(iso).toLocaleDateString()
}

function Kpi({
  label,
  value,
  icon,
  accent = 'neutral',
}: {
  label: string
  value: number | string
  icon: React.ReactNode
  accent?: 'neutral' | 'mint' | 'amber' | 'flash'
}) {
  const ring  =
    accent === 'mint'  ? 'ring-mint-500/20'  :
    accent === 'amber' ? 'ring-amber-500/20' :
    accent === 'flash' ? 'ring-flash-500/30' :
                         'ring-ink-200'
  const iconBg =
    accent === 'mint'  ? 'bg-mint-100 text-mint-600'   :
    accent === 'amber' ? 'bg-amber-50 text-amber-700'  :
    accent === 'flash' ? 'bg-flash-50 text-flash-700'  :
                         'bg-paper-dim text-ink-700'
  return (
    <div className={`flex items-center gap-3 rounded-2xl bg-paper p-4 ring-1 ${ring}`}>
      <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${iconBg}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-widest text-ink-500">{label}</div>
        <div className="font-display mt-0.5 text-2xl font-black tabular-nums text-ink-900">{value}</div>
      </div>
    </div>
  )
}

const ic = 'h-4 w-4'
function IconBox()   { return <svg viewBox="0 0 24 24" className={ic} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8 12 3 3 8v8l9 5 9-5V8Z"/><path d="m3.3 8 8.7 5 8.7-5"/><path d="M12 13v9"/></svg> }
function IconCheck() { return <svg viewBox="0 0 24 24" className={ic} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7"/></svg> }
function IconAlert() { return <svg viewBox="0 0 24 24" className={ic} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.86 1.82 18a2 2 0 0 0 1.7 3h16.96a2 2 0 0 0 1.7-3L13.7 3.86a2 2 0 0 0-3.4 0Z"/></svg> }
function IconX()     { return <svg viewBox="0 0 24 24" className={ic} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg> }
