const VARIANTS = {
  success: 'bg-mint-100 text-mint-600 ring-mint-500/20',
  muted: 'bg-ink-100 text-ink-700 ring-ink-300/40',
  warning: 'bg-amber-50 text-amber-700 ring-amber-500/20',
  danger: 'bg-flash-50 text-flash-700 ring-flash-500/30',
  prime: 'bg-prime-100 text-prime-700 ring-prime-300/30',
  open: 'bg-mint-100 text-mint-600 ring-mint-500/20',
  closed: 'bg-ink-100 text-ink-700 ring-ink-300/40',
} as const

export type BadgeVariant = keyof typeof VARIANTS

export function Badge({
  children,
  variant = 'muted',
  className = '',
}: {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}) {
  return (
    <span
      className={
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize ring-1 ' +
        VARIANTS[variant] +
        ' ' +
        className
      }
    >
      {children}
    </span>
  )
}

export function saleStatusVariant(status: string): BadgeVariant {
  if (status === 'completed') return 'success'
  if (status === 'draft') return 'warning'
  if (status === 'voided') return 'muted'
  if (status === 'refunded' || status === 'partial_refund') return 'danger'
  return 'muted'
}
