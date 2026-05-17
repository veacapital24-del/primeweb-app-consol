import Image from 'next/image'
import Link from 'next/link'
import { Alert, FormPanel } from '@/components/ui'
import { LoginForm } from './LoginForm'

export const metadata = { title: 'Sign in — NuLakaz POS' }
export const dynamic = 'force-dynamic'

type PageProps = {
  searchParams: Promise<{ signed_out?: string; error?: string; next?: string; config?: string }>
}

export default async function LoginPage({ searchParams }: PageProps) {
  const { signed_out, error } = await searchParams

  return (
    <div className="grid min-h-screen place-items-center bg-canvas p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <Image
            src="/nulakaz-wordmark.webp"
            alt="NuLakaz"
            width={170}
            height={55}
            priority
            className="h-10 w-auto object-contain"
          />
          <span className="rounded-full bg-prime-700 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-paper">
            Point of Sale
          </span>
        </div>

        {signed_out ? (
          <Alert variant="success" className="text-center text-xs">
            You've been signed out.
          </Alert>
        ) : null}
        {error === 'no-access' ? (
          <Alert className="text-center text-xs">
            That account doesn't have POS access. Ask an admin to assign you to a location.
          </Alert>
        ) : null}
        {error === 'session' ? (
          <Alert className="text-center text-xs">
            Your session expired or was invalid. Please sign in again.
          </Alert>
        ) : null}
        {error === 'unavailable' ? (
          <Alert className="text-center text-xs">
            Could not reach the database. Start local Supabase with{' '}
            <code className="rounded bg-ink-100 px-1">supabase start</code> in NuLakaz Bankend Consol, then reload.
          </Alert>
        ) : null}
        {error === 'config' ? (
          <Alert className="text-center text-xs">
            Missing Supabase environment variables. Check <code className="rounded bg-ink-100 px-1">.env.local</code>.
          </Alert>
        ) : null}

        <FormPanel>
          <h1 className="font-display mb-4 text-xl font-black tracking-tight">Sign in</h1>
          <LoginForm />
        </FormPanel>

        <div className="text-center text-xs text-ink-500">
          Admin:{' '}
          <Link
            href={process.env.NEXT_PUBLIC_ADMIN_URL ?? 'http://localhost:3001'}
            className="underline hover:text-ink-900"
          >
            {(process.env.NEXT_PUBLIC_ADMIN_URL ?? 'http://localhost:3001').replace(/^https?:\/\//, '')}
          </Link>
        </div>
      </div>
    </div>
  )
}
