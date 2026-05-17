import Link from 'next/link'
import { notFound } from 'next/navigation'
import { adminClient } from '@/lib/supabase'
import { PageHeader } from '@/components/PageHeader'
import { GlassCard, StatCard } from '@/components/admin/ui'
import { orderStatusLabel, ORDER_STATUS_TONES, normalizeOrderStatus } from '@/lib/order-status'
import { PrintPackingSlip } from '@/components/orders/PrintPackingSlip'
import { StatusFlow, NoteForm } from './StatusFlow'

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
    products: {
      id: string
      sku: string
      name: string
      image_url: string | null
      slug: string
    } | null
  }>
}

const CHANNEL_LABEL: Record<string, string> = {
  web: 'Website',
  whatsapp: 'WhatsApp',
  reel: 'Reel',
}

export async function OnlineOrderDetail({ id }: { id: string }) {
  const sb = adminClient()

  const { data: order } = await sb
    .from('orders')
    .select(
      'id, order_number, channel, is_wholesale, subtotal_mur, status, customer_name, whatsapp_phone, notes, created_at, updated_at, reels(slug, caption), order_items(id, qty, unit_price_mur, products(id, sku, name, image_url, slug))',
    )
    .eq('id', id)
    .maybeSingle<FullOrder>()
  if (!order) notFound()

  const itemTotal = order.order_items.reduce(
    (s, i) => s + i.qty * Number(i.unit_price_mur),
    0,
  )
  const totalUnits = order.order_items.reduce((s, i) => s + i.qty, 0)
  const statusKey = normalizeOrderStatus(order.status)
  const tone = ORDER_STATUS_TONES[statusKey] ?? ORDER_STATUS_TONES.pending

  return (
    <div className="space-y-6">
      <PageHeader
        title={order.order_number}
        subtitle={`${CHANNEL_LABEL[order.channel] ?? order.channel}${order.is_wholesale ? ' · Wholesale' : ''}`}
        breadcrumbs={[
          { label: 'Operations' },
          { label: 'Orders', href: '/orders' },
          { label: order.order_number },
        ]}
        actions={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <PrintPackingSlip
              orderId={order.id}
              orderNumber={order.order_number}
              status={order.status}
              compact
            />
            {order.whatsapp_phone && (
              <a
                href={`https://wa.me/${order.whatsapp_phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-mint-500 px-4 py-2.5 text-sm font-bold text-paper transition hover:bg-mint-600"
              >
                WhatsApp
              </a>
            )}
            <Link
              href="/orders"
              className="inline-flex items-center justify-center rounded-xl border border-ink-300/80 bg-paper px-4 py-2.5 text-sm font-semibold text-ink-800 transition hover:border-prime-300 hover:bg-prime-50/40"
            >
              ← All orders
            </Link>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total" value={`Rs ${Number(order.subtotal_mur).toFixed(2)}`} accent="prime" />
        <StatCard label="Units" value={totalUnits} />
        <StatCard
          label="Channel"
          value={CHANNEL_LABEL[order.channel] ?? order.channel}
          accent="amber"
        />
        <div className="glass-card flex flex-col justify-center px-4 py-3 ring-1 ring-ink-200/40">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">Status</p>
          <span
            className="mt-2 inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-bold capitalize"
            style={{ backgroundColor: tone.bg, color: tone.fg }}
          >
            {orderStatusLabel(order.status)}
          </span>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <div className="space-y-6">
          <GlassCard
            title="Fulfilment"
            desc="Print the packing slip to confirm picking (confirmed → packing). Stock is deducted when packing starts."
          >
            <StatusFlow
              orderId={order.id}
              orderNumber={order.order_number}
              status={order.status}
            />
          </GlassCard>

          <GlassCard title={`Line items · ${totalUnits} unit${totalUnits !== 1 ? 's' : ''}`}>
            <ul className="space-y-3">
              {order.order_items.map((it) => (
                <li
                  key={it.id}
                  className="flex items-center gap-3 rounded-xl border border-ink-200/70 bg-canvas/40 p-3 transition hover:border-prime-200/60 hover:bg-prime-50/20"
                >
                  {it.products?.image_url ? (
                    <img
                      src={it.products.image_url}
                      alt=""
                      className="h-14 w-14 shrink-0 rounded-xl object-cover ring-1 ring-ink-300/80"
                    />
                  ) : (
                    <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-ink-100 text-xs font-bold text-ink-500">
                      —
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/products/${it.products?.id}`}
                      className="block truncate text-sm font-semibold text-ink-900 hover:text-prime-700"
                    >
                      {it.products?.name ?? '—'}
                    </Link>
                    <p className="font-mono text-[11px] uppercase tracking-wider text-ink-500">
                      {it.products?.sku}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs tabular-nums text-ink-500">
                      Rs {Number(it.unit_price_mur).toFixed(2)} × {it.qty}
                    </p>
                    <p className="font-display text-base font-black tabular-nums text-prime-800">
                      Rs {(Number(it.unit_price_mur) * it.qty).toFixed(2)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <dl className="mt-5 space-y-2 border-t border-ink-300/50 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-500">Items subtotal</dt>
                <dd className="font-semibold tabular-nums">Rs {itemTotal.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between border-t border-ink-300/50 pt-3">
                <dt className="font-display text-base font-bold text-ink-900">Order total</dt>
                <dd className="font-display text-2xl font-black tabular-nums text-prime-700">
                  Rs {Number(order.subtotal_mur).toFixed(2)}
                </dd>
              </div>
            </dl>
          </GlassCard>

          <GlassCard title="Internal notes" desc="Visible to admins only.">
            {order.notes ? (
              <pre className="mb-4 max-h-48 overflow-auto whitespace-pre-wrap rounded-xl bg-paper-dim/60 p-4 text-xs leading-relaxed text-ink-700">
                {order.notes}
              </pre>
            ) : (
              <p className="mb-4 text-sm text-ink-500">No notes yet.</p>
            )}
            <NoteForm orderId={order.id} />
          </GlassCard>
        </div>

        <aside className="space-y-6">
          <GlassCard title="Customer">
            <dl className="space-y-3 text-sm">
              <MetaRow label="Name" value={order.customer_name ?? '—'} />
              <MetaRow label="WhatsApp" value={order.whatsapp_phone ?? '—'} mono />
              <MetaRow
                label="Mode"
                value={order.is_wholesale ? 'Wholesale (B2B)' : 'Retail'}
              />
            </dl>
          </GlassCard>

          {order.reels && (
            <GlassCard title="Source reel">
              <Link
                href="/reels"
                className="text-sm font-semibold text-prime-700 hover:underline"
              >
                /reel/{order.reels.slug}
              </Link>
              {order.reels.caption && (
                <p className="mt-2 text-xs leading-relaxed text-ink-600">
                  {order.reels.caption}
                </p>
              )}
            </GlassCard>
          )}

          <GlassCard title="Timeline">
            <dl className="space-y-3 text-xs">
              <MetaRow
                label="Placed"
                value={new Date(order.created_at).toLocaleString()}
              />
              <MetaRow
                label="Updated"
                value={new Date(order.updated_at).toLocaleString()}
              />
              <MetaRow label="Order ID" value={order.id} mono />
            </dl>
          </GlassCard>
        </aside>
      </div>
    </div>
  )
}

function MetaRow({
  label,
  value,
  mono,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="grid grid-cols-[6.5rem_1fr] gap-3">
      <dt className="text-ink-500">{label}</dt>
      <dd className={`break-all font-medium text-ink-900 ${mono ? 'font-mono text-[11px]' : ''}`}>
        {value}
      </dd>
    </div>
  )
}
