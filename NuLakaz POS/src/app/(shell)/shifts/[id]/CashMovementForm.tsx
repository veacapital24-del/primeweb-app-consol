'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Alert, INPUT_CLASS, SELECT_CLASS, SubmitButton } from '@/components/ui'
import { addCashMovement } from '../actions'

export function CashMovementForm({ shiftId }: { shiftId: string }) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, start] = useTransition()
  const router = useRouter()

  return (
    <form
      action={(form) => {
        setError(null)
        start(async () => {
          const result = await addCashMovement(shiftId, form)
          if (result?.error) setError(result.error)
          else {
            ;(document.getElementById('cash-form') as HTMLFormElement | null)?.reset()
            router.refresh()
          }
        })
      }}
      id="cash-form"
      className="grid gap-3 md:grid-cols-[160px_1fr_1fr_auto]"
    >
      <select name="kind" defaultValue="cash_in" className={SELECT_CLASS}>
        <option value="cash_in">Cash in</option>
        <option value="cash_out">Cash out</option>
        <option value="paid_in">Paid in</option>
        <option value="paid_out">Paid out</option>
        <option value="drop">Drop</option>
      </select>
      <input
        type="number"
        name="amount_mur"
        required
        min="0.01"
        step="0.01"
        placeholder="Amount (Rs)"
        className={INPUT_CLASS}
      />
      <input name="reason" placeholder="Reason / note" className={INPUT_CLASS} />
      <SubmitButton pending={isPending} size="md">
        {isPending ? 'Adding…' : 'Add'}
      </SubmitButton>
      {error ? (
        <Alert className="md:col-span-4">{error}</Alert>
      ) : null}
    </form>
  )
}
