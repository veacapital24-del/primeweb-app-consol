import type { ReactNode } from 'react'

export type StatTone = 'default' | 'prime' | 'mint' | 'amber' | 'flash' | 'ink'

const TONE_STYLES: Record<StatTone, { border: string; bg: string; value: string }> = {
  default: { border: '', bg: 'glass-card', value: 'text-ink-900' },
  prime: { border: 'border-prime-400/50', bg: 'bg-prime-50', value: 'text-prime-700' },
  mint: { border: 'border-mint-500/30', bg: 'bg-mint-100/80', value: 'text-mint-600' },
  amber: { border: 'border-amber-500/30', bg: 'bg-amber-50', value: 'text-amber-700' },
  flash: { border: 'border-flash-500/40', bg: 'bg-flash-50', value: 'text-flash-700' },
  ink: { border: 'border-ink-300/60', bg: 'bg-paper-dim/60', value: 'text-ink-900' },
}

export function StatCard({
  label,
  value,
  hint,
  tone = 'default',
}: {
  label: string
  value: string | number
  hint?: string
  tone?: StatTone
}) {
  const t = TONE_STYLES[tone]
  const shell =
    tone === 'default'
      ? 'glass-card p-4'
      : `rounded-2xl border p-4 shadow-sm ${t.border} ${t.bg}`
  return (
    <div className={shell}>
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-500">{label}</p>
      <p className={`font-display mt-1.5 text-2xl font-black tabular-nums tracking-tight ${t.value}`}>
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-ink-500">{hint}</p> : null}
    </div>
  )
}

export function StatGrid({
  children,
  cols = 4,
}: {
  children: ReactNode
  cols?: 2 | 3 | 4 | 5
}) {
  const grid =
    cols === 5
      ? 'sm:grid-cols-2 lg:grid-cols-5'
      : cols === 3
        ? 'sm:grid-cols-2 lg:grid-cols-3'
        : cols === 2
          ? 'sm:grid-cols-2'
          : 'sm:grid-cols-2 lg:grid-cols-4'
  return <div className={'grid gap-3 ' + grid}>{children}</div>
}
