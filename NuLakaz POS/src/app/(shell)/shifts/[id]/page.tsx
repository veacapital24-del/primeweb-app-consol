import { notFound } from 'next/navigation'
import { Topbar } from '@/components/Topbar'
import {
  Badge,
  ButtonLink,
  DataTable,
  InlineEmpty,
  Panel,
  PageMain,
  StatCard,
  StatGrid,
  TableBody,
  TableHead,
  TableHeadRow,
  TableRow,
  Td,
  TextLink,
  Th,
  saleStatusVariant,
} from '@/components/ui'
import { serverClient } from '@/lib/supabase'
import type { CashMovementKind, ShiftStatus } from '@/lib/types'
import { CloseShiftForm } from './CloseShiftForm'
import { CashMovementForm } from './CashMovementForm'

export const dynamic = 'force-dynamic'

type ShiftDetail = {
  id: string
  status: ShiftStatus
  cashier_id: string
  opened_at: string
  closed_at: string | null
  opening_float_mur: number
  closing_count_mur: number | null
  expected_cash_mur: number | null
  variance_mur: number | null
  notes: string | null
  register_id: string
  location_id: string
  registers: { code: string; name: string } | null
  locations: { code: string; name: string } | null
}

type CashMovementRow = {
  id: number
  kind: CashMovementKind
  amount_mur: number
  reason: string | null
  created_at: string
}

type SaleRow = {
  id: string
  sale_number: string
  status: string
  total_mur: number
  created_at: string
}

type PageProps = { params: Promise<{ id: string }> }

