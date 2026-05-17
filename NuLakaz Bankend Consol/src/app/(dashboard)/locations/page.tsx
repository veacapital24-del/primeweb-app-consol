import Link from 'next/link'
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
import type { Location } from '@/lib/types'

export const dynamic = 'force-dynamic'

const KIND_LABEL: Record<Location['kind'], string> = {
  store: 'Store',
  warehouse: 'Warehouse',
  kiosk: 'Kiosk',
  popup: 'Pop-up',
}

const KIND_TINT: Record<Location['kind'], { bg: string; fg: string }> = {
  store:     { bg: '#f5e7c4', fg: '#a98937' },
  warehouse: { bg: '#cfdfeb', fg: '#3a6f93' },
  kiosk:     { bg: '#dde7c5', fg: '#5e7f54' },
  popup:     { bg: '#e7d3da', fg: '#82445a' },
}

export default async function LocationsListPage() {
  const sb = adminClient()

  const { data: locations } = await sb
    .from('locations')
    .select('*')
    .order('active', { ascending: false })
    .order('name', { ascending: true })
    .returns<Location[]>()

  // Per-location stock totals — units + product count, surfaced on each
  // card so the user can see warehouse density at a glance.
  const { data: stocks } = await sb
    .from('location_stock')
    .select('location_id, on_hand')
  const totals = new Map<string, { units: number; products: number }>()
  for (const s of stocks ?? []) {
    const cur = totals.get(s.location_id) ?? { units: 0, products: 0 }
    cur.units += Math.max(0, s.on_hand ?? 0)
    cur.products += 1
    totals.set(s.location_id, cur)
  }

  const list = locations ?? []
  const activeCount = list.filter((l) => l.active).length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Locations"
        subtitle="Stores, warehouses, and pop-ups. Shared with the POS — a location created here appears in the POS picker immediately."
        breadcrumbs={[{ label: 'Operations' }, { label: 'Locations' }]}
        actions={
          <BtnPrimary href="/locations/new">
            <IconPlus />
            New location
          </BtnPrimary>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Locations" value={list.length} />
        <StatCard label="Active" value={activeCount} accent="prime" />
        <StatCard
          label="Units on hand"
          value={[...totals.values()].reduce((s, t) => s + t.units, 0).toLocaleString()}
          accent="mint"
        />
      </div>

      {list.length === 0 ? (
        <EmptyState
          title="No locations yet — create one to use the POS and split stock across stores."
          action={{ href: '/locations/new', label: 'New location' }}
        />
      ) : (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((l) => {
          const tint = KIND_TINT[l.kind]
          const t = totals.get(l.id) ?? { units: 0, products: 0 }
          return (
            <CatalogCard key={l.id} href={`/locations/${l.id}`}>
                <span
                  aria-hidden
                  className="block h-0.5 w-full"
                  style={{ backgroundColor: tint.fg }}
                />
                <div className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest"
                        style={{ backgroundColor: tint.bg, color: tint.fg }}
                      >
                        <span
                          aria-hidden
                          className="w-1 h-1 rounded-full"
                          style={{ backgroundColor: tint.fg }}
                        />
                        {KIND_LABEL[l.kind]}
                      </span>
                      <h3 className="mt-2 truncate text-sm font-bold text-ink-900">
                        {l.name}
                      </h3>
                      <p className="font-mono text-[11px] uppercase tracking-wider text-ink-500">
                        {l.code}
                      </p>
                    </div>
                    <ActiveBadge active={l.active} />
                  </div>

                  {l.address && (
                    <p className="line-clamp-2 text-[12.5px] text-ink-700">
                      {l.address}
                    </p>
                  )}

                  <dl className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="rounded-xl bg-canvas/60 px-2.5 py-1.5 ring-1 ring-ink-200/50">
                      <dt className="text-ink-500">On hand</dt>
                      <dd className="mt-0.5 font-display text-base font-black tabular-nums">
                        {t.units.toLocaleString()}
                      </dd>
                    </div>
                    <div className="rounded-xl bg-canvas/60 px-2.5 py-1.5 ring-1 ring-ink-200/50">
                      <dt className="text-ink-500">Products</dt>
                      <dd className="mt-0.5 font-display text-base font-black tabular-nums">
                        {t.products}
                      </dd>
                    </div>
                  </dl>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-ink-500">
                    <span className="font-mono">
                      {l.timezone} · {l.currency}
                    </span>
                    <Link
                      href={`/inventory?location=${l.id}`}
                      className="font-semibold text-prime-700 hover:underline"
                    >
                      View stock →
                    </Link>
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
