'use client'

import { useState, useTransition } from 'react'
import { signIn, sendRecovery } from './actions'

export function LoginForm({ initialError }: { initialError?: string }) {
  const [error, setError] = useState<string | null>(initialError ?? null)
  const [recoverySent, setRecoverySent] = useState(false)
  const [isPending, start] = useTransition()
  const [showForgot, setShowForgot] = useState(false)
  const [email, setEmail] = useState('')

  return (
    <div className="space-y-4">
      <form
        action={(form) => {
          setError(null)
          setRecoverySent(false)
          start(async () => {
            const result = await signIn(form)
            if (result?.error) setError(result.error)
          })
        }}
        className="space-y-4"
      >
        <Field label="Email">
          <input
            type="email"
            name="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@primeweb.mu"
            className={inputCls}
          />
        </Field>
        <Field label="Password">
          <input
            type="password"
            name="password"
            required
            placeholder="••••••••"
            className={inputCls}
          />
        </Field>

        {error && (
          <div className="rounded-lg border border-flash-500/40 bg-flash-50 px-3 py-2 text-xs text-flash-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-prime-700 px-4 py-3 text-sm font-bold text-paper transition hover:bg-prime-800 disabled:opacity-50"
        >
          {isPending ? 'Signing in…' : 'Sign in'}
        </button>

        <button
          type="button"
          onClick={() => setShowForgot((s) => !s)}
          className="block w-full text-center text-xs font-semibold text-ink-500 underline hover:text-ink-900"
        >
          Forgot password?
        </button>
      </form>

      {showForgot && (
        <form
          action={(form) => {
            setError(null)
            start(async () => {
              const result = await sendRecovery(form)
              if (result?.error) setError(result.error)
              else setRecoverySent(true)
            })
          }}
          className="rounded-xl border border-ink-300/60 bg-paper-dim/40 p-3"
        >
          <input type="hidden" name="email" value={email} />
          <p className="text-xs text-ink-700">
            We'll send a password reset link to <strong>{email || 'the email above'}</strong>.
          </p>
          <button
            type="submit"
            disabled={isPending || !email}
            className="mt-2 w-full rounded-lg border border-ink-300 bg-paper px-3 py-2 text-xs font-bold text-ink-900 transition hover:border-ink-700 disabled:opacity-50"
          >
            Send reset link
          </button>
          {recoverySent && (
            <p className="mt-2 text-xs text-mint-600">
              ✓ Sent. Check the inbox (or <a href="http://127.0.0.1:54324" target="_blank" className="underline">Mailpit</a> locally).
            </p>
          )}
        </form>
      )}
    </div>
  )
}

const inputCls =
  'w-full rounded-lg border border-ink-300 bg-paper px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-500 focus:border-prime-500 focus:outline-none focus:ring-2 focus:ring-prime-200'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-500">{label}</span>
      {children}
    </label>
  )
}
