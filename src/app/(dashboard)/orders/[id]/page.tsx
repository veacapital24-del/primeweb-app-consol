import { notFound } from 'next/navigation'
import Link from 'next/link'
import { adminClient } from '@/lib/supabase'
import { PageHeader } from '@/components/PageHeader'
import { StatusFlow, NoteForm } from './StatusFlow'

export const dynamic = 'force-dynamic'

type PageProps = { params: Promise<{ id: string }> }

type FullOrder = {
  id: string
  order_number: string
  channel: string
  is_wholesale: boolean
  subtotal_mur: number
  status: string
  customer_name: string | null
  whatsapp_phone: string | null
  notes: string | null
  created_at: string
  updated_at: string
  reels: { slug: string; caption: string | null } | null
  order_items: Array<{
    id: number
    qty: number
    unit_price_mur: number
    products: { id: string; sku: string; name: string; image_url: string | null; slug: string } | null
  }>
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params
  const sb = adminClient()

  const { data: order } = await sb
    .from('orders')
    .select('id, order_number, channel, is_wholesale, subtotal_mur, status, customer_name, whatsapp_phone, notes, created_at, updated_at, reels(slug, caption), order_items(id, qty, unit_price_mur, products(id, sku, name, image_url, slug))')
    .eq('id', id)
    .maybeSingle<FullOrder>()
  if (!order) notFound()

  const itemTotal = order.order_items.reduce((s, i) => s + i.qty * Number(i.unit_price_mur), 0)
  const totalUnits = order.order_items.reduce((s, i) => s + i.qty, 0)

  return (
    <div>
      <PageHeader
        title={order.order_number}
        subtitle={`${order.channel}${order.is_wholesale ? ' · B2B' : ''} · ${new Date(order.created_at).toLocaleString()}`}
        breadcrumbs={[
          { label: 'Operations' },
          { label: 'Orders', href: '/orders' },
          { label: order.order_number },
        ]}
        actions={
          order.whatsapp_phone && (
            <a
              href={`https://wa.me/${order.whatsapp_phone.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl bg-mint-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-mint-600"
            >
              Open WhatsApp
            </a>
          )
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Left: items + status */}
        <div className="space-y-6">
          <Card title="Status">
            <StatusFlow orderId={order.id} status={order.status} />
          </Card>

          <Card title={`Items · ${totalUnits} unit${totalUnits > 1 ? 's' : ''}`}>
            <ul className="divide-y divide-ink-300/60">
              {order.order_items.map((it) => (
                <li key={it.id} className="flex items-center gap-3 py-3">
                  {it.products?.image_url && (
                    <img src={it.products.image_url} alt="" className="h-12 w-12 rounded-lg object-cover ring-1 ring-ink-300" />
                  )}
                  <div className="min-w-0 flex-1">
                    <Link href={`/products/${it.products?.id}`} className="block truncate text-sm font-semibold hover:text-prime-700">
                      {it.products?.name ?? '—'}
                    </Link>
                    <div className="font-mono text-[11px] uppercase tracking-wider text-ink-500">{it.products?.sku}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold tabular-nums">Rs {Number(it.unit_price_mur).toFixed(2)} × {it.qty}</div>
                    <div className="text-xs text-ink-500 tabular-nums">= Rs {(Number(it.unit_price_mur) * it.qty).toFixed(2)}</div>
                  </div>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-1 border-t border-ink-300/60 pt-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-500">Subtotal</dt>
                <dd className="font-semibold tabular-nums">Rs {itemTotal.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between border-t border-ink-300/60 pt-2 text-base">
                <dt className="font-bold">Total</dt>
                <dd className="font-display text-2xl font-black text-prime-700 tabular-nums">Rs {Number(order.subtotal_mur).toFixed(2)}</dd>
              </div>
            </dl>
          </Card>

          <Card title="Internal notes">
            {order.notes ? (
              <pre className="mb-3 whitespace-pre-wrap rounded-lg bg-paper-dim/60 p-3 text-xs text-ink-700">{order.notes}</pre>
            ) : (
              <p className="mb-3 text-xs text-ink-500">No notes yet.</p>
            )}
            <NoteForm orderId={order.id} />
          </Card>
        </div>

        {/* Right: customer + meta */}
        <div className="space-y-6">
          <Card title="Customer">
            <dl className="space-y-2 text-sm">
              <Row k="Name"     v={order.customer_name ?? '—'} />
              <Row k="WhatsApp" v={order.whatsapp_phone ?? '—'} mono />
              <Row k="Channel"  v={order.channel} cap />
              <Row k="Mode"     v={order.is_wholesale ? 'Wholesale (B2B)' : 'Retail'} />
            </dl>
          </Card>

          {order.reels && (
            <Card title="Source reel">
              <Link href={`/reels`} className="text-sm font-semibold text-prime-700 hover:underline">
                /reel/{order.reels.slug}
              </Link>
              {order.reels.caption && (
                <p className="mt-1 text-xs text-ink-700">{order.reels.caption}</p>
              )}
            </Card>
          )}

          <Card title="Timeline">
            <dl className="space-y-2 text-xs">
              <Row k="Created" v={new Date(order.created_at).toLocaleString()} />
              <Row k="Updated" v={new Date(order.updated_at).toLocaleString()} />
              <Row k="Order ID" v={order.id} mono />
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
