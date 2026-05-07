import Link from 'next/link'
import { adminClient } from '@/lib/supabase'
import { PageHeader } from '@/components/PageHeader'
import { StockRow } from './StockRow'

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
  actor: string | null
  created_at: string
  products: { name: string; sku: string } | null
}

type SearchParams = { filter?: 'all' | 'low' | 'out' | 'in-stock'; q?: string }

export default async function WarehousePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { filter = 'all', q = '' } = await searchParams
  const sb = adminClient()

  let query = sb
    .from('product_stock')
    .select('id, sku, name, image_url, available, low_stock_threshold')
    .order('available', { ascending: true })

  if (q) {
    const pat = `%${q.replace(/[%_]/g, '')}%`
    query = query.or(`name.ilike.${pat},sku.ilike.${pat}`)
  }
  if (filter === 'out')      query = query.eq('available', 0)
  if (filter === 'low')      query = query.gt('available', 0).lte('available', 5)
  if (filter === 'in-stock') query = query.gt('available', 5)

  const { data: rows } = await query.returns<Row[]>()

  // counts
  const { data: stockTotals } = await sb.from('product_stock').select('available').returns<Array<{ available: number }>>()
  const totals = stockTotals ?? []
  const counts = {
    all: totals.length,
    out: totals.filter((r) => r.available === 0).length,
    low: totals.filter((r) => r.available > 0 && r.available <= 5).length,
    inStock: totals.filter((r) => r.available > 5).length,
    units: totals.reduce((s, r) => s + Math.max(0, r.available), 0),
  }

  const tabs = [
    { key: 'all',      label: 'All',       count: counts.all },
    { key: 'out',      label: 'Sold out',  count: counts.out },
    { key: 'low',      label: 'Low stock', count: counts.low },
    { key: 'in-stock', label: 'In stock',  count: counts.inStock },
  ] as const

  // Recent movements
  const { data: moves } = await sb
    .from('stock_movements')
    .select('id, product_id, delta, reason, before_qty, after_qty, actor, created_at, products(name, sku)')
    .order('created_at', { ascending: false })
    .limit(15)
    .returns<Movement[]>()

  return (
    <div>
      <PageHeader
        title="Warehouse"
        subtitle={`${counts.units.toLocaleString()} units across ${counts.all} products`}
        breadcrumbs={[{ label: 'Operations' }, { label: 'Warehouse' }]}
      />

      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Total products"  value={counts.all}     tone="ink" />
        <Stat label="Total units"     value={counts.units.toLocaleString()} tone="prime" />
        <Stat label="Low stock"       value={counts.low}     tone="amber" />
        <Stat label="Sold out"        value={counts.out}     tone={counts.out > 0 ? 'flash' : 'ink'} />
      </div>

      <div className="mt-6 mb-4 flex flex-wrap items-center gap-3">
        <form className="relative flex-1 min-w-[220px] max-w-md">
          <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by name or SKU…"
            className="w-full rounded-lg border border-ink-300 bg-paper py-2 pl-10 pr-3 text-sm focus:border-prime-500 focus:outline-none"
          />
          <input type="hidden" name="filter" value={filter} />
        </form>
        <div className="flex flex-wrap gap-1 text-xs font-semibold">
          {tabs.map((t) => {
            const params = new URLSearchParams()
            if (q) params.set('q', q)
            if (t.key !== 'all') params.set('filter', t.key)
            const href = `/inventory${params.toString() ? `?${params.toString()}` : ''}`
            const active = t.key === filter
            return (
              <Link
                key={t.key}
                href={href}
                className={`rounded-full px-3 py-1.5 transition ${active ? 'bg-prime-700 text-paper' : 'bg-paper text-ink-700 hover:bg-ink-100'}`}
              >
                {t.label} <span className="opacity-60">({t.count})</span>
              </Link>
            )
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Stock table */}
        <div className="overflow-hidden rounded-2xl border border-ink-300/60 bg-paper">
          <table className="w-full text-sm">
            <thead className="bg-paper-dim/60 text-left text-xs uppercase tracking-wider text-ink-500">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">On hand</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Quick set</th>
              </tr>
            </thead>
            <tbody>
              {(rows ?? []).map((r) => (
                <StockRow
                  key={r.id}
                  productId={r.id}
                  productLink={`/products/${r.id}`}
                  name={r.name}
                  sku={r.sku}
                  imageUrl={r.image_url}
                  onHand={r.available}
                  threshold={r.low_stock_threshold}
                />
              ))}
              {(!rows || rows.length === 0) && (
                <tr><td colSpan={4} className="px-4 py-12 text-center text-ink-500">No products in this view.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Movements log */}
        <section className="rounded-2xl border border-ink-300/60 bg-paper p-5">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-ink-500">Recent movements</h2>
          <ul className="space-y-3 text-xs">
            {(moves ?? []).map((m) => (
              <li key={m.id} className="border-l-2 border-ink-300 pl-3">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate font-semibold text-ink-900">{m.products?.name ?? '—'}</span>
                  <span className={`shrink-0 font-bold tabular-nums ${m.delta > 0 ? 'text-mint-600' : 'text-flash-700'}`}>
                    {m.delta > 0 ? '+' : ''}{m.delta}
                  </span>
                </div>
                <div className="text-ink-500">{m.reason ?? 'adjustment'} · {new Date(m.created_at).toLocaleString()}</div>
                {m.before_qty != null && m.after_qty != null && (
                  <div className="text-ink-500">{m.before_qty} → {m.after_qty}</div>
                )}
              </li>
            ))}
            {(!moves || moves.length === 0) && (
              <li className="rounded-lg border border-dashed border-ink-300 p-4 text-center text-ink-500">
                No movements logged yet. Adjustments and fulfilments will show up here.
              </li>
            )}
          </ul>
        </section>
      </div>
    </div>
  )
}

function Stat({ label, value, tone }: { label: string; value: number | string; tone: 'ink' | 'prime' | 'amber' | 'flash' }) {
  const palette: Record<typeof tone, string> = {
    ink:   'border-ink-300/60 bg-paper',
    prime: 'border-prime-700 bg-prime-50',
    amber: 'border-amber-500 bg-amber-50',
    flash: 'border-flash-500 bg-flash-50',
  }
  const colors: Record<typeof tone, string> = {
    ink: 'text-ink-900',
    prime: 'text-prime-700',
    amber: 'text-amber-700',
    flash: 'text-flash-700',
  }
  return (
    <div className={`rounded-2xl border p-4 ${palette[tone]}`}>
      <div className="text-[10px] font-bold uppercase tracking-widest text-ink-500">{label}</div>
      <div className={`font-display mt-1 text-2xl font-black tabular-nums ${colors[tone]}`}>{value}</div>
    </div>
  )
}
