import Link from 'next/link'
import { adminClient } from '@/lib/supabase'
import { PageHeader } from '@/components/PageHeader'

export const dynamic = 'force-dynamic'

type Row = {
  id: string
  order_number: string
  channel: string
  is_wholesale: boolean
  subtotal_mur: number
  status: string
  customer_name: string | null
  whatsapp_phone: string | null
  created_at: string
  order_items: Array<{ qty: number }>
}

type SearchParams = { status?: 'all' | 'pending' | 'confirmed' | 'fulfilled' | 'cancelled' }

export default async function OrdersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { status = 'all' } = await searchParams
  const sb = adminClient()

  let q = sb
    .from('orders')
    .select('id, order_number, channel, is_wholesale, subtotal_mur, status, customer_name, whatsapp_phone, created_at, order_items(qty)')
    .order('created_at', { ascending: false })

  if (status !== 'all') q = q.eq('status', status)

  const { data } = await q.returns<Row[]>()

  // counts for tabs
  const allCounts = await sb.from('orders').select('status').returns<Array<{ status: string }>>()
  const counts = (allCounts.data ?? []).reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1
    acc.all = (acc.all ?? 0) + 1
    return acc
  }, { all: 0, pending: 0, confirmed: 0, fulfilled: 0, cancelled: 0 })

  const tabs = (['all', 'pending', 'confirmed', 'fulfilled', 'cancelled'] as const).map((k) => ({ key: k, count: counts[k] ?? 0 }))

  return (
    <div>
      <PageHeader
        title="Orders"
        subtitle="Track all incoming orders across channels"
        breadcrumbs={[{ label: 'Operations' }, { label: 'Orders' }]}
      />

      <div className="mb-4 flex flex-wrap gap-1 text-xs font-semibold">
        {tabs.map((t) => {
          const active = t.key === status
          const href = t.key === 'all' ? '/orders' : `/orders?status=${t.key}`
          return (
            <Link
              key={t.key}
              href={href}
              className={`rounded-full px-3 py-1.5 capitalize transition ${active ? 'bg-prime-700 text-paper' : 'bg-paper text-ink-700 hover:bg-ink-100'}`}
            >
              {t.key} <span className="opacity-60">({t.count})</span>
            </Link>
          )
        })}
      </div>

      {/* Mobile: card list */}
      <ul className="space-y-2 sm:hidden">
        {(data ?? []).map((o) => {
          const totalItems = o.order_items.reduce((s, i) => s + i.qty, 0)
          return (
            <li key={o.id}>
              <Link
                href={`/orders/${o.id}`}
                className="flex flex-col gap-2 rounded-2xl border border-ink-300/60 bg-paper p-4 transition active:scale-[0.99] active:bg-paper-dim/60"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-mono text-xs font-bold text-prime-700">{o.order_number}</div>
                    <div className="mt-0.5 truncate text-sm font-semibold text-ink-900">{o.customer_name ?? '—'}</div>
                    {o.whatsapp_phone && (
                      <div className="font-mono text-[11px] text-ink-500">{o.whatsapp_phone}</div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-semibold tabular-nums text-ink-900">Rs {Number(o.subtotal_mur).toFixed(2)}</div>
                    <div className="mt-0.5 text-[11px] text-ink-500">{totalItems} unit{totalItems > 1 ? 's' : ''}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <StatusPill status={o.status} />
                    <span className="capitalize text-ink-500">{o.channel}</span>
                    {o.is_wholesale && <span className="rounded-full bg-prime-50 px-1.5 py-0.5 text-[10px] font-bold text-prime-700">B2B</span>}
                  </div>
                  <span className="text-ink-500">{new Date(o.created_at).toLocaleDateString()}</span>
                </div>
              </Link>
            </li>
          )
        })}
        {(!data || data.length === 0) && (
          <li className="rounded-2xl border border-ink-300/60 bg-paper px-4 py-12 text-center text-sm text-ink-500">No orders in this view.</li>
        )}
      </ul>

      {/* Tablet+: table */}
      <div className="hidden overflow-x-auto rounded-2xl border border-ink-300/60 bg-paper sm:block">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-paper-dim/60 text-left text-xs uppercase tracking-wider text-ink-500">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Channel</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">When</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-300/60">
            {(data ?? []).map((o) => {
              const totalItems = o.order_items.reduce((s, i) => s + i.qty, 0)
              return (
                <tr key={o.id} className="cursor-pointer hover:bg-paper-dim/40">
                  <td className="px-4 py-3"><Link href={`/orders/${o.id}`} className="font-mono text-xs font-bold text-prime-700 hover:underline">{o.order_number}</Link></td>
                  <td className="px-4 py-3">
                    <div className="truncate">{o.customer_name ?? '—'}</div>
                    {o.whatsapp_phone && <div className="font-mono text-[11px] text-ink-500">{o.whatsapp_phone}</div>}
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-700">{totalItems} unit{totalItems > 1 ? 's' : ''}</td>
                  <td className="px-4 py-3">
                    <span className="capitalize">{o.channel}</span>
                    {o.is_wholesale && <span className="ml-1.5 rounded-full bg-prime-50 px-1.5 py-0.5 text-[10px] font-bold text-prime-700">B2B</span>}
                  </td>
                  <td className="px-4 py-3 font-semibold tabular-nums">Rs {Number(o.subtotal_mur).toFixed(2)}</td>
                  <td className="px-4 py-3"><StatusPill status={o.status} /></td>
                  <td className="px-4 py-3 text-xs text-ink-500">{new Date(o.created_at).toLocaleString()}</td>
                </tr>
              )
            })}
            {(!data || data.length === 0) && (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-ink-500">No orders in this view.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  const tones: Record<string, string> = {
    pending:   'bg-amber-50 text-amber-700',
    confirmed: 'bg-prime-50 text-prime-700',
    fulfilled: 'bg-mint-100 text-mint-600',
    cancelled: 'bg-ink-100 text-ink-500',
  }
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold capitalize ${tones[status] ?? 'bg-ink-100 text-ink-700'}`}>{status}</span>
}
