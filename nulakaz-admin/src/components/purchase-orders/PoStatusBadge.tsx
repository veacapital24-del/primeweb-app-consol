import type { PoStatus } from '@/lib/types'
import { PO_STATUS_LABEL, PO_STATUS_STYLE } from '@/lib/po-status'

export function PoStatusBadge({
  status,
  size = 'sm',
}: {
  status: PoStatus
  size?: 'sm' | 'md'
}) {
  return (
    <span
      className={`inline-flex rounded-full font-bold ring-1 ${PO_STATUS_STYLE[status]} ${
        size === 'md' ? 'px-3 py-1.5 text-xs' : 'px-2.5 py-1 text-[10px]'
      }`}
    >
      {PO_STATUS_LABEL[status]}
    </span>
  )
}
