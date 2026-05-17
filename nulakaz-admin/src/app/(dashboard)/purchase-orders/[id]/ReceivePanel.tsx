'use client'

import { useState, useTransition } from 'react'
import { receiveItems } from '../actions'
import { AlertError, GlassCard } from '@/components/admin/ui'

type Line = {
  id: string
  product_id: string
  qty_ordered: number
  qty_received: number
  unit_cost_mur: number
  product_name: string
  product_sku: string
}

export function ReceivePanel({ poId, lines }: { poId: string; lines: Line[] }) {
  const [isPending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [qtys, setQtys] = useState<Record<string, number>>(
    Object.fromEntries(lines.map((l) => [l.id, l.qty_ordered - l.qty_received])),
  )

  const openLines = lines.filter((l) => l.qty_received < l.qty_ordered)

  if (done) {
    return (
      <div className="glass-card flex items-center gap-3 border-mint-500/30 bg-mint-50/50 p-4 text-sm font-semibold text-mint-700">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-mint-100 text-mint-600">✓</span>
        Items received and stock updated.
      </div>
    )
  }

  if (!openLines.length) {
    return (
      <div className="glass-card p-4 text-sm text-ink-500">
        All items have been fully received.
      </div>
    )
  }

  const onSubmit = () => {
    setError(null)
    const receipts = openLines
      .map((l) => ({ lineId: l.id, qty: qtys[l.id] ?? 0 }))
      .filter((r) => r.qty > 0)
    if (!receipts.length) {
      setError('Enter at least one received quantity.')
      return
    }
    start(async () => {
      try {
        const form = new FormData()
        form.set('po_id', poId)
        form.set('receipts', JSON.stringify(receipts))
        await receiveItems(form)
        setDone(true)
      } catch (e: unknown) {
        if (e instanceof Error) setError(e.message)
      }
    })
  }

  return (
    <GlassCard title="Receive items" desc="Enter quantities received — stock updates on confirm.">
      {error && <AlertError message={error} />}
      <div className="mt-4 space-y-3">
        {openLines.map((line) => {
          const remaining = line.qty_ordered - line.qty_received
          const pct = line.qty_ordered > 0 ? (line.qty_received / line.qty_ordered) * 100 : 0
          return (
            <div key={line.id} className="po-line-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink-900">{line.product_name}</p>
                  <p className="text-xs text-ink-500">
                    {line.product_sku} · {line.qty_received}/{line.qty_ordered} already in stock
                  </p>
                  <div className="mt-2 h-1.5 max-w-xs overflow-hidden rounded-full bg-ink-100">
                    <div
                      className={`h-full rounded-full ${pct >= 100 ? 'bg-mint-500' : 'bg-prime-500'}`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-ink-500">
                    Receiving
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={remaining}
                    step={1}
                    value={qtys[line.id] ?? remaining}
                    onChange={(e) =>
                      setQtys((prev) => ({
                        ...prev,
                        [line.id]: Math.min(remaining, Math.max(0, parseInt(e.target.value) || 0)),
                      }))
                    }
                    className="w-20 rounded-xl border border-ink-300/80 bg-paper px-3 py-2 text-sm font-semibold tabular-nums text-ink-900 focus:border-prime-400 focus:outline-none focus:ring-[3px] focus:ring-prime-200/70"
                  />
                  <span className="text-xs tabular-nums text-ink-400">/ {remaining}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <div className="mt-5 flex justify-end border-t border-ink-200/50 pt-4">
        <button
          type="button"
          onClick={onSubmit}
          disabled={isPending}
          className="settings-form-submit"
        >
          {isPending ? 'Updating stock…' : 'Confirm receipt'}
        </button>
      </div>
    </GlassCard>
  )
}
