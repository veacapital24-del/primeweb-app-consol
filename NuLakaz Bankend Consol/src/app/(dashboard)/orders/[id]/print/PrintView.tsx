'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import type { PackingSlipData } from '@/lib/packing-slip-types'

export function PrintView({
  slip,
  autoPrint,
}: {
  slip: PackingSlipData
  autoPrint?: boolean
}) {
  useEffect(() => {
    if (!autoPrint) return
    const t = window.setTimeout(() => window.print(), 500)
    return () => window.clearTimeout(t)
  }, [autoPrint])

  return (
    <>
      <div className="print-toolbar mb-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-xl bg-prime-700 px-4 py-2.5 text-sm font-bold text-paper hover:bg-prime-800"
        >
          Print / Save as PDF
        </button>
        <Link
          href={`/orders/${slip.id}`}
          className="rounded-xl border border-ink-300 bg-paper px-4 py-2.5 text-sm font-semibold text-ink-800 hover:border-prime-400"
        >
          ← Back to order
        </Link>
        <p className="w-full text-xs text-ink-500">
          Tip: In the print dialog, choose <strong>Save as PDF</strong> to download.
        </p>
      </div>

      <article className="mx-auto max-w-[210mm] rounded-2xl border border-ink-300/60 bg-white p-8 shadow-lg print:rounded-none print:border-0 print:p-0 print:shadow-none">
        <header className="border-b-4 border-prime-800 pb-4">
          <p className="text-xs font-bold uppercase tracking-widest text-prime-700">NuLakaz</p>
          <h1 className="font-display text-2xl font-black tracking-tight text-ink-900">
            Packing slip
          </h1>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-mono text-xl font-bold text-prime-800">{slip.orderNumber}</p>
              <p className="mt-1 text-sm text-ink-600">
                {slip.channelLabel}
                {slip.isWholesale ? ' · Wholesale' : ' · Retail'}
              </p>
            </div>
            <span className="rounded-full bg-prime-50 px-3 py-1 text-xs font-bold text-prime-800">
              {slip.statusLabel}
            </span>
          </div>
        </header>

        <section className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-ink-500">
              Ship to
            </h2>
            <p className="mt-1 text-lg font-bold text-ink-900">{slip.customerName}</p>
            {slip.whatsappPhone && (
              <p className="font-mono text-sm text-ink-600">WhatsApp: {slip.whatsappPhone}</p>
            )}
          </div>
          <div className="text-sm text-ink-600 sm:text-right">
            <p>Ordered {new Date(slip.createdAt).toLocaleString()}</p>
            <p>Printed {new Date(slip.printedAt).toLocaleString()}</p>
          </div>
        </section>

        <table className="mt-8 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-ink-900/10 bg-ink-50/80 text-left text-[10px] font-bold uppercase tracking-wider text-ink-500">
              <th className="py-2 pr-3">SKU</th>
              <th className="py-2 pr-3">Product</th>
              <th className="py-2 pr-3 text-right">Qty</th>
              <th className="w-10 py-2 text-center">Pick</th>
            </tr>
          </thead>
          <tbody>
            {slip.items.map((item, i) => (
              <tr key={i} className="border-b border-ink-200/80">
                <td className="py-3 pr-3 font-mono text-xs font-semibold text-ink-700">
                  {item.sku}
                </td>
                <td className="py-3 pr-3 font-medium text-ink-900">{item.name}</td>
                <td className="py-3 pr-3 text-right font-display text-base font-black text-ink-900">
                  {item.qty}
                </td>
                <td className="py-3 text-center">
                  <span className="inline-block h-5 w-5 border-2 border-ink-400" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 flex justify-between border-t border-ink-300 pt-4 text-sm">
          <span className="font-bold text-ink-700">{slip.totalUnits} units total</span>
          <span className="font-display text-xl font-black text-prime-800">
            Rs {slip.subtotalMur.toFixed(2)}
          </span>
        </div>

        {slip.notes && (
          <section className="mt-6 rounded-xl bg-ink-50/80 p-4">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-ink-500">
              Notes
            </h2>
            <pre className="mt-2 whitespace-pre-wrap text-xs text-ink-700">{slip.notes}</pre>
          </section>
        )}

        <footer className="mt-10 grid gap-6 border-t border-ink-300 pt-6 sm:grid-cols-2 text-sm text-ink-600">
          <p>
            <span className="font-bold text-ink-800">Packed by:</span> _________________________
          </p>
          <p>
            <span className="font-bold text-ink-800">Checked by:</span> _________________________
          </p>
        </footer>
      </article>
    </>
  )
}
