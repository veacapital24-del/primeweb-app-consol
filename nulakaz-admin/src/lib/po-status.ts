import type { PoStatus } from '@/lib/types'

export const PO_STATUS_LABEL: Record<PoStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  partial: 'Partial',
  received: 'Received',
  cancelled: 'Cancelled',
}

export const PO_STATUS_DETAIL_LABEL: Record<PoStatus, string> = {
  draft: 'Draft',
  sent: 'Sent to supplier',
  partial: 'Partially received',
  received: 'Fully received',
  cancelled: 'Cancelled',
}

export const PO_STATUS_STYLE: Record<PoStatus, string> = {
  draft: 'bg-ink-100 text-ink-600 ring-ink-200/60',
  sent: 'bg-prime-50 text-prime-700 ring-prime-200/80',
  partial: 'bg-amber-50 text-amber-700 ring-amber-400/40',
  received: 'bg-mint-50 text-mint-700 ring-mint-500/25',
  cancelled: 'bg-flash-50 text-flash-700 ring-flash-500/25',
}

export const PO_STATUS_ACCENT: Record<PoStatus, 'prime' | 'amber' | 'mint' | 'flash' | undefined> = {
  draft: undefined,
  sent: 'prime',
  partial: 'amber',
  received: 'mint',
  cancelled: 'flash',
}
