import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/Sidebar'
import { adminClient, serverClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Middleware has already verified there's a session — here we enforce the role.
  const sb = await serverClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect('/login')

  const admin = adminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .maybeSingle<{ full_name: string | null; role: string }>()

  if (!profile || profile.role !== 'admin') {
    // Sign them out so middleware doesn't loop them back in once they "log in" again
    await sb.auth.signOut()
    redirect('/login?error=not-admin')
  }

  const me = {
    id: user.id,
    email: user.email ?? null,
    full_name: profile.full_name,
    role: profile.role,
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar me={me} />
      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
