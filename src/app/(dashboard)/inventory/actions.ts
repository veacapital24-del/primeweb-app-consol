'use server'

import { revalidatePath } from 'next/cache'
import { adminClient } from '@/lib/supabase'

// Canonical adjustment reasons. Every stock change goes through this list so
// the movements log stays meaningful.
export const ADJUST_REASONS = [
  { value: 'receive',          label: 'Receive shipment',     hint: 'New stock from supplier (PO arrival)' },
  { value: 'count_correction', label: 'Count correction',     hint: 'Physical count differs from system' },
  { value: 'damage',           label: 'Damage / write-off',   hint: 'Broken, expired, or unsellable' },
  { value: 'return',           label: 'Customer return',      hint: 'Returned by customer back to stock' },
  { value: 'transfer_out',     label: 'Transfer out',         hint: 'Moved to another location' },
  { value: 'other',            label: 'Other',                hint: 'Manual adjustment with note' },
] as const

export type AdjustReason = typeof ADJUST_REASONS[number]['value']

type AdjustInput = {
  productId: string
  mode: 'relative' | 'absolute'
  qty: number
  reason: AdjustReason
  note?: string
}

async function applyOne(input: AdjustInput) {
  const sb = adminClient()
  const { data: prev } = await sb
    .from('inventory')
    .select('on_hand')
    .eq('product_id', input.productId)
    .maybeSingle()

  const before = prev?.on_hand ?? 0
  const after =
    input.mode === 'absolute'
      ? Math.max(0, Math.floor(input.qty))
      : Math.max(0, before + Math.floor(input.qty))

  if (after === before) return

  await sb.from('inventory').upsert({
    product_id: input.productId,
    on_hand: after,
    updated_at: new Date().toISOString(),
  })

  await sb.from('stock_movements').insert({
    product_id: input.productId,
    delta: after - before,
    before_qty: before,
    after_qty: after,
    reason: input.note ? `${input.reason} · ${input.note}` : input.reason,
    actor: 'admin',
  })
}

export async function adjustStock(input: AdjustInput) {
  if (!Number.isFinite(input.qty)) throw new Error('Quantity is required')
  await applyOne(input)
  revalidatePath('/inventory')
  revalidatePath('/')
  revalidatePath('/products')
}

type BulkInput = Omit<AdjustInput, 'productId'> & { productIds: string[] }

export async function bulkAdjustStock(input: BulkInput) {
  if (!input.productIds.length) return
  if (!Number.isFinite(input.qty)) throw new Error('Quantity is required')
  for (const id of input.productIds) {
    await applyOne({ ...input, productId: id })
  }
  revalidatePath('/inventory')
  revalidatePath('/')
  revalidatePath('/products')
}
