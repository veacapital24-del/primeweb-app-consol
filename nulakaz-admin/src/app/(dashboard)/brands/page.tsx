import { adminClient } from '@/lib/supabase'
import { PageHeader } from '@/components/PageHeader'
import {
  ActiveBadge,
  BtnPrimary,
  CatalogCard,
  EmptyState,
  IconPlus,
  StatCard,
} from '@/components/admin/ui'
import type { Brand } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function BrandsListPage() {
  const sb = adminClient()

  const { data: brands } = await sb
    .from('brands')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })
    .returns<Brand[]>()

  const { data: usage } = await sb
    .from('products')
    .select('brand_slug')
    .not('brand_slug', 'is', null)
  const usageMap = new Map<string, number>()
  for (const r of usage ?? []) {
    if (!r.brand_slug) continue
    usageMap.set(r.brand_slug, (usageMap.get(r.brand_slug) ?? 0) + 1)
  }

  const list = brands ?? []
  const activeCount = list.filter((b) => b.active).length
  const linkedProducts = [...usageMap.values()].reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Brands"
        subtitle="Partner brands on the storefront showcase and product detail pages."
        breadcrumbs={[{ label: 'Catalog' }, { label: 'Brands' }]}
        actions={
          <BtnPrimary href="/brands/new">
            <IconPlus />
            New brand
          </BtnPrimary>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Total brands" value={list.length} />
        <StatCard label="Active" value={activeCount} accent="prime" />
        <StatCard label="Products linked" value={linkedProducts} accent="mint" />
      </div>

      {list.length === 0 ? (
        <EmptyState
          title="No brands yet — create the first one to start tagging products."
          action={{ href: '/brands/new', label: 'Create brand' }}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((b) => {
            const linked = usageMap.get(b.slug) ?? 0
            return (
              <CatalogCard key={b.slug} href={`/brands/${b.slug}`}>
                <div className="flex h-24 items-center justify-center bg-canvas/60 px-5">
                  {b.logo_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={b.logo_url} alt="" className="h-12 w-auto object-contain" />
                  ) : (
                    <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">
                      No logo
                    </span>
                  )}
                </div>
                <div className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold text-ink-900 group-hover:text-prime-800">
                        {b.name}
                      </h3>
                      <p className="font-mono text-[11px] text-ink-500">{b.slug}</p>
                    </div>
                    <ActiveBadge active={b.active} />
                  </div>
                  {b.tagline && (
                    <p className="line-clamp-2 text-[12.5px] italic leading-relaxed text-ink-600">
                      {b.tagline}
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-1 text-[11px] text-ink-500">
                    <span className="capitalize">{b.tint.replace('-', ' ')}</span>
                    <span className="tabular-nums">
                      {linked} {linked === 1 ? 'product' : 'products'}
                    </span>
                  </div>
                </div>
              </CatalogCard>
            )
          })}
        </div>
      )}
    </div>
  )
}
