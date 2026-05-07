'use client'

import { useEffect, useState, useTransition } from 'react'
import { adjustStock, bulkAdjustStock } from './actions'
import { ADJUST_REASONS, type AdjustReason } from './reasons'

export type AdjustTarget = {
  id: string
  name: string
  sku: string
  available: number
}

type Props = {
  targets: AdjustTarget[]    // 1 = single adjust; >1 = bulk
  open: boolean
  onClose: () => void
}

type Mode = 'relative' | 'absolute'

export function AdjustDialog({ targets, open, onClose }: Props) {
  const [reason, setReason] = useState<AdjustReason>('receive')
  const [mode, setMode] = useState<Mode>('relative')
  const [qty, setQty] = useState<number>(1)
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()

  // Stable key derived from targets — used to reset state when the dialog
  // re-opens for a different selection. Computed before the early-return so
  // it runs every render, but useEffect only re-runs when the value changes.
  const targetKey = targets.map((t) => t.id).join(',')

  useEffect(() => {
    if (!open) return
    setReason('receive')
    setMode('relative')
    setQty(1)
    setNote('')
    setError(null)
  }, [open, targetKey])

  if (!open || targets.length === 0) return null

  const isBulk = targets.length > 1
  const single = targets[0]!
  const totalCurrent = targets.reduce((s, t) => s + (t?.available ?? 0), 0)

  // For preview on a single product
  const after = !isBulk
    ? mode === 'absolute'
      ? Math.max(0, Math.floor(qty))
      : Math.max(0, single.available + Math.floor(qty))
    : null
  const delta = !isBulk && after !== null ? after - single.available : null

  const submit = () => {
    setError(null)
    start(async () => {
      try {
        if (isBulk) {
          await bulkAdjustStock({
            productIds: targets.map((t) => t.id),
            mode, qty, reason, note: note || undefined,
          })
        } else {
          await adjustStock({
            productId: single.id,
            mode, qty, reason, note: note || undefined,
          })
        }
        onClose()
      } catch (e) {
        if (e instanceof Error) setError(e.message)
      }
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-ink-900/40 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal
    >
      <div
        className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-2xl bg-paper p-5 shadow-2xl shadow-ink-900/30 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display text-xl font-black tracking-tight">
              {isBulk ? 'Bulk adjustment' : 'Adjust stock'}
            </h3>
            <p className="mt-0.5 truncate text-xs text-ink-500">
              {isBulk
                ? `${targets.length} products selected · ${totalCurrent} units total`
                : <>{single.name} · <span className="font-mono">{single.sku}</span></>}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-900"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </header>

        <div className="mt-5 space-y-4">
          <Field label="Reason">
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as AdjustReason)}
              className="w-full rounded-lg border border-ink-300 bg-paper px-3 py-2 text-sm focus:border-prime-500 focus:outline-none"
            >
              {ADJUST_REASONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-ink-500">
              {ADJUST_REASONS.find((r) => r.value === reason)?.hint}
            </p>
          </Field>

          <Field label="Mode">
            <div className="inline-flex w-full rounded-lg bg-ink-100 p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setMode('relative')}
                className={`flex-1 rounded-md px-3 py-1.5 transition ${mode === 'relative' ? 'bg-paper text-ink-900 shadow-sm' : 'text-ink-500'}`}
              >
                + / − Delta
              </button>
              <button
                type="button"
                onClick={() => setMode('absolute')}
                className={`flex-1 rounded-md px-3 py-1.5 transition ${mode === 'absolute' ? 'bg-paper text-ink-900 shadow-sm' : 'text-ink-500'}`}
              >
                Set to
              </button>
            </div>
          </Field>

          <Field label={mode === 'relative' ? 'Delta (negative to remove)' : 'New on-hand value'}>
            <input
              type="number"
              value={qty}
              onChange={(e) => setQty(Number(e.target.value) || 0)}
              autoFocus
              className="w-full rounded-lg border border-ink-300 bg-paper px-3 py-2 text-sm font-bold tabular-nums focus:border-prime-500 focus:outline-none"
            />
            {isBulk && (
              <p className="mt-1 text-[11px] text-ink-500">
                {mode === 'absolute'
                  ? `Every selected product will be set to ${Math.max(0, Math.floor(qty))}.`
                  : `Each selected product will move by ${qty > 0 ? '+' : ''}${Math.floor(qty)}.`}
              </p>
            )}
          </Field>

          <Field label="Note (optional)">
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. PO-2103, supplier ABC"
              className="w-full rounded-lg border border-ink-300 bg-paper px-3 py-2 text-sm focus:border-prime-500 focus:outline-none"
            />
          </Field>

          {!isBulk && delta !== null && after !== null && (
            <div className="rounded-xl bg-paper-dim p-3">
              <div className="text-[10px] font-bold uppercase tracking-widest text-ink-500">Preview</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-display text-2xl font-black tabular-nums">{single.available}</span>
                <span className="text-ink-500">→</span>
                <span className="font-display text-2xl font-black tabular-nums">{after}</span>
                <span className={`ml-auto rounded-full px-2 py-0.5 text-xs font-bold ${
                  delta > 0 ? 'bg-mint-100 text-mint-600' :
                  delta < 0 ? 'bg-flash-50 text-flash-700' :
                              'bg-ink-100 text-ink-500'
                }`}>
                  {delta > 0 ? '+' : ''}{delta}
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-flash-500/40 bg-flash-50 px-3 py-2 text-xs text-flash-700">
              {error}
            </div>
          )}
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="flex-1 rounded-xl border border-ink-300 bg-paper px-4 py-2.5 text-sm font-bold text-ink-700 hover:border-ink-700 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={pending || (!isBulk && delta === 0)}
            className="flex-1 rounded-xl bg-prime-700 px-4 py-2.5 text-sm font-bold text-paper hover:bg-prime-800 disabled:opacity-50"
          >
            {pending ? 'Saving…' : isBulk ? `Apply to ${targets.length}` : 'Apply adjustment'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-ink-500">{label}</span>
      {children}
    </label>
  )
}
