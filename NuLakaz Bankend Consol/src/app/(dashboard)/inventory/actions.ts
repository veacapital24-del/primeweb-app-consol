'use server'

import { revalidatePath } from 'next/cache'
import { adminClient } from '@/lib/supabase'
import type { AdjustReason } from './reasons'

type AdjustInput = {
  productId: string
  mode: 'relative' | 'absolute'
  qty: number
  reason: AdjustReason
  note?: string
  // null  → adjust the warehouse-wide `inventory` table.
  // UUID  → adjust the `location_stock` row for that location.
  locationId?: string | null
}

async function applyOne(input: AdjustInput) {
  const sb = adminClient()
  const useLocation = !!input.locationId

  // Look up the current on-hand value from the right table so the preview
  // matches what we'll write back.
  let before = 0
  let locationCode = ''
  if (useLocation) {
    const { data: prev } = await sb
      .from('location_stock')
      .select('on_hand')
      .eq('product_id', input.productId)
      .eq('location_id', input.locationId!)
      .maybeSingle()
    before = prev?.on_hand ?? 0

    // Resolve the location code so we can stamp it into the movement
    // reason — that's how the warehouse activity feed filters per location.
    const { data: loc } = await sb
      .from('locations')
      .select('code')
      .eq('id', input.locationId!)
      .maybeSingle()
    locationCode = loc?.code ?? input.locationId!.slice(0, 8)
  } else {
    const { data: prev } = await sb
      .from('inventory')
      .select('on_hand')
      .eq('product_id', input.productId)
      .maybeSingle()
    before = prev?.on_hand ?? 0
  }

  const after =
    input.mode === 'absolute'
      ? Math.max(0, Math.floor(input.qty))
      : Math.max(0, before + Math.floor(input.qty))

  if (after === before) return

  if (useLocation) {
    await sb.from('location_stock').upsert(
      {
        product_id: input.productId,
        location_id: input.locationId!,
        on_hand: after,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'product_id,location_id', ignoreDuplicates: false },
    )
  } else {
    await sb.from('inventory').upsert({
      product_id: input.productId,
      on_hand: after,
      updated_at: new Date().toISOString(),
    })
  }

  // Stamp the movement with the location code so the warehouse activity
  // feed (which filters by `@<code>`) can show only the relevant entries.
  // The `stock_movements` table has no location_id column today; encoding
  // it in the reason avoids a migration but stays grep-able.
  const reasonParts = [
    input.reason,
    useLocation ? `@${locationCode}` : null,
    input.note,
  ].filter(Boolean) as string[]

  await sb.from('stock_movements').insert({
    product_id: input.productId,
    delta: after - before,
    before_qty: before,
    after_qty: after,
    reason: reasonParts.join(' · '),
    actor: 'admin',
  })
}

export async function adjustStock(input: AdjustInput) {
  if (!Number.isFinite(input.qty)) throw new Error('Quantity is required')
  await applyOne(input)
  revalidatePath('/inventory')
  revalidatePath('/locations')
  revalidatePath('/')
  revalidatePath('/products')
}

type BulkInput = Omit<AdjustInput, 'productId'> & { productIds: string[] }

export async function bulkAdjustStock(input: BulkInput) {
  if (!input.productIds.length) return
  if (!Number.isFinite(input.qty)) throw new Error('Quantity is required')
  for (const id of input.productIds) {
    await applyOne({
      productId: id,
      mode: input.mode,
      qty: input.qty,
      reason: input.reason,
      note: input.note,
      locationId: input.locationId,
    })
  }
  revalidatePath('/inventory')
  revalidatePath('/locations')
  revalidatePath('/')
  revalidatePath('/products')
}
