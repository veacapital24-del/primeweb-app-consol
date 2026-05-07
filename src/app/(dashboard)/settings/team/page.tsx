import Link from 'next/link'
import { adminClient } from '@/lib/supabase'
import { RoleSelect, OptInToggle } from './RoleSelect'

export const dynamic = 'force-dynamic'

const TEAM_ROLES = ['admin', 'wholesaler', 'retailer'] as const
type TeamRole = typeof TEAM_ROLES[number]

type Profile = {
  id: string
  full_name: string | null
  phone: string | null
  shop_name: string | null
  role: 'customer' | TeamRole
  whatsapp_opt_in: boolean
  created_at: string
}

type SearchParams = { role?: 'all' | TeamRole; q?: string }

export default async function TeamPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { role = 'all', q = '' } = await searchParams
  const sb = adminClient()

  let query = sb
    .from('profiles')
    .select('*')
    .in('role', TEAM_ROLES as unknown as string[])
    .order('created_at', { ascending: false })

  if (role !== 'all') query = query.eq('role', role)
  if (q) {
    const pat = `%${q.replace(/[%_]/g, '')}%`
    query = query.or(`full_name.ilike.${pat},phone.ilike.${pat},shop_name.ilike.${pat}`)
  }

  const { data: profiles } = await query.returns<Profile[]>()

  const teamCounts = await sb.from('profiles').select('role').in('role', TEAM_ROLES as unknown as string[]).returns<Array<{ role: TeamRole }>>()
  const counts = (teamCounts.data ?? []).reduce<Record<string, number>>((acc, p) => {
    acc[p.role] = (acc[p.role] ?? 0) + 1
    acc.all = (acc.all ?? 0) + 1
    return acc
  }, { all: 0, admin: 0, wholesaler: 0, retailer: 0 })

  const tabs = (['all', 'admin', 'wholesaler', 'retailer'] as const).map((k) => ({ key: k, count: counts[k] ?? 0 }))

  const ids = (profiles ?? []).map((p) => p.id)
  const { data: orderCounts } = ids.length > 0
    ? await sb.from('orders').select('customer_id').in('customer_id', ids)
    : { data: [] as Array<{ customer_id: string | null }> }
  const orderCountMap = new Map<string, number>()
  for (const o of orderCounts ?? []) {
    if (!o.customer_id) continue
    orderCountMap.set(o.customer_id, (orderCountMap.get(o.customer_id) ?? 0) + 1)
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-black tracking-tight">Admin users</h2>
          <p className="mt-1 text-sm text-ink-500">
            Operators only — admins, wholesalers, retailers. Customer accounts live under <Link href="/customers" className="font-semibold text-prime-700 underline">Customers</Link>.
          </p>
        </div>
        <Link
          href="/settings/team/new?kind=team"
          className="rounded-xl bg-prime-700 px-4 py-2 text-sm font-bold text-paper transition hover:bg-prime-800"
        >
          + Invite teammate
        </Link>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <form className="relative flex-1 min-w-[220px] max-w-md">
          <svg className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          <input
            name="q"
            defaultValue={q}
            placeholder="Search name, phone, or shop…"
            className="w-full rounded-lg border border-ink-200 bg-paper py-1.5 pl-9 pr-3 text-sm focus:border-prime-500 focus:outline-none"
          />
          <input type="hidden" name="role" value={role} />
        </form>
        <div className="flex flex-wrap gap-1 text-xs font-semibold">
          {tabs.map((t) => {
            const active = t.key === role
            const params = new URLSearchParams()
            if (q) params.set('q', q)
            if (t.key !== 'all') params.set('role', t.key)
            const href = `/settings/team${params.toString() ? `?${params.toString()}` : ''}`
            return (
              <Link
                key={t.key}
                href={href}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 capitalize transition ${
                  active ? 'bg-ink-900 text-paper' : 'text-ink-700 hover:bg-paper-dim/60'
                }`}
              >
                {t.key} <span className={active ? 'opacity-70' : 'text-ink-500'}>{t.count}</span>
              </Link>
            )
          })}
        </div>
      </div>

      <div className="grid gap-2 text-xs sm:grid-cols-3">
        <Legend role="admin"      desc="Full access to this admin console." />
        <Legend role="wholesaler" desc="High-volume B2B. Special account terms." />
        <Legend role="retailer"   desc="Tabagie buyer — sees wholesale tier on the storefront." />
      </div>

      <div className="overflow-x-auto rounded-2xl bg-paper ring-1 ring-ink-200">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="text-left text-[11px] font-bold uppercase tracking-widest text-ink-500">
              <th className="px-5 py-2.5">Member</th>
              <th className="px-5 py-2.5">Phone / shop</th>
              <th className="px-5 py-2.5">Orders</th>
              <th className="px-5 py-2.5">Role</th>
              <th className="px-5 py-2.5">WhatsApp</th>
              <th className="px-5 py-2.5">Joined</th>
            </tr>
          </thead>
          <tbody>
            {(profiles ?? []).map((p) => (
              <tr key={p.id} className="border-t border-ink-200/60 transition hover:bg-paper-dim/40">
                <td className="px-5 py-3.5">
                  <div className="font-semibold text-ink-900">{p.full_name ?? '—'}</div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">{p.id.slice(0, 8)}</div>
                </td>
                <td className="px-5 py-3.5 text-xs">
                  {p.phone && <div className="font-mono">{p.phone}</div>}
                  {p.shop_name && <div className="text-ink-700">{p.shop_name}</div>}
                  {!p.phone && !p.shop_name && <span className="text-ink-300">—</span>}
                </td>
                <td className="px-5 py-3.5 tabular-nums">{orderCountMap.get(p.id) ?? 0}</td>
                <td className="px-5 py-3.5"><RoleSelect userId={p.id} current={p.role} /></td>
                <td className="px-5 py-3.5"><OptInToggle userId={p.id} current={p.whatsapp_opt_in} /></td>
                <td className="px-5 py-3.5 text-xs text-ink-500">{new Date(p.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {(!profiles || profiles.length === 0) && (
              <tr><td colSpan={6} className="px-5 py-12 text-center text-ink-500">
                No team members yet. Invite the first one.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Legend({ role, desc }: { role: string; desc: string }) {
  return (
    <div className="rounded-xl bg-paper p-3 ring-1 ring-ink-200">
      <div className="font-bold capitalize text-ink-900">{role}</div>
      <div className="mt-0.5 text-ink-500">{desc}</div>
    </div>
  )
}
