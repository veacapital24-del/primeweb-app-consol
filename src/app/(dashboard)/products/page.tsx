import Link from 'next/link'
import { adminClient } from '@/lib/supabase'
import { PageHeader } from '@/components/PageHeader'
import type { Product } from '@/lib/types'

export const dynamic = 'force-dynamic'

type ProductWithStock = Product & { available: number | null }

type SearchParams = { q?: string; filter?: 'all' | 'active' | 'inactive' | 'hard-discount' | 'no-wholesale' }

export default async function ProductsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { q = '', filter = 'all' } = await searchParams
  const sb = adminClient()

  let query = sb
    .from('products')
    .select('id, sku, slug, name, description, image_url, retail_price_mur, wholesale_price_mur, wholesale_min_qty, is_hard_discount, active')
    .order('name')

  if (q) {
    const pat = `%${q.replace(/[%_]/g, '')}%`
    query = query.or(`name.ilike.${pat},sku.ilike.${pat}`)
  }
  if (filter === 'active')        query = query.eq('active', true)
  if (filter === 'inactive')      query = query.eq('active', false)
  if (filter === 'hard-discount') query = query.eq('is_hard_discount', true)
  if (filter === 'no-wholesale')  query = query.is('wholesale_price_mur', null)

  const { data: products } = await query.returns<Product[]>()

  // Pull stock in one extra query
  const ids = (products ?? []).map((p) => p.id)
  const { data: stocks } = ids.length > 0
    ? await sb.from('inventory').select('product_id, on_hand, reserved').in('product_id', ids)
    : { data: [] as Array<{ product_id: string; on_hand: number; reserved: number }> }
  const stockMap = new Map((stocks ?? []).map((s) => [s.product_id, Math.max(0, s.on_hand - s.reserved)]))

  const rows: ProductWithStock[] = (products ?? []).map((p) => ({ ...p, available: stockMap.get(p.id) ?? null }))

  const counts = await sb.from('products').select('id, active, is_hard_discount, wholesale_price_mur').returns<Array<{ id: string; active: boolean; is_hard_discount: boolean; wholesale_price_mur: number | null }>>()
  const all = counts.data ?? []
  const tabs: Array<{ key: NonNullable<SearchParams['filter']>; label: string; count: number }> = [
    { key: 'all',           label: 'All',            count: all.length },
    { key: 'active',        label: 'Active',         count: all.filter((p) => p.active).length },
    { key: 'inactive',      label: 'Inactive',       count: all.filter((p) => !p.active).length },
    { key: 'hard-discount', label: 'Hard discount',  count: all.filter((p) => p.is_hard_discount).length },
    { key: 'no-wholesale',  label: 'No wholesale',   count: all.filter((p) => p.wholesale_price_mur == null).length },
  ]

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle="Edit catalog entries, prices, and tags"
        breadcrumbs={[{ label: 'Catalog' }, { label: 'Products' }]}
        actions={
          <Link href="/products/new" className="rounded-xl bg-prime-700 px-4 py-2 text-sm font-bold text-paper transition hover:bg-prime-800">
            + New product
          </Link>
        }
      />

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
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
            const active = t.key === filter
            const params = new URLSearchParams()
            if (q) params.set('q', q)
            if (t.key !== 'all') params.set('filter', t.key)
            const href = `/products${params.toString() ? `?${params.toString()}` : ''}`
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

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-ink-300/60 bg-paper">
        <table className="w-full text-sm">
          <thead className="bg-paper-dim/60 text-left text-xs uppercase tracking-wider text-ink-500">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Retail</th>
              <th className="px-4 py-3">Wholesale</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Tags</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-300/60">
            {rows.map((p) => (
              <tr key={p.id} className="hover:bg-paper-dim/40">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {p.image_url && <img src={p.image_url} alt="" className="h-10 w-10 rounded-lg object-cover ring-1 ring-ink-300" />}
                    <div className="min-w-0">
                      <Link href={`/products/${p.id}`} className="block truncate font-semibold text-ink-900 hover:text-prime-700">{p.name}</Link>
                      <div className="font-mono text-[11px] uppercase tracking-wider text-ink-500">{p.sku}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 tabular-nums">Rs {Number(p.retail_price_mur).toFixed(2)}</td>
                <td className="px-4 py-3 tabular-nums">
                  {p.wholesale_price_mur != null ? (
                    <span>
                      Rs {Number(p.wholesale_price_mur).toFixed(2)}
                      <span className="ml-1 text-[11px] text-ink-500">· min {p.wholesale_min_qty}</span>
                    </span>
                  ) : <span className="text-ink-300">—</span>}
                </td>
                <td className="px-4 py-3">
                  {p.available == null ? (
                    <span className="text-ink-300">—</span>
                  ) : p.available === 0 ? (
                    <span className="rounded-full bg-flash-50 px-2 py-0.5 text-[11px] font-bold text-flash-700">Sold out</span>
                  ) : p.available <= 5 ? (
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">{p.available} left</span>
                  ) : (
                    <span className="font-semibold tabular-nums">{p.available}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {!p.active && <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-bold text-ink-500">Inactive</span>}
                    {p.is_hard_discount && <span className="rounded-full bg-prime-50 px-2 py-0.5 text-[10px] font-bold text-prime-700">Hard discount</span>}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/products/${p.id}`} className="text-xs font-semibold text-prime-700 hover:underline">Edit →</Link>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-ink-500">
                {q ? `No product matches "${q}".` : 'No products yet.'}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
