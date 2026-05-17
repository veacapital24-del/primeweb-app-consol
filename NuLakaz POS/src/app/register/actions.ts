'use server'

import { revalidatePath } from 'next/cache'
import { adminClient, serverClient } from '@/lib/supabase'
import type {
  CommitSaleInput,
  CommitSaleResult,
  HeldLine,
  ParkSaleInput,
  ParkSaleResult,
} from './types'

// Customer lookup for the register's "attach customer" picker.
// Uses the service-role client so cashiers can find any customer by name/phone
// without us having to widen the RLS policy on profiles.
export async function searchCustomers(q: string) {
  const sb = await serverClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return [] as { id: string; full_name: string | null; phone: string | null }[]

  const term = q.trim()
  if (term.length < 2) return []

  const admin = adminClient()
  const { data } = await admin
    .from('profiles')
    .select('id, full_name, phone')
    .or(`full_name.ilike.%${term}%,phone.ilike.%${term}%`)
    .limit(10)

  return (data ?? []) as { id: string; full_name: string | null; phone: string | null }[]
}

export async function parkSale(input: ParkSaleInput): Promise<ParkSaleResult> {
  const sb = await serverClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return { ok: false, error: 'Not signed in.' }

  const { data: shift } = await sb
    .from('shifts')
    .select('id, register_id, location_id, status, cashier_id')
    .eq('id', input.shift_id)
    .maybeSingle<{
      id: string
      register_id: string
      location_id: string
      status: 'open' | 'closed'
      cashier_id: string
    }>()

  if (!shift) return { ok: false, error: 'Shift not found.' }
  if (shift.status !== 'open') return { ok: false, error: 'Shift is closed.' }
  if (shift.cashier_id !== user.id) return { ok: false, error: 'Not your shift.' }
  if (!input.lines.length) return { ok: false, error: 'Cart is empty.' }

  const subtotal = input.lines.reduce(
    (s, l) => s + l.unit_price_mur * l.qty - l.line_discount_mur,
    0,
  )
  const cart_discount = Math.max(0, Number(input.cart_discount_mur) || 0)
  const total = Math.max(0, subtotal - cart_discount)

  // Idempotent on (location_id, client_uuid) — replays don't double-park
  const { data: existing } = await sb
    .from('sales')
    .select('id, sale_number')
    .eq('location_id', shift.location_id)
    .eq('client_uuid', input.client_uuid)
    .maybeSingle<{ id: string; sale_number: string }>()
  if (existing) return { ok: true, sale_id: existing.id, sale_number: existing.sale_number }

  const { data: sale, error: sErr } = await sb
    .from('sales')
    .insert({
      shift_id: shift.id,
      register_id: shift.register_id,
      location_id: shift.location_id,
      cashier_id: user.id,
      customer_id: input.customer_id ?? null,
      subtotal_mur: subtotal,
      discount_mur: cart_discount,
      tax_mur: 0,
      total_mur: total,
      status: 'draft',
      notes: input.label?.trim() || null,
      client_uuid: input.client_uuid,
    })
    .select('id, sale_number')
    .single()

  if (sErr || !sale) return { ok: false, error: sErr?.message ?? 'Failed to park sale.' }

  const lineRows = input.lines.map((l) => ({
    sale_id: sale.id,
    product_id: l.product_id,
    sku: l.sku,
    name: l.name,
    qty: l.qty,
    unit_price_mur: l.unit_price_mur,
    line_discount_mur: l.line_discount_mur,
    line_tax_mur: 0,
    line_total_mur: l.unit_price_mur * l.qty - l.line_discount_mur,
  }))

  const { error: linesErr } = await sb.from('sale_lines').insert(lineRows)
  if (linesErr) {
    await sb.from('sales').update({ status: 'voided' }).eq('id', sale.id)
    return { ok: false, error: linesErr.message }
  }

  revalidatePath('/register')
  return { ok: true, sale_id: sale.id, sale_number: sale.sale_number }
}

export async function listHeldSales(location_id: string) {
  const sb = await serverClient()
  const { data } = await sb
    .from('sales')
    .select('id, sale_number, subtotal_mur, discount_mur, total_mur, notes, created_at, customer_id')
    .eq('location_id', location_id)
    .eq('status', 'draft')
    .order('created_at', { ascending: false })
    .limit(30)

  return (data ?? []) as {
    id: string
    sale_number: string
    subtotal_mur: number
    discount_mur: number
    total_mur: number
    notes: string | null
    created_at: string
    customer_id: string | null
  }[]
}

export async function recallHeldSale(sale_id: string): Promise<
  | {
      ok: true
      customer_id: string | null
      cart_discount_mur: number
      lines: HeldLine[]
    }
  | { ok: false; error: string }
> {
  const sb = await serverClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return { ok: false, error: 'Not signed in.' }

  const { data: sale, error: sErr } = await sb
    .from('sales')
    .select('id, customer_id, discount_mur, status, location_id')
    .eq('id', sale_id)
    .maybeSingle<{
      id: string
      customer_id: string | null
      discount_mur: number
      status: string
      location_id: string
    }>()
  if (sErr || !sale) return { ok: false, error: 'Sale not found.' }
  if (sale.status !== 'draft') return { ok: false, error: 'This sale is no longer held.' }

  const { data: linesData } = await sb
    .from('sale_lines')
    .select('product_id, sku, name, qty, unit_price_mur, line_discount_mur')
    .eq('sale_id', sale_id)
    .order('id')

  // Mark draft as voided so it leaves the held list. The fresh cart re-commits as a new sale.
  await sb.from('sales').update({ status: 'voided' }).eq('id', sale_id)
  revalidatePath('/register')

  return {
    ok: true,
    customer_id: sale.customer_id,
    cart_discount_mur: Number(sale.discount_mur),
    lines: (linesData ?? []).map((l) => ({
      product_id: l.product_id as string,
      sku: l.sku as string,
      name: l.name as string,
      qty: Number(l.qty),
      unit_price_mur: Number(l.unit_price_mur),
      line_discount_mur: Number(l.line_discount_mur),
    })),
  }
}

