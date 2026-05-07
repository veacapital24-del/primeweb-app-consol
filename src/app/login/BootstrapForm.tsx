'use client'

import { useState, useTransition } from 'react'
import { bootstrapFirstAdmin } from './actions'

export function BootstrapForm() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, start] = useTransition()

  return (
    <form
      action={(form) => {
        setError(null)
        start(async () => {
          const result = await bootstrapFirstAdmin(form)
          if (result?.error) setError(result.error)
        })
      }}
      className="space-y-4"
    >
      <div className="rounded-xl border border-prime-200 bg-prime-50 px-3 py-2 text-xs text-ink-700">
        <strong className="text-prime-700">First-run setup.</strong> No admin exists yet. Create the first one to lock down this console.
      </div>

      <Field label="Full name">
        <input name="full_name" placeholder="Your name" autoFocus className={inputCls} />
      </Field>
      <Field label="Email">
        <input name="email" type="email" required placeholder="you@primeweb.mu" className={inputCls} />
      </Field>
      <Field label="Password" hint="Minimum 8 characters">
        <input name="password" type="password" required minLength={8} placeholder="••••••••" className={inputCls} />
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
        {isPending ? 'Creating admin…' : 'Create first admin'}
      </button>
      <p className="text-center text-[11px] text-ink-500">
        After this, the bootstrap form disappears and only sign-in is available.
      </p>
    </form>
  )
}

const inputCls =
  'w-full rounded-lg border border-ink-300 bg-paper px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-500 focus:border-prime-500 focus:outline-none focus:ring-2 focus:ring-prime-200'

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-500">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-ink-500">{hint}</span>}
    </label>
  )
}
