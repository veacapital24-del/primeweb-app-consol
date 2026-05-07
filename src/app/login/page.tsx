import Image from 'next/image'
import Link from 'next/link'
import { LoginForm } from './LoginForm'
import { BootstrapForm } from './BootstrapForm'
import { adminClient } from '@/lib/supabase'

export const metadata = { title: 'Sign in — Primeweb Admin' }
export const dynamic = 'force-dynamic'

type PageProps = { searchParams: Promise<{ signed_out?: string; error?: string; next?: string }> }

export default async function LoginPage({ searchParams }: PageProps) {
  const { signed_out, error } = await searchParams

  // Detect first-run: zero admins → show the bootstrap form instead of sign-in.
  const sb = adminClient()
  const { count } = await sb
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('role', 'admin')
  const needsBootstrap = (count ?? 0) === 0

  return (
    <div className="grid min-h-screen place-items-center bg-canvas p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <Image
            src="/primeweb-logo.webp"
            alt="Primeweb"
            width={3733}
            height={575}
            priority
            className="h-[24px] w-auto"
          />
          <span className="rounded-full bg-prime-700 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-paper">
            Admin console
          </span>
        </div>

        {signed_out && (
          <div className="rounded-xl border border-mint-500/30 bg-mint-100 px-4 py-3 text-center text-xs font-semibold text-mint-600">
            ✓ You've been signed out.
          </div>
        )}
        {error === 'not-admin' && (
          <div className="rounded-xl border border-flash-500/40 bg-flash-50 px-4 py-3 text-center text-xs font-semibold text-flash-700">
            That account doesn't have admin access. Ask an existing admin to promote it.
          </div>
        )}

        <div className="rounded-2xl border border-ink-300/60 bg-paper p-5 shadow-sm">
          <h1 className="font-display mb-4 text-xl font-black tracking-tight">
            {needsBootstrap ? 'Set up admin' : 'Sign in'}
          </h1>
          {needsBootstrap ? <BootstrapForm /> : <LoginForm />}
        </div>

        <div className="text-center text-xs text-ink-500">
          Storefront: <Link href="http://localhost:3002" className="underline hover:text-ink-900">localhost:3002</Link>
          {' · '}
          Studio: <Link href="http://127.0.0.1:54323" className="underline hover:text-ink-900">localhost:54323</Link>
        </div>
      </div>
    </div>
  )
}
