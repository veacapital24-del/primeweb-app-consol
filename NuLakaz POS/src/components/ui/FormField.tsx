import type { ReactNode } from 'react'
import { INPUT_CLASS } from './styles'

export { INPUT_CLASS, SELECT_CLASS, CHECKBOX_CLASS } from './styles'

export function FormField({
  label,
  hint,
  optional,
  children,
}: {
  label: string
  hint?: string
  optional?: boolean
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-ink-500">{label}</span>
        {optional ? <span className="text-[10px] font-medium text-ink-500">optional</span> : null}
      </span>
      {children}
      {hint ? <span className="mt-1 block text-[11px] leading-relaxed text-ink-500">{hint}</span> : null}
    </label>
  )
}

export function FormActions({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2 border-t border-ink-300/40 pt-4">{children}</div>
}
