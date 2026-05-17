'use client'

import { useEffect, useState } from 'react'
import { listMovements } from './actions'

type Movement = {
  id: number
  delta: number
  before_qty: number | null
  after_qty: number | null
  reason: string | null
  reason_code: string | null
  reference_id: string | null
  actor: string | null
  created_at: string
}

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', {
    timeZone: 'Indian/Mauritius',
    hour12: false,
  })

const REASON_TONE: Record<string, string> = {
  sale: 'bg-flash-50 text-flash-700',
  return: 'bg-mint-100 text-mint-600',
  receipt: 'bg-mint-100 text-mint-600',
  transfer_in: 'bg-prime-50 text-prime-700',
  transfer_out: 'bg-amber-50 text-amber-700',
  adjustment: 'bg-amber-50 text-amber-700',
  count: 'bg-prime-50 text-prime-700',
  damage: 'bg-flash-50 text-flash-700',
}

export function HistoryDialog({
  open,
  onClose,
  productId,
  locationId,
  productName,
  productSku,
}: {
  open: boolean
  onClose: () => void
  productId: string
  locationId: string
  productName: string
  productSku: string
}) {
  const [rows, setRows] = useState<Movement[] | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    let active = true
    setLoading(true)
    setRows(null)
    listMovements(productId, locationId).then((data) => {
      if (active) {
        setRows(data as Movement[])
        setLoading(false)
      }
    })
    return () => {
      active = false
    }
  }, [open, productId, locationId])

  useEffect(() => {
    if (!open) return
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
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-widest text-ink-500">
              Stock history
            </div>
            <div className="mt-0.5 truncate font-display text-lg font-black tracking-tight">
              {productName}
            </div>
            <div className="font-mono text-xs text-ink-500">{productSku}</div>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full bg-paper-dim/80 text-ink-700 hover:bg-paper-dim hover:text-ink-900"
          >
            ✕
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-ink-300/60">
          <table className="w-full text-sm">
            <thead className="bg-paper-dim/40 text-left text-[10px] uppercase tracking-wider text-ink-500">
              <tr>
                <th className="px-3 py-2">When</th>
                <th className="px-3 py-2">Reason</th>
                <th className="px-3 py-2 text-right">Δ</th>
                <th className="px-3 py-2 text-right">After</th>
                <th className="px-3 py-2">Actor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-300/60">
              {loading && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-xs text-ink-500">
                    Loading…
                  </td>
                </tr>
              )}
              {!loading && rows && rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-xs text-ink-500">
                    No movements recorded.
                  </td>
                </tr>
              )}
              {!loading &&
                rows?.map((m) => (
                  <tr key={m.id} className="hover:bg-paper-dim/40">
                    <td className="whitespace-nowrap px-3 py-2 text-xs text-ink-700">
                      {fmtDateTime(m.created_at)}
                    </td>
                    <td className="px-3 py-2">
                      {m.reason_code && (
                        <span
                          className={`mr-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            REASON_TONE[m.reason_code] ?? 'bg-ink-100 text-ink-700'
                          }`}
                        >
                          {m.reason_code}
                        </span>
                      )}
                      <span className="text-xs text-ink-700">{m.reason ?? '—'}</span>
                    </td>
                    <td
                      className={`px-3 py-2 text-right font-mono font-bold tabular-nums ${
                        m.delta > 0 ? 'text-mint-600' : m.delta < 0 ? 'text-flash-700' : 'text-ink-700'
                      }`}
                    >
                      {m.delta > 0 ? '+' : ''}
                      {m.delta}
                    </td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums text-ink-700">
                      {m.after_qty ?? '—'}
                    </td>
                    <td className="truncate px-3 py-2 text-xs text-ink-500">{m.actor ?? '—'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
