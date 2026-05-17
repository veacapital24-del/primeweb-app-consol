'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { adminClient, serverClient } from '@/lib/supabase'

const ROLES = ['customer', 'retailer', 'wholesaler', 'admin'] as const
const TEAM_ROLES = ['admin', 'wholesaler', 'retailer'] as const
type Role = typeof ROLES[number]
type TeamRole = typeof TEAM_ROLES[number]

async function requireAdmin() {
  const sb = await serverClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) throw new Error('Not signed in')

  const admin = adminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle<{ role: string }>()

  if (profile?.role !== 'admin') throw new Error('Admin access required')
  return user
}

async function assertCanChangeRole(userId: string, newRole: Role) {
  if (newRole === 'admin') return

  const sb = adminClient()
  const { data: current } = await sb
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle<{ role: string }>()

  if (current?.role !== 'admin') return

  const { count } = await sb
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('role', 'admin')

  if ((count ?? 0) <= 1) {
    throw new Error('Cannot change the role of the last admin account.')
  }
}

export async function setUserRole(userId: string, role: Role) {
  await requireAdmin()
  if (!ROLES.includes(role)) throw new Error('invalid role')
  await assertCanChangeRole(userId, role)
  const sb = adminClient()
  const { error } = await sb.from('profiles').update({ role }).eq('id', userId)
  if (error) throw new Error(error.message)
  revalidateTeamPaths(userId)
}

export async function updateTeamMember(userId: string, form: FormData) {
  await requireAdmin()

  const email = String(form.get('email') ?? '').trim().toLowerCase()
  const fullName = (String(form.get('full_name') ?? '').trim() || null) as string | null
  const phone = (String(form.get('phone') ?? '').trim() || null) as string | null
  const shopName = (String(form.get('shop_name') ?? '').trim() || null) as string | null
  const roleInput = String(form.get('role') ?? '')
  const whatsappOptIn = form.get('whatsapp_opt_in') === 'on'

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('A valid email is required')
  }
  if (!TEAM_ROLES.includes(roleInput as TeamRole)) {
    throw new Error('Invalid operator role')
  }
  const role = roleInput as TeamRole

  await assertCanChangeRole(userId, role)

  const sb = adminClient()

  const { data: existing, error: loadErr } = await sb
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle<{ role: string }>()
  if (loadErr) throw new Error(loadErr.message)
  if (!existing || !TEAM_ROLES.includes(existing.role as TeamRole)) {
    throw new Error('Team member not found')
  }

  const { error: authErr } = await sb.auth.admin.updateUserById(userId, {
    email,
    user_metadata: { full_name: fullName },
  })
  if (authErr) throw new Error(authErr.message)

  const { error: profileErr } = await sb
    .from('profiles')
    .update({
      full_name: fullName,
      phone,
      shop_name: shopName,
      role,
      whatsapp_opt_in: whatsappOptIn,
    })
    .eq('id', userId)
  if (profileErr) throw new Error(profileErr.message)

  revalidateTeamPaths(userId)
}

export async function updateTeamMemberAndRedirect(userId: string, form: FormData) {
  await updateTeamMember(userId, form)
  redirect('/settings/team')
}

export async function sendTeamMemberRecoveryLink(userId: string): Promise<{ recoveryUrl: string | null }> {
  await requireAdmin()
  const sb = adminClient()
  const { data: authUser, error } = await sb.auth.admin.getUserById(userId)
  if (error || !authUser.user?.email) throw new Error('Could not load user email')

  const { data: linkData } = await sb.auth.admin.generateLink({
    type: 'recovery',
    email: authUser.user.email,
  })

  return { recoveryUrl: linkData?.properties?.action_link ?? null }
}

function revalidateTeamPaths(userId: string) {
  revalidatePath('/settings/team')
  revalidatePath(`/settings/team/${userId}`)
  revalidatePath('/customers')
  revalidatePath('/', 'layout')
}

export async function setWhatsAppOptIn(userId: string, optIn: boolean) {
  await requireAdmin()
  const sb = adminClient()
  const { error } = await sb.from('profiles').update({ whatsapp_opt_in: optIn }).eq('id', userId)
  if (error) throw new Error(error.message)
  revalidateTeamPaths(userId)
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
  revalidatePath('/customers')
  return { ok: true, email, recoveryUrl }
}

export async function inviteUserAndRedirect(form: FormData) {
  await inviteUser(form)
  redirect('/settings/team')
}
