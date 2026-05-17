'use client'

import { useState, useTransition } from 'react'
import { createSupplier, updateSupplier } from './actions'
import type { Supplier } from '@/lib/types'
import {
  AlertError,
  Field,
  FormStickyBar,
  GlassCard,
  inputCls,
} from '@/components/admin/ui'

type Props = { supplier?: Supplier }

export function SupplierForm({ supplier }: Props) {
  const mode = supplier ? 'edit' : 'create'
  const [isPending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const onSubmit = (form: FormData) => {
    setError(null)
    start(async () => {
      try {
        if (mode === 'create') await createSupplier(form)
        else await updateSupplier(supplier!.id, form)
      } catch (e: unknown) {
        if (e instanceof Error && e.message !== 'NEXT_REDIRECT') setError(e.message)
      }
    })
  }

  return (
    <form action={onSubmit} className="space-y-6">
      {error && <AlertError message={error} />}

      <GlassCard title="Supplier details">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Company name" required className="sm:col-span-2">
            <input
              name="name"
              type="text"
              required
              defaultValue={supplier?.name}
              placeholder="e.g. Island Foods Ltd"
              className={inputCls}
            />
          </Field>

          <Field label="Contact name">
            <input
              name="contact_name"
              type="text"
              defaultValue={supplier?.contact_name ?? ''}
              placeholder="Main contact person"
              className={inputCls}
            />
          </Field>

          <Field label="Phone">
            <input
              name="phone"
              type="tel"
              defaultValue={supplier?.phone ?? ''}
              placeholder="+230 5XXX XXXX"
              className={inputCls}
            />
          </Field>

          <Field label="Email">
            <input
              name="email"
              type="email"
              defaultValue={supplier?.email ?? ''}
              placeholder="orders@supplier.com"
              className={inputCls}
            />
          </Field>

          <Field label="Address">
            <input
              name="address"
              type="text"
              defaultValue={supplier?.address ?? ''}
              placeholder="Street, City"
              className={inputCls}
            />
          </Field>

          <Field label="Notes" className="sm:col-span-2">
            <textarea
              name="notes"
              rows={3}
              defaultValue={supplier?.notes ?? ''}
              placeholder="Payment terms, lead times, any other notes…"
              className={`${inputCls} resize-none`}
            />
          </Field>
        </div>
      </GlassCard>

      <FormStickyBar
        backHref="/suppliers"
        backLabel="← Back to Suppliers"
        submitLabel={mode === 'create' ? 'Create Supplier' : 'Save Changes'}
        pendingLabel={mode === 'create' ? 'Creating…' : 'Saving…'}
        isPending={isPending}
      />
    </form>
  )
}
