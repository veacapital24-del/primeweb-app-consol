'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Alert,
  ButtonLink,
  CHECKBOX_CLASS,
  FormActions,
  FormField,
  INPUT_CLASS,
  SELECT_CLASS,
  SubmitButton,
} from '@/components/ui'
import type { Location, Register } from '@/lib/types'
import { createRegister, updateRegister } from './actions'

type Mode = 'create' | 'edit'

export function RegisterForm({
  mode,
  initial,
  locations,
  defaultLocationId,
}: {
  mode: Mode
  initial?: Register
  locations: Pick<Location, 'id' | 'code' | 'name'>[]
  defaultLocationId?: string
}) {
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [isPending, start] = useTransition()
  const router = useRouter()

  return (
    <form
      action={(form) => {
        setError(null)
        setSaved(false)
        start(async () => {
          const result =
            mode === 'create' ? await createRegister(form) : await updateRegister(initial!.id, form)
          if (result?.error) setError(result.error)
          else if (mode === 'edit') {
            setSaved(true)
            router.refresh()
          }
        })
      }}
      className="grid gap-5"
    >
      <FormField label="Location">
        <select
          name="location_id"
          required
          defaultValue={initial?.location_id ?? defaultLocationId ?? ''}
          className={SELECT_CLASS}
          disabled={mode === 'edit'}
        >
          <option value="" disabled>
            Pick a location…
          </option>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>
              {l.code} · {l.name}
            </option>
          ))}
        </select>
        {mode === 'edit' && (
          <span className="mt-1 block text-[11px] text-ink-500">
            A register's location is fixed once created.
          </span>
        )}
      </FormField>

      <div className="grid gap-5 md:grid-cols-2">
        <FormField label="Code" hint="Unique per location, e.g. REG-1">
          <input
            name="code"
            required
            defaultValue={initial?.code}
            placeholder="REG-1"
            autoFocus={mode === 'create'}
            className={INPUT_CLASS}
          />
        </FormField>
        <FormField label="Name">
          <input
            name="name"
            required
            defaultValue={initial?.name}
            placeholder="Front counter"
            className={INPUT_CLASS}
          />
        </FormField>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="active"
          defaultChecked={initial?.active ?? true}
          className={CHECKBOX_CLASS}
        />
        <span className="font-semibold text-ink-700">Active</span>
        <span className="text-xs text-ink-500">— uncheck to retire this register without deleting</span>
      </label>

      {error ? <Alert>{error}</Alert> : null}
      {saved ? <Alert variant="success">Saved.</Alert> : null}

      <FormActions>
        <SubmitButton pending={isPending}>
          {isPending ? 'Saving…' : mode === 'create' ? 'Create register' : 'Save changes'}
        </SubmitButton>
        <ButtonLink href="/registers" variant="secondary">
          Cancel
        </ButtonLink>
      </FormActions>
    </form>
  )
}
