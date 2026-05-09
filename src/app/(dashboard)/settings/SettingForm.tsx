'use client'

import { useState, useTransition } from 'react'
import { saveSettings } from './actions'

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
      className="rounded-2xl border border-ink-300/60 bg-paper p-5"
    >
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-black tracking-tight">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-ink-500">{subtitle}</p>}
        </div>
        {saved && <span className="rounded-full bg-mint-100 px-2 py-0.5 text-[11px] font-bold text-mint-600">✓ Saved</span>}
      </div>

      <input type="hidden" name="_bools" value={boolKeys} />

      <div className="grid gap-4 md:grid-cols-2">
        {fields.map((f) => (
          <Field key={f.name} field={f} value={values[f.name]} />
        ))}
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-prime-700 px-5 py-2 text-sm font-bold text-paper transition hover:bg-prime-800 disabled:opacity-50"
        >
          {isPending ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}

function Field({ field, value }: { field: FieldDef; value: unknown }) {
  if (field.type === 'bool') {
    return (
      <label className="col-span-full flex items-center justify-between gap-3 rounded-xl bg-paper-dim/60 p-3">
        <div>
          <div className="text-sm font-semibold">{field.label}</div>
          {field.hint && <div className="text-xs text-ink-500">{field.hint}</div>}
        </div>
        <input
          type="checkbox"
          name={field.name}
          defaultChecked={Boolean(value)}
          className="h-5 w-9 cursor-pointer appearance-none rounded-full bg-ink-200 transition checked:bg-prime-700 relative
            before:absolute before:left-0.5 before:top-0.5 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition checked:before:translate-x-4"
        />
      </label>
    )
  }
  if (field.type === 'textarea') {
    return (
      <label className="col-span-full block">
        <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-500">{field.label}</span>
        <textarea
          name={field.name}
          rows={field.rows ?? 3}
          defaultValue={String(value ?? '')}
          placeholder={field.placeholder}
          className="w-full rounded-lg border border-ink-300 bg-paper px-3 py-2 text-sm focus:border-prime-500 focus:outline-none"
        />
        {field.hint && <span className="mt-1 block text-[11px] text-ink-500">{field.hint}</span>}
      </label>
    )
  }
  if (field.type === 'number') {
    return (
      <label className="block">
        <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-500">{field.label}</span>
        <div className="relative">
          <input
            name={field.name}
            type="number"
            defaultValue={String(value ?? '')}
            className="w-full rounded-lg border border-ink-300 bg-paper px-3 py-2 text-sm focus:border-prime-500 focus:outline-none"
          />
          {field.suffix && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-500">{field.suffix}</span>}
        </div>
        {field.hint && <span className="mt-1 block text-[11px] text-ink-500">{field.hint}</span>}
      </label>
    )
  }
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-500">{field.label}</span>
      <input
        name={field.name}
        type={field.type}
        defaultValue={String(value ?? '')}
        placeholder={field.placeholder}
        className="w-full rounded-lg border border-ink-300 bg-paper px-3 py-2 text-sm focus:border-prime-500 focus:outline-none"
      />
      {field.hint && <span className="mt-1 block text-[11px] text-ink-500">{field.hint}</span>}
    </label>
  )
}
