'use server'

import { revalidatePath } from 'next/cache'
import { adminClient } from '@/lib/supabase'

async function logMovement(productId: string, before: number, after: number, reason = 'manual adjustment') {
  if (before === after) return
  const sb = adminClient()
  await sb.from('stock_movements').insert({
    product_id: productId,
    delta: after - before,
    before_qty: before,
    after_qty: after,
    reason,
    actor: 'admin',
  })
}

export async function setStock(productId: string, onHand: number, reason?: string) {
  const sb = adminClient()
  const { data: prev } = await sb.from('inventory').select('on_hand').eq('product_id', productId).maybeSingle()
  const before = prev?.on_hand ?? 0
  const after = Math.max(0, Math.floor(onHand))

  const { error } = await sb
    .from('inventory')
    .upsert({ product_id: productId, on_hand: after, updated_at: new Date().toISOString() })
  if (error) throw new Error(error.message)

  await logMovement(productId, before, after, reason)

  revalidatePath('/inventory')
  revalidatePath('/')
  revalidatePath('/products')
}

export async function adjustStock(productId: string, delta: number) {
  const sb = adminClient()
  const { data: prev } = await sb.from('inventory').select('on_hand').eq('product_id', productId).maybeSingle()
  const before = prev?.on_hand ?? 0
  const after = Math.max(0, before + delta)
  await setStock(productId, after, `manual ${delta > 0 ? '+' : ''}${delta}`)
}

export async function bulkSetStock(productIds: string[], onHand: number) {
  for (const id of productIds) {
    await setStock(id, onHand, 'bulk update')
  }
}
