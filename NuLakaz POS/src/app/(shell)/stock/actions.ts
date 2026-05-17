'use server'

import { revalidatePath } from 'next/cache'
import { serverClient } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

type StockResult =
  | { ok: true; on_hand: number; delta: number }
  | { ok: false; error: string }

export async function setOnHand(
  product_id: string,
  location_id: string,
  target: number,
  reason: string | null,
): Promise<StockResult> {
  const me = await requireAdmin()

  if (!Number.isFinite(target) || target < 0) {
    return { ok: false, error: 'Target must be 0 or more.' }
  }
  const targetInt = Math.round(target)

  const sb = await serverClient()

  const { data: existing } = await sb
    .from('location_stock')
    .select('on_hand')
    .eq('product_id', product_id)
    .eq('location_id', location_id)
    .maybeSingle<{ on_hand: number }>()

  const current = Number(existing?.on_hand ?? 0)
  const delta = targetInt - current

  if (delta === 0) return { ok: true, on_hand: targetInt, delta: 0 }

  const { data: newOnHand, error: rpcErr } = await sb.rpc('apply_stock_delta', {
    p_product_id: product_id,
    p_location_id: location_id,
    p_delta: delta,
  })
  if (rpcErr) return { ok: false, error: rpcErr.message }

  const { error: movErr } = await sb.from('stock_movements').insert({
    product_id,
    location_id,
    delta,
    before_qty: current,
    after_qty: typeof newOnHand === 'number' ? newOnHand : targetInt,
    reason: reason ?? 'adjustment',
    reason_code: 'adjustment',
    actor: me.email ?? me.id,
  })
  if (movErr) return { ok: false, error: movErr.message }

  revalidatePath('/stock')
  return { ok: true, on_hand: typeof newOnHand === 'number' ? newOnHand : targetInt, delta }
}

export async function adjustOnHand(
  product_id: string,
  location_id: string,
  delta: number,
  reason: string | null,
): Promise<StockResult> {
  const me = await requireAdmin()

  if (!Number.isFinite(delta) || delta === 0) {
    return { ok: false, error: 'Delta must be a non-zero number.' }
  }
  const deltaInt = Math.round(delta)

  const sb = await serverClient()

  const { data: before } = await sb
    .from('location_stock')
    .select('on_hand')
    .eq('product_id', product_id)
    .eq('location_id', location_id)
    .maybeSingle<{ on_hand: number }>()
  const beforeQty = Number(before?.on_hand ?? 0)

  const { data: newOnHand, error: rpcErr } = await sb.rpc('apply_stock_delta', {
    p_product_id: product_id,
    p_location_id: location_id,
    p_delta: deltaInt,
  })
  if (rpcErr) return { ok: false, error: rpcErr.message }

  const { error: movErr } = await sb.from('stock_movements').insert({
    product_id,
    location_id,
    delta: deltaInt,
    before_qty: beforeQty,
    after_qty: typeof newOnHand === 'number' ? newOnHand : null,
    reason: reason ?? 'adjustment',
    reason_code: deltaInt > 0 ? 'receipt' : 'adjustment',
    actor: me.email ?? me.id,
  })
  if (movErr) return { ok: false, error: movErr.message }

  revalidatePath('/stock')
  return { ok: true, on_hand: typeof newOnHand === 'number' ? newOnHand : beforeQty + deltaInt, delta: deltaInt }
}

export async function listMovements(product_id: string, location_id: string) {
  await requireAdmin()
  const sb = await serverClient()
  const { data } = await sb
    .from('stock_movements')
    .select('id, delta, before_qty, after_qty, reason, reason_code, reference_id, actor, created_at')
    .eq('product_id', product_id)
    .eq('location_id', location_id)
    .order('created_at', { ascending: false })
    .limit(50)
  return data ?? []
}

export type ReceiveItem = { product_id: string; qty: number }

export async function receiveStock(
  location_id: string,
  items: ReceiveItem[],
  reason: string | null,
) {
  const me = await requireAdmin()
  const sb = await serverClient()

  const valid = items.filter((i) => i.qty > 0)
  if (valid.length === 0) return { error: 'Add at least one item with quantity.' }

  let totalUnits = 0
  for (const item of valid) {
    const qty = Math.round(item.qty)

    const { data: before } = await sb
      .from('location_stock')
      .select('on_hand')
      .eq('product_id', item.product_id)
      .eq('location_id', location_id)
      .maybeSingle<{ on_hand: number }>()

    const { data: newOnHand, error: rpcErr } = await sb.rpc('apply_stock_delta', {
      p_product_id: item.product_id,
      p_location_id: location_id,
      p_delta: qty,
    })
    if (rpcErr) return { error: rpcErr.message }

    await sb.from('stock_movements').insert({
      product_id: item.product_id,
      location_id,
      delta: qty,
      before_qty: Number(before?.on_hand ?? 0),
      after_qty: typeof newOnHand === 'number' ? newOnHand : null,
      reason: reason ?? 'Stock receipt',
      reason_code: 'receipt',
      actor: me.email ?? me.id,
    })

    totalUnits += qty
  }

  revalidatePath('/stock')
  return { ok: true, items: valid.length, units: totalUnits }
}
