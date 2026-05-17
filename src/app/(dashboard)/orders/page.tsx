import Link from 'next/link'
import { adminClient } from '@/lib/supabase'
import { PageHeader } from '@/components/PageHeader'
import type { Location } from '@/lib/types'

export const dynamic = 'force-dynamic'

// ─── Source-row shape ───────────────────────────────────────────────
// Both online orders and POS sales feed into this normalised row so the
// page renders one timeline. Differences are captured by `kind` (online
// vs pos) and the optional `location` block (only POS rows have one).

type RowKind = 'online' | 'pos'

type UnifiedRow = {
  kind: RowKind
  id: string
  number: string
  status: string
  total: number
  units: number
  is_wholesale: boolean
  customer: string | null
  phone: string | null
  channel: string // 'web' | 'whatsapp' | 'reel' | 'pos'
  created_at: string
  // POS rows carry a location reference for the colored chip + filter.
  location: Pick<Location, 'id' | 'code' | 'name' | 'kind'> | null
}

// ─── Source rows from PostgREST ────────────────────────────────────

type OnlineOrderRow = {
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

type PosSaleRow = {
  id: string
  sale_number: string
  location_id: string | null
  subtotal_mur: number
  total_mur: number
  status: string
  customer_id: string | null
  created_at: string
  locations: { id: string; code: string; name: string; kind: Location['kind'] } | null
  sale_lines: Array<{ qty: number }>
}

// Per-location tint — same palette family as /locations + /inventory so
// the visual story stays consistent across pages.
const LOCATION_KIND_TINT: Record<Location['kind'], { bg: string; fg: string }> = {
  store:     { bg: '#f5e7c4', fg: '#a98937' },
  warehouse: { bg: '#cfdfeb', fg: '#3a6f93' },
  kiosk:     { bg: '#dde7c5', fg: '#5e7f54' },
  popup:     { bg: '#e7d3da', fg: '#82445a' },
}

// Channel pill — non-POS orders. The POS pill uses the location tint
// (looked up below), so we don't list 'pos' here.
const CHANNEL_TINT: Record<string, { bg: string; fg: string; label: string }> = {
  web:      { bg: '#ecdee3', fg: '#82445a', label: 'Web' },
  whatsapp: { bg: '#dde7c5', fg: '#5e7f54', label: 'WhatsApp' },
  reel:     { bg: '#e7d3da', fg: '#82445a', label: 'Reel' },
}

type SearchParams = {
  status?: 'all' | 'pending' | 'confirmed' | 'fulfilled' | 'cancelled' | 'completed'
  // 'all' (default), 'online', 'pos', or a location UUID for POS rows at
  // that specific store.
  source?: string
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const { status = 'all', source = 'all' } = await searchParams
  const sb = adminClient()

  const showOnline = source === 'all' || source === 'online'
  const showPos = source === 'all' || source === 'pos' || isUuid(source)
  const locationFilter = isUuid(source) ? source : null

  // Pull both feeds + the location list in parallel.
  const [onlineRes, posRes, locsRes] = await Promise.all([
    showOnline
      ? sb
          .from('orders')
          .select(
            'id, order_number, channel, is_wholesale, subtotal_mur, status, customer_name, whatsapp_phone, created_at, order_items(qty)',
          )
          .order('created_at', { ascending: false })
          .returns<OnlineOrderRow[]>()
      : Promise.resolve({ data: [] as OnlineOrderRow[] }),
    showPos
      ? (() => {
          let q = sb
            .from('sales')
            .select(
              'id, sale_number, location_id, subtotal_mur, total_mur, status, customer_id, created_at, locations(id, code, name, kind), sale_lines(qty)',
            )
            .order('created_at', { ascending: false })
          if (locationFilter) q = q.eq('location_id', locationFilter)
          return q.returns<PosSaleRow[]>()
        })()
      : Promise.resolve({ data: [] as PosSaleRow[] }),
    sb
      .from('locations')
      .select('id, code, name, kind, active')
      .eq('active', true)
      .order('name', { ascending: true })
      .returns<(Pick<Location, 'id' | 'code' | 'name' | 'kind'> & { active: boolean })[]>(),
  ])

  // Normalise both into UnifiedRow.
  const online: UnifiedRow[] = (onlineRes.data ?? []).map((o) => ({
    kind: 'online',
    id: o.id,
    number: o.order_number,
    status: o.status,
    total: Number(o.subtotal_mur),
    units: o.order_items.reduce((s, i) => s + Number(i.qty), 0),
    is_wholesale: o.is_wholesale,
    customer: o.customer_name,
    phone: o.whatsapp_phone,
    channel: o.channel,
    created_at: o.created_at,
    location: null,
  }))
  const pos: UnifiedRow[] = (posRes.data ?? []).map((s) => ({
    kind: 'pos',
    id: s.id,
    number: s.sale_number,
    status: s.status,
    total: Number(s.total_mur),
    units: s.sale_lines.reduce((acc, i) => acc + Number(i.qty), 0),
    is_wholesale: false,
    customer: s.customer_id ? null /* resolved below */ : 'Walk-in',
    phone: null,
    channel: 'pos',
    created_at: s.created_at,
    location: s.locations
      ? {
          id: s.locations.id,
          code: s.locations.code,
          name: s.locations.name,
          kind: s.locations.kind,
        }
      : null,
  }))

  // Resolve POS customer names in one extra round-trip.
  const customerIds = (posRes.data ?? [])
    .map((s) => s.customer_id)
    .filter((x): x is string => Boolean(x))
  if (customerIds.length > 0) {
    const { data: profiles } = await sb
      .from('profiles')
      .select('id, full_name')
      .in('id', customerIds)
      .returns<Array<{ id: string; full_name: string | null }>>()
    const nameById = new Map(
      (profiles ?? []).map((p) => [p.id, p.full_name ?? null]),
    )
    for (const row of pos) {
      if (row.kind === 'pos' && row.customer === null) {
        const sale = (posRes.data ?? []).find((s) => s.id === row.id)
        if (sale?.customer_id) {
          row.customer = nameById.get(sale.customer_id) ?? null
        }
      }
    }
  }

  let unified = [...online, ...pos].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )

  // Status filter — applied last so the chip counts above are independent.
  if (status !== 'all') unified = unified.filter((r) => r.status === status)

  // ─── Tab counts (reflect source filter, not status) ───
  const allCounts = await Promise.all([
    sb.from('orders').select('id', { count: 'exact', head: true }),
    sb.from('sales').select('id', { count: 'exact', head: true }),
  ])
  const onlineTotal = allCounts[0].count ?? 0
  const posTotal = allCounts[1].count ?? 0

  // Per-location POS counts.
  const { data: rawByLoc } = await sb
    .from('sales')
    .select('location_id')
  const byLoc = new Map<string, number>()
  for (const r of rawByLoc ?? []) {
    if (!r.location_id) continue
    byLoc.set(r.location_id, (byLoc.get(r.location_id) ?? 0) + 1)
  }

  const STATUS_TABS = [
    'all',
    'pending',
    'confirmed',
    'fulfilled',
    'completed',
    'cancelled',
  ] as const

  const buildHref = (overrides: Partial<SearchParams>) => {
    const next = { status, source, ...overrides }
    const params = new URLSearchParams()
    if (next.status && next.status !== 'all') params.set('status', next.status)
    if (next.source && next.source !== 'all') params.set('source', next.source)
    return `/orders${params.toString() ? `?${params.toString()}` : ''}`
  }

  const sourceTabs = [
    { key: 'all',    label: 'All sources', count: onlineTotal + posTotal },
    { key: 'online', label: 'Online',      count: onlineTotal },
    { key: 'pos',    label: 'POS',         count: posTotal },
  ] as const

  return (
    <div>
      <PageHeader
        title="Orders"
        subtitle="Online + POS in one timeline. POS rows are colour-tagged by their location."
        breadcrumbs={[{ label: 'Operations' }, { label: 'Orders' }]}
        actions={
          <Link
            href="/locations"
            className="rounded-xl border border-ink-300 bg-paper px-3 py-1.5 text-xs font-bold text-ink-700 transition hover:border-prime-700 hover:text-prime-700"
          >
            Manage locations →
          </Link>
        }
      />

      {/* ─── Source filter ─────────────────────────────────────────── */}
      <div className="mb-3 rounded-2xl border border-ink-300/60 bg-paper p-3 sm:p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-[10.5px] font-bold uppercase tracking-widest text-ink-500">
            Source
          </span>
          {sourceTabs.map((t) => {
            const active = source === t.key || (t.key === 'pos' && isUuid(source))
            return (
              <Link
                key={t.key}
                href={buildHref({ source: t.key === 'all' ? undefined : t.key })}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs transition ${
                  active
                    ? 'bg-prime-700 text-paper'
                    : 'border border-ink-300 bg-paper text-ink-700 hover:border-prime-500 hover:text-prime-700'
                }`}
              >
                <span className="font-bold">{t.label}</span>
                <span className={active ? 'opacity-70' : 'text-ink-500'}>
                  {t.count}
                </span>
              </Link>
            )
          })}
          <span className="mx-1 hidden h-5 w-px bg-ink-300/60 sm:inline-block" />
          {(locsRes.data ?? []).map((l) => {
            const active = source === l.id
            const tint = LOCATION_KIND_TINT[l.kind]
            const count = byLoc.get(l.id) ?? 0
            return (
              <Link
                key={l.id}
                href={buildHref({ source: l.id })}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs transition ${
                  active
                    ? 'text-paper'
                    : 'border border-ink-300 bg-paper text-ink-700 hover:border-prime-500'
                }`}
                style={
                  active
                    ? { backgroundColor: tint.fg }
                    : undefined
                }
              >
                <span
                  aria-hidden
                  className="block w-1.5 h-1.5 rounded-full"
                  style={{
                    backgroundColor: active ? '#fff' : tint.fg,
                  }}
                />
                <span className="font-bold">{l.name}</span>
                <span className={active ? 'opacity-70 font-mono text-[10px]' : 'text-ink-500 font-mono text-[10px]'}>
                  {l.code} · {count}
                </span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* ─── Status sub-tabs ───────────────────────────────────────── */}
      <div className="mb-4 flex flex-wrap gap-1 text-xs font-semibold">
        {STATUS_TABS.map((s) => {
          const active = s === status
          return (
            <Link
              key={s}
              href={buildHref({ status: s === 'all' ? undefined : s })}
              className={`rounded-full px-3 py-1.5 capitalize transition ${
                active ? 'bg-ink-900 text-paper' : 'bg-paper text-ink-700 hover:bg-ink-100'
              }`}
            >
              {s}
            </Link>
          )
        })}
      </div>

      {/* Mobile: card list */}
      <ul className="space-y-2 sm:hidden">
        {unified.map((o) => (
          <MobileCard key={`${o.kind}-${o.id}`} row={o} />
        ))}
        {unified.length === 0 && (
          <li className="rounded-2xl border border-ink-300/60 bg-paper px-4 py-12 text-center text-sm text-ink-500">
            No orders in this view.
          </li>
        )}
      </ul>

      {/* Tablet+: table */}
      <div className="hidden overflow-x-auto rounded-2xl border border-ink-300/60 bg-paper sm:block">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-paper-dim/60 text-left text-xs uppercase tracking-wider text-ink-500">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">When</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-300/60">
            {unified.map((o) => (
              <DesktopRow key={`${o.kind}-${o.id}`} row={o} />
            ))}
            {unified.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-ink-500">
                  No orders in this view.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function isUuid(v: string | undefined): v is string {
  return !!v && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)
}

function MobileCard({ row }: { row: UnifiedRow }) {
  const linkable = row.kind === 'online'
  const Wrapper: React.ElementType = linkable ? Link : 'div'
  const href = linkable ? `/orders/${row.id}` : '#'
  const tint =
    row.kind === 'pos' && row.location
      ? LOCATION_KIND_TINT[row.location.kind]
      : null

  return (
    <li>
      <Wrapper
        {...(linkable ? { href } : {})}
        className={`flex flex-col gap-2 rounded-2xl border bg-paper p-4 transition ${
          linkable ? 'active:scale-[0.99] active:bg-paper-dim/60' : ''
        }`}
        style={{
          borderColor: tint ? `${tint.fg}55` : 'rgb(207 200 188 / .6)',
          borderLeftWidth: tint ? '3px' : '1px',
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="font-mono text-xs font-bold text-prime-700">
              {row.number}
            </div>
            <div className="mt-0.5 truncate text-sm font-semibold text-ink-900">
              {row.customer ?? '—'}
            </div>
            {row.phone && (
              <div className="font-mono text-[11px] text-ink-500">
                {row.phone}
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="font-semibold tabular-nums text-ink-900">
              Rs {row.total.toFixed(2)}
            </div>
            <div className="mt-0.5 text-[11px] text-ink-500">
              {row.units} unit{row.units > 1 ? 's' : ''}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center gap-1.5">
            <StatusPill status={row.status} />
            <SourceChip row={row} />
            {row.is_wholesale && (
              <span className="rounded-full bg-prime-50 px-1.5 py-0.5 text-[10px] font-bold text-prime-700">
                B2B
              </span>
            )}
          </div>
          <span className="text-ink-500">
            {new Date(row.created_at).toLocaleDateString()}
          </span>
        </div>
      </Wrapper>
    </li>
  )
}

function DesktopRow({ row }: { row: UnifiedRow }) {
  const tint =
    row.kind === 'pos' && row.location
      ? LOCATION_KIND_TINT[row.location.kind]
      : null
  return (
    <tr
      className="hover:bg-paper-dim/40"
      style={{
        boxShadow: tint ? `inset 3px 0 0 0 ${tint.fg}` : undefined,
      }}
    >
      <td className="px-4 py-3">
        {row.kind === 'online' ? (
          <Link
            href={`/orders/${row.id}`}
            className="font-mono text-xs font-bold text-prime-700 hover:underline"
          >
            {row.number}
          </Link>
        ) : (
          <span className="font-mono text-xs font-bold text-ink-700">
            {row.number}
          </span>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="truncate">{row.customer ?? '—'}</div>
        {row.phone && (
          <div className="font-mono text-[11px] text-ink-500">{row.phone}</div>
        )}
      </td>
      <td className="px-4 py-3 text-xs text-ink-700">
        {row.units} unit{row.units > 1 ? 's' : ''}
      </td>
      <td className="px-4 py-3">
        <SourceChip row={row} />
        {row.is_wholesale && (
          <span className="ml-1.5 rounded-full bg-prime-50 px-1.5 py-0.5 text-[10px] font-bold text-prime-700">
            B2B
          </span>
        )}
      </td>
      <td className="px-4 py-3 font-semibold tabular-nums">
        Rs {row.total.toFixed(2)}
      </td>
      <td className="px-4 py-3">
        <StatusPill status={row.status} />
      </td>
      <td className="px-4 py-3 text-xs text-ink-500">
        {new Date(row.created_at).toLocaleString()}
      </td>
    </tr>
  )
}

function SourceChip({ row }: { row: UnifiedRow }) {
  if (row.kind === 'pos' && row.location) {
    const tint = LOCATION_KIND_TINT[row.location.kind]
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest"
        style={{ backgroundColor: tint.bg, color: tint.fg }}
      >
        <span
          aria-hidden
          className="block w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: tint.fg }}
        />
        POS · {row.location.code}
      </span>
    )
  }
  if (row.kind === 'pos') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-ink-700">
        POS
      </span>
    )
  }
  const c = CHANNEL_TINT[row.channel] ?? {
    bg: '#ecdee3',
    fg: '#82445a',
    label: row.channel || 'Web',
  }
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest"
      style={{ backgroundColor: c.bg, color: c.fg }}
    >
      <span
        aria-hidden
        className="block w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: c.fg }}
      />
      {c.label}
    </span>
  )
}

function StatusPill({ status }: { status: string }) {
  const tones: Record<string, { bg: string; fg: string }> = {
    pending:   { bg: '#f5e7c4', fg: '#7a6128' },
    confirmed: { bg: '#cfdfeb', fg: '#3a6f93' },
    fulfilled: { bg: '#dde7c5', fg: '#3f6828' },
    completed: { bg: '#dde7c5', fg: '#3f6828' },
    cancelled: { bg: '#f1d9d4', fg: '#7a3026' },
    refunded:  { bg: '#ecdee3', fg: '#82445a' },
  }
  const c = tones[status] ?? { bg: '#ecdee3', fg: '#6e4252' }
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[11px] font-bold capitalize"
      style={{ backgroundColor: c.bg, color: c.fg }}
    >
      {status}
    </span>
  )
}
