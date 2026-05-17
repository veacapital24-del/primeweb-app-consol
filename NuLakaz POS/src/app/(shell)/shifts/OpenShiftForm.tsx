'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import {
  Alert,
  ButtonLink,
  FormActions,
  FormField,
  INPUT_CLASS,
  SELECT_CLASS,
  SubmitButton,
} from '@/components/ui'
import { openShift } from './actions'

type RegisterOption = {
  id: string
  code: string
  name: string
  location_code: string
  location_name: string
}

export function OpenShiftForm({
  registers,
  defaultFloat = 0,
}: {
  registers: RegisterOption[]
  defaultFloat?: number
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, start] = useTransition()

  return (
    <form
      action={(form) => {
        setError(null)
        start(async () => {
          const result = await openShift(form)
          if ('error' in result) {
            setError(result.error)
            return
          }
          router.push('/register')
          router.refresh()
        })
      }}
      className="grid gap-5"
    >
      <FormField label="Register">
        <select name="register_id" required defaultValue="" className={SELECT_CLASS}>
          <option value="" disabled>
            Pick a register…
          </option>
          {registers.map((r) => (
            <option key={r.id} value={r.id}>
              {r.location_code} · {r.code} — {r.name}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="Opening float (Rs)" hint="Cash already in the drawer at the start of the shift.">
        <input
          type="number"
          name="opening_float_mur"
          required
          min={0}
          step="0.01"
          defaultValue={String(defaultFloat)}
          className={INPUT_CLASS}
        />
      </FormField>

      <FormField label="Notes" optional>
        <textarea name="notes" rows={2} className={INPUT_CLASS} />
      </FormField>

      {error ? <Alert>{error}</Alert> : null}

      <FormActions>
        <SubmitButton pending={isPending}>{isPending ? 'Opening…' : 'Open shift'}</SubmitButton>
        <ButtonLink href="/shifts" variant="secondary">
          Cancel
        </ButtonLink>
      </FormActions>
    </form>
  )
}
