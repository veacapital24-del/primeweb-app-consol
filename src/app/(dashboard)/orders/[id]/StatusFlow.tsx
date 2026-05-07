'use client'

import { useTransition } from 'react'
import { setOrderStatus, addOrderNote } from '../actions'

const STEPS: Array<{ key: 'pending' | 'confirmed' | 'fulfilled'; label: string }> = [
  { key: 'pending',   label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'fulfilled', label: 'Fulfilled' },
]

export function StatusFlow({ orderId, status }: { orderId: string; status: string }) {
  const [isPending, start] = useTransition()
  const idx = STEPS.findIndex((s) => s.key === status)
  const isCancelled = status === 'cancelled'

  const transition = (next: 'pending' | 'confirmed' | 'fulfilled' | 'cancelled') => {
    start(async () => {
      try { await setOrderStatus(orderId, next) }
      catch (e) { console.error(e) }
    })
  }

  return (
    <div className="space-y-4">
      {/* Step rail */}
      <div className="flex items-center gap-3">
        {STEPS.map((s, i) => {
          const reached = !isCancelled && i <= idx
          const current = !isCancelled && i === idx
          return (
            <div key={s.key} className="flex flex-1 items-center gap-3">
              <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold transition ${
                reached
                  ? current
                    ? 'bg-prime-700 text-paper ring-4 ring-prime-200'
                    : 'bg-prime-700 text-paper'
                  : 'bg-ink-100 text-ink-500'
              }`}>
                {reached && i < idx ? '✓' : i + 1}
              </div>
              <div className="min-w-0">
                <div className={`text-sm font-bold ${reached ? 'text-ink-900' : 'text-ink-500'}`}>{s.label}</div>
              </div>
              {i < STEPS.length - 1 && <div className={`h-0.5 flex-1 ${i < idx && !isCancelled ? 'bg-prime-700' : 'bg-ink-200'}`} />}
            </div>
          )
        })}
      </div>

      {isCancelled && (
        <div className="rounded-xl border border-flash-500/30 bg-flash-50 px-4 py-3 text-sm text-flash-700">
          This order is cancelled. No fulfilment will happen.
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        {status === 'pending' && (
          <>
            <button
              disabled={isPending}
              onClick={() => transition('confirmed')}
              className="rounded-xl bg-prime-700 px-4 py-2 text-sm font-bold text-paper transition hover:bg-prime-800 disabled:opacity-50"
            >
              Confirm order
            </button>
            <button
              disabled={isPending}
              onClick={() => transition('cancelled')}
              className="rounded-xl border border-flash-500/40 bg-flash-50 px-4 py-2 text-sm font-bold text-flash-700 transition hover:bg-flash-500 hover:text-white disabled:opacity-50"
            >
              Cancel
            </button>
          </>
        )}
        {status === 'confirmed' && (
          <>
            <button
              disabled={isPending}
              onClick={() => transition('fulfilled')}
              className="rounded-xl bg-mint-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-mint-600 disabled:opacity-50"
            >
              Mark as fulfilled
            </button>
            <button
              disabled={isPending}
              onClick={() => transition('pending')}
              className="rounded-xl border border-ink-300 bg-paper px-4 py-2 text-sm font-bold text-ink-700 transition hover:border-ink-700 disabled:opacity-50"
            >
              Back to pending
            </button>
            <button
              disabled={isPending}
              onClick={() => transition('cancelled')}
              className="rounded-xl border border-flash-500/40 bg-flash-50 px-4 py-2 text-sm font-bold text-flash-700 transition hover:bg-flash-500 hover:text-white disabled:opacity-50"
            >
              Cancel
            </button>
          </>
        )}
        {status === 'fulfilled' && (
          <span className="rounded-xl bg-mint-100 px-4 py-2 text-sm font-bold text-mint-600">
            ✓ Order fulfilled — stock decremented
          </span>
        )}
        {status === 'cancelled' && (
          <button
            disabled={isPending}
            onClick={() => transition('pending')}
            className="rounded-xl border border-ink-300 bg-paper px-4 py-2 text-sm font-bold text-ink-700 transition hover:border-ink-700 disabled:opacity-50"
          >
            Re-open
          </button>
        )}
      </div>
    </div>
  )
}

export function NoteForm({ orderId }: { orderId: string }) {
  const [isPending, start] = useTransition()
  return (
    <form
      action={(form) => {
        const note = String(form.get('note') ?? '')
        if (!note.trim()) return
        start(async () => { await addOrderNote(orderId, note); (document.getElementById('note-form') as HTMLFormElement)?.reset() })
      }}
      id="note-form"
      className="flex gap-2"
    >
      <input
        name="note"
        placeholder="Add a note (visible to admins only)…"
        className="flex-1 rounded-lg border border-ink-300 bg-paper px-3 py-2 text-sm focus:border-prime-500 focus:outline-none"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-ink-900 px-4 py-2 text-sm font-bold text-paper hover:bg-prime-700 disabled:opacity-50"
      >
        Add note
      </button>
    </form>
  )
}
