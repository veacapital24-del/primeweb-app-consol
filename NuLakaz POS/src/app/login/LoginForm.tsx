'use client'

import { useState, useTransition } from 'react'
import { Alert, FormField, INPUT_CLASS, SubmitButton } from '@/components/ui'
import { signIn } from './actions'

export function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, start] = useTransition()

  return (
    <form
      action={(form) => {
        setError(null)
        start(async () => {
          const result = await signIn(form)
          if (result?.error) setError(result.error)
        })
      }}
      className="space-y-4"
    >
      <FormField label="Email">
        <input
          type="email"
          name="email"
          required
          autoFocus
          placeholder="cashier@nulakaz.com"
          className={INPUT_CLASS}
        />
      </FormField>
      <FormField label="Password">
        <input
          type="password"
          name="password"
          required
          placeholder="••••••••"
          className={INPUT_CLASS}
        />
      </FormField>

      {error ? <Alert>{error}</Alert> : null}

      <SubmitButton pending={isPending} size="full">
        {isPending ? 'Signing in…' : 'Sign in'}
      </SubmitButton>
    </form>
  )
}
