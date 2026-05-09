'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { adminClient } from '@/lib/supabase'
import { LOCATION_KINDS, type LocationKind } from '@/lib/types'

type LocationInput = {
  code: string
  name: string
  kind: LocationKind
  address: string | null
  phone: string | null
  timezone: string
  currency: string
  active: boolean
}

function fromForm(form: FormData): LocationInput {
  const str = (k: string) => String(form.get(k) ?? '').trim()
  const bool = (k: string) => form.get(k) === 'on'
  const kindRaw = str('kind')
  const kind = (LOCATION_KINDS as readonly string[]).includes(kindRaw)
    ? (kindRaw as LocationKind)
    : 'store'
  return {
    // Codes are uppercased + dash-cleaned. Used in the POS receipts header.
    code: str('code').toUpperCase().replace(/[^A-Z0-9-]+/g, '-'),
    name: str('name'),
    kind,
    address: str('address') || null,
    phone: str('phone') || null,
    timezone: str('timezone') || 'Indian/Mauritius',
    currency: (str('currency') || 'MUR').toUpperCase().slice(0, 3),
    active: bool('active'),
  }
}

export async function createLocation(form: FormData) {
  const input = fromForm(form)
  if (!input.code || !input.name)
    throw new Error('Code and name are required')

  const sb = adminClient()
  const { data, error } = await sb
    .from('locations')
    .insert(input)
    .select('id')
    .single()
  if (error) throw new Error(error.message)

  // Seed location_stock for every active product so the POS sees the new
  // store immediately. We mirror the warehouse-wide threshold and start at
  // zero on-hand — admins can rebalance from the warehouse page.
  const { data: products } = await sb
    .from('products')
    .select('id')
    .eq('active', true)
  const { data: invByProduct } = await sb
    .from('inventory')
    .select('product_id, low_stock_threshold')
  const thresholdMap = new Map(
    (invByProduct ?? []).map((r) => [r.product_id, r.low_stock_threshold ?? 5]),
  )

  if (products && products.length > 0) {
    await sb.from('location_stock').upsert(
      products.map((p) => ({
        product_id: p.id,
        location_id: data.id,
        on_hand: 0,
        low_stock_threshold: thresholdMap.get(p.id) ?? 5,
      })),
      { onConflict: 'product_id,location_id', ignoreDuplicates: true },
    )
  }

  revalidatePath('/locations')
  revalidatePath('/inventory')
  redirect(`/locations/${data.id}`)
}

export async function updateLocation(id: string, form: FormData) {
  const input = fromForm(form)
  const sb = adminClient()
  const { error } = await sb.from('locations').update(input).eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/locations')
  revalidatePath(`/locations/${id}`)
  revalidatePath('/inventory')
}

export async function deleteLocation(id: string) {
  const sb = adminClient()
  // Drop the per-location stock rows first, otherwise the FK from
  // location_stock.location_id will fail. Sales / refunds keep their
  // location_id by setting it to null on cascade — we don't want to lose
  // sale history just because a store closes.
  const { error: stockErr } = await sb
    .from('location_stock')
    .delete()
    .eq('location_id', id)
  if (stockErr) throw new Error(stockErr.message)

  const { error } = await sb.from('locations').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/locations')
  revalidatePath('/inventory')
  redirect('/locations')
}
