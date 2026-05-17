'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { receiveStock } from './actions'

type ProductOption = { id: string; sku: string; name: string }

type Line = { uuid: string; product_id: string | null; qty: number }

export function ReceiveDialog({
  open,
  onClose,
  locationId,
  locationLabel,
  products,
}: {
  open: boolean
  onClose: () => void
  locationId: string
  locationLabel: string
  products: ProductOption[]
}) {
  const [lines, setLines] = useState<Line[]>([{ uuid: crypto.randomUUID(), product_id: null, qty: 0 }])
  const [reason, setReason] = useState('Stock receipt')
  const [error, setError] = useState<string | null>(null)
  const [isPending, start] = useTransition()
  const router = useRouter()

  useEffect(() => {
    if (!open) return
    setLines([{ uuid: crypto.randomUUID(), product_id: null, qty: 0 }])
    setReason('Stock receipt')
    setError(null)
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  const productById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products])
  const totalUnits = lines.reduce((s, l) => s + (l.qty > 0 ? l.qty : 0), 0)
  const totalLines = lines.filter((l) => l.product_id && l.qty > 0).length

  function addLine() {
    setLines((prev) => [...prev, { uuid: crypto.randomUUID(), product_id: null, qty: 0 }])
  }
  function removeLine(uuid: string) {
    setLines((prev) => (prev.length === 1 ? prev : prev.filter((l) => l.uuid !== uuid)))
  }
  function updateLine(uuid: string, patch: Partial<Line>) {
    setLines((prev) => prev.map((l) => (l.uuid === uuid ? { ...l, ...patch } : l)))
  }

  function commit() {
    setError(null)
    const items = lines
      .filter((l) => l.product_id && l.qty > 0)
      .map((l) => ({ product_id: l.product_id!, qty: l.qty }))
    if (items.length === 0) {
      setError('Add at least one item with a positive quantity.')
      return
    }
    start(async () => {
      const result = await receiveStock(locationId, items, reason.trim() || null)
      if (result.error) {
        setError(result.error)
        return
      }
      router.refresh()
      onClose()
    })
  }

  if (!open) return null

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 grid place-items-start overflow-y-auto bg-ink-900/60 px-4 py-8 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="mx-auto w-full max-w-2xl rounded-2xl border border-ink-300 bg-paper p-5 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-ink-500">
              Receive stock at {locationLabel}
            </div>
            <h2 className="mt-0.5 font-display text-xl font-black tracking-tight">
              + Receive stock
            </h2>
            <p className="mt-1 text-xs text-ink-500">
              Records a positive movement and increments on-hand at this location.
            </p>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full bg-paper-dim/80 text-ink-700 hover:bg-paper-dim hover:text-ink-900"
          >
            ✕
          </button>
        </div>

        <label className="mt-4 block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-500">Reason / reference</span>
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Supplier invoice #1234"
            className="w-full rounded-lg border border-ink-300 bg-paper px-3 py-2 text-sm focus:border-prime-500 focus:outline-none focus:ring-2 focus:ring-prime-200"
          />
        </label>

        <div className="mt-4 space-y-2">
          {lines.map((l) => {
            const used = new Set(lines.filter((x) => x.uuid !== l.uuid && x.product_id).map((x) => x.product_id!))
            return (
              <div key={l.uuid} className="grid items-center gap-2 rounded-xl border border-ink-300/60 bg-paper p-2.5 sm:grid-cols-[1fr_120px_auto]">
                <select
                  value={l.product_id ?? ''}
                  onChange={(e) => updateLine(l.uuid, { product_id: e.target.value || null })}
                  className="rounded-lg border border-ink-300 bg-paper px-3 py-2 text-sm focus:border-prime-500 focus:outline-none"
                >
                  <option value="">Pick a product…</option>
                  {products
                    .filter((p) => !used.has(p.id))
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.sku} — {p.name}
                      </option>
                    ))}
                </select>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={l.qty || ''}
                  onChange={(e) => updateLine(l.uuid, { qty: Number(e.target.value) || 0 })}
                  placeholder="Qty"
                  className="rounded-lg border border-ink-300 bg-paper px-3 py-2 text-right font-mono tabular-nums focus:border-prime-500 focus:outline-none"
                />
                <button
                  onClick={() => removeLine(l.uuid)}
                  disabled={lines.length === 1}
                  className="grid h-9 w-9 place-items-center rounded-md text-ink-500 transition hover:bg-paper-dim hover:text-flash-700 disabled:opacity-30"
                  aria-label="Remove line"
                >
                  ✕
                </button>
              </div>
            )
          })}
          <button
            onClick={addLine}
            className="w-full rounded-lg border border-dashed border-ink-300 bg-paper-dim/40 py-2 text-xs font-bold text-ink-700 transition hover:border-prime-500 hover:text-prime-700"
          >
            + Add another item
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl bg-prime-50 px-4 py-3 text-sm">
          <span className="font-semibold text-ink-700">{totalLines} line{totalLines === 1 ? '' : 's'}</span>
          <span className="font-mono text-base font-black text-prime-700 tabular-nums">+{totalUnits} units</span>
        </div>

        {error && (
          <div className="mt-3 rounded-lg border border-flash-500/40 bg-flash-50 px-3 py-2 text-xs text-flash-700">
            {error}
          </div>
        )}

        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={commit}
            disabled={isPending || totalLines === 0}
            className="flex-1 rounded-xl bg-prime-700 px-4 py-3 text-sm font-black text-paper transition hover:bg-prime-800 disabled:opacity-40"
          >
            {isPending ? 'Receiving…' : `Confirm — receive ${totalUnits} units`}
          </button>
          <button
            onClick={onClose}
            className="rounded-xl border border-ink-300 bg-paper px-4 py-3 text-sm font-bold text-ink-900 hover:border-ink-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
