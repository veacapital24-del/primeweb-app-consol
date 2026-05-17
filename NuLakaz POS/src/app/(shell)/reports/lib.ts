import type { TenderType } from '@/lib/types'

export const TZ_OFFSET_MS = 4 * 60 * 60 * 1000

export const TENDER_LABEL: Record<TenderType, string> = {
  cash: 'Cash',
  card: 'Card',
  mobile_money: 'Mobile money',
  store_credit: 'Store credit',
  voucher: 'Voucher',
  bank_transfer: 'Bank transfer',
}

export const TENDER_COLOR: Record<TenderType, string> = {
  cash: 'bg-prime-700',
  card: 'bg-flash-500',
  mobile_money: 'bg-mint-500',
  store_credit: 'bg-amber-500',
  voucher: 'bg-ink-700',
  bank_transfer: 'bg-prime-400',
}

export const TENDER_RING: Record<TenderType, string> = {
  cash: 'ring-prime-300',
  card: 'ring-flash-500/40',
  mobile_money: 'ring-mint-500/40',
  store_credit: 'ring-amber-500/40',
  voucher: 'ring-ink-300',
  bank_transfer: 'ring-prime-300',
}

export function fmtMur(n: number) {
  return `Rs ${n.toLocaleString('en-MU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function localDateStr(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function toLocalDateKey(iso: string) {
  return new Date(new Date(iso).getTime() + TZ_OFFSET_MS).toISOString().slice(0, 10)
}

export function formatRangeCaption(fromStr: string, toStr: string, locationLabel?: string | null) {
  const range =
    fromStr === toStr
      ? new Date(`${fromStr}T12:00:00`).toLocaleDateString('en-MU', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : `${fromStr} → ${toStr}`
  return locationLabel ? `${range} · ${locationLabel}` : range
}
