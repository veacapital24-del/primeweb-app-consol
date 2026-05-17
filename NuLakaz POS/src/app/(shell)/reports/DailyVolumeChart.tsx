import { InlineEmpty } from '@/components/ui'
import { fmtMur, localDateStr, toLocalDateKey } from './lib'

type DayBucket = { date: string; revenue: number; count: number }

export function DailyVolumeChart({
  sales,
  fromStr,
  toStr,
}: {
  sales: { created_at: string; total_mur: number }[]
  fromStr: string
  toStr: string
}) {
  const buckets = buildBuckets(sales, fromStr, toStr)
  const maxRevenue = Math.max(...buckets.map((b) => b.revenue), 1)

  if (buckets.every((b) => b.count === 0)) {
    return <InlineEmpty>No completed sales in this range.</InlineEmpty>
  }

  return (
    <div className="space-y-4">
      <div className="flex h-36 items-end gap-1 sm:gap-1.5">
        {buckets.map((b) => {
          const height = b.revenue > 0 ? Math.max(8, (b.revenue / maxRevenue) * 100) : 4
          const label = formatDayLabel(b.date)
          return (
            <div
              key={b.date}
              className="group flex min-w-0 flex-1 flex-col items-center gap-2"
              title={`${label}: ${fmtMur(b.revenue)} · ${b.count} sale${b.count === 1 ? '' : 's'}`}
            >
              <div className="relative flex w-full flex-1 items-end justify-center">
                <div
                  className={`w-full max-w-[2.5rem] rounded-t-lg transition-all duration-500 ${
                    b.revenue > 0
                      ? 'bg-gradient-to-t from-prime-700 to-prime-400 shadow-sm shadow-prime-900/15 group-hover:from-prime-800 group-hover:to-prime-500'
                      : 'bg-ink-200/80'
                  }`}
                  style={{ height: `${height}%` }}
                />
              </div>
              <span className="max-w-full truncate text-[9px] font-semibold uppercase tracking-wide text-ink-500 sm:text-[10px]">
                {label}
              </span>
            </div>
          )
        })}
      </div>
      <p className="text-center text-[11px] text-ink-500">
        Daily net revenue · hover bars for detail
      </p>
    </div>
  )
}

function buildBuckets(
  sales: { created_at: string; total_mur: number }[],
  fromStr: string,
  toStr: string,
): DayBucket[] {
  const map = new Map<string, DayBucket>()
  for (const s of sales) {
    const date = toLocalDateKey(s.created_at)
    const e = map.get(date) ?? { date, revenue: 0, count: 0 }
    e.revenue += Number(s.total_mur)
    e.count += 1
    map.set(date, e)
  }

  const days: DayBucket[] = []
  const start = new Date(`${fromStr}T12:00:00`)
  const end = new Date(`${toStr}T12:00:00`)
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const key = localDateStr(d)
    days.push(map.get(key) ?? { date: key, revenue: 0, count: 0 })
  }
  return days.length <= 31 ? days : days.slice(-31)
}

function formatDayLabel(dateKey: string) {
  const d = new Date(`${dateKey}T12:00:00`)
  return d.toLocaleDateString('en-MU', { day: 'numeric', month: 'short' })
}
