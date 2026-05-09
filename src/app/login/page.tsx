import Image from 'next/image'
import Link from 'next/link'
import { LoginForm } from './LoginForm'
import { BootstrapForm } from './BootstrapForm'
import { adminClient } from '@/lib/supabase'

export const metadata = { title: 'Sign in — NuLakaz Admin' }
export const dynamic = 'force-dynamic'

type PageProps = { searchParams: Promise<{ signed_out?: string; error?: string; next?: string }> }

// Photographic backdrop for the editorial hero pane. Loaded as a CSS
// `background-image` so we don't need to thread Unsplash through next/image's
// remotePatterns allowlist on the admin app.
const HERO_BG =
  'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1800&q=80'

export default async function LoginPage({ searchParams }: PageProps) {
  const { signed_out, error } = await searchParams

  // Detect first-run: zero admins → show the bootstrap form instead of sign-in.
  const sb = adminClient()
  const { count } = await sb
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('role', 'admin')
  const needsBootstrap = (count ?? 0) === 0

  const storefront = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'https://nulakaz-web.vercel.app'

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[1.05fr_minmax(0,520px)]">
      {/* ─────────────────────────── Editorial hero ─────────────────────────── */}
      <aside className="relative hidden overflow-hidden bg-prime-900 lg:block">
        {/* Photo backdrop */}
        <span
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${HERO_BG})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        {/* Brand-tinted gradient overlay */}
        <span
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(125deg, rgba(92,51,66,0.92) 0%, rgba(130,68,90,0.78) 45%, rgba(183,90,116,0.55) 100%)',
          }}
        />
        {/* Paper-grain texture for warmth */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='5'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.4 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          }}
        />

        {/* Top rail — wordmark + N°00 chip */}
        <div className="relative flex items-center justify-between px-12 pt-10 text-paper/85">
          <span className="font-display text-sm italic tracking-[0.18em] uppercase">
            NuLakaz · Mo Lakaz
          </span>
          <span className="font-display text-sm italic tracking-[0.2em]">
            <span className="text-paper">N°</span>00
          </span>
        </div>

        {/* Headline + body, anchored bottom-left */}
        <div className="relative flex h-full flex-col justify-end px-12 pb-14 pr-16">
          <span className="mb-6 inline-flex items-center gap-2 self-start text-[11px] font-semibold uppercase tracking-[0.32em] text-paper/85">
            <span className="block h-px w-9 bg-paper/60" />
            Operator console
          </span>
          <h1 className="font-display text-[56px] font-semibold leading-[0.95] tracking-tight text-paper">
            Run the shelf,
            <br />
            <em className="font-light italic text-prime-200">your way</em>
            <span className="text-prime-300">.</span>
          </h1>
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-paper/85">
            Manage products, brands, inventory and orders for the NuLakaz
            storefront — sourced for Mauritius, restocked weekly.
          </p>

          {/* Mini stats — editorial chips */}
          <ul className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] text-paper/80">
            <li className="inline-flex items-center gap-2">
              <span aria-hidden className="block h-1.5 w-1.5 rounded-full bg-mint-500" />
              <span className="font-semibold">Live catalog</span>
            </li>
            <li className="inline-flex items-center gap-2">
              <span aria-hidden className="block h-1.5 w-1.5 rounded-full bg-prime-300" />
              <span className="font-semibold">Cold-chain delivery</span>
            </li>
            <li className="inline-flex items-center gap-2">
              <span aria-hidden className="block h-1.5 w-1.5 rounded-full bg-amber-500" />
              <span className="font-semibold">Mauritius-wide, next-day</span>
            </li>
          </ul>

          {/* Bottom credit + storefront link */}
          <div className="mt-12 flex items-baseline justify-between gap-3 border-t border-paper/15 pt-6 text-[11px] uppercase tracking-[0.3em] text-paper/65">
            <span className="font-semibold">Admin console · v.2026</span>
            <a
              href={storefront}
              target="_blank"
              rel="noopener noreferrer"
              className="font-display text-sm italic tracking-normal text-paper normal-case transition-colors hover:text-prime-200"
            >
              View storefront →
            </a>
          </div>
        </div>
      </aside>

      {/* ───────────────────────────── Form pane ─────────────────────────────── */}
      <main
        className="relative flex flex-col items-center justify-center px-5 py-10 sm:px-8"
        style={{
          backgroundImage:
            'radial-gradient(60% 50% at 50% 0%, rgba(183,90,116,0.10), transparent 70%), linear-gradient(180deg, var(--color-canvas) 0%, var(--color-paper-dim) 100%)',
        }}
      >
        {/* Mobile-only mini wordmark + storefront link */}
        <div className="mb-8 flex w-full max-w-md items-center justify-between lg:hidden">
          <Image
            src="/logo/nulakaz-wordmark.webp"
            alt="NuLakaz"
            width={3139}
            height={1015}
            priority
            className="h-7 w-auto"
          />
          <Link
            href={storefront}
            className="font-display text-xs italic text-ink-500 hover:text-ink-900"
          >
            Storefront →
          </Link>
        </div>

        <div className="w-full max-w-md">
          {/* Editorial heading */}
          <header className="mb-7 flex flex-col items-start">
            <span className="mb-3 hidden lg:block">
              <Image
                src="/logo/nulakaz-wordmark.webp"
                alt="NuLakaz"
                width={3139}
                height={1015}
                priority
                className="h-9 w-auto"
              />
            </span>
            <span className="inline-flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.32em] text-ink-500">
              <span className="block h-px w-7 bg-prime-700/40" />
              Admin console
            </span>
            <h2 className="mt-2 font-display text-[34px] font-semibold leading-[1.02] tracking-tight text-ink-900">
              {needsBootstrap ? (
                <>
                  Set up{' '}
                  <em className="font-light italic text-prime-700">admin</em>
                  <span className="text-prime-700">.</span>
                </>
              ) : (
                <>
                  Welcome{' '}
                  <em className="font-light italic text-prime-700">back</em>
                  <span className="text-prime-700">.</span>
                </>
              )}
            </h2>
            <p className="mt-2 text-[13.5px] leading-relaxed text-ink-500">
              {needsBootstrap
                ? 'No admin exists yet. Create the first account to lock down this console.'
                : 'Sign in with the credentials issued to your team.'}
            </p>
          </header>

          {/* Status banners */}
          {signed_out && (
            <div className="mb-5 flex items-start gap-3 rounded-2xl border border-mint-500/30 bg-mint-100 px-4 py-3 text-xs font-semibold text-mint-600">
              <span aria-hidden className="mt-0.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-mint-500" />
              <span>You've been signed out. See you again soon.</span>
            </div>
          )}
          {error === 'not-admin' && (
            <div className="mb-5 flex items-start gap-3 rounded-2xl border border-flash-500/40 bg-flash-50 px-4 py-3 text-xs font-semibold text-flash-700">
              <span aria-hidden className="mt-0.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-flash-500" />
              <span>That account doesn't have admin access. Ask an existing admin to promote it.</span>
            </div>
          )}

          {/* Form card */}
          <div className="rounded-3xl border border-ink-300/60 bg-paper p-6 shadow-[0_24px_60px_-30px_rgba(92,51,66,0.45)] sm:p-7">
            {needsBootstrap ? <BootstrapForm /> : <LoginForm />}
          </div>

          {/* Footer hints */}
          <ul className="mt-6 flex flex-wrap items-center justify-between gap-3 text-[11px] uppercase tracking-[0.28em] text-ink-500">
            <li className="font-semibold">Secure · Encrypted at rest</li>
            <li>
              <a
                href={storefront}
                target="_blank"
                rel="noopener noreferrer"
                className="font-display normal-case italic tracking-normal text-prime-700 hover:text-prime-800"
              >
                NuLakaz storefront →
              </a>
            </li>
          </ul>
        </div>
      </main>
    </div>
  )
}
