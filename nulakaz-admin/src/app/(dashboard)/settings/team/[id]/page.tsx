import { notFound } from 'next/navigation'
import Link from 'next/link'
import { adminClient, serverClient } from '@/lib/supabase'
import { TeamMemberForm, type TeamMemberInitial } from '../TeamMemberForm'

export const dynamic = 'force-dynamic'

const TEAM_ROLES = ['admin', 'wholesaler', 'retailer'] as const

export default async function EditTeamMemberPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const sb = adminClient()

  const { data: profile, error } = await sb
    .from('profiles')
    .select('id, full_name, phone, shop_name, role, whatsapp_opt_in, created_at')
    .eq('id', id)
    .maybeSingle<{
      id: string
      full_name: string | null
      phone: string | null
      shop_name: string | null
      role: string
      whatsapp_opt_in: boolean
      created_at: string
    }>()

  if (error || !profile || !TEAM_ROLES.includes(profile.role as (typeof TEAM_ROLES)[number])) {
    notFound()
  }

  const { data: authData, error: authErr } = await sb.auth.admin.getUserById(id)
  if (authErr || !authData.user?.email) notFound()

  const auth = await serverClient()
  const { data: { user: currentUser } } = await auth.auth.getUser()

  const member: TeamMemberInitial = {
    id: profile.id,
    email: authData.user.email,
    full_name: profile.full_name,
    phone: profile.phone,
    shop_name: profile.shop_name,
    role: profile.role as TeamMemberInitial['role'],
    whatsapp_opt_in: profile.whatsapp_opt_in,
    created_at: profile.created_at,
  }

  return (
    <div className="space-y-5">
      <header>
        <Link
          href="/settings/team"
          className="text-xs font-semibold text-prime-700 underline hover:text-prime-800"
        >
          ← Team
        </Link>
        <h2 className="font-display mt-2 text-2xl font-black tracking-tight">
          Edit {profile.full_name?.trim() || 'team member'}
        </h2>
        <p className="mt-1 text-sm text-ink-500">
          Update profile details, sign-in email, operator role, and WhatsApp preferences.
        </p>
      </header>

      <TeamMemberForm member={member} isSelf={currentUser?.id === id} />
    </div>
  )
}
