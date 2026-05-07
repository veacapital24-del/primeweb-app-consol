import Link from 'next/link'
import { adminClient } from '@/lib/supabase'
import { PageHeader } from '@/components/PageHeader'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const sb = adminClient()

  const since = new Date(Date.now() - 7 * 86400_000).toISOString()

  const [products, lowStock, outStock, ordersWeek, ordersPending, whatsappWeek, recentOrders] = await Promise.all([
    sb.from('products').select('id', { count: 'exact', head: true }).eq('active', true),
    sb.from('product_stock').select('id, name, available, low_stock_threshold').lte('available', 5).gt('available', 0).order('available').limit(8),
    sb.from('product_stock').select('id, name').eq('available', 0).limit(8),
    sb.from('orders').select('id, subtotal_mur, channel, is_wholesale, created_at').gte('created_at', since),
    sb.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    sb.from('whatsapp_messages').select('id', { count: 'exact', head: true }).gte('created_at', since),
    sb.from('orders').select('id, order_number, channel, is_wholesale, subtotal_mur, status, created_at, customer_name').order('created_at', { ascending: false }).limit(8),
  ])

  const week = ordersWeek.data ?? []
  const revenueWeek = week.reduce((s, o) => s + Number(o.subtotal_mur ?? 0), 0)
  const channelMix = week.reduce<Record<string, number>>((acc, o) => {
    acc[o.channel] = (acc[o.channel] ?? 0) + 1
    return acc
  }, {})
  const wholesaleShare = week.length > 0 ? (week.filter((o) => o.is_wholesale).length / week.length) * 100 : 0

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Live overview of catalog, inventory, and channels"
        actions={
          <>
            <Link href="/products/new" className="rounded-xl bg-prime-700 px-4 py-2 text-sm font-bold text-paper transition hover:bg-prime-800">
              + Add product
            </Link>
            <Link href="/orders" className="rounded-xl border border-ink-300 bg-paper px-4 py-2 text-sm font-bold text-ink-900 transition hover:border-ink-700">
              See orders
            </Link>
          </>
        }
      />

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Active products" value={products.count ?? 0} hint="in catalog" />
        <Kpi label="Pending orders" value={ordersPending.count ?? 0} hint="awaiting confirmation" tone={(ordersPending.count ?? 0) > 0 ? 'amber' : undefined} />
        <Kpi label="Revenue · 7d" value={`Rs ${Math.round(revenueWeek).toLocaleString()}`} hint={`${week.length} orders`} tone="prime" />
        <Kpi label="Stock alerts" value={(lowStock.data?.length ?? 0) + (outStock.data?.length ?? 0)} hint={`${outStock.data?.length ?? 0} sold out · ${lowStock.data?.length ?? 0} low`} tone={(outStock.data?.length ?? 0) > 0 ? 'flash' : undefined} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Channel mix */}
        <Panel title="Channel mix · 7d">
          <ChannelBar mix={channelMix} total={week.length} />
          <div className="mt-4 flex items-center justify-between border-t border-ink-300/60 pt-3 text-xs">
            <span className="text-ink-500">Wholesale orders</span>
            <span className="font-bold text-prime-700">{wholesaleShare.toFixed(0)}%</span>
          </div>
        </Panel>

        {/* WhatsApp activity */}
        <Panel title="WhatsApp · 7d">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-4xl font-black text-prime-700">{whatsappWeek.count ?? 0}</span>
            <span className="text-xs text-ink-500">messages</span>
          </div>
          <p className="mt-2 text-xs text-ink-500">
            Inbound + outbound across the WhatsApp channel.
          </p>
          <Link href="/whatsapp" className="mt-3 inline-block text-xs font-semibold text-prime-700 underline">
            Open inbox →
          </Link>
        </Panel>

        {/* Stock alerts */}
        <Panel title="Stock alerts">
          <ul className="divide-y divide-ink-300/60 text-sm">
            {(outStock.data ?? []).map((row) => (
              <li key={row.id} className="flex items-center justify-between py-2">
                <span className="truncate">{row.name}</span>
                <span className="rounded-full bg-flash-50 px-2 py-0.5 text-[11px] font-bold text-flash-700">Sold out</span>
              </li>
            ))}
            {(lowStock.data ?? []).map((row) => (
              <li key={row.id} className="flex items-center justify-between py-2">
                <span className="truncate">{row.name}</span>
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">{row.available} left</span>
              </li>
            ))}
            {(lowStock.data?.length ?? 0) + (outStock.data?.length ?? 0) === 0 && (
              <li className="py-4 text-center text-xs text-ink-500">All stocked above threshold.</li>
            )}
          </ul>
          <Link href="/inventory" className="mt-3 inline-block text-xs font-semibold text-prime-700 underline">
            Open warehouse →
          </Link>
        </Panel>
      </div>

      {/* Recent orders */}
      <Panel className="mt-6" title="Latest orders" right={<Link href="/orders" className="text-xs font-semibold text-prime-700 underline">All orders →</Link>}>
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-ink-500">
            <tr>
              <th className="py-2 pr-4">Order</th>
              <th className="py-2 pr-4">Customer</th>
              <th className="py-2 pr-4">Channel</th>
              <th className="py-2 pr-4">Total</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">When</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-300/60">
            {(recentOrders.data ?? []).map((o) => (
              <tr key={o.id} className="hover:bg-paper-dim/40">
                <td className="py-2.5 pr-4"><Link href={`/orders/${o.id}`} className="font-mono text-xs font-bold text-prime-700 hover:underline">{o.order_number}</Link></td>
                <td className="py-2.5 pr-4 truncate max-w-[180px]">{o.customer_name ?? '—'}</td>
                <td className="py-2.5 pr-4">
                  <span className="capitalize">{o.channel}</span>
                  {o.is_wholesale && <span className="ml-1.5 rounded-full bg-prime-50 px-1.5 py-0.5 text-[10px] font-bold text-prime-700">B2B</span>}
                </td>
                <td className="py-2.5 pr-4 font-semibold tabular-nums">Rs {Number(o.subtotal_mur).toFixed(2)}</td>
                <td className="py-2.5 pr-4"><StatusPill status={o.status} /></td>
                <td className="py-2.5 pr-4 text-xs text-ink-500">{new Date(o.created_at).toLocaleString()}</td>
              </tr>
            ))}
            {(!recentOrders.data || recentOrders.data.length === 0) && (
              <tr><td colSpan={6} className="py-8 text-center text-ink-500">No orders yet.</td></tr>
            )}
          </tbody>
        </table>
      </Panel>
    </div>
  )
}

