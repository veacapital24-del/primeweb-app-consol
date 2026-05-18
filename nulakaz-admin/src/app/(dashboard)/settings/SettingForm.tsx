'use client'

import { useActionState } from 'react'
import { saveSettings } from './actions'
import { Field, Toggle, inputCls } from '@/components/admin/ui'

type FieldDef =
  | { name: string; label: string; type: 'text' | 'tel' | 'url'; placeholder?: string; hint?: string }
  | { name: string; label: string; type: 'number'; suffix?: string; hint?: string }
  | { name: string; label: string; type: 'bool'; hint?: string }
  | { name: string; label: string; type: 'textarea'; rows?: number; placeholder?: string; hint?: string }

type FormState = { error?: string; saved?: boolean } | null

async function saveSettingsAction(
  settingKey: string,
  _prev: FormState,
  form: FormData,
): Promise<FormState> {
  try {
    await saveSettings(settingKey, form)
    return { saved: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Failed to save' }
  }
}

export function SettingForm({
  settingKey,
  subtitle,
  values,
  fields,
}: {
  settingKey: string
  subtitle?: string
  values: Record<string, unknown>
  fields: FieldDef[]
}) {
  const boundAction = saveSettingsAction.bind(null, settingKey)
  const [state, formAction, isPending] = useActionState<FormState, FormData>(boundAction, null)
  const boolKeys = fields.filter((f) => f.type === 'bool').map((f) => f.name).join(',')

  return (
    <form action={formAction} className="settings-form">
      {subtitle && (
        <p className="border-b border-ink-200/60 px-6 py-3 text-sm leading-relaxed text-ink-500">
          {subtitle}
        </p>
      )}

      <div className="settings-form-header">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">Fields</p>
        <div className="flex flex-wrap items-center gap-2">
          {state?.saved && (
            <span className="settings-saved-badge" role="status">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Saved
            </span>
          )}
          {state?.error && (
            <span className="settings-error-badge" role="alert">
              {state.error}
            </span>
          )}
        </div>
      </div>

      <input type="hidden" name="_bools" value={boolKeys} />

      <div className="settings-form-fields">
        {fields.map((f) => (
          <SettingField key={f.name} field={f} value={values[f.name]} />
        ))}
      </div>

      <div className="settings-form-footer">
        <p className="text-xs text-ink-500">Changes apply to the live storefront after save.</p>
        <button type="submit" disabled={isPending} className="settings-form-submit">
          {isPending ? (
            <>
              <span className="settings-form-spinner" aria-hidden />
              Saving…
            </>
          ) : (
            'Save changes'
          )}
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
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-ink-500">
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
