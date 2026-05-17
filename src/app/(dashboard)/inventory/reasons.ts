// Plain client-safe constants. Splitting these out of `actions.ts` avoids the
// "Only async functions are allowed in 'use server' files" runtime trap that
// can surface in production with non-function exports.

export const ADJUST_REASONS = [
  { value: 'receive',          label: 'Receive shipment',     hint: 'New stock from supplier (PO arrival)' },
  { value: 'count_correction', label: 'Count correction',     hint: 'Physical count differs from system' },
  { value: 'damage',           label: 'Damage / write-off',   hint: 'Broken, expired, or unsellable' },
  { value: 'return',           label: 'Customer return',      hint: 'Returned by customer back to stock' },
  { value: 'transfer_out',     label: 'Transfer out',         hint: 'Moved to another location' },
  { value: 'other',            label: 'Other',                hint: 'Manual adjustment with note' },
] as const

export type AdjustReason = typeof ADJUST_REASONS[number]['value']