function Kpi({ label, value, hint, tone }: { label: string; value: number | string; hint?: string; tone?: 'prime' | 'flash' | 'amber' }) {
  const accent =
    tone === 'prime' ? 'border-prime-700 bg-prime-50' :
    tone === 'flash' ? 'border-flash-500 bg-flash-50' :
    tone === 'amber' ? 'border-amber-500 bg-amber-50' :
    'border-ink-300/60 bg-paper'
  const valueColor =
    tone === 'prime' ? 'text-prime-700' :
    tone === 'flash' ? 'text-flash-700' :
    tone === 'amber' ? 'text-amber-700' :
    'text-ink-900'
  return (
    <div className={`rounded-2xl border p-5 ${accent}`}>
      <div className="text-[10px] font-bold uppercase tracking-widest text-ink-500">{label}</div>
      <div className={`font-display mt-1 text-3xl font-black tabular-nums ${valueColor}`}>{value}</div>
      {hint && <div className="mt-1 text-xs text-ink-500">{hint}</div>}
    </div>
  )
}

function Panel({ title, right, children, className = '' }: { title: string; right?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-ink-300/60 bg-paper p-5 ${className}`}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-widest text-ink-500">{title}</h2>
        {right}
      </div>
      {children}
    </section>
  )
}

function ChannelBar({ mix, total }: { mix: Record<string, number>; total: number }) {
  if (total === 0) return <div className="text-xs text-ink-500">No orders this week.</div>
  const colors: Record<string, string> = { web: 'bg-prime-700', whatsapp: 'bg-mint-500', reel: 'bg-flash-500' }
  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded-full bg-ink-100">
        {Object.entries(mix).map(([ch, n]) => (
          <span key={ch} className={`h-full ${colors[ch] ?? 'bg-ink-500'}`} style={{ width: `${(n / total) * 100}%` }} title={`${ch}: ${n}`} />
        ))}
      </div>
      <ul className="mt-3 grid grid-cols-3 gap-2 text-xs">
        {(['web', 'whatsapp', 'reel'] as const).map((ch) => (
          <li key={ch}>
            <div className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${colors[ch]}`} />
              <span className="capitalize text-ink-700">{ch}</span>
            </div>
            <div className="mt-0.5 font-bold tabular-nums">{mix[ch] ?? 0}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  const tone = STATUS_TONES[status] ?? 'bg-ink-100 text-ink-700'
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold capitalize ${tone}`}>{status}</span>
}

const STATUS_TONES: Record<string, string> = {
  pending:   'bg-amber-50 text-amber-700',
  confirmed: 'bg-prime-50 text-prime-700',
  fulfilled: 'bg-mint-100 text-mint-600',
  cancelled: 'bg-ink-100 text-ink-500',
}
