'use server'

import { revalidatePath } from 'next/cache'
import { adminClient } from '@/lib/supabase'
import {
  getNextOrderStatus,
  normalizeOrderStatus,
  type OrderStatus,
} from '@/lib/order-status'

const ALLOWED: OrderStatus[] = [
  'pending',
  'confirmed',
  'packing',
  'packed',
  'delivery_in_progress',
  'delivered',
  'completed',
  'cancelled',
]

async function decrementStockForOrder(orderId: string) {
  const sb = adminClient()
  const tag = `Order ${orderId.slice(0, 8)} packing`

  const { data: prior } = await sb
    .from('stock_movements')
    .select('id')
    .ilike('reason', `${tag}%`)
    .limit(1)
  if (prior?.length) return

  const { data: items } = await sb
    .from('order_items')
    .select('product_id, qty')
    .eq('order_id', orderId)

  for (const it of items ?? []) {
    const { data: inv } = await sb
      .from('inventory')
      .select('on_hand')
      .eq('product_id', it.product_id)
      .maybeSingle()
    const next = Math.max(0, (inv?.on_hand ?? 0) - it.qty)
    await sb.from('inventory').upsert({
      product_id: it.product_id,
      on_hand: next,
      updated_at: new Date().toISOString(),
    })
    await sb.from('stock_movements').insert({
      product_id: it.product_id,
      delta: -it.qty,
      reason: tag,
      before_qty: inv?.on_hand ?? 0,
      after_qty: next,
      actor: 'admin',
    })
  }
}

export async function setOrderStatus(orderId: string, status: OrderStatus) {
  if (!ALLOWED.includes(status)) throw new Error('invalid status')
  const sb = adminClient()

  if (status === 'packing') {
    await decrementStockForOrder(orderId)
  }

  const { error } = await sb
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId)
  if (error) throw new Error(error.message)

  revalidatePath('/orders')
  revalidatePath(`/orders/${orderId}`)
  revalidatePath('/')
  revalidatePath('/inventory')
}

export async function proceedOrder(orderId: string) {
  const sb = adminClient()
  const { data: row, error } = await sb
    .from('orders')
    .select('status')
    .eq('id', orderId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  if (!row) throw new Error('order not found')

  const current = normalizeOrderStatus(row.status)
  const next = getNextOrderStatus(current)
  if (!next) throw new Error('cannot proceed from this status')

  await setOrderStatus(orderId, next)
}

/** Confirmed → packing when warehouse prints the packing slip. */
export async function confirmPackingFromPrint(orderId: string) {
  const sb = adminClient()
  const { data: row } = await sb
    .from('orders')
    .select('status, order_number')
    .eq('id', orderId)
    .maybeSingle()

  if (!row) throw new Error('order not found')
  const current = normalizeOrderStatus(row.status)
  if (current !== 'confirmed') {
    throw new Error('Order must be confirmed before printing to start packing')
  }

  const stamp = new Date().toLocaleString()
  const { data: existing } = await sb
    .from('orders')
    .select('notes')
    .eq('id', orderId)
    .maybeSingle()
  const printNote = `[${stamp}] Packing slip printed — packing started.`
  const newNotes = existing?.notes
    ? `${existing.notes}\n${printNote}`
    : printNote

  await sb
    .from('orders')
    .update({ notes: newNotes, updated_at: new Date().toISOString() })
    .eq('id', orderId)

  await setOrderStatus(orderId, 'packing')
}

export async function addOrderNote(orderId: string, note: string) {
  if (!note.trim()) return
  const sb = adminClient()
  const { data: existing } = await sb
    .from('orders')
    .select('notes')
    .eq('id', orderId)
    .maybeSingle()
  const stamp = new Date().toLocaleString()
  const newNotes = `${existing?.notes ? existing.notes + '\n' : ''}[${stamp}] ${note.trim()}`
  await sb
    .from('orders')
    .update({ notes: newNotes, updated_at: new Date().toISOString() })
    .eq('id', orderId)
  revalidatePath(`/orders/${orderId}`)
}
