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
import type { Location } from '@/lib/types'
import { createLocation, updateLocation } from './actions'

type Mode = 'create' | 'edit'

export function LocationForm({ mode, initial }: { mode: Mode; initial?: Location }) {
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
            mode === 'create'
              ? await createLocation(form)
              : await updateLocation(initial!.id, form)
          if (result?.error) setError(result.error)
          else if (mode === 'edit') {
            setSaved(true)
            router.refresh()
          }
        })
      }}
      className="grid gap-5"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <FormField label="Code" hint="Short ref, e.g. PV-01">
          <input
            name="code"
            required
            defaultValue={initial?.code}
            placeholder="PV-01"
            autoFocus={mode === 'create'}
            className={INPUT_CLASS}
          />
        </FormField>
        <FormField label="Kind">
          <select name="kind" defaultValue={initial?.kind ?? 'store'} className={SELECT_CLASS}>
            <option value="store">Store</option>
            <option value="warehouse">Warehouse</option>
            <option value="kiosk">Kiosk</option>
            <option value="popup">Pop-up</option>
          </select>
        </FormField>
      </div>

      <FormField label="Name">
        <input
          name="name"
          required
          defaultValue={initial?.name}
          placeholder="Pétion-Ville Main"
          className={INPUT_CLASS}
        />
      </FormField>

      <FormField label="Address" optional>
        <textarea name="address" defaultValue={initial?.address ?? ''} rows={2} className={INPUT_CLASS} />
      </FormField>

      <div className="grid gap-5 md:grid-cols-3">
        <FormField label="Phone" optional>
          <input
            name="phone"
            defaultValue={initial?.phone ?? ''}
            placeholder="+230 5xxx xxxx"
            className={INPUT_CLASS}
          />
        </FormField>
        <FormField label="Timezone">
          <input
            name="timezone"
            defaultValue={initial?.timezone ?? 'Indian/Mauritius'}
            className={INPUT_CLASS}
          />
        </FormField>
        <FormField label="Currency">
          <input
            name="currency"
            defaultValue={initial?.currency ?? 'MUR'}
            maxLength={3}
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
        <span className="text-xs text-ink-500">— uncheck to hide from staff without deleting</span>
      </label>

      {error ? <Alert>{error}</Alert> : null}
      {saved ? <Alert variant="success">Saved.</Alert> : null}

      <FormActions>
        <SubmitButton pending={isPending}>
          {isPending ? 'Saving…' : mode === 'create' ? 'Create location' : 'Save changes'}
        </SubmitButton>
        <ButtonLink href="/locations" variant="secondary">
          Cancel
        </ButtonLink>
      </FormActions>
    </form>
  )
}
