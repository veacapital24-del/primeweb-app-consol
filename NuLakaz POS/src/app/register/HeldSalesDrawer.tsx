'use client'

import { useEffect, useState, useTransition } from 'react'
import { discardHeldSale, listHeldSales, recallHeldSale } from './actions'
import type { HeldLine } from './types'

export type HeldRow = {
  id: string
  sale_number: string
  subtotal_mur: number
  discount_mur: number
  total_mur: number
  notes: string | null
  created_at: string
  customer_id: string | null
}

const fmt = (n: number) => `Rs ${Number(n).toFixed(2)}`

function relativeTime(iso: string) {
  const ms = Date.now() - new Date(iso).getTime()
  const min = Math.floor(ms / 60_000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const d = Math.floor(hr / 24)
  return `${d}d ago`
}

export function HeldSalesDrawer({
  open,
  onClose,
  locationId,
  onRecall,
}: {
  open: boolean
  onClose: () => void
  locationId: string
  onRecall: (data: { customer_id: string | null; cart_discount_mur: number; lines: HeldLine[] }) => void
}) {
  const [rows, setRows] = useState<HeldRow[] | null>(null)
  const [isPending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)

  async function refresh() {
    const data = await listHeldSales(locationId)
    setRows(data as HeldRow[])
  }

  useEffect(() => {
    if (!open) return
    setRows(null)
    setError(null)
    refresh()
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, locationId])

  function handleRecall(saleId: string) {
    setError(null)
    start(async () => {
      const result = await recallHeldSale(saleId)
      if (!result.ok) {
        setError(result.error)
        return
      }
      onRecall({
        customer_id: result.customer_id,
        cart_discount_mur: result.cart_discount_mur,
        lines: result.lines,
      })
      onClose()
    })
  }

  function handleDiscard(saleId: string) {
    if (!confirm('Discard this held sale? This cannot be undone.')) return
    setError(null)
    start(async () => {
      const result = await discardHeldSale(saleId)
      if (!result.ok) {
        setError(result.error)
        return
      }
      refresh()
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
        className="mx-auto w-full max-w-xl rounded-2xl border border-ink-300 bg-paper p-5 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-ink-500">
              Parked / held sales
            </div>
            <h2 className="mt-0.5 font-display text-xl font-black tracking-tight">
              Held sales
            </h2>
            <p className="mt-1 text-xs text-ink-500">
              Recall to load back into the cart, or discard.
            </p>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full bg-paper-dim/80 text-ink-700 hover:bg-paper-dim hover:text-ink-900"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-lg border border-flash-500/40 bg-flash-50 px-3 py-2 text-xs text-flash-700">
            {error}
          </div>
        )}

        <div className="mt-4 max-h-[60vh] overflow-y-auto">
          {rows === null ? (
            <div className="py-8 text-center text-xs text-ink-500">Loading…</div>
          ) : rows.length === 0 ? (
            <div className="rounded-xl border border-dashed border-ink-300 bg-paper-dim/40 p-8 text-center text-sm text-ink-500">
              No held sales right now.
            </div>
          ) : (
            <ul className="space-y-2">
              {rows.map((r) => (
                <li
                  key={r.id}
                  className="rounded-xl border border-ink-300/60 bg-paper p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-prime-700">{r.sale_number}</span>
                        <span className="text-[11px] text-ink-500">{relativeTime(r.created_at)}</span>
                      </div>
                      <div className="mt-0.5 truncate text-sm font-semibold">
                        {r.notes ?? <span className="text-ink-500">No label</span>}
                      </div>
                      <div className="mt-0.5 flex items-baseline gap-2 text-xs text-ink-700">
                        <span className="font-mono tabular-nums">{fmt(r.total_mur)}</span>
                        {Number(r.discount_mur) > 0 && (
                          <span className="text-flash-700">−{fmt(r.discount_mur)} disc</span>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        onClick={() => handleRecall(r.id)}
                        disabled={isPending}
                        className="rounded-lg bg-prime-700 px-3 py-1.5 text-xs font-bold text-paper hover:bg-prime-800 disabled:opacity-50"
                      >
                        Recall
                      </button>
                      <button
                        onClick={() => handleDiscard(r.id)}
                        disabled={isPending}
                        className="rounded-lg border border-ink-300 bg-paper px-3 py-1.5 text-xs font-bold text-ink-900 hover:border-flash-500 hover:text-flash-700 disabled:opacity-50"
                      >
                        Discard
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
