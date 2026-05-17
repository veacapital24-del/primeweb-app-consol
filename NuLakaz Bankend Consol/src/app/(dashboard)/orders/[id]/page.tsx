import { notFound } from 'next/navigation'
import Link from 'next/link'
import { adminClient } from '@/lib/supabase'
import { PageHeader } from '@/components/PageHeader'
import { GlassCard } from '@/components/admin/ui'
import { OnlineOrderDetail } from './OnlineOrderDetail'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ source?: string }>
}

type FullSale = {
  id: string
  sale_number: string
  status: string
  subtotal_mur: number
  discount_mur: number
  tax_mur: number
  total_mur: number
  notes: string | null
  created_at: string
  completed_at: string | null
  cashier_id: string
  customer_id: string | null
  locations: { id: string; code: string; name: string; kind: string } | null
  sale_lines: Array<{
    id: number
    qty: number
    sku: string
    name: string
    unit_price_mur: number
    line_discount_mur: number
    line_tax_mur: number
    line_total_mur: number
    products: { id: string; image_url: string | null } | null
  }>
  payments: Array<{ tender: string; amount_mur: number }>
}

export default async function OrderDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const { source } = await searchParams

  if (source === 'pos') {
    return <PosSaleDetail id={id} />
  }

  return <OnlineOrderDetail id={id} />
}


async function PosSaleDetail({ id }: { id: string }) {
  const sb = adminClient()

  const { data: sale } = await sb
    .from('sales')
    .select(
      'id, sale_number, status, subtotal_mur, discount_mur, tax_mur, total_mur, notes, created_at, completed_at, cashier_id, customer_id, locations(id, code, name, kind), sale_lines(id, qty, sku, name, unit_price_mur, line_discount_mur, line_tax_mur, line_total_mur, products(id, image_url)), payments(tender, amount_mur)',
    )
    .eq('id', id)
    .maybeSingle<FullSale>()
  if (!sale) notFound()

  const profileIds = [sale.cashier_id, sale.customer_id].filter((x): x is string => Boolean(x))
  const { data: profiles } =
    profileIds.length > 0
      ? await sb.from('profiles').select('id, full_name').in('id', profileIds)
      : { data: [] as Array<{ id: string; full_name: string | null }> }
  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.full_name ?? '—']))

  const totalUnits = sale.sale_lines.reduce((s, l) => s + Number(l.qty), 0)
  const loc = sale.locations

  return (
    <div>
      <PageHeader
        title={sale.sale_number}
        subtitle={`POS${loc ? ` · ${loc.name} (${loc.code})` : ''} · ${new Date(sale.created_at).toLocaleString()}`}
        breadcrumbs={[
          { label: 'Operations' },
          { label: 'Orders', href: '/orders' },
          { label: sale.sale_number },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <Card title="Status">
            <p className="text-sm font-semibold capitalize text-ink-900">
              {sale.status.replace(/_/g, ' ')}
            </p>
            <p className="mt-1 text-xs text-ink-500">
              POS sales are updated from the register; status changes here are read-only.
            </p>
          </Card>

          <Card title={`Items · ${totalUnits} unit${totalUnits !== 1 ? 's' : ''}`}>
            <ul className="divide-y divide-ink-300/60">
              {sale.sale_lines.map((it) => (
                <li key={it.id} className="flex items-center gap-3 py-3">
                  {it.products?.image_url && (
                    <img src={it.products.image_url} alt="" className="h-12 w-12 rounded-lg object-cover ring-1 ring-ink-300" />
                  )}
                  <div className="min-w-0 flex-1">
                    {it.products?.id ? (
                      <Link href={`/products/${it.products.id}`} className="block truncate text-sm font-semibold hover:text-prime-700">
                        {it.name}
                      </Link>
                    ) : (
                      <span className="block truncate text-sm font-semibold text-ink-900">{it.name}</span>
                    )}
                    <div className="font-mono text-[11px] uppercase tracking-wider text-ink-500">{it.sku}</div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-xs text-ink-500 tabular-nums sm:text-sm">
                      Rs {Number(it.unit_price_mur).toFixed(2)} × {it.qty}
                    </div>
                    <div className="font-semibold tabular-nums">
                      = Rs {Number(it.line_total_mur).toFixed(2)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-1 border-t border-ink-300/60 pt-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-500">Subtotal</dt>
                <dd className="font-semibold tabular-nums">Rs {Number(sale.subtotal_mur).toFixed(2)}</dd>
              </div>
              {Number(sale.discount_mur) > 0 && (
                <div className="flex justify-between">
                  <dt className="text-ink-500">Discount</dt>
                  <dd className="font-semibold tabular-nums text-prime-700">
                    − Rs {Number(sale.discount_mur).toFixed(2)}
                  </dd>
                </div>
              )}
              {Number(sale.tax_mur) > 0 && (
                <div className="flex justify-between">
                  <dt className="text-ink-500">Tax</dt>
                  <dd className="font-semibold tabular-nums">Rs {Number(sale.tax_mur).toFixed(2)}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-ink-300/60 pt-2 text-base">
                <dt className="font-bold">Total</dt>
                <dd className="font-display text-2xl font-black text-prime-700 tabular-nums">
                  Rs {Number(sale.total_mur).toFixed(2)}
                </dd>
              </div>
            </dl>
          </Card>

          {sale.notes && (
            <Card title="Notes">
              <pre className="whitespace-pre-wrap rounded-lg bg-paper-dim/60 p-3 text-xs text-ink-700">
                {sale.notes}
              </pre>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card title="Sale">
            <dl className="space-y-2 text-sm">
              <Row k="Customer" v={sale.customer_id ? nameById.get(sale.customer_id) ?? '—' : 'Walk-in'} />
              <Row k="Cashier" v={nameById.get(sale.cashier_id) ?? '—'} />
              <Row k="Location" v={loc ? `${loc.name} (${loc.code})` : '—'} />
              <Row k="Source" v="POS" cap />
            </dl>
          </Card>

          {sale.payments.length > 0 && (
            <Card title="Payments">
              <ul className="divide-y divide-ink-300/60 text-sm">
                {sale.payments.map((p, i) => (
                  <li key={i} className="flex justify-between py-2 capitalize">
                    <span className="text-ink-700">{p.tender.replace(/_/g, ' ')}</span>
                    <span className="font-semibold tabular-nums">Rs {Number(p.amount_mur).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card title="Timeline">
            <dl className="space-y-2 text-xs">
              <Row k="Created" v={new Date(sale.created_at).toLocaleString()} />
              {sale.completed_at && (
                <Row k="Completed" v={new Date(sale.completed_at).toLocaleString()} />
              )}
              <Row k="Sale ID" v={sale.id} mono />
            </dl>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-ink-300/60 bg-paper p-5">
      <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-ink-500">{title}</h2>
      {children}
    </section>
  )
}

function Row({ k, v, mono, cap }: { k: string; v: string; mono?: boolean; cap?: boolean }) {
  return (
    <div className="grid grid-cols-[max-content_1fr] gap-x-4">
      <dt className="text-ink-500">{k}</dt>
      <dd className={`break-all ${mono ? 'font-mono' : ''} ${cap ? 'capitalize' : ''}`}>{v}</dd>
    </div>
  )
}
