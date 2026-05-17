'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { serverClient } from '@/lib/supabase'
import type { LocationKind } from '@/lib/types'

const KINDS: LocationKind[] = ['store', 'warehouse', 'kiosk', 'popup']

function parseLocation(form: FormData) {
  const code = String(form.get('code') ?? '').trim().toUpperCase()
  const name = String(form.get('name') ?? '').trim()
  const kindRaw = String(form.get('kind') ?? 'store')
  const kind: LocationKind = (KINDS as string[]).includes(kindRaw) ? (kindRaw as LocationKind) : 'store'
  const address = String(form.get('address') ?? '').trim() || null
  const phone = String(form.get('phone') ?? '').trim() || null
  const timezone = String(form.get('timezone') ?? '').trim() || 'Indian/Mauritius'
  const currency = String(form.get('currency') ?? '').trim().toUpperCase() || 'MUR'
  const active = form.get('active') === 'on' || form.get('active') === 'true'

  if (!code) return { error: 'Code is required.' as const }
  if (!/^[A-Z0-9-]{2,16}$/.test(code)) return { error: 'Code must be 2–16 chars: A–Z, 0–9, dash.' as const }
  if (!name) return { error: 'Name is required.' as const }

  return { data: { code, name, kind, address, phone, timezone, currency, active } }
}

export async function createLocation(form: FormData) {
  const parsed = parseLocation(form)
  if ('error' in parsed) return { error: parsed.error }

  const sb = await serverClient()
  const { data, error } = await sb
    .from('locations')
    .insert(parsed.data)
    .select('id')
    .single()

  if (error) return { error: error.message }

  revalidatePath('/locations')
  redirect(`/locations/${data.id}`)
}

export async function updateLocation(id: string, form: FormData) {
  const parsed = parseLocation(form)
  if ('error' in parsed) return { error: parsed.error }

  const sb = await serverClient()
  const { error } = await sb.from('locations').update(parsed.data).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/locations')
  revalidatePath(`/locations/${id}`)
  return { ok: true }
}

export async function toggleLocationActive(id: string, next: boolean) {
  const sb = await serverClient()
  const { error } = await sb.from('locations').update({ active: next }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/locations')
  revalidatePath(`/locations/${id}`)
  return { ok: true }
}
