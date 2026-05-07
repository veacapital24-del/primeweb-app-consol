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
}

export function StockRow({ productId, productLink, name, sku, imageUrl, onHand, threshold }: Props) {
  const [value, setValue] = useState(String(onHand))
  const [pending, start] = useTransition()
  const live = Number(value)
  const isLow = live > 0 && live <= threshold
  const isOut = live === 0

  return (
    <tr className="border-t border-ink-300/60 hover:bg-paper-dim/30">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {imageUrl && <img src={imageUrl} alt="" className="h-10 w-10 rounded-lg object-cover ring-1 ring-ink-300" />}
          <div className="min-w-0">
            <Link href={productLink} className="block truncate font-semibold text-ink-900 hover:text-prime-700">{name}</Link>
            <div className="font-mono text-[11px] uppercase tracking-wider text-ink-500">{sku}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <button
            disabled={pending}
            onClick={() => start(() => adjustStock(productId, -1).then(() => setValue(String(Math.max(0, live - 1)))))}
            className="rounded-md border border-ink-300 bg-paper px-2 py-1 text-sm hover:bg-ink-100 disabled:opacity-40"
          >−</button>
          <input
            type="number"
            min={0}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={() => start(() => setStock(productId, Number(value) || 0, 'inline edit'))}
            className="w-16 rounded-md border border-ink-300 bg-paper px-2 py-1 text-center text-sm font-bold tabular-nums focus:border-prime-500 focus:outline-none"
          />
          <button
            disabled={pending}
            onClick={() => start(() => adjustStock(productId, 1).then(() => setValue(String(live + 1))))}
            className="rounded-md border border-ink-300 bg-paper px-2 py-1 text-sm hover:bg-ink-100 disabled:opacity-40"
          >+</button>
        </div>
      </td>
      <td className="px-4 py-3">
        {isOut ? (
          <span className="rounded-full bg-flash-50 px-2 py-0.5 text-[11px] font-bold text-flash-700">Sold out</span>
        ) : isLow ? (
          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">Low — flash</span>
        ) : (
          <span className="rounded-full bg-mint-100 px-2 py-0.5 text-[11px] font-bold text-mint-600">In stock</span>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {[10, 25, 50, 100].map((n) => (
            <button
              key={n}
              disabled={pending}
              onClick={() => start(() => setStock(productId, n, `quick set ${n}`).then(() => setValue(String(n))))}
              className="rounded-md border border-ink-300 bg-paper px-2 py-1 text-xs hover:bg-ink-100 disabled:opacity-40"
            >
              {n}
            </button>
          ))}
          <button
            disabled={pending}
            onClick={() => start(() => setStock(productId, 0, 'manual sell out').then(() => setValue('0')))}
            className="rounded-md border border-flash-500/40 bg-flash-50 px-2 py-1 text-xs text-flash-700 hover:bg-flash-500 hover:text-white disabled:opacity-40"
          >
            Sell out
          </button>
        </div>
      </td>
    </tr>
  )
}
