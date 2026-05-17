'use server'

import { revalidatePath } from 'next/cache'
import { adminClient } from '@/lib/supabase'

const ALLOWED = ['pending', 'confirmed', 'fulfilled', 'cancelled'] as const
type Status = typeof ALLOWED[number]

export async function setOrderStatus(orderId: string, status: Status) {
  if (!ALLOWED.includes(status)) throw new Error('invalid status')
  const sb = adminClient()

  // When fulfilling, decrement on_hand for each item.
  if (status === 'fulfilled') {
    const { data: items } = await sb.from('order_items').select('product_id, qty').eq('order_id', orderId)
    for (const it of items ?? []) {
      const { data: inv } = await sb.from('inventory').select('on_hand').eq('product_id', it.product_id).maybeSingle()
      const next = Math.max(0, (inv?.on_hand ?? 0) - it.qty)
      await sb.from('inventory').upsert({ product_id: it.product_id, on_hand: next, updated_at: new Date().toISOString() })
      await sb.from('stock_movements').insert({
        product_id: it.product_id,
        delta: -it.qty,
        reason: `Order ${orderId.slice(0, 8)} fulfilled`,
        before_qty: inv?.on_hand ?? 0,
        after_qty: next,
        actor: 'admin',
      })
    }
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

export async function addOrderNote(orderId: string, note: string) {
  if (!note.trim()) return
  const sb = adminClient()
  const { data: existing } = await sb.from('orders').select('notes').eq('id', orderId).maybeSingle()
  const stamp = new Date().toLocaleString()
  const newNotes = `${existing?.notes ? existing.notes + '\n' : ''}[${stamp}] ${note.trim()}`
  await sb.from('orders').update({ notes: newNotes, updated_at: new Date().toISOString() }).eq('id', orderId)
  revalidatePath(`/orders/${orderId}`)
}
