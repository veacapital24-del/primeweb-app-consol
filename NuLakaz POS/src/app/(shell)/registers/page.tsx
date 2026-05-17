import { Topbar } from '@/components/Topbar'
import { Alert, EmptyState, PageMain } from '@/components/ui'
import { adminClient } from '@/lib/supabase'
import { RegistersBoard, type RegisterItem } from './RegistersBoard'

export const dynamic = 'force-dynamic'

type SearchParams = Promise<{ location?: string }>

type RegRow = {
  id: string
  code: string
  name: string
  active: boolean
  location_id: string
  locations: { code: string; name: string } | null
}

type ShiftRow = {
  id: string
  register_id: string
  cashier_id: string
  opened_at: string
}

type SaleRow = {
  register_id: string
  total_mur: number
}

type LineRow = { sale_id: string; qty: number }

const TZ_OFFSET_MS = 4 * 60 * 60 * 1000

export default async function RegistersPage({ searchParams }: { searchParams: SearchParams }) {
  const { location } = await searchParams
  const admin = adminClient()

  const { data: locationsData } = await admin
    .from('locations')
    .select('id, code, name')
    .order('code')

  const locations = (locationsData ?? []) as { id: string; code: string; name: string }[]
  const activeLocId =
    location && locations.find((l) => l.id === location) ? location : null

  const nowLocalMs = Date.now() + TZ_OFFSET_MS
  const todayStr = new Date(nowLocalMs).toISOString().slice(0, 10)
  const fromIso = new Date(Date.parse(`${todayStr}T00:00:00.000Z`) - TZ_OFFSET_MS).toISOString()
  const toIso = new Date(Date.parse(`${todayStr}T23:59:59.999Z`) - TZ_OFFSET_MS).toISOString()

  let regQ = admin
    .from('registers')
    .select('id, code, name, active, location_id, locations(code, name)')
    .order('code')
  if (activeLocId) regQ = regQ.eq('location_id', activeLocId)

  const [{ data: regData, error: regErr }, { data: openShifts }, { data: salesToday }] =
    await Promise.all([
      regQ,
      admin.from('shifts').select('id, register_id, cashier_id, opened_at').eq('status', 'open'),
      admin
        .from('sales')
        .select('id, register_id, total_mur')
        .eq('status', 'completed')
        .gte('created_at', fromIso)
        .lte('created_at', toIso),
    ])

  const regs = (regData ?? []) as unknown as RegRow[]
  const shifts = (openShifts ?? []) as ShiftRow[]
  const sales = (salesToday ?? []) as (SaleRow & { id: string })[]

  const cashierIds = Array.from(new Set(shifts.map((s) => s.cashier_id)))
  let cashierName: (id: string) => string = (id) => id.slice(0, 8)
  if (cashierIds.length > 0) {
    const [{ data: profs }, { data: usersPage }] = await Promise.all([
      admin.from('profiles').select('id, full_name').in('id', cashierIds),
      admin.auth.admin.listUsers({ page: 1, perPage: 200 }),
    ])
    const byProf = new Map((profs ?? []).map((p) => [p.id, p.full_name as string | null]))
    const byEmail = new Map((usersPage?.users ?? []).map((u) => [u.id, u.email ?? null]))
    cashierName = (id) => byProf.get(id) ?? byEmail.get(id) ?? id.slice(0, 8)
  }

  const salesByRegister = new Map<string, { count: number; revenue: number }>()
  for (const s of sales) {
    const e = salesByRegister.get(s.register_id) ?? { count: 0, revenue: 0 }
    e.count += 1
    e.revenue += Number(s.total_mur)
    salesByRegister.set(s.register_id, e)
  }

  const saleIds = sales.map((s) => s.id)
  const unitsByRegister = new Map<string, number>()
  if (saleIds.length > 0) {
    const { data: linesData } = await admin
      .from('sale_lines')
      .select('sale_id, qty')
      .in('sale_id', saleIds)
    const saleToReg = new Map(sales.map((s) => [s.id, s.register_id]))
    for (const l of (linesData ?? []) as LineRow[]) {
      const reg = saleToReg.get(l.sale_id)
      if (!reg) continue
      unitsByRegister.set(reg, (unitsByRegister.get(reg) ?? 0) + Number(l.qty))
    }
  }

  const shiftByRegister = new Map<string, ShiftRow>()
  for (const sh of shifts) shiftByRegister.set(sh.register_id, sh)

  const items: RegisterItem[] = regs.map((r) => {
    const sh = shiftByRegister.get(r.id)
    const stats = salesByRegister.get(r.id) ?? { count: 0, revenue: 0 }
    return {
      id: r.id,
      code: r.code,
      name: r.name,
      active: r.active,
      location_id: r.location_id,
      location_code: r.locations?.code ?? '—',
      location_name: r.locations?.name ?? '—',
      open_shift_id: sh?.id ?? null,
      open_shift_started_at: sh?.opened_at ?? null,
      open_shift_cashier: sh ? cashierName(sh.cashier_id) : null,
      today_sales: stats.count,
      today_revenue: stats.revenue,
      today_units: unitsByRegister.get(r.id) ?? 0,
    }
  })

  return (
    <>
      <Topbar
        title="Registers"
        subtitle="POS terminals · live sessions and today's activity"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Registers' }]}
      />

      <PageMain>
        {regErr ? <Alert>{regErr.message}</Alert> : null}

        {locations.length === 0 ? (
          <EmptyState
            title="Add a location first"
            description="Each register lives at a physical location."
            action={{ label: '+ New location', href: '/locations/new' }}
          />
        ) : items.length === 0 && !activeLocId ? (
          <EmptyState
            title="No registers yet"
            description="A register is one POS terminal at a location."
            action={{ label: '+ Create register', href: '/registers/new' }}
          />
        ) : (
          <RegistersBoard items={items} locations={locations} activeLocationId={activeLocId} />
        )}
      </PageMain>
    </>
  )
}