export async function discardHeldSale(
  sale_id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const sb = await serverClient()
  const { error } = await sb.from('sales').update({ status: 'voided' }).eq('id', sale_id)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/register')
  return { ok: true }
}

export async function commitSale(input: CommitSaleInput): Promise<CommitSaleResult> {
  const sb = await serverClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return { ok: false, error: 'Not signed in.' }

  // Validate shift
  const { data: shift, error: sErr } = await sb
    .from('shifts')
    .select('id, register_id, location_id, status, cashier_id')
    .eq('id', input.shift_id)
    .maybeSingle<{
      id: string
      register_id: string
      location_id: string
      status: 'open' | 'closed'
      cashier_id: string
    }>()

  if (sErr || !shift) return { ok: false, error: 'Shift not found.' }
  if (shift.status !== 'open') return { ok: false, error: 'Shift is closed.' }
  if (shift.cashier_id !== user.id) return { ok: false, error: 'This shift belongs to another cashier.' }

  if (!input.lines.length) return { ok: false, error: 'Cart is empty.' }

  // Compute server-side totals (don't trust the client)
  const subtotal = input.lines.reduce(
    (s, l) => s + l.unit_price_mur * l.qty - l.line_discount_mur,
    0,
  )
  const cart_discount = Math.max(0, Number(input.cart_discount_mur) || 0)
  const total = Math.max(0, subtotal - cart_discount)
  const paid = input.payments.reduce((s, p) => s + Number(p.amount_mur), 0)

  if (paid + 0.0001 < total) {
    return { ok: false, error: `Payment Rs ${paid.toFixed(2)} is less than total Rs ${total.toFixed(2)}.` }
  }

  // Idempotency: if a sale with this client_uuid already exists, return it.
  const { data: existing } = await sb
    .from('sales')
    .select('id, sale_number, total_mur')
    .eq('location_id', shift.location_id)
    .eq('client_uuid', input.client_uuid)
    .maybeSingle<{ id: string; sale_number: string; total_mur: number }>()

  if (existing) {
    return {
      ok: true,
      sale_id: existing.id,
      sale_number: existing.sale_number,
      total_mur: Number(existing.total_mur),
    }
  }

  const now = new Date().toISOString()

  // 1. Insert sale
  const { data: sale, error: saleErr } = await sb
    .from('sales')
    .insert({
      shift_id: shift.id,
      register_id: shift.register_id,
      location_id: shift.location_id,
      cashier_id: user.id,
      customer_id: input.customer_id ?? null,
      subtotal_mur: subtotal,
      discount_mur: cart_discount,
      tax_mur: 0,
      total_mur: total,
      status: 'completed',
      notes: input.notes ?? null,
      client_uuid: input.client_uuid,
      synced_at: now,
      completed_at: now,
    })
    .select('id, sale_number')
    .single()

  if (saleErr || !sale) return { ok: false, error: saleErr?.message ?? 'Failed to insert sale.' }

  // 2. Insert sale lines
  const lineRows = input.lines.map((l) => ({
    sale_id: sale.id,
    product_id: l.product_id,
    sku: l.sku,
    name: l.name,
    qty: l.qty,
    unit_price_mur: l.unit_price_mur,
    line_discount_mur: l.line_discount_mur,
    line_tax_mur: 0,
    line_total_mur: l.unit_price_mur * l.qty - l.line_discount_mur,
  }))

  const { error: linesErr } = await sb.from('sale_lines').insert(lineRows)
  if (linesErr) {
    // Best-effort rollback: void the sale so it doesn't sit half-built
    await sb.from('sales').update({ status: 'voided' }).eq('id', sale.id)
    return { ok: false, error: linesErr.message }
  }

  // 3. Insert payments
  const paymentRows = input.payments.map((p) => ({
    sale_id: sale.id,
    tender: p.tender,
    amount_mur: p.amount_mur,
    reference: p.reference ?? null,
  }))

  const { error: payErr } = await sb.from('payments').insert(paymentRows)
  if (payErr) {
    await sb.from('sales').update({ status: 'voided' }).eq('id', sale.id)
    return { ok: false, error: payErr.message }
  }

  // 4. Decrement per-location stock atomically + log the movement.
  // We use the apply_stock_delta() SQL function so concurrent sales can't race.
  for (const l of input.lines) {
    const delta = -Math.round(l.qty)
    const { data: newOnHand } = await sb.rpc('apply_stock_delta', {
      p_product_id: l.product_id,
      p_location_id: shift.location_id,
      p_delta: delta,
    })

    await sb.from('stock_movements').insert({
      product_id: l.product_id,
      location_id: shift.location_id,
      delta,
      after_qty: typeof newOnHand === 'number' ? newOnHand : null,
      reason: 'sale',
      reason_code: 'sale',
      reference_id: sale.id,
      actor: user.email ?? user.id,
    })
  }

  revalidatePath('/register')
  revalidatePath(`/shifts/${shift.id}`)

  return {
    ok: true,
    sale_id: sale.id,
    sale_number: sale.sale_number,
    total_mur: total,
  }
}
