/** Shared packing-slip shapes (safe for client + server). */

export type PackingSlipItem = {
  sku: string
  name: string
  qty: number
  unitPrice: number
  lineTotal: number
}

export type PackingSlipData = {
  id: string
  orderNumber: string
  status: string
  statusLabel: string
  channel: string
  channelLabel: string
  isWholesale: boolean
  customerName: string
  whatsappPhone: string | null
  notes: string | null
  createdAt: string
  printedAt: string
  subtotalMur: number
  totalUnits: number
  items: PackingSlipItem[]
}
