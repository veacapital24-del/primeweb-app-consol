import Link from 'next/link'
import { adminClient } from '@/lib/supabase'
import { PageHeader } from '@/components/PageHeader'
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

  return (
    <div>
      <PageHeader
        title="Locations"
        subtitle="Stores, warehouses, and pop-ups. Shared with the POS — a location created here appears in the POS picker immediately."
        breadcrumbs={[{ label: 'Operations' }, { label: 'Locations' }]}
        actions={
          <Link
            href="/locations/new"
            className="rounded-xl bg-prime-700 px-4 py-2 text-sm font-bold text-paper transition hover:bg-prime-800"
          >
            + New location
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(locations ?? []).map((l) => {
          const tint = KIND_TINT[l.kind]
          const t = totals.get(l.id) ?? { units: 0, products: 0 }
          return (
            <article
              key={l.id}
              className="overflow-hidden rounded-2xl border border-ink-300/60 bg-paper transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-ink-900/10"
            >
              <Link href={`/locations/${l.id}`} className="block">
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
                    {!l.active && (
                      <span className="rounded-full bg-flash-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
                        Off
                      </span>
                    )}
                  </div>

                  {l.address && (
                    <p className="line-clamp-2 text-[12.5px] text-ink-700">
                      {l.address}
                    </p>
                  )}

                  <dl className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="rounded-lg bg-paper-dim/60 px-2.5 py-1.5">
                      <dt className="text-ink-500">On hand</dt>
                      <dd className="mt-0.5 font-display text-base font-black tabular-nums">
                        {t.units.toLocaleString()}
                      </dd>
                    </div>
                    <div className="rounded-lg bg-paper-dim/60 px-2.5 py-1.5">
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
              </Link>
            </article>
          )
        })}

        {(!locations || locations.length === 0) && (
          <div className="col-span-full rounded-2xl border border-dashed border-ink-300 bg-paper-dim/40 p-12 text-center">
            <p className="text-ink-700">
              No locations yet — create one to start using the POS and split
              stock across stores.
            </p>
            <Link
              href="/locations/new"
              className="mt-3 inline-block rounded-xl bg-prime-700 px-4 py-2 text-sm font-bold text-paper hover:bg-prime-800"
            >
              + New location
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
