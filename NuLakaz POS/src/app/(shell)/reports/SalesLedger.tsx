import {
  Badge,
  DataTable,
  InlineEmpty,
  TableBody,
  TableHead,
  TableHeadRow,
  TableRow,
  Td,
  TextLink,
  Th,
  saleStatusVariant,
} from '@/components/ui'
import { fmtMur } from './lib'

type SaleRow = {
  id: string
  sale_number: string
  status: string
  total_mur: number
  created_at: string
  locations: { code: string; name: string } | null
}

export function SalesLedger({ sales, totalCount }: { sales: SaleRow[]; totalCount: number }) {
  if (sales.length === 0) {
    return <InlineEmpty>No sales in this range.</InlineEmpty>
  }

  const shown = sales.slice(0, 100)

  return (
    <>
      <DataTable minWidth="640px">
        <TableHead>
          <TableHeadRow>
            <Th>When</Th>
            <Th>Sale</Th>
            <Th>Location</Th>
            <Th>Status</Th>
            <Th align="right">Total</Th>
          </TableHeadRow>
        </TableHead>
        <TableBody>
          {shown.map((s) => (
            <TableRow key={s.id}>
              <Td className="whitespace-nowrap">
                <time dateTime={s.created_at} className="block text-xs font-medium text-ink-700">
                  {formatWhen(s.created_at)}
                </time>
                <span className="text-[10px] text-ink-500">{formatRelative(s.created_at)}</span>
              </Td>
              <Td>
                <TextLink href={`/sales/${s.id}`}>{s.sale_number}</TextLink>
              </Td>
              <Td>
                {s.locations ? (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-ink-100/80 px-2 py-0.5 text-xs">
                    <span className="font-mono font-bold text-prime-800">{s.locations.code}</span>
                    <span className="hidden truncate text-ink-600 sm:inline">{s.locations.name}</span>
                  </span>
                ) : (
                  <span className="text-ink-400">—</span>
                )}
              </Td>
              <Td>
                <Badge variant={saleStatusVariant(s.status)}>{s.status}</Badge>
              </Td>
              <Td align="right" className="font-mono text-sm font-bold tabular-nums text-ink-900">
                {fmtMur(Number(s.total_mur))}
              </Td>
            </TableRow>
          ))}
        </TableBody>
      </DataTable>
      {totalCount > 100 ? (
        <p className="mt-3 rounded-lg border border-ink-300/40 bg-paper-dim/50 px-3 py-2 text-center text-xs text-ink-600">
          Showing first <strong>100</strong> of <strong>{totalCount}</strong> sales — narrow the date range to see more.
        </p>
      ) : null}
    </>
  )
}

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString('en-MU', {
    timeZone: 'Indian/Mauritius',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatRelative(iso: string) {
  const ms = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(ms / 60_000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}
