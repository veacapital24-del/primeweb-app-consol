// POS domain types.
// These describe the entities that only exist in the POS module:
// physical locations, registers, cashier shifts, sales, payments,
// cash drawer movements, and stock movements.

export type LocationKind = 'store' | 'warehouse' | 'kiosk' | 'popup'

export type Location = {
  id: string
  code: string                // short human ref, e.g. "PV-01"
  name: string
  kind: LocationKind
  address: string | null
  phone: string | null
  timezone: string            // IANA, e.g. "Indian/Mauritius"
  currency: string            // ISO 4217, e.g. "MUR"
  active: boolean
  created_at: string
}

export type Register = {
  id: string
  location_id: string
  code: string                // e.g. "REG-1"
  name: string
  active: boolean
}

export type ShiftStatus = 'open' | 'closed'

export type Shift = {
  id: string
  register_id: string
  location_id: string
  cashier_id: string          // profiles.id
  opened_at: string
  closed_at: string | null
  opening_float_mur: number
  closing_count_mur: number | null
  expected_cash_mur: number | null
  variance_mur: number | null
  status: ShiftStatus
  notes: string | null
}

export type SaleStatus = 'draft' | 'completed' | 'voided' | 'refunded' | 'partial_refund'

export type Sale = {
  id: string
  sale_number: string         // human-readable, location-prefixed
  shift_id: string
  register_id: string
  location_id: string
  cashier_id: string
  customer_id: string | null
  subtotal_mur: number
  discount_mur: number
  tax_mur: number
  total_mur: number
  status: SaleStatus
  notes: string | null
  created_at: string
  completed_at: string | null
  // Offline reconciliation
  client_uuid: string         // generated on the device, idempotency key
  synced_at: string | null
}

export type SaleLine = {
  id: string
  sale_id: string
  product_id: string
  sku: string
  name: string                // captured at sale time
  qty: number
  unit_price_mur: number       // at sale time
  unit_cost_mur: number | null // for margin reporting
  line_discount_mur: number
  line_tax_mur: number
  line_total_mur: number
}

export type TenderType =
  | 'cash'
  | 'card'
  | 'mobile_money'
  | 'store_credit'
  | 'voucher'
  | 'bank_transfer'

export type Payment = {
  id: string
  sale_id: string
  tender: TenderType
  amount_mur: number
  reference: string | null    // last-4, MoMo ref, etc. (manual entry only)
  created_at: string
}

export type CashMovementKind =
  | 'open_float'
  | 'close_count'
  | 'cash_in'
  | 'cash_out'
  | 'paid_in'
  | 'paid_out'
  | 'drop'

export type CashMovement = {
  id: string
  shift_id: string
  kind: CashMovementKind
  amount_mur: number
  reason: string | null
  created_at: string
}

export type StockMovementReason =
  | 'sale'
  | 'return'
  | 'transfer_in'
  | 'transfer_out'
  | 'adjustment'
  | 'count'
  | 'damage'

export type StockMovement = {
  id: string
  product_id: string
  location_id: string
  delta: number               // signed
  reason: StockMovementReason
  reference_id: string | null // sale_id, transfer_id, count_id…
  created_by: string
  created_at: string
}

// Cart shape used in the register UI before a sale is committed.
export type CartLine = {
  product_id: string
  sku: string
  name: string
  qty: number
  unit_price_mur: number
  line_discount_mur: number
}

export type Cart = {
  client_uuid: string
  location_id: string
  register_id: string
  customer_id: string | null
  lines: CartLine[]
  cart_discount_mur: number
  notes: string | null
  created_at: string
}
