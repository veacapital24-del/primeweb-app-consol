import 'server-only'

import { adminClient } from '@/lib/supabase'
import { orderStatusLabel } from '@/lib/order-status'
import type { PackingSlipData, PackingSlipItem } from '@/lib/packing-slip-types'

export type { PackingSlipData, PackingSlipItem } from '@/lib/packing-slip-types'

const CHANNEL_LABEL: Record<string, string> = {
  web: 'Website',
  whatsapp: 'WhatsApp',
  reel: 'Reel',
}

export async function fetchPackingSlip(orderId: string): Promise<PackingSlipData | null> {
  const sb = adminClient()
  const { data: order, error } = await sb
    .from('orders')
    .select(
      'id, order_number, channel, is_wholesale, subtotal_mur, status, customer_name, whatsapp_phone, notes, created_at, order_items(qty, unit_price_mur, products(sku, name))',
    )
    .eq('id', orderId)
    .maybeSingle()

  if (error) {
    console.error('[fetchPackingSlip]', error.message)
    throw new Error(error.message)
  }
  if (!order) return null

  const items: PackingSlipItem[] = (order.order_items ?? []).map((it) => {
    const qty = Number(it.qty)
    const unitPrice = Number(it.unit_price_mur)
    const product = Array.isArray(it.products) ? it.products[0] : it.products
    return {
      sku: product?.sku ?? '—',
      name: product?.name ?? '—',
      qty,
      unitPrice,
      lineTotal: qty * unitPrice,
    }
  })

  const totalUnits = items.reduce((s, i) => s + i.qty, 0)

  return {
    id: order.id,
    orderNumber: order.order_number,
    status: order.status,
    statusLabel: orderStatusLabel(order.status),
    channel: order.channel,
    channelLabel: CHANNEL_LABEL[order.channel] ?? order.channel,
    isWholesale: order.is_wholesale,
    customerName: order.customer_name ?? '—',
    whatsappPhone: order.whatsapp_phone,
    notes: order.notes,
    createdAt: order.created_at,
    printedAt: new Date().toISOString(),
    subtotalMur: Number(order.subtotal_mur),
    totalUnits,
    items,
  }
}
