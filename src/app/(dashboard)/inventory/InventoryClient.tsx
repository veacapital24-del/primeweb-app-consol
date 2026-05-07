'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { AdjustDialog, type AdjustTarget } from './AdjustDialog'

type Row = {
  id: string
  sku: string
  name: string
  image_url: string | null
  available: number
  low_stock_threshold: number
  updated_at?: string | null
}

export function InventoryClient({ rows }: { rows: Row[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [dialogTargets, setDialogTargets] = useState<AdjustTarget[]>([])

  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id))
  const someSelected = selected.size > 0

  const toggleAll = () => {
    setSelected((s) => {
      if (allSelected) return new Set()
      return new Set(rows.map((r) => r.id))
    })
  }
  const toggleOne = (id: string) => {
    setSelected((s) => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const openSingle = (row: Row) => {
    setDialogTargets([{ id: row.id, name: row.name, sku: row.sku, available: row.available }])
  }

  const openBulk = () => {
    const targets: AdjustTarget[] = rows
      .filter((r) => selected.has(r.id))
      .map((r) => ({ id: r.id, name: r.name, sku: r.sku, available: r.available }))
    if (targets.length > 0) setDialogTargets(targets)
  }

  const closeDialog = () => {
    setDialogTargets([])
    setSelected(new Set())
  }

  const selectedRows = useMemo(() => rows.filter((r) => selected.has(r.id)), [rows, selected])
  const selectedUnits = selectedRows.reduce((s, r) => s + r.available, 0)

  return (
    <>
      <div className={`overflow-x-auto ${someSelected ? 'pb-28 md:pb-0' : ''}`}>
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="text-left text-[11px] font-bold uppercase tracking-widest text-ink-500">
              <th className="px-5 py-2.5 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  aria-label="Select all"
                  className="h-4 w-4 cursor-pointer rounded border-ink-300 text-prime-700 focus:ring-prime-500"
                />
              </th>
              <th className="px-5 py-2.5">Product</th>
              <th className="px-5 py-2.5">On hand</th>
              <th className="px-5 py-2.5">Status</th>
              <th className="px-5 py-2.5">Updated</th>
              <th className="px-5 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <Row
                key={r.id}
                row={r}
                selected={selected.has(r.id)}
                onToggle={() => toggleOne(r.id)}
                onAdjust={() => openSingle(r)}
              />
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-sm text-ink-500">
                  No products in this view.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Bulk action bar */}
      {someSelected && (
        <div className="fixed inset-x-0 bottom-3 z-30 flex justify-center px-3 sm:bottom-4 sm:px-4">
          <div className="flex w-full max-w-3xl items-center gap-2 rounded-2xl bg-ink-900 px-3 py-2.5 text-paper shadow-2xl shadow-ink-900/30 sm:gap-3 sm:px-4 sm:py-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-paper text-xs font-black text-ink-900">
              {selected.size}
            </span>
            <div className="min-w-0 flex-1 text-sm">
              <div className="truncate font-bold">{selected.size} product{selected.size > 1 ? 's' : ''} selected</div>
              <div className="hidden text-xs text-paper/70 tabular-nums sm:block">{selectedUnits} units total</div>
            </div>
            <button
              onClick={() => setSelected(new Set())}
              className="rounded-lg border border-paper/20 px-3 py-2 text-xs font-bold transition hover:bg-paper/10"
            >
              Clear
            </button>
            <button
              onClick={openBulk}
              className="rounded-lg bg-prime-500 px-3 py-2 text-xs font-bold transition hover:bg-prime-400 sm:px-4"
            >
              Adjust →
            </button>
          </div>
        </div>
      )}

      <AdjustDialog
        targets={dialogTargets}
        open={dialogTargets.length > 0}
        onClose={closeDialog}
      />
    </>
  )
}

function Row({
  row,
  selected,
  onToggle,
  onAdjust,
}: {
  row: Row
  selected: boolean
  onToggle: () => void
  onAdjust: () => void
}) {
  const isLow = row.available > 0 && row.available <= row.low_stock_threshold
  const isOut = row.available === 0
  const dot = isOut ? 'bg-flash-500' : isLow ? 'bg-amber-500' : 'bg-mint-500'
  const status = isOut ? 'Sold out' : isLow ? `Low · ${row.available}` : `In stock · ${row.available}`

  return (
    <tr className={`group border-t border-ink-200/60 transition ${selected ? 'bg-prime-50/60' : 'hover:bg-paper-dim/40'}`}>
      <td className="px-5 py-3.5">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          aria-label={`Select ${row.name}`}
          className="h-4 w-4 cursor-pointer rounded border-ink-300 text-prime-700 focus:ring-prime-500"
        />
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          {row.image_url ? (
            <img src={row.image_url} alt="" className="h-10 w-10 rounded-lg object-cover ring-1 ring-ink-200" />
          ) : (
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-paper-dim text-ink-300">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 8 12 3 3 8v8l9 5 9-5V8Z"/></svg>
            </div>
          )}
          <div className="min-w-0">
            <Link href={`/products/${row.id}`} className="block truncate text-sm font-semibold text-ink-900 hover:text-prime-700">
              {row.name}
            </Link>
            <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">{row.sku}</div>
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <span className="font-display text-lg font-black tabular-nums text-ink-900">{row.available}</span>
      </td>
      <td className="px-5 py-3.5">
        <div className="inline-flex items-center gap-2 text-xs">
          <span className="relative flex h-2 w-2">
            {isOut && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-flash-500 opacity-60"></span>}
            <span className={`relative inline-flex h-2 w-2 rounded-full ${dot}`}></span>
          </span>
          <span className="font-medium text-ink-700">{status}</span>
        </div>
      </td>
      <td className="px-5 py-3.5 text-xs text-ink-500">
        {row.updated_at ? relativeTime(row.updated_at) : '—'}
      </td>
      <td className="px-5 py-3.5 text-right">
        <button
          onClick={onAdjust}
          className="rounded-lg border border-ink-300 bg-paper px-3 py-1.5 text-xs font-bold text-ink-900 transition hover:border-prime-700 hover:bg-prime-50"
        >
          Adjust
        </button>
      </td>
    </tr>
  )
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const d = Math.floor(hr / 24)
  if (d < 7) return `${d}d ago`
  return new Date(iso).toLocaleDateString()
}
