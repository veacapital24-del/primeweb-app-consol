'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { adminClient } from '@/lib/supabase'

const ROLES = ['customer', 'retailer', 'wholesaler', 'admin'] as const
type Role = typeof ROLES[number]

export async function setUserRole(userId: string, role: Role) {
  if (!ROLES.includes(role)) throw new Error('invalid role')
  const sb = adminClient()
  const { error } = await sb.from('profiles').update({ role }).eq('id', userId)
  if (error) throw new Error(error.message)
  revalidatePath('/settings/team')
  revalidatePath('/settings/customers')
}

export async function setWhatsAppOptIn(userId: string, optIn: boolean) {
  const sb = adminClient()
  const { error } = await sb.from('profiles').update({ whatsapp_opt_in: optIn }).eq('id', userId)
  if (error) throw new Error(error.message)
  revalidatePath('/settings/team')
  revalidatePath('/settings/customers')
}

export async function inviteUser(form: FormData): Promise<{ ok: true; email: string; recoveryUrl: string | null }> {
  const email = String(form.get('email') ?? '').trim().toLowerCase()
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('A valid email is required')
  }

  const roleInput = String(form.get('role') ?? 'customer')
  if (!ROLES.includes(roleInput as Role)) throw new Error('Invalid role')
  const role = roleInput as Role
  const fullName = (String(form.get('full_name') ?? '').trim() || null) as string | null
  const phone    = (String(form.get('phone') ?? '').trim() || null)    as string | null
  const shopName = (String(form.get('shop_name') ?? '').trim() || null) as string | null

  const sb = adminClient()

  // Create the auth user with a throwaway password — they'll reset it via the recovery link.
  const tempPassword = crypto.randomUUID() + crypto.randomUUID().slice(0, 8)

  const { data, error } = await sb.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  })
  if (error || !data.user) {
    throw new Error(error?.message ?? 'Failed to create user')
  }

  // The on_auth_user_created trigger inserts a profile row already; patch the rest.
  const { error: profileErr } = await sb
    .from('profiles')
    .update({
      role,
      full_name: fullName,
      phone,
      shop_name: shopName,
    })
    .eq('id', data.user.id)
  if (profileErr) throw new Error(profileErr.message)

  // Generate a recovery link the admin can share with the user.
  let recoveryUrl: string | null = null
  const { data: linkData } = await sb.auth.admin.generateLink({ type: 'recovery', email })
  recoveryUrl = linkData?.properties?.action_link ?? null

  revalidatePath('/settings/team')
  revalidatePath('/settings/customers')
  return { ok: true, email, recoveryUrl }
}

export async function inviteUserAndRedirect(form: FormData) {
  await inviteUser(form)
  redirect('/settings/team')
}
