import Link from 'next/link'
import { adminClient } from '@/lib/supabase'
import { PageHeader } from '@/components/PageHeader'
import { OptInToggle } from '../users/RoleSelect'
import { PromoteButton } from './PromoteButton'

export const dynamic = 'force-dynamic'

type Customer = {
  id: string
  full_name: string | null
  phone: string | null
  shop_name: string | null
  whatsapp_opt_in: boolean
  created_at: string
}

type SearchParams = { q?: string; filter?: 'all' | 'with-orders' | 'whatsapp' | 'recent' }

export default async function CustomersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { q = '', filter = 'all' } = await searchParams
  const sb = adminClient()

  let query = sb
    .from('profiles')
    .select('id, full_name, phone, shop_name, whatsapp_opt_in, created_at')
    .eq('role', 'customer')
    .order('created_at', { ascending: false })

  if (q) {
    const pat = `%${q.replace(/[%_]/g, '')}%`
    query = query.or(`full_name.ilike.${pat},phone.ilike.${pat}`)
  }
  if (filter === 'whatsapp') query = query.eq('whatsapp_opt_in', true)
  if (filter === 'recent')   query = query.gte('created_at', new Date(Date.now() - 30 * 86400_000).toISOString())

  const { data: customers } = await query.limit(200).returns<Customer[]>()

  // Bulk order stats
  const ids = (customers ?? []).map((c) => c.id)
  const { data: orderStats } = ids.length > 0
    ? await sb
        .from('orders')
        .select('customer_id, subtotal_mur, created_at')
        .in('customer_id', ids)
    : { data: [] as Array<{ customer_id: string | null; subtotal_mur: number; created_at: string }> }

  const stats = new Map<string, { count: number; spent: number; last: string | null }>()
  for (const o of orderStats ?? []) {
    if (!o.customer_id) continue
    const cur = stats.get(o.customer_id) ?? { count: 0, spent: 0, last: null }
    cur.count += 1
    cur.spent += Number(o.subtotal_mur ?? 0)
    if (!cur.last || o.created_at > cur.last) cur.last = o.created_at
    stats.set(o.customer_id, cur)
  }

  let rows = customers ?? []
  if (filter === 'with-orders') {
    rows = rows.filter((c) => (stats.get(c.id)?.count ?? 0) > 0)
  }

  // Tab counts (unfiltered counts based on customers only)
  const allCustomers = await sb.from('profiles').select('id, whatsapp_opt_in, created_at').eq('role', 'customer').returns<Array<{ id: string; whatsapp_opt_in: boolean; created_at: string }>>()
  const total = allCustomers.data ?? []
  const tabCounts = {
    all: total.length,
    'with-orders': new Set((orderStats ?? []).map((o) => o.customer_id).filter(Boolean) as string[]).size,
    whatsapp: total.filter((c) => c.whatsapp_opt_in).length,
    recent: total.filter((c) => c.created_at >= new Date(Date.now() - 30 * 86400_000).toISOString()).length,
  }
  const tabs = (['all', 'with-orders', 'whatsapp', 'recent'] as const).map((k) => ({ key: k, count: tabCounts[k] }))

  // Headline KPIs
  const totalSpent = (orderStats ?? []).reduce((s, o) => s + Number(o.subtotal_mur ?? 0), 0)
  const totalOrders = (orderStats ?? []).length

  return (
    <div>
      <PageHeader
        title="Customers"
        subtitle="End-shopper accounts. Operators are managed under People → Team & roles."
        breadcrumbs={[{ label: 'People' }, { label: 'Customers' }]}
        actions={
          <Link href="/users/new?kind=customer" className="rounded-xl bg-prime-700 px-4 py-2 text-sm font-bold text-paper transition hover:bg-prime-800">
            + Add customer by email
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Customer accounts" value={total.length} />
        <Stat label="Lifetime orders"   value={totalOrders} />
        <Stat label="Lifetime revenue"  value={`Rs ${Math.round(totalSpent).toLocaleString()}`} tone="prime" />
      </div>

      <div className="mt-6 mb-4 flex flex-wrap items-center gap-3">
        <form className="relative flex-1 min-w-[220px] max-w-md">
          <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          <input
            name="q"
            defaultValue={q}
            placeholder="Search name or phone…"
            className="w-full rounded-lg border border-ink-300 bg-paper py-2 pl-10 pr-3 text-sm focus:border-prime-500 focus:outline-none"
          />
          <input type="hidden" name="filter" value={filter} />
        </form>
        <div className="flex flex-wrap gap-1 text-xs font-semibold">
          {tabs.map((t) => {
            const active = t.key === filter
            const params = new URLSearchParams()
            if (q) params.set('q', q)
            if (t.key !== 'all') params.set('filter', t.key)
            const href = `/customers${params.toString() ? `?${params.toString()}` : ''}`
            const labels: Record<typeof t.key, string> = {
              all: 'All',
              'with-orders': 'With orders',
              whatsapp: 'WhatsApp opt-in',
              recent: 'New · 30d',
            }
            return (
              <Link
                key={t.key}
                href={href}
                className={`rounded-full px-3 py-1.5 transition ${active ? 'bg-prime-700 text-paper' : 'bg-paper text-ink-700 hover:bg-ink-100'}`}
              >
                {labels[t.key]} <span className="opacity-60">({t.count})</span>
              </Link>
            )
          })}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-ink-300/60 bg-paper">
        <table className="w-full text-sm">
          <thead className="bg-paper-dim/60 text-left text-xs uppercase tracking-wider text-ink-500">
            <tr>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3">Lifetime spent</th>
              <th className="px-4 py-3">Last order</th>
              <th className="px-4 py-3">WhatsApp</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Promote</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-300/60">
            {rows.map((c) => {
              const s = stats.get(c.id)
              return (
                <tr key={c.id} className="hover:bg-paper-dim/40">
                  <td className="px-4 py-3">
                    <div className="font-semibold">{c.full_name ?? '—'}</div>
                    <div className="font-mono text-[11px] uppercase tracking-wider text-ink-500">{c.id.slice(0, 8)}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{c.phone ?? <span className="text-ink-300">—</span>}</td>
                  <td className="px-4 py-3 tabular-nums">{s?.count ?? 0}</td>
                  <td className="px-4 py-3 tabular-nums">{s?.spent ? `Rs ${s.spent.toFixed(2)}` : <span className="text-ink-300">—</span>}</td>
                  <td className="px-4 py-3 text-xs text-ink-500">
                    {s?.last ? new Date(s.last).toLocaleDateString() : <span className="text-ink-300">—</span>}
                  </td>
                  <td className="px-4 py-3"><OptInToggle userId={c.id} current={c.whatsapp_opt_in} /></td>
                  <td className="px-4 py-3 text-xs text-ink-500">{new Date(c.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3"><PromoteButton userId={c.id} /></td>
                </tr>
              )
            })}
            {rows.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-ink-500">
                {q ? `No customer matches "${q}".` : 'No customers in this view yet.'}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Stat({ label, value, tone }: { label: string; value: number | string; tone?: 'prime' }) {
  return (
    <div className={`rounded-2xl border p-4 ${tone === 'prime' ? 'border-prime-700 bg-prime-50' : 'border-ink-300/60 bg-paper'}`}>
      <div className="text-[10px] font-bold uppercase tracking-widest text-ink-500">{label}</div>
      <div className={`font-display mt-1 text-2xl font-black tabular-nums ${tone === 'prime' ? 'text-prime-700' : 'text-ink-900'}`}>{value}</div>
    </div>
  )
}
