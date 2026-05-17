'use client'

import { useActionState, useState } from 'react'
import { signIn, sendRecovery, type AuthFormState } from './actions'

export function LoginForm({ initialError }: { initialError?: string }) {
  const [state, formAction, isPending] = useActionState<AuthFormState, FormData>(
    signIn,
    initialError ? { error: initialError } : null,
  )
  const [recoveryState, recoveryAction, recoveryPending] = useActionState<
    AuthFormState,
    FormData
  >(sendRecovery, null)
  const [showForgot, setShowForgot] = useState(false)
  const [email, setEmail] = useState('')

  const error = state?.error ?? null
  const recoverySent = recoveryState?.ok === true

  return (
    <div className="space-y-4">
      <form action={formAction} className="space-y-4">
        <Field label="Email">
          <InputWithIcon
            icon={
              <>
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2Z" />
                <polyline points="22,6 12,13 2,6" />
              </>
            }
          >
            <input
              type="email"
              name="email"
              required
              autoFocus
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@nulakaz.mu"
              className={inputCls}
            />
          </InputWithIcon>
        </Field>

        <Field label="Password">
          <InputWithIcon
            icon={
              <>
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </>
            }
          >
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className={inputCls}
            />
          </InputWithIcon>
        </Field>

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-flash-500/40 bg-flash-50 px-3 py-2.5 text-xs text-flash-700">
            <span aria-hidden className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-flash-500" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-prime-700 px-4 py-3 text-sm font-bold text-paper shadow-[0_10px_24px_-12px_rgba(92,51,66,0.55)] transition-all hover:bg-prime-800 hover:shadow-[0_14px_32px_-12px_rgba(92,51,66,0.6)] active:scale-[0.99] disabled:opacity-50"
        >
          <span>{isPending ? 'Signing in…' : 'Sign in'}</span>
          {!isPending && (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              aria-hidden
              className="transition-transform group-hover:translate-x-0.5"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="13 5 20 12 13 19" />
            </svg>
          )}
        </button>

        <button
          type="button"
          onClick={() => setShowForgot((s) => !s)}
          className="block w-full text-center font-display text-[13px] italic text-ink-500 transition-colors hover:text-prime-700"
        >
          {showForgot ? 'Hide reset' : 'Forgot password?'}
        </button>
      </form>

      {showForgot && (
        <form
          action={recoveryAction}
          className="rounded-2xl border border-ink-300/60 bg-paper-dim/60 p-4"
        >
          <input type="hidden" name="email" value={email} />
          <p className="text-[12px] leading-relaxed text-ink-700">
            We'll send a password reset link to{' '}
            <strong className="font-semibold text-ink-900">{email || 'the email above'}</strong>.
          </p>
          {recoveryState?.error && (
            <p className="mt-2 text-[11.5px] font-semibold text-flash-700">{recoveryState.error}</p>
          )}
          <button
            type="submit"
            disabled={recoveryPending || !email}
            className="mt-3 w-full rounded-xl border border-ink-300 bg-paper px-3 py-2 text-xs font-bold text-ink-900 transition-all hover:border-prime-500 hover:text-prime-700 disabled:opacity-50"
          >
            {recoveryPending ? 'Sending…' : 'Send reset link'}
          </button>
          {recoverySent && (
            <p className="mt-3 inline-flex items-center gap-2 text-[11.5px] font-semibold text-mint-600">
              <span aria-hidden className="block h-1.5 w-1.5 rounded-full bg-mint-500" />
              Sent. Check your inbox.
            </p>
          )}
        </form>
      )}
    </div>
  )
}

const inputCls =
  'w-full rounded-xl border border-ink-300 bg-paper py-2.5 pl-10 pr-3 text-sm text-ink-900 placeholder:text-ink-500/70 focus:border-prime-500 focus:outline-none focus:ring-2 focus:ring-prime-200 transition-shadow'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.22em] text-ink-500">
        {label}
      </span>
      {children}
    </label>
  )
}

function InputWithIcon({
  icon,
  children,
}: {
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="relative">
      <span
        aria-hidden
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-500"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.85"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {icon}
        </svg>
      </span>
      {children}
    </div>
  )
}
