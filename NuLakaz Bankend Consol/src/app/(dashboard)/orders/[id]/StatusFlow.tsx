'use client'

import { useTransition } from 'react'
import {
  ORDER_FULFILLMENT_STEPS,
  getNextOrderStatus,
  normalizeOrderStatus,
  orderStatusLabel,
  orderStatusStepIndex,
  proceedButtonLabel,
} from '@/lib/order-status'
import { PrintPackingSlip } from '@/components/orders/PrintPackingSlip'
import { proceedOrder, setOrderStatus, addOrderNote } from '../actions'

export function StatusFlow({
  orderId,
  orderNumber,
  status,
}: {
  orderId: string
  orderNumber: string
  status: string
}) {
  const [isPending, start] = useTransition()
  const normalized = normalizeOrderStatus(status)
  const stepIdx = orderStatusStepIndex(status)
  const isCancelled = normalized === 'cancelled'
  const isComplete = normalized === 'completed'
  const next = getNextOrderStatus(status)

  const run = (fn: () => Promise<void>) => {
    start(async () => {
      try {
        await fn()
      } catch (e) {
        console.error(e)
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Step timeline */}
      <ol className="relative space-y-0">
        {ORDER_FULFILLMENT_STEPS.map((step, i) => {
          const reached = !isCancelled && stepIdx >= i
          const current = !isCancelled && stepIdx === i
          const isLast = i === ORDER_FULFILLMENT_STEPS.length - 1

          return (
            <li key={step.key} className="relative flex gap-4 pb-6 last:pb-0">
              {!isLast && (
                <span
                  aria-hidden
                  className={`absolute left-[15px] top-8 bottom-0 w-0.5 ${
                    reached && stepIdx > i ? 'bg-prime-600' : 'bg-ink-200'
                  }`}
                />
              )}
              <span
                className={`relative z-[1] grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold transition ${
                  current
                    ? 'bg-prime-700 text-paper ring-4 ring-prime-200 shadow-md shadow-prime-900/20'
                    : reached
                      ? 'bg-prime-700 text-paper'
                      : 'border border-ink-300 bg-paper text-ink-400'
                }`}
              >
                {reached && !current ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <p
                  className={`text-sm font-bold ${
                    current ? 'text-prime-800' : reached ? 'text-ink-900' : 'text-ink-500'
                  }`}
                >
                  {step.label}
                </p>
                {current && (
                  <p className="mt-0.5 text-xs text-prime-600">Current stage</p>
                )}
              </div>
            </li>
          )
        })}
      </ol>

      {isCancelled && (
        <div className="rounded-xl border border-flash-500/30 bg-flash-50 px-4 py-3 text-sm text-flash-700">
          This order is cancelled. Fulfilment is stopped.
        </div>
      )}

      {isComplete && (
        <div className="flex items-center gap-3 rounded-xl border border-mint-500/25 bg-mint-50 px-4 py-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-mint-500 text-paper">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
          <div>
            <p className="text-sm font-bold text-mint-800">Order complete</p>
            <p className="text-xs text-mint-700/90">Stock was adjusted when packing started.</p>
          </div>
        </div>
      )}

      {!isCancelled && normalized !== 'completed' && (
        <div className="rounded-xl border border-ink-200/80 bg-canvas/50 p-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-ink-500">
            Warehouse · packing slip
          </p>
          <PrintPackingSlip orderId={orderId} orderNumber={orderNumber} status={status} />
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-2 border-t border-ink-300/50 pt-5 sm:flex-row sm:flex-wrap">
        {next && !isCancelled && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => run(() => proceedOrder(orderId))}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-prime-700 px-5 py-3 text-sm font-bold text-paper shadow-md shadow-prime-900/15 transition hover:bg-prime-800 disabled:opacity-50 sm:flex-none sm:min-w-[200px]"
          >
            {isPending ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-paper/30 border-t-paper" />
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            )}
            {next ? proceedButtonLabel(next) : 'Proceed order'}
          </button>
        )}

        {(normalized === 'pending' || normalized === 'confirmed') && !isCancelled && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => run(() => setOrderStatus(orderId, 'cancelled'))}
            className="rounded-xl border border-flash-500/40 bg-flash-50 px-4 py-3 text-sm font-bold text-flash-700 transition hover:bg-flash-500 hover:text-paper disabled:opacity-50"
          >
            Cancel order
          </button>
        )}

        {stepIdx > 0 && !isCancelled && !isComplete && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              const prev = ORDER_FULFILLMENT_STEPS[stepIdx - 1]?.key
              if (prev) run(() => setOrderStatus(orderId, prev))
            }}
            className="rounded-xl border border-ink-300 bg-paper px-4 py-3 text-sm font-semibold text-ink-700 transition hover:border-ink-500 disabled:opacity-50"
          >
            Step back
          </button>
        )}

        {isCancelled && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => run(() => setOrderStatus(orderId, 'pending'))}
            className="rounded-xl border border-ink-300 bg-paper px-4 py-3 text-sm font-bold text-ink-700 transition hover:border-prime-500 disabled:opacity-50"
          >
            Re-open order
          </button>
        )}
      </div>

      {!isCancelled && (
        <p className="text-[11px] leading-relaxed text-ink-500">
          Current status:{' '}
          <span className="font-semibold text-ink-700">{orderStatusLabel(status)}</span>
          {next && (
            <>
              {' '}
              · Next: <span className="font-semibold text-prime-700">{orderStatusLabel(next)}</span>
            </>
          )}
        </p>
      )}
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
        start(async () => {
          await addOrderNote(orderId, note)
          ;(document.getElementById('note-form') as HTMLFormElement)?.reset()
        })
      }}
      id="note-form"
      className="flex flex-col gap-2 sm:flex-row"
    >
      <input
        name="note"
        placeholder="Add an internal note…"
        className="flex-1 rounded-xl border border-ink-300/80 bg-paper px-3.5 py-2.5 text-sm shadow-inner shadow-ink-900/[0.02] focus:border-prime-400 focus:outline-none focus:ring-[3px] focus:ring-prime-200/70"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-xl bg-ink-900 px-4 py-2.5 text-sm font-bold text-paper transition hover:bg-prime-700 disabled:opacity-50"
      >
        Add note
      </button>
    </form>
  )
}
