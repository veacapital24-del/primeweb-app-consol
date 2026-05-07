import Link from 'next/link'
import { adminClient } from '@/lib/supabase'
import { PageHeader } from '@/components/PageHeader'
import { InventoryClient } from './InventoryClient'

export const dynamic = 'force-dynamic'

type Row = {
  id: string
  sku: string
  name: string
  image_url: string | null
  available: number
  low_stock_threshold: number
}

type InventoryMeta = { product_id: string; updated_at: string | null }

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

  const ids = (rows ?? []).map((r) => r.id)
  const { data: invMeta } = ids.length > 0
    ? await sb.from('inventory').select('product_id, updated_at').in('product_id', ids)
    : { data: [] as InventoryMeta[] }
  const updatedMap = new Map((invMeta ?? []).map((r) => [r.product_id, r.updated_at]))
  const enrichedRows = (rows ?? []).map((r) => ({
    ...r,
    updated_at: updatedMap.get(r.id) ?? null,
  }))

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
    { key: 'in-stock', label: 'In stock',  count: counts.inStock },
    { key: 'low',      label: 'Low',       count: counts.low },
    { key: 'out',      label: 'Sold out',  count: counts.out },
  ] as const

  const { data: moves } = await sb
    .from('stock_movements')
    .select('id, product_id, delta, reason, before_qty, after_qty, created_at, products(name)')
    .order('created_at', { ascending: false })
    .limit(8)
    .returns<Movement[]>()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Warehouse"
        subtitle={`${counts.units.toLocaleString()} units across ${counts.all} products · adjust via reason-tracked flow`}
        breadcrumbs={[{ label: 'Operations' }, { label: 'Warehouse' }]}
      />

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
            </form>
            <div className="flex flex-wrap gap-1 text-xs font-semibold">
              {tabs.map((t) => {
                const active = t.key === filter
                const params = new URLSearchParams()
                if (q) params.set('q', q)
                if (t.key !== 'all') params.set('filter', t.key)
                const href = `/inventory${params.toString() ? `?${params.toString()}` : ''}`
                return (
                  <Link
                    key={t.key}
                    href={href}
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

          <InventoryClient rows={enrichedRows} />
        </section>

        <aside className="overflow-hidden rounded-2xl border border-ink-200 bg-paper">
          <header className="flex items-center justify-between border-b border-ink-200 px-5 py-3">
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-ink-500">Activity</h2>
            <span className="text-[10px] text-ink-500">last 8</span>
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
                Adjustments will appear here.
              </li>
            )}
          </ol>
        </aside>
      </div>
    </div>
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
