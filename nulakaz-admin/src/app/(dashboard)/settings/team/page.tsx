import Link from 'next/link'
import { adminClient } from '@/lib/supabase'
import { SettingsFilterTabs } from '../SettingsShell'
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

  const tabs = (['all', 'admin', 'wholesaler', 'retailer'] as const).map((k) => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (k !== 'all') params.set('role', k)
    const qs = params.toString()
    return {
      key: k,
      label: k === 'all' ? 'All' : k,
      count: counts[k] ?? 0,
      href: `/settings/team${qs ? `?${qs}` : ''}`,
    }
  })

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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-lg text-sm text-ink-500">
          Operators only. Customer accounts live under{' '}
          <Link href="/customers" className="font-semibold text-prime-700 hover:underline">Customers</Link>.
        </p>
        <Link href="/settings/team/new?kind=team" className="settings-form-submit shrink-0">
          + Invite teammate
        </Link>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
        <form className="settings-search">
          <svg className="settings-search-icon h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" strokeLinecap="round" />
          </svg>
          <input name="q" defaultValue={q} placeholder="Search name, phone, or shop…" />
          <input type="hidden" name="role" value={role} />
        </form>
        <SettingsFilterTabs tabs={tabs} activeKey={role} />
      </div>

      <div className="settings-role-legend">
        <Legend role="admin"      desc="Full access to this admin console." />
        <Legend role="wholesaler" desc="High-volume B2B. Special account terms." />
        <Legend role="retailer"   desc="Tabagie buyer — sees wholesale tier on the storefront." />
      </div>

      {/* Mobile: card list */}
      <ul className="space-y-2 sm:hidden">
        {(profiles ?? []).map((p) => (
          <li key={p.id} className="settings-panel p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate font-semibold text-ink-900">{p.full_name ?? '—'}</div>
                {p.phone && <div className="font-mono text-xs text-ink-700">{p.phone}</div>}
                {p.shop_name && <div className="truncate text-xs text-ink-700">{p.shop_name}</div>}
              </div>
              <div className="text-right text-[11px] text-ink-500">
                <div className="font-bold tabular-nums text-ink-900">{orderCountMap.get(p.id) ?? 0}</div>
                <div>orders</div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-[1fr_auto] items-center gap-2">
              <RoleSelect userId={p.id} current={p.role} teamOnly />
              <OptInToggle userId={p.id} current={p.whatsapp_opt_in} />
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <span className="text-[11px] text-ink-500">
                Joined {new Date(p.created_at).toLocaleDateString()}
              </span>
              <Link
                href={`/settings/team/${p.id}`}
                className="rounded-lg bg-prime-50 px-3 py-1.5 text-xs font-bold text-prime-700 ring-1 ring-prime-200/80 transition hover:bg-prime-100"
              >
                Edit
              </Link>
            </div>
          </li>
        ))}
        {(!profiles || profiles.length === 0) && (
          <li className="rounded-2xl bg-paper px-4 py-12 text-center text-sm text-ink-500 ring-1 ring-ink-200">
            No team members yet. Invite the first one.
          </li>
        )}
      </ul>

      {/* Tablet+: table */}
      <div className="settings-panel hidden overflow-x-auto sm:block">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="text-left text-[11px] font-bold uppercase tracking-widest text-ink-500">
              <th className="px-5 py-2.5">Member</th>
              <th className="px-5 py-2.5">Phone / shop</th>
              <th className="px-5 py-2.5">Orders</th>
              <th className="px-5 py-2.5">Role</th>
              <th className="px-5 py-2.5">WhatsApp</th>
              <th className="px-5 py-2.5">Joined</th>
              <th className="px-5 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {(profiles ?? []).map((p) => (
              <tr key={p.id} className="border-t border-ink-200/60 transition hover:bg-paper-dim/40">
                <td className="px-5 py-3.5">
                  <Link
                    href={`/settings/team/${p.id}`}
                    className="font-semibold text-ink-900 transition hover:text-prime-700 hover:underline"
                  >
                    {p.full_name ?? '—'}
                  </Link>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">{p.id.slice(0, 8)}</div>
                </td>
                <td className="px-5 py-3.5 text-xs">
                  {p.phone && <div className="font-mono">{p.phone}</div>}
                  {p.shop_name && <div className="text-ink-700">{p.shop_name}</div>}
                  {!p.phone && !p.shop_name && <span className="text-ink-300">—</span>}
                </td>
                <td className="px-5 py-3.5 tabular-nums">{orderCountMap.get(p.id) ?? 0}</td>
                <td className="px-5 py-3.5"><RoleSelect userId={p.id} current={p.role} teamOnly /></td>
                <td className="px-5 py-3.5"><OptInToggle userId={p.id} current={p.whatsapp_opt_in} /></td>
                <td className="px-5 py-3.5 text-xs text-ink-500">{new Date(p.created_at).toLocaleDateString()}</td>
                <td className="px-5 py-3.5">
                  <Link
                    href={`/settings/team/${p.id}`}
                    className="rounded-lg bg-prime-50 px-3 py-1.5 text-xs font-bold text-prime-700 ring-1 ring-prime-200/80 transition hover:bg-prime-100"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {(!profiles || profiles.length === 0) && (
              <tr><td colSpan={7} className="px-5 py-12 text-center text-ink-500">
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
    <div className="settings-role-legend-item">
      <div className="font-bold capitalize text-ink-900">{role}</div>
      <div className="mt-0.5 text-ink-500">{desc}</div>
    </div>
  )
}
