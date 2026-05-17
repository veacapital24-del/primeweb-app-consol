'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { serverClient } from '@/lib/supabase'

function parseRegister(form: FormData) {
  const location_id = String(form.get('location_id') ?? '').trim()
  const code = String(form.get('code') ?? '').trim().toUpperCase()
  const name = String(form.get('name') ?? '').trim()
  const active = form.get('active') === 'on' || form.get('active') === 'true'

  if (!location_id) return { error: 'Location is required.' as const }
  if (!code) return { error: 'Code is required.' as const }
  if (!/^[A-Z0-9-]{2,16}$/.test(code)) return { error: 'Code must be 2–16 chars: A–Z, 0–9, dash.' as const }
  if (!name) return { error: 'Name is required.' as const }

  return { data: { location_id, code, name, active } }
}

export async function createRegister(form: FormData) {
  const parsed = parseRegister(form)
  if ('error' in parsed) return { error: parsed.error }

  const sb = await serverClient()
  const { data, error } = await sb
    .from('registers')
    .insert(parsed.data)
    .select('id')
    .single()

  if (error) return { error: error.message }

  revalidatePath('/registers')
  redirect(`/registers/${data.id}`)
}

export async function updateRegister(id: string, form: FormData) {
  const parsed = parseRegister(form)
  if ('error' in parsed) return { error: parsed.error }

  const sb = await serverClient()
  const { error } = await sb.from('registers').update(parsed.data).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/registers')
  revalidatePath(`/registers/${id}`)
  return { ok: true }
}

export async function toggleRegisterActive(id: string, next: boolean) {
  const sb = await serverClient()
  const { error } = await sb.from('registers').update({ active: next }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/registers')
  revalidatePath(`/registers/${id}`)
  return { ok: true }
}
