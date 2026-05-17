/** Online order fulfilment pipeline (DB `orders.status`). */

export const ORDER_FULFILLMENT_STEPS = [
  { key: 'pending', label: 'Pending', short: 'Pending' },
  { key: 'confirmed', label: 'Confirmed', short: 'Confirmed' },
  { key: 'packing', label: 'Packing in progress', short: 'Packing' },
  { key: 'packed', label: 'Packed · ready to ship', short: 'Packed' },
  {
    key: 'delivery_in_progress',
    label: 'Delivery in progress',
    short: 'Out for delivery',
  },
  { key: 'delivered', label: 'Delivered', short: 'Delivered' },
  { key: 'completed', label: 'Complete', short: 'Complete' },
] as const

export type OrderFulfillmentStatus = (typeof ORDER_FULFILLMENT_STEPS)[number]['key']

export const ORDER_STATUSES = [
  ...ORDER_FULFILLMENT_STEPS.map((s) => s.key),
  'cancelled',
] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]

/** Legacy DB value from before the fulfilment expansion. */
export function normalizeOrderStatus(status: string): OrderStatus {
  if (status === 'fulfilled') return 'completed'
  return status as OrderStatus
}

export function orderStatusLabel(status: string): string {
  const key = normalizeOrderStatus(status)
  if (key === 'cancelled') return 'Cancelled'
  const step = ORDER_FULFILLMENT_STEPS.find((s) => s.key === key)
  return step?.label ?? status.replace(/_/g, ' ')
}

export function orderStatusStepIndex(status: string): number {
  const key = normalizeOrderStatus(status)
  if (key === 'cancelled') return -1
  return ORDER_FULFILLMENT_STEPS.findIndex((s) => s.key === key)
}

export function getNextOrderStatus(
  status: string,
): OrderFulfillmentStatus | null {
  const key = normalizeOrderStatus(status)
  if (key === 'cancelled' || key === 'completed') return null
  const idx = ORDER_FULFILLMENT_STEPS.findIndex((s) => s.key === key)
  if (idx < 0 || idx >= ORDER_FULFILLMENT_STEPS.length - 1) return null
  return ORDER_FULFILLMENT_STEPS[idx + 1].key
}

export function proceedButtonLabel(next: OrderFulfillmentStatus): string {
  const step = ORDER_FULFILLMENT_STEPS.find((s) => s.key === next)
  if (!step) return 'Proceed order'
  if (next === 'confirmed') return 'Proceed — Confirm order'
  if (next === 'completed') return 'Proceed — Mark complete'
  return `Proceed — ${step.short}`
}

export const ORDER_STATUS_TONES: Record<
  string,
  { bg: string; fg: string; ring: string }
> = {
  pending: { bg: '#f5e7c4', fg: '#7a6128', ring: 'ring-amber-400/35' },
  confirmed: { bg: '#cfdfeb', fg: '#3a6f93', ring: 'ring-prime-300/50' },
  packing: { bg: '#e7d3da', fg: '#82445a', ring: 'ring-prime-400/40' },
  packed: { bg: '#ecdee3', fg: '#6e4252', ring: 'ring-prime-300/40' },
  delivery_in_progress: { bg: '#dde7c5', fg: '#3f6828', ring: 'ring-mint-400/35' },
  delivered: { bg: '#c5e0d4', fg: '#2d5c40', ring: 'ring-mint-500/35' },
  completed: { bg: '#dde7c5', fg: '#3f6828', ring: 'ring-mint-500/30' },
  fulfilled: { bg: '#dde7c5', fg: '#3f6828', ring: 'ring-mint-500/30' },
  cancelled: { bg: '#f1d9d4', fg: '#7a3026', ring: 'ring-flash-500/30' },
}

export const ORDER_LIST_STATUS_TABS = [
  'all',
  'pending',
  'confirmed',
  'packing',
  'packed',
  'delivery_in_progress',
  'delivered',
  'completed',
  'cancelled',
] as const

/** True when printing the packing slip should advance confirmed → packing. */
export function canConfirmPackingFromPrint(status: string): boolean {
  return normalizeOrderStatus(status) === 'confirmed'
}
