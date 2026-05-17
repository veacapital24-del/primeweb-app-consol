import Link from 'next/link'
import { adminClient } from '@/lib/supabase'
import { PageHeader } from '@/components/PageHeader'
import { BtnPrimary, IconPlus, ProductTags, StatCard, StockBadge } from '@/components/products/ui'
import type { Product } from '@/lib/types'

export const dynamic = 'force-dynamic'

type ProductWithStock = Product & { available: number | null }

type SearchParams = { q?: string; filter?: 'all' | 'active' | 'inactive' | 'hard-discount' | 'no-wholesale' }

export default async function ProductsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { q = '', filter = 'all' } = await searchParams
  const sb = adminClient()

  let query = sb
    .from('products')
    .select(
      'id, sku, slug, name, description, image_url, retail_price_mur, wholesale_price_mur, wholesale_min_qty, is_hard_discount, active, category_slug, brand_slug, tags',
    )
    .order('name')

  if (q) {
    const pat = `%${q.replace(/[%_]/g, '')}%`
    query = query.or(`name.ilike.${pat},sku.ilike.${pat}`)
  }
  if (filter === 'active') query = query.eq('active', true)
  if (filter === 'inactive') query = query.eq('active', false)
  if (filter === 'hard-discount') query = query.eq('is_hard_discount', true)
  if (filter === 'no-wholesale') query = query.is('wholesale_price_mur', null)

  const { data: products } = await query.returns<Product[]>()

  const ids = (products ?? []).map((p) => p.id)
  const { data: stocks } =
    ids.length > 0
      ? await sb.from('inventory').select('product_id, on_hand, reserved').in('product_id', ids)
      : { data: [] as Array<{ product_id: string; on_hand: number; reserved: number }> }
  const stockMap = new Map(
    (stocks ?? []).map((s) => [s.product_id, Math.max(0, s.on_hand - s.reserved)]),
  )

  const rows: ProductWithStock[] = (products ?? []).map((p) => ({
    ...p,
    available: stockMap.get(p.id) ?? null,
  }))

  const counts = await sb
    .from('products')
    .select('id, active, is_hard_discount, wholesale_price_mur')
    .returns<
      Array<{ id: string; active: boolean; is_hard_discount: boolean; wholesale_price_mur: number | null }>
    >()
  const all = counts.data ?? []
  const tabs: Array<{ key: NonNullable<SearchParams['filter']>; label: string; count: number }> = [
    { key: 'all', label: 'All', count: all.length },
    { key: 'active', label: 'Active', count: all.filter((p) => p.active).length },
    { key: 'inactive', label: 'Inactive', count: all.filter((p) => !p.active).length },
    { key: 'hard-discount', label: 'Hard discount', count: all.filter((p) => p.is_hard_discount).length },
    { key: 'no-wholesale', label: 'No wholesale', count: all.filter((p) => p.wholesale_price_mur == null).length },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        subtitle={`${all.length} in catalog · manage prices, stock signals, and storefront visibility`}
        breadcrumbs={[{ label: 'Catalog' }, { label: 'Products' }]}
        actions={
          <BtnPrimary href="/products/new">
            <IconPlus />
            New product
          </BtnPrimary>
        }
      />

      {/* Stats strip */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total products" value={String(all.length)} />
        <StatCard label="Active" value={String(all.filter((p) => p.active).length)} accent="prime" />
        <StatCard
          label="Hard discount"
          value={String(all.filter((p) => p.is_hard_discount).length)}
          accent="flash"
        />
        <StatCard
          label="Low / out of stock"
          value={String(rows.filter((p) => p.available != null && p.available <= 5).length)}
          accent="amber"
        />
      </div>

      {/* Search + filters */}
      <div className="glass-card flex flex-col gap-4 p-4 md:flex-row md:items-center md:p-5">
        <form className="relative min-w-0 flex-1" action="/products" method="get">
          <svg
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by name or SKU…"
            className="w-full rounded-xl border border-ink-300/80 bg-paper py-2.5 pl-10 pr-3 text-sm shadow-inner shadow-ink-900/[0.02] transition focus:border-prime-400 focus:outline-none focus:ring-[3px] focus:ring-prime-200/70"
          />
          {filter !== 'all' && <input type="hidden" name="filter" value={filter} />}
        </form>
        <div className="flex flex-wrap gap-1.5">
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
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? 'bg-prime-700 text-paper shadow-sm shadow-prime-900/15'
                    : 'bg-paper text-ink-700 ring-1 ring-ink-200/80 hover:bg-prime-50 hover:text-prime-800'
                }`}
              >
                {t.label}
                <span className={active ? 'opacity-80' : 'text-ink-500'}>{t.count}</span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Mobile cards */}
      <ul className="space-y-2 lg:hidden">
        {rows.map((p) => (
          <li key={p.id}>
            <Link
              href={`/products/${p.id}`}
              className="glass-card flex gap-4 p-4 transition hover:ring-prime-200/80"
            >
              <ProductThumb url={p.image_url} name={p.name} />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink-900">{p.name}</p>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-ink-500">{p.sku}</p>
                  </div>
                  <StockBadge available={p.available} />
                </div>
                <p className="mt-2 font-display text-lg font-black tabular-nums text-prime-800">
                  Rs {Number(p.retail_price_mur).toFixed(2)}
                </p>
                <div className="mt-2">
                  <ProductTags active={p.active} isHardDiscount={p.is_hard_discount} />
                </div>
              </div>
            </Link>
          </li>
        ))}
        {rows.length === 0 && <EmptyProducts q={q} />}
      </ul>

      {/* Desktop table */}
      <div className="glass-card hidden overflow-hidden lg:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead>
              <tr className="border-b border-ink-200/80 bg-canvas/50 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-ink-500">
                <th className="px-5 py-3.5">Product</th>
                <th className="px-5 py-3.5">Retail</th>
                <th className="px-5 py-3.5">Wholesale</th>
                <th className="px-5 py-3.5">Stock</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-200/50">
              {rows.map((p) => (
                <tr key={p.id} className="group transition hover:bg-prime-50/30">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <ProductThumb url={p.image_url} name={p.name} />
                      <div className="min-w-0">
                        <Link
                          href={`/products/${p.id}`}
                          className="block truncate font-semibold text-ink-900 transition group-hover:text-prime-800"
                        >
                          {p.name}
                        </Link>
                        <p className="font-mono text-[10px] uppercase tracking-wider text-ink-500">{p.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-display font-bold tabular-nums text-ink-900">
                    Rs {Number(p.retail_price_mur).toFixed(2)}
                  </td>
                  <td className="px-5 py-4 tabular-nums text-ink-700">
                    {p.wholesale_price_mur != null ? (
                      <>
                        Rs {Number(p.wholesale_price_mur).toFixed(2)}
                        <span className="ml-1 text-[11px] text-ink-500">min {p.wholesale_min_qty}</span>
                      </>
                    ) : (
                      <span className="text-ink-300">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <StockBadge available={p.available} />
                  </td>
                  <td className="px-5 py-4">
                    <ProductTags active={p.active} isHardDiscount={p.is_hard_discount} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/products/${p.id}`}
                      className="inline-flex rounded-lg bg-prime-50 px-3 py-1.5 text-xs font-bold text-prime-700 ring-1 ring-prime-200/80 transition hover:bg-prime-100"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-16">
                    <EmptyProducts q={q} />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function ProductThumb({ url, name }: { url: string | null; name: string }) {
  if (url) {
    return (
      <img
        src={url}
        alt=""
        className="h-12 w-12 shrink-0 rounded-xl object-cover ring-1 ring-ink-200/80"
      />
    )
  }
  return (
    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-ink-100 text-xs font-bold text-ink-500 ring-1 ring-ink-200/60">
      {name.slice(0, 2).toUpperCase()}
    </div>
  )
}

function EmptyProducts({ q }: { q: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-ink-100 text-ink-400">
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
        </svg>
      </div>
      <p className="text-sm font-medium text-ink-700">
        {q ? `No products match "${q}"` : 'No products in the catalog yet'}
      </p>
      {!q && (
        <BtnPrimary href="/products/new" className="mt-1">
          Create your first product
        </BtnPrimary>
      )}
    </div>
  )
}

