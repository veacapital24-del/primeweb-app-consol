import Link from 'next/link'
import { adminClient } from '@/lib/supabase'
import { PageHeader } from '@/components/PageHeader'
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

  // How many products reference each brand — surfaces orphans.
  const { data: usage } = await sb
    .from('products')
    .select('brand_slug')
    .not('brand_slug', 'is', null)
  const usageMap = new Map<string, number>()
  for (const r of usage ?? []) {
    if (!r.brand_slug) continue
    usageMap.set(r.brand_slug, (usageMap.get(r.brand_slug) ?? 0) + 1)
  }

  return (
    <div>
      <PageHeader
        title="Brands"
        subtitle="Partner brands shown on the storefront's brand showcase + product detail pages."
        breadcrumbs={[{ label: 'Catalog' }, { label: 'Brands' }]}
        actions={
          <Link
            href="/brands/new"
            className="rounded-xl bg-prime-700 px-4 py-2 text-sm font-bold text-paper transition hover:bg-prime-800"
          >
            + New brand
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(brands ?? []).map((b) => {
          const linked = usageMap.get(b.slug) ?? 0
          return (
            <article
              key={b.slug}
              className="overflow-hidden rounded-2xl border border-ink-300/60 bg-paper transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-ink-900/10"
            >
              <Link href={`/brands/${b.slug}`} className="block">
                <div className="flex h-24 items-center justify-center bg-paper-dim/60 px-5">
                  {b.logo_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={b.logo_url}
                      alt=""
                      className="h-12 w-auto object-contain"
                    />
                  ) : (
                    <span className="text-xs uppercase tracking-widest text-ink-500">
                      No logo yet
                    </span>
                  )}
                </div>
                <div className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold text-ink-900">
                        {b.name}
                      </h3>
                      <p className="font-mono text-[11px] uppercase tracking-wider text-ink-500">
                        {b.slug}
                      </p>
                    </div>
                    {!b.active && (
                      <span className="rounded-full bg-flash-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
                        Inactive
                      </span>
                    )}
                  </div>
                  {b.tagline && (
                    <p className="line-clamp-2 text-[12.5px] italic text-ink-700">
                      {b.tagline}
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-1 text-[11px] text-ink-500">
                    <span className="capitalize">{b.tint.replace('-', ' ')} tint</span>
                    <span>
                      {linked} {linked === 1 ? 'product' : 'products'}
                    </span>
                  </div>
                </div>
              </Link>
            </article>
          )
        })}

        {(!brands || brands.length === 0) && (
          <div className="col-span-full rounded-2xl border border-dashed border-ink-300 bg-paper-dim/40 p-12 text-center">
            <p className="text-ink-700">
              No brands yet — create the first one to start tagging products.
            </p>
            <Link
              href="/brands/new"
              className="mt-3 inline-block rounded-xl bg-prime-700 px-4 py-2 text-sm font-bold text-paper hover:bg-prime-800"
            >
              + New brand
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
