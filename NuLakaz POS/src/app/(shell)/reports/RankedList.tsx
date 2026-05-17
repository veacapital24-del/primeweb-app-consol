import { InlineEmpty } from '@/components/ui'

export type RankedRow = {
  id: string
  title: string
  subtitle?: string
  primary: string
  secondary?: string
  value: number
  meta?: string
}

export function RankedList({
  rows,
  valueLabel = 'Revenue',
  emptyMessage,
}: {
  rows: RankedRow[]
  valueLabel?: string
  emptyMessage: string
}) {
  if (rows.length === 0) {
    return <InlineEmpty>{emptyMessage}</InlineEmpty>
  }

  const max = Math.max(...rows.map((r) => r.value), 1)

  return (
    <ol className="space-y-2">
      {rows.map((row, i) => {
        const pct = (row.value / max) * 100
        return (
          <li
            key={row.id}
            className="group rounded-xl border border-ink-300/40 bg-paper/60 p-3 transition hover:border-prime-300/60 hover:bg-prime-50/30"
          >
            <div className="flex items-start gap-3">
              <RankBadge rank={i + 1} />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink-900">{row.title}</p>
                    {row.subtitle ? (
                      <p className="truncate font-mono text-[11px] text-ink-500">{row.subtitle}</p>
                    ) : null}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-mono text-sm font-bold tabular-nums text-prime-800">{row.primary}</p>
                    {row.secondary ? (
                      <p className="text-[11px] font-medium text-ink-500">{row.secondary}</p>
                    ) : null}
                  </div>
                </div>
                <div className="mt-2.5">
                  <div className="mb-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-ink-500">
                    <span>{valueLabel}</span>
                    {row.meta ? <span>{row.meta}</span> : null}
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-ink-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-prime-600 to-prime-400 transition-all duration-700 group-hover:from-prime-700 group-hover:to-prime-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

function RankBadge({ rank }: { rank: number }) {
  const medal =
    rank === 1
      ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-paper shadow-amber-700/25'
      : rank === 2
        ? 'bg-gradient-to-br from-ink-300 to-ink-500 text-paper'
        : rank === 3
          ? 'bg-gradient-to-br from-flash-500/90 to-flash-700 text-paper'
          : 'bg-paper-dim text-ink-600 ring-1 ring-ink-300/60'

  return (
    <span
      className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-black shadow-sm ${medal}`}
      aria-label={`Rank ${rank}`}
    >
      {rank}
    </span>
  )
}
