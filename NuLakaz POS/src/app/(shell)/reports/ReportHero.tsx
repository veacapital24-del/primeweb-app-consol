import { Badge } from '@/components/ui'
import { fmtMur } from './lib'

export function ReportHero({
  revenue,
  ticketCount,
  avgTicket,
  itemsSold,
  totalDiscount,
  voidedCount,
  periodLabel,
}: {
  revenue: number
  ticketCount: number
  avgTicket: number
  itemsSold: number
  totalDiscount: number
  voidedCount: number
  periodLabel: string
}) {
  return (
    <section className="glass-card relative overflow-hidden p-5 sm:p-7">
      <div
        className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-prime-200/50 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-mint-100/60 blur-3xl"
        aria-hidden
      />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-500">Net revenue</p>
          <p className="font-display mt-1 text-4xl font-black tracking-tight text-ink-900 sm:text-5xl">
            {fmtMur(revenue)}
          </p>
          <p className="mt-2 text-sm text-ink-600">{periodLabel}</p>
          {voidedCount > 0 ? (
            <div className="mt-3">
              <Badge variant="muted">
                {voidedCount} voided or refunded in range
              </Badge>
            </div>
          ) : null}
        </div>

        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:max-w-xl lg:flex-1">
          <MetricTile label="Completed sales" value={String(ticketCount)} />
          <MetricTile label="Avg ticket" value={fmtMur(avgTicket)} mono />
          <MetricTile label="Items sold" value={String(itemsSold)} />
          <MetricTile
            label="Discounts"
            value={totalDiscount > 0 ? fmtMur(totalDiscount) : '—'}
            mono
            muted={totalDiscount <= 0}
          />
        </ul>
      </div>
    </section>
  )
}

function MetricTile({
  label,
  value,
  mono,
  muted,
}: {
  label: string
  value: string
  mono?: boolean
  muted?: boolean
}) {
  return (
    <li className="rounded-xl border border-ink-300/50 bg-paper/70 px-3 py-2.5 shadow-sm backdrop-blur-sm">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-500">{label}</p>
      <p
        className={`mt-1 truncate text-lg font-bold tracking-tight ${mono ? 'font-mono tabular-nums' : ''} ${
          muted ? 'text-ink-400' : 'text-ink-900'
        }`}
      >
        {value}
      </p>
    </li>
  )
}
