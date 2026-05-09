'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import {
  createLocation,
  updateLocation,
  deleteLocation,
} from './actions'
import { LOCATION_KINDS, type Location, type LocationKind } from '@/lib/types'

type Mode = 'create' | 'edit'

type Props = {
  mode: Mode
  location?: Location
}

const KIND_LABEL: Record<LocationKind, string> = {
  store: 'Store',
  warehouse: 'Warehouse',
  kiosk: 'Kiosk',
  popup: 'Pop-up',
}

export function LocationForm({ mode, location }: Props) {
  const [isPending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [code, setCode] = useState(location?.code ?? '')
  const [name, setName] = useState(location?.name ?? '')

  const onSubmit = (form: FormData) => {
    setError(null)
    start(async () => {
      try {
        if (mode === 'create') await createLocation(form)
        else await updateLocation(location!.id, form)
      } catch (e) {
        if (e instanceof Error && e.message !== 'NEXT_REDIRECT') setError(e.message)
      }
    })
  }

  const onDelete = () => {
    if (!location) return
    if (
      !confirm(
        `Delete "${location.name}"? Per-location stock rows for this site will be removed; sale history is kept.`,
      )
    )
      return
    start(async () => {
      try {
        await deleteLocation(location.id)
      } catch (e) {
        if (e instanceof Error && e.message !== 'NEXT_REDIRECT') setError(e.message)
      }
    })
  }

  return (
    <form action={onSubmit} className="space-y-6">
      {error && (
        <div className="rounded-xl border border-flash-500/40 bg-flash-50 px-4 py-3 text-sm text-flash-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card title="Identity">
            <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
              <Field
                label="Code"
                required
                hint="Short identifier shown on receipts (uppercase, A–Z 0–9)."
              >
                <input
                  name="code"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="NK-PL01"
                  className={`${inputCls} font-mono uppercase`}
                />
              </Field>
              <Field label="Name" required>
                <input
                  name="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Port Louis · Codan"
                  className={inputCls}
                />
              </Field>
            </div>

            <Field label="Kind" className="mt-4">
              <select
                name="kind"
                defaultValue={location?.kind ?? 'store'}
                className={inputCls}
              >
                {LOCATION_KINDS.map((k) => (
                  <option key={k} value={k}>
                    {KIND_LABEL[k]}
                  </option>
                ))}
              </select>
            </Field>
          </Card>

          <Card title="Reach">
            <Field label="Address" hint="Shown on POS receipts.">
              <textarea
                name="address"
                rows={2}
                defaultValue={location?.address ?? ''}
                placeholder="Royal Road, Port Louis, Mauritius"
                className={`${inputCls} resize-y`}
              />
            </Field>
            <Field label="Phone" className="mt-4">
              <input
                name="phone"
                type="tel"
                defaultValue={location?.phone ?? ''}
                placeholder="+230 5xxx xxxx"
                className={inputCls}
              />
            </Field>
          </Card>

          <Card title="Locale">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Timezone" hint="IANA tz · e.g. Indian/Mauritius.">
                <input
                  name="timezone"
                  defaultValue={location?.timezone ?? 'Indian/Mauritius'}
                  placeholder="Indian/Mauritius"
                  className={`${inputCls} font-mono`}
                />
              </Field>
              <Field
                label="Currency"
                hint="ISO 4217 · 3-letter code, uppercase."
              >
                <input
                  name="currency"
                  defaultValue={location?.currency ?? 'MUR'}
                  maxLength={3}
                  className={`${inputCls} font-mono uppercase`}
                />
              </Field>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Status">
            <label className="flex items-center justify-between gap-3 rounded-xl bg-paper-dim/60 p-3">
              <div>
                <div className="text-sm font-semibold">Active</div>
                <div className="text-xs text-ink-500">
                  Visible to POS + warehouse
                </div>
              </div>
              <input
                type="checkbox"
                name="active"
                defaultChecked={location?.active ?? true}
                className="h-5 w-9 cursor-pointer appearance-none rounded-full bg-ink-200 transition checked:bg-prime-700 relative
                  before:absolute before:left-0.5 before:top-0.5 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition checked:before:translate-x-4"
              />
            </label>
            <p className="mt-3 text-[11px] text-ink-500">
              Inactive locations stay in the database (for sale history) but
              won't appear in the POS picker or the warehouse switcher.
            </p>
          </Card>

          {mode === 'edit' && location && (
            <Card title="Danger">
              <button
                type="button"
                onClick={onDelete}
                disabled={isPending}
                className="w-full rounded-xl border border-flash-500/50 bg-flash-50 px-4 py-2 text-sm font-bold text-flash-700 transition hover:bg-flash-500 hover:text-white"
              >
                Delete location
              </button>
              <p className="mt-2 text-xs text-ink-500">
                Removes the location row and its per-product stock rows.
                Sale history with this location is preserved (the link is
                cleared, not the records).
              </p>
            </Card>
          )}
        </div>
      </div>

      <div className="sticky bottom-4 flex flex-col-reverse gap-2 rounded-2xl border border-ink-300/60 bg-paper px-4 py-3 shadow-lg shadow-ink-900/10 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-5">
        <Link
          href="/locations"
          className="text-center text-sm font-semibold text-ink-700 underline sm:text-left"
        >
          ← Back to locations
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-prime-700 px-5 py-3 text-sm font-bold text-paper transition hover:bg-prime-800 disabled:opacity-50 sm:w-auto sm:py-2.5"
        >
          {isPending ? 'Saving…' : mode === 'create' ? 'Create location' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}

const inputCls =
  'w-full rounded-lg border border-ink-300 bg-paper px-3 py-2 text-sm text-ink-900 placeholder:text-ink-500 focus:border-prime-500 focus:outline-none focus:ring-2 focus:ring-prime-200'

function Field({
  label,
  required,
  hint,
  children,
  className = '',
}: {
  label: string
  required?: boolean
  hint?: string
  children: React.ReactNode
  className?: string
}) {
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
      <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-ink-500">
        {title}
      </h2>
      {children}
    </section>
  )
}
