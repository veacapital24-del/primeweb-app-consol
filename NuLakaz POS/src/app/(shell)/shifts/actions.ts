'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { serverClient } from '@/lib/supabase'
import type { CashMovementKind, Shift } from '@/lib/types'

export type OpenShiftResult = { error: string } | { shiftId: string }

export async function openShift(form: FormData): Promise<OpenShiftResult> {
  const sb = await serverClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return { error: 'Not signed in.' }

  const register_id = String(form.get('register_id') ?? '').trim()
  const opening_float_mur = Number(form.get('opening_float_mur') ?? 0)
  const notes = String(form.get('notes') ?? '').trim() || null

  if (!register_id) return { error: 'Register is required.' }
  if (!Number.isFinite(opening_float_mur) || opening_float_mur < 0) {
    return { error: 'Opening float must be 0 or more.' }
  }

  // Resolve location_id from the register (also confirms RLS access)
  const { data: reg, error: regErr } = await sb
    .from('registers')
    .select('id, location_id, active')
    .eq('id', register_id)
    .maybeSingle<{ id: string; location_id: string; active: boolean }>()

  if (regErr || !reg) {
    return {
      error:
        'Register not found or you are not assigned to this location. Ask an admin to add you under Staff.',
    }
  }
  if (!reg.active) return { error: 'This register is retired.' }

  const { data: existingMine } = await sb
    .from('shifts')
    .select('id')
    .eq('cashier_id', user.id)
    .eq('status', 'open')
    .maybeSingle<{ id: string }>()

  if (existingMine) {
    return {
      error: 'You already have an open shift. Continue on the register or close it first.',
    }
  }

  const { data, error } = await sb
    .from('shifts')
    .insert({
      register_id,
      location_id: reg.location_id,
      cashier_id: user.id,
      opening_float_mur,
      notes,
    })
    .select('id')
    .single()

  if (error) {
    if (
      error.message.includes('shifts_one_open_per_register') ||
      error.code === '23505'
    ) {
      return { error: 'This register already has an open shift. Close it first.' }
    }
    if (error.code === '42501') {
      return {
        error:
          'Permission denied — you must be assigned to this location. Ask an admin to add you under Staff.',
      }
    }
    return { error: error.message }
  }

  revalidatePath('/shifts')
  revalidatePath('/shifts/open')
  revalidatePath('/register')
  revalidatePath('/registers')
  return { shiftId: data.id }
}

export async function closeShift(id: string, form: FormData) {
  const closing_count_mur = Number(form.get('closing_count_mur') ?? 0)
  const notes = String(form.get('notes') ?? '').trim() || null

  if (!Number.isFinite(closing_count_mur) || closing_count_mur < 0) {
    return { error: 'Closing count must be 0 or more.' }
  }

  const sb = await serverClient()

  const { data: shift, error: sErr } = await sb
    .from('shifts')
    .select('id, status, opening_float_mur')
    .eq('id', id)
    .maybeSingle<Pick<Shift, 'id' | 'status' | 'opening_float_mur'>>()

  if (sErr || !shift) return { error: 'Shift not found.' }
  if (shift.status !== 'open') return { error: 'Shift is already closed.' }

  // Cash drawer movements
  const { data: movs } = await sb
    .from('cash_movements')
    .select('kind, amount_mur')
    .eq('shift_id', id)

  const sumKinds = (kinds: CashMovementKind[]) =>
    (movs ?? [])
      .filter((m) => kinds.includes(m.kind as CashMovementKind))
      .reduce((s, m) => s + Number(m.amount_mur), 0)

  const cashIn = sumKinds(['cash_in', 'paid_in'])
  const cashOut = sumKinds(['cash_out', 'paid_out', 'drop'])

  // Cash payments from completed sales in this shift
  const { data: salesRows } = await sb
    .from('sales')
    .select('id')
    .eq('shift_id', id)
    .eq('status', 'completed')

  const saleIds = (salesRows ?? []).map((s) => s.id as string)

  let cashSales = 0
  if (saleIds.length > 0) {
    const { data: pays } = await sb
      .from('payments')
      .select('amount_mur')
      .eq('tender', 'cash')
      .in('sale_id', saleIds)
    cashSales = (pays ?? []).reduce((s, p) => s + Number(p.amount_mur), 0)
  }

  const expected_cash_mur =
    Number(shift.opening_float_mur) + cashIn - cashOut + cashSales
  const variance_mur = closing_count_mur - expected_cash_mur

  const { error } = await sb
    .from('shifts')
    .update({
      closing_count_mur,
      expected_cash_mur,
      variance_mur,
      closed_at: new Date().toISOString(),
      status: 'closed',
      notes,
    })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/shifts')
  revalidatePath(`/shifts/${id}`)
  return { ok: true }
}

const MOVEMENT_KINDS: CashMovementKind[] = [
  'cash_in',
  'cash_out',
  'paid_in',
  'paid_out',
  'drop',
]

export async function addCashMovement(shift_id: string, form: FormData) {
  const kindRaw = String(form.get('kind') ?? '')
  if (!(MOVEMENT_KINDS as string[]).includes(kindRaw)) {
    return { error: 'Invalid movement kind.' }
  }
  const amount_mur = Number(form.get('amount_mur') ?? 0)
  if (!Number.isFinite(amount_mur) || amount_mur <= 0) {
    return { error: 'Amount must be greater than zero.' }
  }
  const reason = String(form.get('reason') ?? '').trim() || null

  const sb = await serverClient()
  const { error } = await sb.from('cash_movements').insert({
    shift_id,
    kind: kindRaw as CashMovementKind,
    amount_mur,
    reason,
  })
  if (error) return { error: error.message }

  revalidatePath(`/shifts/${shift_id}`)
  return { ok: true }
}
