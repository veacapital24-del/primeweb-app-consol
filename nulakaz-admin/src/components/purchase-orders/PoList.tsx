import Link from 'next/link'
import type { PoStatus } from '@/lib/types'
import { PoStatusBadge } from './PoStatusBadge'

export type PoListRow = {
  id: string
  po_number: string
  status: PoStatus
  expected_date: string | null
  total_cost_mur: number
  created_at: string
  supplier_name: string | null
}

function formatMur(n: number) {
  return Number(n).toLocaleString('en-MU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-MU', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatWhen(iso: string) {
  return new Date(iso).toLocaleDateString('en-MU', { day: 'numeric', month: 'short' })
}

const DESKTOP_COLS =
  'grid grid-cols-[minmax(6rem,1fr)_minmax(7rem,1.2fr)_5.5rem_minmax(5rem,0.9fr)_minmax(5.5rem,0.85fr)_minmax(5rem,0.75fr)] items-center gap-x-3'

export function PoList({ rows }: { rows: PoListRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="glass-card px-4 py-14 text-center text-sm text-ink-500">
        No purchase orders in this view.
      </div>
    )
  }

  return (
    <>
      <ul className="space-y-2 sm:hidden">
        {rows.map((po) => (
          <li key={po.id}>
            <Link href={`/purchase-orders/${po.id}`} className="po-list-card block">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-sm font-bold text-ink-900">{po.po_number}</p>
                  <p className="mt-0.5 truncate text-xs text-ink-500">
                    {po.supplier_name ?? 'No supplier'}
                  </p>
                </div>
                <PoStatusBadge status={po.status} />
              </div>
              <div className="mt-3 flex items-center justify-between gap-2 border-t border-ink-200/50 pt-3 text-xs">
                <span className="text-ink-500">
                  {po.expected_date ? `Expected ${formatDate(po.expected_date)}` : 'No expected date'}
                </span>
                <span className="font-display font-bold tabular-nums text-ink-900">
                  Rs {formatMur(po.total_cost_mur)}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <div className="glass-card hidden min-w-0 overflow-x-auto sm:block">
        <div className="min-w-[720px]">
          <div
            className={`${DESKTOP_COLS} border-b border-ink-300/60 bg-paper-dim/60 px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-ink-500`}
          >
            <span>PO #</span>
            <span>Supplier</span>
            <span>Status</span>
            <span>Expected</span>
            <span className="text-right">Total</span>
            <span>Created</span>
          </div>
          <div className="divide-y divide-ink-300/60">
            {rows.map((po) => (
              <Link
                key={po.id}
                href={`/purchase-orders/${po.id}`}
                className={`${DESKTOP_COLS} po-list-row px-4 py-3.5 transition`}
              >
                <span className="font-mono text-sm font-bold text-ink-900">{po.po_number}</span>
                <span className="truncate text-sm text-ink-700">
                  {po.supplier_name ?? <span className="text-ink-400">—</span>}
                </span>
                <span>
                  <PoStatusBadge status={po.status} />
                </span>
                <span className="text-sm text-ink-600">{formatDate(po.expected_date)}</span>
                <span className="text-right font-semibold tabular-nums text-ink-900">
                  Rs {formatMur(po.total_cost_mur)}
                </span>
                <span className="text-sm text-ink-500">{formatWhen(po.created_at)}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
