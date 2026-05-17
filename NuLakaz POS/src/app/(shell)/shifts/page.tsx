import { Topbar } from '@/components/Topbar'
import {
  Alert,
  Badge,
  ButtonLink,
  DataTable,
  EmptyState,
  PageMain,
  PageSection,
  TableBody,
  TableHead,
  TableHeadRow,
  TableRow,
  Td,
  TextLink,
  Th,
} from '@/components/ui'
import { serverClient } from '@/lib/supabase'
import type { ShiftStatus } from '@/lib/types'

export const dynamic = 'force-dynamic'

type Row = {
  id: string
  status: ShiftStatus
  opened_at: string
  closed_at: string | null
  opening_float_mur: number
  closing_count_mur: number | null
  expected_cash_mur: number | null
  variance_mur: number | null
  cashier_id: string
  registers: { code: string; name: string } | null
  locations: { code: string; name: string } | null
}

export default async function ShiftsPage() {
  const sb = await serverClient()

  const { data: rowsData, error } = await sb
    .from('shifts')
    .select(
      'id, status, opened_at, closed_at, opening_float_mur, closing_count_mur, expected_cash_mur, variance_mur, cashier_id, registers(code, name), locations(code, name)',
    )
    .order('opened_at', { ascending: false })
    .limit(50)

  const rows = (rowsData ?? []) as unknown as Row[]
  const open = rows.filter((r) => r.status === 'open')
  const closed = rows.filter((r) => r.status === 'closed')

  return (
    <>
      <Topbar
        title="Shifts"
        subtitle="Cashier sessions — opening float, sales, closing count"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Shifts' }]}
        actions={<ButtonLink href="/shifts/open">+ Open shift</ButtonLink>}
      />

      <PageMain>
        {error ? <Alert>{error.message}</Alert> : null}

        <PageSection title="Open" count={open.length}>
          {open.length === 0 ? (
            <EmptyState
              compact
              title="No open shifts"
              description="Open a shift on a register to start selling."
              action={{ label: '+ Open shift', href: '/shifts/open' }}
            />
          ) : (
            <ShiftsTable rows={open} />
          )}
        </PageSection>

        <PageSection title="Recent closed" count={closed.length}>
          {closed.length === 0 ? (
            <EmptyState compact title="No closed shifts yet" description="Closed shifts will appear here." />
          ) : (
            <ShiftsTable rows={closed} />
          )}
        </PageSection>
      </PageMain>
    </>
  )
}

function ShiftsTable({ rows }: { rows: Row[] }) {
  return (
    <DataTable minWidth="800px">
      <TableHead>
        <TableHeadRow>
          <Th>Status</Th>
          <Th>Register</Th>
          <Th>Location</Th>
          <Th>Opened</Th>
          <Th align="right">Float</Th>
          <Th align="right">Variance</Th>
          <Th />
        </TableHeadRow>
      </TableHead>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.id}>
            <Td>
              <Badge variant={r.status === 'open' ? 'open' : 'closed'}>{r.status}</Badge>
            </Td>
            <Td>
              {r.registers ? (
                <>
                  <span className="font-mono text-xs font-bold text-prime-700">{r.registers.code}</span>
                  <span className="ml-2 font-semibold text-ink-900">{r.registers.name}</span>
                </>
              ) : (
                '—'
              )}
            </Td>
            <Td className="text-ink-700">
              {r.locations ? (
                <>
                  <span className="font-mono text-xs">{r.locations.code}</span>
                  <span className="ml-2">{r.locations.name}</span>
                </>
              ) : (
                '—'
              )}
            </Td>
            <Td className="text-xs text-ink-500">{new Date(r.opened_at).toLocaleString()}</Td>
            <Td align="right" className="tabular-nums">
              Rs {Number(r.opening_float_mur).toFixed(2)}
            </Td>
            <Td align="right" className="tabular-nums">
              {r.variance_mur === null ? (
                <span className="text-ink-500">—</span>
              ) : (
                <Variance value={Number(r.variance_mur)} />
              )}
            </Td>
            <Td align="right">
              <TextLink href={'/shifts/' + r.id}>Open →</TextLink>
            </Td>
          </TableRow>
        ))}
      </TableBody>
    </DataTable>
  )
}

function Variance({ value }: { value: number }) {
  if (value === 0) return <span className="text-ink-700">Rs 0.00</span>
  const tone = value > 0 ? 'text-mint-600' : 'text-flash-700'
  const sign = value > 0 ? '+' : ''
  return (
    <span className={'font-bold ' + tone}>
      {sign}Rs {value.toFixed(2)}
    </span>
  )
}
