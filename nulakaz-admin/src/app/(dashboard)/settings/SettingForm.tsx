'use client'

import { useState, useTransition } from 'react'
import { saveSettings } from './actions'
import { Field, Toggle, inputCls } from '@/components/admin/ui'

type FieldDef =
  | { name: string; label: string; type: 'text' | 'tel' | 'url'; placeholder?: string; hint?: string }
  | { name: string; label: string; type: 'number'; suffix?: string; hint?: string }
  | { name: string; label: string; type: 'bool'; hint?: string }
  | { name: string; label: string; type: 'textarea'; rows?: number; placeholder?: string; hint?: string }

export function SettingForm({
  settingKey,
  title,
  subtitle,
  values,
  fields,
}: {
  settingKey: string
  title: string
  subtitle?: string
  values: Record<string, unknown>
  fields: FieldDef[]
}) {
  const [isPending, start] = useTransition()
  const [saved, setSaved] = useState(false)
  const boolKeys = fields.filter((f) => f.type === 'bool').map((f) => f.name).join(',')

  return (
    <form
      action={(form) => {
        setSaved(false)
        start(async () => {
          await saveSettings(settingKey, form)
          setSaved(true)
          setTimeout(() => setSaved(false), 2000)
        })
      }}
      className="glass-card p-5 md:p-6"
    >
      <div className="mb-5 flex items-baseline justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold tracking-tight text-ink-900">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-ink-500">{subtitle}</p>}
        </div>
        {saved && (
          <span className="rounded-full bg-mint-50 px-2.5 py-1 text-[11px] font-bold text-mint-700 ring-1 ring-mint-500/25">
            Saved
          </span>
        )}
      </div>

      <input type="hidden" name="_bools" value={boolKeys} />

      <div className="grid gap-4 md:grid-cols-2">
        {fields.map((f) => (
          <SettingField key={f.name} field={f} value={values[f.name]} />
        ))}
      </div>

      <div className="mt-6 flex justify-end border-t border-ink-200/60 pt-5">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-prime-700 px-5 py-2.5 text-sm font-bold text-paper shadow-md shadow-prime-900/15 transition hover:bg-prime-800 disabled:opacity-50"
        >
          {isPending ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}

function SettingField({ field, value }: { field: FieldDef; value: unknown }) {
  if (field.type === 'bool') {
    return (
      <div className="col-span-full">
        <Toggle name={field.name} label={field.label} desc={field.hint} defaultChecked={Boolean(value)} />
      </div>
    )
  }
  if (field.type === 'textarea') {
    return (
      <Field label={field.label} hint={field.hint} className="col-span-full">
        <textarea
          name={field.name}
          rows={field.rows ?? 3}
          defaultValue={String(value ?? '')}
          placeholder={field.placeholder}
          className={`${inputCls} resize-y`}
        />
      </Field>
    )
  }
  if (field.type === 'number') {
    return (
      <Field label={field.label} hint={field.hint}>
        <div className="relative">
          <input name={field.name} type="number" defaultValue={String(value ?? '')} className={inputCls} />
          {field.suffix && (
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-ink-500">
              {field.suffix}
            </span>
          )}
        </div>
      </Field>
    )
  }
  return (
    <Field label={field.label} hint={field.hint}>
      <input
        name={field.name}
        type={field.type}
        defaultValue={String(value ?? '')}
        placeholder={field.placeholder}
        className={inputCls}
      />
    </Field>
  )
}
