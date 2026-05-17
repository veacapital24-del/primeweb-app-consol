'use client'

import { useState, useTransition } from 'react'
import {
  Alert,
  ButtonLink,
  FormActions,
  FormField,
  SELECT_CLASS,
  SubmitButton,
} from '@/components/ui'
import type { Location } from '@/lib/types'
import { assignStaff } from './actions'

type UserOption = { id: string; email: string | null; full_name: string | null; role: string }

export function StaffForm({
  users,
  locations,
}: {
  users: UserOption[]
  locations: Pick<Location, 'id' | 'code' | 'name'>[]
}) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, start] = useTransition()

  return (
    <form
      action={(form) => {
        setError(null)
        start(async () => {
          const result = await assignStaff(form)
          if (result?.error) setError(result.error)
        })
      }}
      className="grid gap-5"
    >
      <FormField label="User">
        <select name="user_id" required defaultValue="" className={SELECT_CLASS}>
          <option value="" disabled>
            Pick a user…
          </option>
          {users.map((u) => {
            const label = u.full_name ? `${u.full_name} — ${u.email ?? ''}` : (u.email ?? u.id)
            return (
              <option key={u.id} value={u.id}>
                {label}
                {u.role === 'admin' ? ' · (admin)' : ''}
              </option>
            )
          })}
        </select>
        <span className="mt-1 block text-[11px] text-ink-500">
          Don't see them? Create the user in the Bankend admin first.
        </span>
      </FormField>

      <FormField label="Location">
        <select name="location_id" required defaultValue="" className={SELECT_CLASS}>
          <option value="" disabled>
            Pick a location…
          </option>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>
              {l.code} · {l.name}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="Role">
        <select name="role" defaultValue="cashier" className={SELECT_CLASS}>
          <option value="cashier">Cashier — sell, refund with manager PIN</option>
          <option value="manager">Manager — sell + void / discount / refund without escalation</option>
        </select>
      </FormField>

      {error ? <Alert>{error}</Alert> : null}

      <FormActions>
        <SubmitButton pending={isPending}>{isPending ? 'Assigning…' : 'Assign'}</SubmitButton>
        <ButtonLink href="/staff" variant="secondary">
          Cancel
        </ButtonLink>
      </FormActions>
    </form>
  )
}
