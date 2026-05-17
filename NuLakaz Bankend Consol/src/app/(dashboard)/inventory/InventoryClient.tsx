'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { StockBadge } from '@/components/admin/ui'
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

export function InventoryClient({
  rows,
  locationId,
  locationLabel,
  emptyMessage = 'No products in this view.',
}: {
  rows: Row[]
  locationId: string | null
  locationLabel: string
  emptyMessage?: string
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [dialogTargets, setDialogTargets] = useState<AdjustTarget[]>([])
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id))
  const someSelected = selected.size > 0

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(rows.map((r) => r.id)))
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
    setOpenMenuId(null)
    setDialogTargets([
      { id: row.id, name: row.name, sku: row.sku, available: row.available },
    ])
  }

  const openBulk = () => {
    const targets = rows
      .filter((r) => selected.has(r.id))
      .map((r) => ({ id: r.id, name: r.name, sku: r.sku, available: r.available }))
    if (targets.length > 0) setDialogTargets(targets)
  }

  const closeDialog = () => {
    setDialogTargets([])
    setSelected(new Set())
  }

  const selectedUnits = useMemo(
    () => rows.filter((r) => selected.has(r.id)).reduce((s, r) => s + r.available, 0),
    [rows, selected],
  )

  if (rows.length === 0) {
    return (
      <div className="glass-card flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
        <div className="grid h-11 w-11 place-items-center rounded-full bg-ink-100 text-ink-400">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-ink-700">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <>
      <div className={`glass-card overflow-hidden ${someSelected ? 'mb-20' : ''}`}>
        {/* Column headers — desktop only */}
        <div className="hidden items-center gap-3 border-b border-ink-200/60 bg-canvas/40 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-ink-500 sm:flex sm:px-4">
          <span className="w-8 shrink-0">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
              aria-label="Select all"
              className="h-4 w-4 rounded border-ink-300 text-prime-700 focus:ring-prime-400"
            />
          </span>
          <span className="w-10 shrink-0" />
          <span className="min-w-0 flex-1">Product</span>
          <span className="w-[4.5rem] shrink-0 text-right">Qty</span>
          <span className="w-9 shrink-0" />
        </div>

        <ul className="divide-y divide-ink-200/50">
          {rows.map((r) => (
            <StockRow
              key={r.id}
              row={r}
              selected={selected.has(r.id)}
              menuOpen={openMenuId === r.id}
              onToggle={() => toggleOne(r.id)}
              onMenuToggle={() =>
                setOpenMenuId((id) => (id === r.id ? null : r.id))
              }
              onMenuClose={() => setOpenMenuId(null)}
              onAdjust={() => openSingle(r)}
            />
          ))}
        </ul>
      </div>

      {someSelected && (
        <div className="fixed inset-x-0 bottom-4 z-30 flex justify-center px-4">
          <div className="flex w-full max-w-lg items-center gap-3 rounded-2xl border border-ink-300/50 bg-paper/95 px-4 py-3 shadow-xl backdrop-blur-md">
            <span className="font-display text-lg font-black tabular-nums text-prime-800">
              {selected.size}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-ink-900">Selected</p>
              <p className="text-xs tabular-nums text-ink-500">{selectedUnits} units</p>
            </div>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="rounded-xl px-3 py-2 text-xs font-semibold text-ink-600 hover:bg-ink-100"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={openBulk}
              className="rounded-xl bg-prime-700 px-4 py-2 text-xs font-bold text-paper shadow-md hover:bg-prime-800"
            >
              Adjust stock
            </button>
          </div>
        </div>
      )}

      <AdjustDialog
        targets={dialogTargets}
        open={dialogTargets.length > 0}
        onClose={closeDialog}
        locationId={locationId}
        locationLabel={locationLabel}
      />
    </>
  )
}

function StockRow({
  row,
  selected,
  menuOpen,
  onToggle,
  onMenuToggle,
  onMenuClose,
  onAdjust,
}: {
  row: Row
  selected: boolean
  menuOpen: boolean
  onToggle: () => void
  onMenuToggle: () => void
  onMenuClose: () => void
  onAdjust: () => void
}) {
  return (
    <li
      className={`flex items-center gap-2.5 px-3 py-2.5 transition sm:gap-3 sm:px-4 sm:py-3 ${
        selected ? 'bg-prime-50/50' : 'hover:bg-prime-50/20'
      }`}
    >
      <input
        type="checkbox"
        checked={selected}
        onChange={onToggle}
        aria-label={`Select ${row.name}`}
        className="h-4 w-4 shrink-0 rounded border-ink-300 text-prime-700 focus:ring-prime-400"
      />

      <ProductThumb url={row.image_url} name={row.name} />

      <div className="min-w-0 flex-1">
        <Link
          href={`/products/${row.id}`}
          className="block truncate text-sm font-semibold leading-snug text-ink-900 hover:text-prime-700"
        >
          {row.name}
        </Link>
        <p className="truncate font-mono text-[10px] text-ink-500">{row.sku}</p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-0.5">
        <span className="text-[10px] font-medium uppercase tracking-wide text-ink-400 sm:hidden">
          Qty
        </span>
        <span
          className={`font-display text-base font-black tabular-nums sm:text-lg ${
            row.available === 0
              ? 'text-flash-700'
              : row.available <= row.low_stock_threshold
                ? 'text-amber-700'
                : 'text-ink-900'
          }`}
        >
          {row.available}
        </span>
        {(row.available === 0 || row.available <= row.low_stock_threshold) && (
          <StockBadge available={row.available} />
        )}
      </div>

      <RowMenu
        open={menuOpen}
        onToggle={onMenuToggle}
        onClose={onMenuClose}
        onAdjust={onAdjust}
        productId={row.id}
      />
    </li>
  )
}

function RowMenu({
  open,
  onToggle,
  onClose,
  onAdjust,
  productId,
}: {
  open: boolean
  onToggle: () => void
  onClose: () => void
  onAdjust: () => void
  productId: string
}) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) onClose()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Product actions"
        className={`grid h-9 w-9 place-items-center rounded-xl transition ${
          open
            ? 'bg-prime-100 text-prime-800 ring-1 ring-prime-200'
            : 'text-ink-500 hover:bg-ink-100 hover:text-ink-900'
        }`}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
          <circle cx="12" cy="5" r="1.75" />
          <circle cx="12" cy="12" r="1.75" />
          <circle cx="12" cy="19" r="1.75" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-1 min-w-[10.5rem] overflow-hidden rounded-xl border border-ink-200/80 bg-paper py-1 shadow-lg shadow-ink-900/10"
        >
          <button
            type="button"
            role="menuitem"
            onClick={onAdjust}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-semibold text-ink-900 transition hover:bg-prime-50"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-prime-700" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
            Adjust stock
          </button>
          <Link
            href={`/products/${productId}`}
            role="menuitem"
            onClick={onClose}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-ink-700 transition hover:bg-ink-50"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-ink-500" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 20.5 3.5" />
            </svg>
            View product
          </Link>
        </div>
      )}
    </div>
  )
}

function ProductThumb({ url, name }: { url: string | null; name: string }) {
  if (url) {
    return (
      <img
        src={url}
        alt=""
        className="h-10 w-10 shrink-0 rounded-lg object-cover ring-1 ring-ink-200/80 sm:h-11 sm:w-11 sm:rounded-xl"
      />
    )
  }
  return (
    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-ink-100 text-ink-400 ring-1 ring-ink-200/60 sm:h-11 sm:w-11 sm:rounded-xl">
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
      </svg>
    </div>
  )
}
