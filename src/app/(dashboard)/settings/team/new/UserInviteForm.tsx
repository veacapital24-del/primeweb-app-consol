'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { inviteUser } from '../actions'

type Role = 'customer' | 'retailer' | 'wholesaler' | 'admin'
type Kind = 'team' | 'customer'

export function UserInviteForm({
  kind = 'team',
  defaultRole = 'admin',
}: {
  kind?: Kind
  defaultRole?: Role
} = {}) {
  const [isPending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<{ email: string; recoveryUrl: string | null } | null>(null)
  const [role, setRole] = useState<Role>(defaultRole)
  const isCustomerForm = kind === 'customer'

  const onSubmit = (form: FormData) => {
    setError(null)
    setSuccess(null)
    start(async () => {
      try {
        const result = await inviteUser(form)
        setSuccess({ email: result.email, recoveryUrl: result.recoveryUrl })
      } catch (e) {
        if (e instanceof Error) setError(e.message)
      }
    })
  }

  if (success) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-mint-500/30 bg-mint-100 p-5">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-mint-500 text-white">✓</span>
            <h2 className="font-display text-xl font-black text-mint-600">User invited</h2>
          </div>
          <p className="mt-2 text-sm text-ink-700">
            An auth account was created for <strong>{success.email}</strong>. Share the recovery link below so they can set their own password.
          </p>
          {success.recoveryUrl ? (
            <div className="mt-3 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-widest text-ink-500">Password set link</div>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={success.recoveryUrl}
                  className="flex-1 rounded-lg border border-ink-300 bg-paper px-3 py-2 font-mono text-[11px]"
                />
                <button
                  type="button"
                  onClick={() => navigator.clipboard?.writeText(success.recoveryUrl!)}
                  className="rounded-lg bg-ink-900 px-3 py-2 text-xs font-bold text-paper hover:bg-prime-700"
                >
                  Copy
                </button>
              </div>
              <p className="text-[11px] text-ink-500">
                Single-use, expires per Supabase auth policy. The user can also use the standard "Forgot password" flow.
              </p>
            </div>
          ) : (
            <p className="mt-3 text-xs text-ink-500">No recovery link returned — check Mailpit at <a href="http://127.0.0.1:54324" target="_blank" className="underline">localhost:54324</a> for the auto-sent recovery email.</p>
          )}
        </div>
        <div className="flex gap-2">
          <Link
            href={isCustomerForm ? '/customers' : '/settings/team'}
            className="rounded-xl bg-prime-700 px-4 py-2 text-sm font-bold text-paper transition hover:bg-prime-800"
          >
            ← Back to {isCustomerForm ? 'customers' : 'team'}
          </Link>
          <button
            type="button"
            onClick={() => setSuccess(null)}
            className="rounded-xl border border-ink-300 bg-paper px-4 py-2 text-sm font-bold text-ink-900 transition hover:border-ink-700"
          >
            {isCustomerForm ? 'Add another customer' : 'Invite another teammate'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <form action={onSubmit} className="space-y-6">
      {error && (
        <div className="rounded-xl border border-flash-500/40 bg-flash-50 px-4 py-3 text-sm text-flash-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card title="Account">
            <Field label="Email" required hint="The user will use this to sign in. We'll auto-confirm it.">
              <input
                name="email"
                type="email"
                required
                autoFocus
                placeholder="someone@example.com"
                className={inputCls}
              />
            </Field>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Full name">
                <input name="full_name" placeholder="Jean Dupont" className={inputCls} />
              </Field>
              <Field label="Phone">
                <input name="phone" type="tel" placeholder="+230 5xxx xxxx" className={inputCls} />
              </Field>
            </div>
            <Field label="Shop name" hint="Required for tabagie / wholesaler accounts" className="mt-4">
              <input name="shop_name" placeholder="e.g. Tabagie La Caverne" className={inputCls} />
            </Field>
          </Card>

          <Card title={isCustomerForm ? 'Customer profile' : 'Operator role'}>
            {isCustomerForm ? (
              <>
                <div className="rounded-xl border border-prime-200 bg-prime-50 p-3 text-xs text-ink-700">
                  This account will be a <strong>customer</strong>. To grant operator access (admin, wholesaler, retailer), use the <Link href="/settings/team/new?kind=team" className="font-bold text-prime-700 underline">team invite</Link> instead.
                </div>
                <input type="hidden" name="role" value="customer" />
              </>
            ) : (
              <div className="grid gap-2">
                {TEAM_ROLES.map((r) => (
                  <label
                    key={r.value}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                      role === r.value ? 'border-prime-700 bg-prime-50' : 'border-ink-300 bg-paper hover:border-ink-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={r.value}
                      checked={role === r.value}
                      onChange={() => setRole(r.value)}
                      className="mt-1 h-4 w-4 text-prime-700 focus:ring-prime-500"
                    />
                    <div>
                      <div className="text-sm font-bold capitalize text-ink-900">{r.value}</div>
                      <div className="text-xs text-ink-500">{r.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="What happens next">
            <ol className="space-y-3 text-xs text-ink-700">
              <Step n={1}>An auth user is created in Supabase with a temporary password.</Step>
              <Step n={2}>Their <code className="rounded bg-paper-dim px-1">profiles</code> row is created via trigger and updated with the role.</Step>
              <Step n={3}>You'll get a one-time link to share so they can set their own password.</Step>
              <Step n={4}>Locally, the recovery email also lands in <a href="http://127.0.0.1:54324" target="_blank" className="font-semibold text-prime-700 underline">Mailpit</a>.</Step>
            </ol>
          </Card>
        </div>
      </div>

      <div className="sticky bottom-4 flex items-center justify-between gap-3 rounded-2xl border border-ink-300/60 bg-paper px-5 py-3 shadow-lg shadow-ink-900/10">
        <Link href={isCustomerForm ? '/customers' : '/settings/team'} className="text-sm font-semibold text-ink-700 underline">
          ← Back to {isCustomerForm ? 'customers' : 'team'}
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-prime-700 px-5 py-2.5 text-sm font-bold text-paper transition hover:bg-prime-800 disabled:opacity-50"
        >
          {isPending ? 'Inviting…' : (isCustomerForm ? 'Add customer' : 'Invite teammate')}
        </button>
      </div>
    </form>
  )
}

const TEAM_ROLES = [
  { value: 'admin'      as const, desc: 'Full access to this admin console.' },
  { value: 'wholesaler' as const, desc: 'High-volume B2B. Special account terms.' },
  { value: 'retailer'   as const, desc: 'Tabagie buyer — sees wholesale tier on the storefront.' },
]

const inputCls =
  'w-full rounded-lg border border-ink-300 bg-paper px-3 py-2 text-sm text-ink-900 placeholder:text-ink-500 focus:border-prime-500 focus:outline-none focus:ring-2 focus:ring-prime-200'

function Field({ label, required, hint, children, className = '' }: { label: string; required?: boolean; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      {label && (
        <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-500">
          {label} {required && <span className="text-flash-500">*</span>}
        </span>
      )}
      {children}
      {hint && <span className="mt-1 block text-[11px] text-ink-500">{hint}</span>}
    </label>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-ink-300/60 bg-paper p-5">
      <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-ink-500">{title}</h2>
      {children}
    </section>
  )
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-prime-700 text-[10px] font-bold text-paper">{n}</span>
      <span>{children}</span>
    </li>
  )
}
