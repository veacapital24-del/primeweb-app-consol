'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { adminClient, serverClient } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'
import type { PosRole } from './types'

const ROLES: PosRole[] = ['cashier', 'manager']

function parseAssignment(form: FormData) {
  const user_id = String(form.get('user_id') ?? '').trim()
  const location_id = String(form.get('location_id') ?? '').trim()
  const roleRaw = String(form.get('role') ?? 'cashier')
  const role: PosRole = (ROLES as string[]).includes(roleRaw) ? (roleRaw as PosRole) : 'cashier'

  if (!user_id) return { error: 'User is required.' as const }
  if (!location_id) return { error: 'Location is required.' as const }

  return { data: { user_id, location_id, role } }
}

export async function assignStaff(form: FormData) {
  await requireAdmin()
  const parsed = parseAssignment(form)
  if ('error' in parsed) return { error: parsed.error }

  const sb = await serverClient()
  const { error } = await sb
    .from('staff_locations')
    .upsert(parsed.data, { onConflict: 'user_id,location_id' })

  if (error) return { error: error.message }

  revalidatePath('/staff')
  redirect('/staff')
}

export async function updateRole(user_id: string, location_id: string, role: PosRole) {
  await requireAdmin()
  if (!ROLES.includes(role)) return { error: 'Invalid role.' }

  const sb = await serverClient()
  const { error } = await sb
    .from('staff_locations')
    .update({ role })
    .eq('user_id', user_id)
    .eq('location_id', location_id)

  if (error) return { error: error.message }
  revalidatePath('/staff')
  return { ok: true }
}

export async function removeStaff(user_id: string, location_id: string) {
  await requireAdmin()
  const sb = await serverClient()
  const { error } = await sb
    .from('staff_locations')
    .delete()
    .eq('user_id', user_id)
    .eq('location_id', location_id)

  if (error) return { error: error.message }
  revalidatePath('/staff')
  return { ok: true }
}

// Pull the full user list with email + name. Admin-only because it touches
// auth.users. Used by the assignment form's user picker.
export async function listUsersWithEmail(): Promise<
  { id: string; email: string | null; full_name: string | null; role: string }[]
> {
  await requireAdmin()
  const admin = adminClient()

  // Page through auth users (service role bypasses RLS)
  const { data: page } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 })
  const users = page?.users ?? []

  if (users.length === 0) return []

  const ids = users.map((u) => u.id)
  const { data: profiles } = await admin
    .from('profiles')
    .select('id, full_name, role')
    .in('id', ids)

  const byId = new Map<string, { full_name: string | null; role: string }>()
  for (const p of profiles ?? []) byId.set(p.id, { full_name: p.full_name, role: p.role })

  return users
    .map((u) => ({
      id: u.id,
      email: u.email ?? null,
      full_name: byId.get(u.id)?.full_name ?? null,
      role: byId.get(u.id)?.role ?? 'customer',
    }))
    .sort((a, b) => (a.email ?? '').localeCompare(b.email ?? ''))
}