export default async function ShiftDetailPage({ params }: PageProps) {
  const { id } = await params
  const sb = await serverClient()

  const { data: shift, error } = await sb
    .from('shifts')
    .select(
      'id, status, cashier_id, opened_at, closed_at, opening_float_mur, closing_count_mur, expected_cash_mur, variance_mur, notes, register_id, location_id, registers(code, name), locations(code, name)',
    )
    .eq('id', id)
    .maybeSingle<ShiftDetail>()

  if (error || !shift) notFound()

  const [{ data: movsData }, { data: salesData }] = await Promise.all([
    sb
      .from('cash_movements')
      .select('id, kind, amount_mur, reason, created_at')
      .eq('shift_id', id)
      .order('created_at', { ascending: false }),
    sb
      .from('sales')
      .select('id, sale_number, status, total_mur, created_at')
      .eq('shift_id', id)
      .order('created_at', { ascending: false }),
  ])

  const movs = (movsData ?? []) as CashMovementRow[]
  const sales = (salesData ?? []) as SaleRow[]

  const sumKinds = (kinds: CashMovementKind[]) =>
    movs.filter((m) => kinds.includes(m.kind)).reduce((s, m) => s + Number(m.amount_mur), 0)
  const cashIn = sumKinds(['cash_in', 'paid_in'])
  const cashOut = sumKinds(['cash_out', 'paid_out', 'drop'])

  const completedSaleIds = sales.filter((s) => s.status === 'completed').map((s) => s.id)
  let cashSales = 0
  if (completedSaleIds.length > 0) {
    const { data: pays } = await sb
      .from('payments')
      .select('amount_mur')
      .eq('tender', 'cash')
      .in('sale_id', completedSaleIds)
    cashSales = (pays ?? []).reduce((s, p) => s + Number(p.amount_mur), 0)
  }

  const expected =
    Number(shift.opening_float_mur) + cashIn - cashOut + cashSales

  const totalSales = sales
    .filter((s) => s.status === 'completed')
    .reduce((s, x) => s + Number(x.total_mur), 0)

  return (
    <>
      <Topbar
        title={`${shift.registers?.code ?? '—'} · ${shift.registers?.name ?? ''}`}
        subtitle={`${shift.locations?.code ?? ''} · ${shift.locations?.name ?? ''}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Shifts', href: '/shifts' },
          { label: shift.status === 'open' ? 'Open' : 'Closed' },
        ]}
        actions={
          shift.status === 'open' ? (
            <ButtonLink href="/register">Open register →</ButtonLink>
          ) : undefined
        }
      />

      <PageMain>
        <StatGrid>
          <StatCard
            label="Status"
            value={shift.status === 'open' ? 'Open' : 'Closed'}
            tone={shift.status === 'open' ? 'mint' : 'ink'}
          />
          <StatCard label="Opening float" value={`Rs ${Number(shift.opening_float_mur).toFixed(2)}`} />
          <StatCard
            label="Cash sales"
            value={`Rs ${cashSales.toFixed(2)}`}
            hint={`${completedSaleIds.length} completed sale${completedSaleIds.length === 1 ? '' : 's'}`}
          />
          <StatCard
            label={shift.status === 'open' ? 'Expected cash' : 'Variance'}
            value={
              shift.status === 'open'
                ? `Rs ${expected.toFixed(2)}`
                : shift.variance_mur === null
                ? '—'
                : `${Number(shift.variance_mur) >= 0 ? '+' : ''}Rs ${Number(shift.variance_mur).toFixed(2)}`
            }
            tone={
              shift.status === 'open'
                ? 'prime'
                : Number(shift.variance_mur ?? 0) === 0
                ? 'ink'
                : Number(shift.variance_mur ?? 0) > 0
                ? 'mint'
                : 'flash'
            }
          />
        </StatGrid>

        <Panel title="Cash drawer">
          {shift.status === 'open' && <CashMovementForm shiftId={shift.id} />}
          {movs.length === 0 ? (
            <div className="mt-4">
              <InlineEmpty>No cash movements logged yet.</InlineEmpty>
            </div>
          ) : (
            <DataTable minWidth="600px" className="mt-4">
              <TableHead>
                <TableHeadRow>
                  <Th>When</Th>
                  <Th>Kind</Th>
                  <Th>Reason</Th>
                  <Th align="right">Amount</Th>
                </TableHeadRow>
              </TableHead>
              <TableBody>
                {movs.map((m) => (
                  <TableRow key={m.id}>
                    <Td className="text-xs text-ink-500">{new Date(m.created_at).toLocaleString()}</Td>
                    <Td>
                      <KindBadge kind={m.kind} />
                    </Td>
                    <Td className="text-ink-700">{m.reason ?? '—'}</Td>
                    <Td align="right" className="font-mono tabular-nums">
                      Rs {Number(m.amount_mur).toFixed(2)}
                    </Td>
                  </TableRow>
                ))}
              </TableBody>
            </DataTable>
          )}
        </Panel>

        <Panel
          title="Sales"
          right={
            <span className="text-xs text-ink-500">
              {sales.length} total · Rs {totalSales.toFixed(2)} completed
            </span>
          }
        >
          {sales.length === 0 ? (
            <InlineEmpty>No sales yet on this shift.</InlineEmpty>
          ) : (
            <DataTable minWidth="480px">
              <TableHead>
                <TableHeadRow>
                  <Th>When</Th>
                  <Th>Number</Th>
                  <Th>Status</Th>
                  <Th align="right">Total</Th>
                </TableHeadRow>
              </TableHead>
              <TableBody>
                {sales.map((s) => (
                  <TableRow key={s.id}>
                    <Td className="text-xs text-ink-500">{new Date(s.created_at).toLocaleString()}</Td>
                    <Td>
                      <TextLink href={`/sales/${s.id}`}>{s.sale_number}</TextLink>
                    </Td>
                    <Td>
                      <Badge variant={saleStatusVariant(s.status)}>{s.status}</Badge>
                    </Td>
                    <Td align="right" className="font-mono tabular-nums">
                      Rs {Number(s.total_mur).toFixed(2)}
                    </Td>
                  </TableRow>
                ))}
              </TableBody>
            </DataTable>
          )}
        </Panel>

        {shift.status === 'open' ? (
          <Panel title="Close shift">
            <CloseShiftForm shiftId={shift.id} expected={expected} />
          </Panel>
        ) : (
          <Panel title="Close summary">
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <Row label="Opened" value={new Date(shift.opened_at).toLocaleString()} />
              <Row label="Closed" value={shift.closed_at ? new Date(shift.closed_at).toLocaleString() : '—'} />
              <Row label="Expected cash" value={`Rs ${Number(shift.expected_cash_mur ?? 0).toFixed(2)}`} />
              <Row label="Closing count" value={`Rs ${Number(shift.closing_count_mur ?? 0).toFixed(2)}`} />
              <Row
                label="Variance"
                value={
                  shift.variance_mur === null
                    ? '—'
                    : `${Number(shift.variance_mur) >= 0 ? '+' : ''}Rs ${Number(shift.variance_mur).toFixed(2)}`
                }
              />
              {shift.notes && <Row label="Notes" value={shift.notes} />}
            </dl>
          </Panel>
        )}
      </PageMain>
    </>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-ink-300/60 py-2">
      <dt className="text-xs font-bold uppercase tracking-wider text-ink-500">{label}</dt>
      <dd className="font-mono text-sm tabular-nums">{value}</dd>
    </div>
  )
}

function KindBadge({ kind }: { kind: CashMovementKind }) {
  const map: Record<CashMovementKind, { label: string; variant: 'muted' | 'success' | 'danger' | 'warning' }> = {
    open_float: { label: 'Open', variant: 'muted' },
    close_count: { label: 'Close', variant: 'muted' },
    cash_in: { label: 'Cash in', variant: 'success' },
    cash_out: { label: 'Cash out', variant: 'danger' },
    paid_in: { label: 'Paid in', variant: 'success' },
    paid_out: { label: 'Paid out', variant: 'danger' },
    drop: { label: 'Drop', variant: 'warning' },
  }
  const m = map[kind]
  return <Badge variant={m.variant}>{m.label}</Badge>
}
