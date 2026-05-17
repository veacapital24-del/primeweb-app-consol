import { InlineEmpty } from '@/components/ui'
import type { TenderType } from '@/lib/types'
import { fmtMur, TENDER_COLOR, TENDER_LABEL, TENDER_RING } from './lib'

export function PaymentMix({
  entries,
}: {
  entries: { tender: TenderType; amount: number }[]
}) {
  const sorted = [...entries].sort((a, b) => b.amount - a.amount)
  const total = sorted.reduce((s, e) => s + e.amount, 0)

  if (sorted.length === 0 || total <= 0) {
    return <InlineEmpty>No payments recorded in this range.</InlineEmpty>
  }

  const conic = sorted
    .reduce(
      (acc, e) => {
        const pct = (e.amount / total) * 100
        const next = acc.cursor + pct
        const slice = `${colorToken(e.tender)} ${acc.cursor}% ${next}%`
        acc.cursor = next
        acc.stops.push(slice)
        return acc
      },
      { cursor: 0, stops: [] as string[] },
    )
    .stops.join(', ')

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,11rem)_1fr] lg:items-center">
      <div className="mx-auto flex flex-col items-center gap-3">
        <div
          className="relative grid h-36 w-36 place-items-center rounded-full shadow-inner shadow-ink-900/5 ring-1 ring-ink-300/40"
          style={{ background: `conic-gradient(${conic})` }}
        >
          <div className="grid h-[4.5rem] w-[4.5rem] place-items-center rounded-full bg-paper text-center shadow-sm ring-1 ring-ink-200/60">
            <span className="text-[9px] font-bold uppercase tracking-wider text-ink-500">Total</span>
            <span className="font-mono text-xs font-bold tabular-nums text-ink-900">{fmtMur(total)}</span>
          </div>
        </div>
        <p className="text-center text-[11px] text-ink-500">{sorted.length} tender type{sorted.length === 1 ? '' : 's'}</p>
      </div>

      <ul className="space-y-2">
        {sorted.map((e) => {
          const pct = (e.amount / total) * 100
          return (
            <li
              key={e.tender}
              className={`rounded-xl border border-ink-300/50 bg-paper/80 p-3 shadow-sm ring-1 ${TENDER_RING[e.tender]}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className={`h-3 w-3 shrink-0 rounded-full ${TENDER_COLOR[e.tender]}`} />
                  <span className="truncate text-sm font-semibold text-ink-900">{TENDER_LABEL[e.tender]}</span>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-mono text-sm font-bold tabular-nums text-ink-900">{fmtMur(e.amount)}</p>
                  <p className="text-[11px] font-medium text-ink-500">{pct.toFixed(1)}%</p>
                </div>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-100">
                <div
                  className={`h-full rounded-full ${TENDER_COLOR[e.tender]} transition-all duration-700`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function colorToken(tender: TenderType): string {
  const map: Record<TenderType, string> = {
    cash: 'var(--color-prime-700)',
    card: 'var(--color-flash-500)',
    mobile_money: 'var(--color-mint-500)',
    store_credit: 'var(--color-amber-500)',
    voucher: 'var(--color-ink-700)',
    bank_transfer: 'var(--color-prime-400)',
  }
  return map[tender]
}
