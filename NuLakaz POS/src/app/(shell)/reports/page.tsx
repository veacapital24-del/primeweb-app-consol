import { Topbar } from '@/components/Topbar'
import { PageMain, Panel } from '@/components/ui'
import { adminClient } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'
import type { TenderType } from '@/lib/types'
import { DailyVolumeChart } from './DailyVolumeChart'
import { PaymentMix } from './PaymentMix'
import { RankedList, type RankedRow } from './RankedList'
import { ReportFilters } from './ReportFilters'
import { ReportHero } from './ReportHero'
import { SalesLedger } from './SalesLedger'
import { TZ_OFFSET_MS, fmtMur, formatRangeCaption } from './lib'

export const dynamic = 'force-dynamic'

type SearchParams = Promise<{ from?: string; to?: string; location?: string }>

type SaleRow = {
  id: string
  sale_number: string
  status: string
  subtotal_mur: number
  discount_mur: number
  total_mur: number
  cashier_id: string
  location_id: string
  created_at: string
  locations: { code: string; name: string } | null
}

type PaymentRow = { sale_id: string; tender: TenderType; amount_mur: number }
type LineRow = { product_id: string; sku: string; name: string; qty: number; line_total_mur: number; sale_id: string }

export default async function ReportsPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdmin()
  const sp = await searchParams

  const nowLocalMs = Date.now() + TZ_OFFSET_MS
  const todayStr = new Date(nowLocalMs).toISOString().slice(0, 10)
  const fromStr = sp.from || todayStr
  const toStr = sp.to || todayStr

  const fromIso = new Date(Date.parse(`${fromStr}T00:00:00.000Z`) - TZ_OFFSET_MS).toISOString()
  const toIso = new Date(Date.parse(`${toStr}T23:59:59.999Z`) - TZ_OFFSET_MS).toISOString()

  const admin = adminClient()

  const { data: locations } = await admin
    .from('locations')
    .select('id, code, name')
    .order('code')

  const locs = (locations ?? []) as { id: string; code: string; name: string }[]
  const activeLocId = sp.location && locs.find((l) => l.id === sp.location) ? sp.location : null
  const activeLoc = activeLocId ? locs.find((l) => l.id === activeLocId) : null

  let salesQ = admin
    .from('sales')
    .select(
      'id, sale_number, status, subtotal_mur, discount_mur, total_mur, cashier_id, location_id, created_at, locations(code, name)',
    )
    .gte('created_at', fromIso)
    .lte('created_at', toIso)
    .order('created_at', { ascending: false })
  if (activeLocId) salesQ = salesQ.eq('location_id', activeLocId)

  const { data: salesData } = await salesQ
  const allSales = (salesData ?? []) as unknown as SaleRow[]
  const completed = allSales.filter((s) => s.status === 'completed')
  const voided = allSales.filter((s) => s.status === 'voided' || s.status === 'refunded')

  const revenue = completed.reduce((s, x) => s + Number(x.total_mur), 0)
  const ticketCount = completed.length
  const avgTicket = ticketCount > 0 ? revenue / ticketCount : 0
  const totalDiscount = completed.reduce((s, x) => s + Number(x.discount_mur), 0)

  const completedIds = completed.map((s) => s.id)

  const [payRes, lineRes] =
    completedIds.length === 0
      ? [{ data: [] as PaymentRow[] }, { data: [] as LineRow[] }]
      : await Promise.all([
          admin.from('payments').select('sale_id, tender, amount_mur').in('sale_id', completedIds),
          admin
            .from('sale_lines')
            .select('product_id, sku, name, qty, line_total_mur, sale_id')
            .in('sale_id', completedIds),
        ])

  const payments = (payRes.data ?? []) as PaymentRow[]
  const lines = (lineRes.data ?? []) as LineRow[]

  const itemsSold = lines.reduce((s, l) => s + Number(l.qty), 0)

  const tenderTotals: Partial<Record<TenderType, number>> = {}
  for (const p of payments) {
    tenderTotals[p.tender] = (tenderTotals[p.tender] ?? 0) + Number(p.amount_mur)
  }
  const tenderEntries = Object.entries(tenderTotals).map(([tender, amount]) => ({
    tender: tender as TenderType,
    amount,
  }))

  const productAgg = new Map<string, { sku: string; name: string; qty: number; revenue: number }>()
  for (const l of lines) {
    const e = productAgg.get(l.product_id)
    if (e) {
      e.qty += Number(l.qty)
      e.revenue += Number(l.line_total_mur)
    } else {
      productAgg.set(l.product_id, {
        sku: l.sku,
        name: l.name,
        qty: Number(l.qty),
        revenue: Number(l.line_total_mur),
      })
    }
  }
  const topProducts = Array.from(productAgg.entries())
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 10)

  const cashierAgg = new Map<string, { count: number; revenue: number }>()
  for (const s of completed) {
    const e = cashierAgg.get(s.cashier_id) ?? { count: 0, revenue: 0 }
    e.count += 1
    e.revenue += Number(s.total_mur)
    cashierAgg.set(s.cashier_id, e)
  }

  const cashierIds = Array.from(cashierAgg.keys())

  let cashierName: (id: string) => string = (id) => id.slice(0, 8)
  if (cashierIds.length > 0) {
    const { data: profs } = await admin.from('profiles').select('id, full_name').in('id', cashierIds)
    const byProf = new Map((profs ?? []).map((p) => [p.id, p.full_name]))
    const byEmail = new Map<string, string | null>()
    try {
      const { data: page, error: listErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 })
      if (listErr) console.error('[reports] listUsers:', listErr.message)
      for (const u of page?.users ?? []) byEmail.set(u.id, u.email ?? null)
    } catch (err) {
      console.error('[reports] listUsers:', err)
    }
    cashierName = (id) => byProf.get(id) ?? byEmail.get(id) ?? id.slice(0, 8)
  }

  const cashierRows = Array.from(cashierAgg.entries())
    .map(([id, v]) => ({ id, name: cashierName(id), ...v }))
    .sort((a, b) => b.revenue - a.revenue)

  const periodLabel = formatRangeCaption(fromStr, toStr, activeLoc?.code ?? null)

  const productRows: RankedRow[] = topProducts.map(([id, p]) => ({
    id,
    title: p.name,
    subtitle: p.sku,
    primary: fmtMur(p.revenue),
    secondary: `${p.qty} units`,
    value: p.revenue,
    meta: revenue > 0 ? `${((p.revenue / revenue) * 100).toFixed(0)}% of revenue` : undefined,
  }))

  const cashierRankRows: RankedRow[] = cashierRows.map((c) => ({
    id: c.id,
    title: c.name,
    primary: fmtMur(c.revenue),
    secondary: `${c.count} sale${c.count === 1 ? '' : 's'}`,
    value: c.revenue,
    meta: revenue > 0 ? `${((c.revenue / revenue) * 100).toFixed(0)}% of revenue` : undefined,
  }))

  return (
    <>
      <Topbar
        title="Reports"
        subtitle="Sales performance, tenders, and team breakdown for your selected period."
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Reports' }]}
      />

      <PageMain spacing="loose">
        <ReportFilters
          fromStr={fromStr}
          toStr={toStr}
          activeLocId={activeLocId}
          locations={locs}
        />

        <ReportHero
          revenue={revenue}
          ticketCount={ticketCount}
          avgTicket={avgTicket}
          itemsSold={itemsSold}
          totalDiscount={totalDiscount}
          voidedCount={voided.length}
          periodLabel={periodLabel}
        />

        <div className="grid gap-6 xl:grid-cols-5">
          <Panel title="Daily volume" className="xl:col-span-3">
            <DailyVolumeChart
              sales={completed.map((s) => ({ created_at: s.created_at, total_mur: Number(s.total_mur) }))}
              fromStr={fromStr}
              toStr={toStr}
            />
          </Panel>

          <Panel title="Payment mix" className="xl:col-span-2">
            <PaymentMix entries={tenderEntries} />
          </Panel>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="Top products" right={<span className="text-[10px] font-bold uppercase tracking-wider text-ink-500">By revenue</span>}>
            <RankedList rows={productRows} emptyMessage="Nothing sold in this range." />
          </Panel>

          <Panel title="By cashier" right={<span className="text-[10px] font-bold uppercase tracking-wider text-ink-500">By revenue</span>}>
            <RankedList rows={cashierRankRows} emptyMessage="No cashier activity in this range." />
          </Panel>
        </div>

        <Panel
          title="Sales ledger"
          right={
            <span className="rounded-full bg-ink-100 px-2.5 py-0.5 text-[10px] font-bold tabular-nums text-ink-700">
              {allSales.length} total
            </span>
          }
        >
          <SalesLedger sales={allSales} totalCount={allSales.length} />
        </Panel>
      </PageMain>
    </>
  )
}
