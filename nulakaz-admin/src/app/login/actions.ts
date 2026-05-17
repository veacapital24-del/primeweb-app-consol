'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { adminClient, serverClient } from '@/lib/supabase'

export type AuthFormState = { error?: string; ok?: boolean } | null

export async function signIn(
  _prev: AuthFormState,
  form: FormData,
): Promise<AuthFormState> {
  const email = String(form.get('email') ?? '').trim().toLowerCase()
  const password = String(form.get('password') ?? '')
  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  const sb = await serverClient()
  const { error } = await sb.auth.signInWithPassword({ email, password })
  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function bootstrapFirstAdmin(
  _prev: AuthFormState,
  form: FormData,
): Promise<AuthFormState> {
  const email = String(form.get('email') ?? '').trim().toLowerCase()
  const password = String(form.get('password') ?? '')
  const fullName = String(form.get('full_name') ?? '').trim() || null

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Enter a valid email.' }
  if (password.length < 8) return { error: 'Password must be at least 8 characters.' }

  const admin = adminClient()

  // Refuse if any admin already exists. This action is meant for first-run only.
  const { count, error: countErr } = await admin
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('role', 'admin')
  if (countErr) return { error: countErr.message }
  if ((count ?? 0) > 0) return { error: 'An admin already exists. Use the sign-in form.' }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  })
  if (error || !data.user) return { error: error?.message ?? 'Failed to create user' }

  const { error: profileErr } = await admin
    .from('profiles')
    .update({ role: 'admin', full_name: fullName })
    .eq('id', data.user.id)
  if (profileErr) return { error: profileErr.message }

  // Sign them in immediately
  const sb = await serverClient()
  await sb.auth.signInWithPassword({ email, password })

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function sendRecovery(
  _prev: AuthFormState,
  form: FormData,
): Promise<AuthFormState> {
  const email = String(form.get('email') ?? '').trim().toLowerCase()
  if (!email) return { error: 'Enter your email first.' }
  const sb = await serverClient()
  const { error } = await sb.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_ADMIN_URL ?? 'http://localhost:3001'}/login`,
  })
  if (error) return { error: error.message }
  return { ok: true }
}
