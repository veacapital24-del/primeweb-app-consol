import { redirect } from 'next/navigation'
import { adminClient, serverClient } from './supabase'

export type Me = {
  id: string
  email: string | null
  full_name: string | null
  role: string
}

// Returns the signed-in user's profile, redirecting to /login if absent.
export async function getMe(): Promise<Me> {
  const sb = await serverClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect('/login')

  const admin = adminClient()
  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .maybeSingle<{ full_name: string | null; role: string }>()

  if (profileError) {
    console.error('[getMe] profiles:', profileError.message)
  }

  return {
    id: user.id,
    email: user.email ?? null,
    full_name: profile?.full_name ?? null,
    role: profile?.role ?? 'customer',
  }
}

// Hard guard for admin-only pages. Use at the top of admin server components.
export async function requireAdmin(): Promise<Me> {
  const me = await getMe()
  if (me.role !== 'admin') redirect('/?error=admin-only')
  return me
}
