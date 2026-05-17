import Link from 'next/link'
import { adminClient } from '@/lib/supabase'
import { PageHeader } from '@/components/PageHeader'
import { OrdersList, type OrderListRow } from '@/components/orders/OrdersList'
import { orderStatusLabel } from '@/lib/order-status'
import type { Location } from '@/lib/types'

export const dynamic = 'force-dynamic'

// ─── Source-row shape ───────────────────────────────────────────────
// Both online orders and POS sales feed into this normalised row so the
// page renders one timeline. Differences are captured by `kind` (online
// vs pos) and the optional `location` block (only POS rows have one).

type RowKind = 'online' | 'pos'

type UnifiedRow = OrderListRow

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

type SearchParams = {
  status?:
    | 'all'
    | 'pending'
    | 'confirmed'
    | 'packing'
    | 'packed'
    | 'delivery_in_progress'
    | 'delivered'
    | 'completed'
    | 'cancelled'
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
    'packing',
    'packed',
    'delivery_in_progress',
    'delivered',
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
    <div className="space-y-6">
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
      <div className="glass-card p-3 sm:p-4">
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
      <div className="glass-card flex flex-wrap gap-1.5 p-3 text-xs font-semibold">
        {STATUS_TABS.map((s) => {
          const active = s === status
          return (
            <Link
              key={s}
              href={buildHref({ status: s === 'all' ? undefined : s })}
              className={`rounded-full px-3 py-1.5 transition ${
                active ? 'bg-ink-900 text-paper' : 'bg-paper text-ink-700 hover:bg-ink-100'
              }`}
            >
              {s === 'all' ? 'All' : orderStatusLabel(s)}
            </Link>
          )
        })}
      </div>

      <OrdersList rows={unified} />
    </div>
  )
}

function isUuid(v: string | undefined): v is string {
  return !!v && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)
}
