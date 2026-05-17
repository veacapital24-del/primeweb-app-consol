import Link from 'next/link'
import { adminClient } from '@/lib/supabase'
import { PageHeader } from '@/components/PageHeader'
import {
  BtnPrimary,
  FilterPill,
  IconPlus,
  SearchInput,
  StatCard,
  TableHead,
  TableShell,
} from '@/components/admin/ui'
import { OptInToggle } from '../settings/team/RoleSelect'
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

  const allCustomers = await sb.from('profiles').select('id, whatsapp_opt_in, created_at').eq('role', 'customer').returns<Array<{ id: string; whatsapp_opt_in: boolean; created_at: string }>>()
  const total = allCustomers.data ?? []
  const tabCounts = {
    all: total.length,
    'with-orders': new Set((orderStats ?? []).map((o) => o.customer_id).filter(Boolean) as string[]).size,
    whatsapp: total.filter((c) => c.whatsapp_opt_in).length,
    recent: total.filter((c) => c.created_at >= new Date(Date.now() - 30 * 86400_000).toISOString()).length,
  }
  const tabs = (['all', 'with-orders', 'whatsapp', 'recent'] as const).map((k) => ({ key: k, count: tabCounts[k] }))

  const totalSpent = (orderStats ?? []).reduce((s, o) => s + Number(o.subtotal_mur ?? 0), 0)
  const totalOrders = (orderStats ?? []).length

  return (
    <div className="space-y-5">
      <PageHeader
        title="Customers"
        subtitle="End-shopper accounts. Operators are managed under Settings → Team & roles."
        breadcrumbs={[{ label: 'People' }, { label: 'Customers' }]}
        actions={
          <BtnPrimary href="/settings/team/new?kind=customer">
            <IconPlus />
            Add customer
          </BtnPrimary>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Customer accounts" value={total.length} />
        <StatCard label="Lifetime orders" value={totalOrders} />
        <StatCard label="Lifetime revenue" value={`Rs ${Math.round(totalSpent).toLocaleString()}`} accent="prime" />
      </div>

      <div className="glass-card flex flex-col gap-4 p-4 md:flex-row md:items-center md:p-5">
        <form className="relative min-w-0 flex-1" action="/customers" method="get">
          <SearchInput defaultValue={q} placeholder="Search name or phone…" hiddenFields={{ filter }} />
        </form>
        <div className="flex flex-wrap gap-1.5">
          {tabs.map((t) => {
            const active = t.key === filter
            const params = new URLSearchParams()
            if (q) params.set('q', q)
            if (t.key !== 'all') params.set('filter', t.key)
            const href = `/customers${params.toString() ? `?${params.toString()}` : ''}`
            const labels: Record<typeof t.key, string> = {
              all: 'All',
              'with-orders': 'With orders',
              whatsapp: 'WhatsApp',
              recent: 'New · 30d',
            }
            return (
              <FilterPill key={t.key} href={href} active={active} label={labels[t.key]} count={t.count} />
            )
          })}
        </div>
      </div>

      <TableShell>
          <TableHead>
            <tr>
              <th className="px-5 py-2.5">Customer</th>
              <th className="px-5 py-2.5">Phone</th>
              <th className="px-5 py-2.5">Orders</th>
              <th className="px-5 py-2.5">Lifetime</th>
              <th className="px-5 py-2.5">Last order</th>
              <th className="px-5 py-2.5">WhatsApp</th>
              <th className="px-5 py-2.5">Joined</th>
              <th className="px-5 py-2.5">Promote</th>
            </tr>
          </TableHead>
          <tbody>
            {rows.map((c) => {
              const s = stats.get(c.id)
              return (
                <tr key={c.id} className="border-t border-ink-200/60 transition hover:bg-paper-dim/40">
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-ink-900">{c.full_name ?? '—'}</div>
                    <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">{c.id.slice(0, 8)}</div>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs">{c.phone ?? <span className="text-ink-300">—</span>}</td>
                  <td className="px-5 py-3.5 tabular-nums">{s?.count ?? 0}</td>
                  <td className="px-5 py-3.5 tabular-nums">{s?.spent ? `Rs ${s.spent.toFixed(0)}` : <span className="text-ink-300">—</span>}</td>
                  <td className="px-5 py-3.5 text-xs text-ink-500">
                    {s?.last ? new Date(s.last).toLocaleDateString() : <span className="text-ink-300">—</span>}
                  </td>
                  <td className="px-5 py-3.5"><OptInToggle userId={c.id} current={c.whatsapp_opt_in} /></td>
                  <td className="px-5 py-3.5 text-xs text-ink-500">{new Date(c.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5"><PromoteButton userId={c.id} /></td>
                </tr>
              )
            })}
            {rows.length === 0 && (
              <tr><td colSpan={8} className="px-5 py-12 text-center text-ink-500">
                {q ? `No customer matches "${q}".` : 'No customers in this view yet.'}
              </td></tr>
            )}
          </tbody>
      </TableShell>
    </div>
  )
}

