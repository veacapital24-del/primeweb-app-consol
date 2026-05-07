'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { adjustStock, setStock } from './actions'

type Props = {
  productId: string
  productLink: string
  name: string
  sku: string
  imageUrl: string | null
  onHand: number
  threshold: number
  updatedAt?: string | null
}

export function StockRow({ productId, productLink, name, sku, imageUrl, onHand, threshold, updatedAt }: Props) {
  const [value, setValue] = useState(String(onHand))
  const [pending, start] = useTransition()
  const [menuOpen, setMenuOpen] = useState(false)
  const live = Number(value)
  const isLow = live > 0 && live <= threshold
  const isOut = live === 0

  const dot = isOut ? 'bg-flash-500' : isLow ? 'bg-amber-500' : 'bg-mint-500'
  const status = isOut ? 'Sold out' : isLow ? `Low · ${live}` : `In stock · ${live}`

  const update = (next: number, reason: string) => {
    const safe = Math.max(0, Math.floor(next))
    setValue(String(safe))
    start(() => setStock(productId, safe, reason))
  }

  return (
    <tr className="group border-t border-ink-200/60 transition hover:bg-paper-dim/40">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          {imageUrl ? (
            <img src={imageUrl} alt="" className="h-10 w-10 rounded-lg object-cover ring-1 ring-ink-200" />
          ) : (
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-paper-dim text-ink-300">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 8 12 3 3 8v8l9 5 9-5V8Z"/></svg>
            </div>
          )}
          <div className="min-w-0">
            <Link href={productLink} className="block truncate text-sm font-semibold text-ink-900 hover:text-prime-700">
              {name}
            </Link>
            <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">{sku}</div>
          </div>
        </div>
      </td>

      <td className="px-5 py-3.5">
        <div className="inline-flex items-center rounded-lg border border-ink-200 bg-paper">
          <button
            disabled={pending}
            onClick={() => start(() => adjustStock(productId, -1).then(() => setValue(String(Math.max(0, live - 1)))))}
            aria-label="Decrease"
            className="grid h-8 w-8 place-items-center text-ink-700 hover:bg-ink-100 hover:text-ink-900 disabled:opacity-40"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M5 12h14"/></svg>
          </button>
          <input
            type="number"
            min={0}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={() => start(() => setStock(productId, Number(value) || 0, 'inline edit'))}
            className="w-14 border-x border-ink-200 bg-transparent py-1.5 text-center text-sm font-semibold tabular-nums focus:outline-none"
          />
          <button
            disabled={pending}
            onClick={() => start(() => adjustStock(productId, 1).then(() => setValue(String(live + 1))))}
            aria-label="Increase"
            className="grid h-8 w-8 place-items-center text-ink-700 hover:bg-ink-100 hover:text-ink-900 disabled:opacity-40"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
          </button>
        </div>
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
        {updatedAt ? relativeTime(updatedAt) : '—'}
      </td>

      <td className="px-5 py-3.5 text-right">
        <div className="relative inline-block">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            onBlur={() => setTimeout(() => setMenuOpen(false), 150)}
            className="grid h-8 w-8 place-items-center rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-900"
            aria-label="More"
            aria-expanded={menuOpen}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
          </button>
          {menuOpen && (
            <div
              className="absolute right-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-xl border border-ink-200 bg-paper text-left text-xs shadow-lg shadow-ink-900/10"
              onMouseDown={(e) => e.preventDefault()}
            >
              <MenuItem label="Restock to 25"   onClick={() => update(25, 'restock 25')}  />
              <MenuItem label="Restock to 50"   onClick={() => update(50, 'restock 50')}  />
              <MenuItem label="Restock to 100"  onClick={() => update(100, 'restock 100')} />
              <hr className="border-ink-200" />
              <MenuItem label="Mark sold out"   onClick={() => update(0, 'manual sell out')} tone="flash" />
            </div>
          )}
        </div>
      </td>
    </tr>
  )
}

function MenuItem({ label, onClick, tone }: { label: string; onClick: () => void; tone?: 'flash' }) {
  return (
    <button
      onClick={onClick}
      className={`block w-full px-3 py-2 text-left transition ${
        tone === 'flash' ? 'text-flash-700 hover:bg-flash-50' : 'text-ink-700 hover:bg-paper-dim/60'
      }`}
    >
      {label}
    </button>
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
