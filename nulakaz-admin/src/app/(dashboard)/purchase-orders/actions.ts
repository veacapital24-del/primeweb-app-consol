'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { adminClient } from '@/lib/supabase'
import type { PoStatus } from '@/lib/types'

type LineInput = {
  product_id: string
  qty_ordered: number
  unit_cost_mur: number
}

export async function createPurchaseOrder(formData: FormData) {
  const supplierId = (formData.get('supplier_id') as string) || null
  const locationId = (formData.get('location_id') as string) || null
  const expectedDate = (formData.get('expected_date') as string) || null
  const notes = (formData.get('notes') as string) || null
  const linesRaw = formData.get('lines') as string

  let lines: LineInput[] = []
  try {
    lines = JSON.parse(linesRaw)
  } catch {
    throw new Error('Invalid line items')
  }
  if (!lines.length) throw new Error('Add at least one product line')

  const sb = adminClient()

  const { data: poNum } = await sb.rpc('next_po_number')
  const totalCost = lines.reduce((s, l) => s + l.qty_ordered * l.unit_cost_mur, 0)

  const { data: po, error } = await sb
    .from('purchase_orders')
    .insert({
      po_number: poNum as string,
      supplier_id: supplierId,
      location_id: locationId,
      expected_date: expectedDate,
      notes,
      total_cost_mur: totalCost,
    })
    .select('id')
    .single()

  if (error || !po) throw new Error(error?.message ?? 'Failed to create PO')

  await sb.from('purchase_order_lines').insert(
    lines.map((l) => ({
      po_id: po.id,
      product_id: l.product_id,
      qty_ordered: l.qty_ordered,
      unit_cost_mur: l.unit_cost_mur,
    })),
  )

  revalidatePath('/purchase-orders')
  redirect(`/purchase-orders/${po.id}`)
}

export async function updatePoStatus(poId: string, status: PoStatus) {
  const sb = adminClient()
  await sb
    .from('purchase_orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', poId)
  revalidatePath(`/purchase-orders/${poId}`)
  revalidatePath('/purchase-orders')
}

export async function receiveItems(formData: FormData) {
  const poId = formData.get('po_id') as string
  const receiptsRaw = formData.get('receipts') as string

  const receipts: Array<{ lineId: string; qty: number }> = JSON.parse(receiptsRaw)
  if (!receipts.length) return

  const sb = adminClient()

  const [{ data: po }, { data: lines }] = await Promise.all([
    sb.from('purchase_orders').select('id, po_number, location_id, status').eq('id', poId).single(),
    sb.from('purchase_order_lines').select('*').eq('po_id', poId),
  ])

  if (!po || !lines) throw new Error('PO not found')

  for (const r of receipts) {
    if (!r.qty || r.qty <= 0) continue
    const line = lines.find((l) => l.id === r.lineId)
    if (!line) continue

    const remaining = line.qty_ordered - line.qty_received
    const delta = Math.min(r.qty, remaining)
    if (delta <= 0) continue

    const newReceived = line.qty_received + delta

    await sb
      .from('purchase_order_lines')
      .update({ qty_received: newReceived })
      .eq('id', line.id)

    // Update inventory and log stock movement
    if (po.location_id) {
      const { data: existing } = await sb
        .from('location_stock')
        .select('on_hand')
        .eq('product_id', line.product_id)
        .eq('location_id', po.location_id)
        .maybeSingle()
      const before = existing?.on_hand ?? 0
      const after = before + delta
      await sb.from('location_stock').upsert(
        { product_id: line.product_id, location_id: po.location_id, on_hand: after, updated_at: new Date().toISOString() },
        { onConflict: 'product_id,location_id', ignoreDuplicates: false },
      )
      const { data: loc } = await sb.from('locations').select('code').eq('id', po.location_id).maybeSingle()
      await sb.from('stock_movements').insert({
        product_id: line.product_id,
        delta,
        before_qty: before,
        after_qty: after,
        reason: `${po.po_number} · received @${loc?.code ?? po.location_id.slice(0, 8)}`,
        actor: 'admin',
      })
    } else {
      const { data: existing } = await sb
        .from('inventory')
        .select('on_hand')
        .eq('product_id', line.product_id)
        .maybeSingle()
      const before = existing?.on_hand ?? 0
      const after = before + delta
      await sb.from('inventory').upsert({
        product_id: line.product_id,
        on_hand: after,
        updated_at: new Date().toISOString(),
      })
      await sb.from('stock_movements').insert({
        product_id: line.product_id,
        delta,
        before_qty: before,
        after_qty: after,
        reason: `${po.po_number} · received`,
        actor: 'admin',
      })
    }
  }

  // Recalculate PO status
  const { data: updated } = await sb
    .from('purchase_order_lines')
    .select('qty_ordered, qty_received')
    .eq('po_id', poId)

  if (updated) {
    const allDone = updated.every((l) => l.qty_received >= l.qty_ordered)
    const anyDone = updated.some((l) => l.qty_received > 0)
    const newStatus: PoStatus = allDone ? 'received' : anyDone ? 'partial' : po.status
    if (newStatus !== po.status) {
      await sb
        .from('purchase_orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', poId)
    }
  }

  revalidatePath(`/purchase-orders/${poId}`)
  revalidatePath('/purchase-orders')
  revalidatePath('/inventory')
  revalidatePath('/')
}
