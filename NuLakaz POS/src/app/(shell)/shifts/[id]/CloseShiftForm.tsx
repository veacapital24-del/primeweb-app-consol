'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Alert, FormField, INPUT_CLASS, SubmitButton } from '@/components/ui'
import { closeShift } from '../actions'

export function CloseShiftForm({
  shiftId,
  expected,
}: {
  shiftId: string
  expected: number
}) {
  const [error, setError] = useState<string | null>(null)
  const [count, setCount] = useState<string>('')
  const [isPending, start] = useTransition()
  const router = useRouter()

  const variance =
    count === '' || !Number.isFinite(Number(count)) ? null : Number(count) - expected

  return (
    <form
      action={(form) => {
        if (!confirm('Close this shift? This action cannot be undone.')) return
        setError(null)
        start(async () => {
          const result = await closeShift(shiftId, form)
          if (result?.error) setError(result.error)
          else router.refresh()
        })
      }}
      className="grid gap-4"
    >
      <div className="rounded-xl border border-ink-300/60 bg-paper-dim/40 p-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-ink-500">Expected cash</span>
          <span className="font-mono font-bold tabular-nums">Rs {expected.toFixed(2)}</span>
        </div>
      </div>

      <FormField label="Closing count (Rs)" hint="Total cash counted in the drawer at close.">
        <input
          type="number"
          name="closing_count_mur"
          required
          min={0}
          step="0.01"
          value={count}
          onChange={(e) => setCount(e.target.value)}
          className={INPUT_CLASS}
        />
      </FormField>

      {variance !== null && (
        <Alert
          variant={variance === 0 ? 'info' : variance > 0 ? 'success' : 'error'}
          className="flex flex-wrap items-baseline gap-2"
        >
          <span className="text-xs font-bold uppercase tracking-widest">Variance</span>
          <span className="font-mono font-bold tabular-nums">
            {variance > 0 ? '+' : ''}Rs {variance.toFixed(2)}
          </span>
        </Alert>
      )}

      <FormField label="Closing notes" optional>
        <textarea name="notes" rows={2} className={INPUT_CLASS} />
      </FormField>

      {error ? <Alert>{error}</Alert> : null}

      <SubmitButton pending={isPending || count === ''} variant="danger">
        {isPending ? 'Closing…' : 'Close shift'}
      </SubmitButton>
    </form>
  )
}
