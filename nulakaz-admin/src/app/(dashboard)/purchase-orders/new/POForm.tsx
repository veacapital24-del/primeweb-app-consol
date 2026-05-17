'use client'

import { useState, useTransition } from 'react'
import { createPurchaseOrder } from '../actions'
import type { Supplier, Location, Product } from '@/lib/types'
import {
  AlertError,
  Field,
  FormStickyBar,
  GlassCard,
  inputCls,
} from '@/components/admin/ui'

type LineItem = {
  product_id: string
  qty_ordered: number
  unit_cost_mur: number
}

type Props = {
  suppliers: Pick<Supplier, 'id' | 'name'>[]
  locations: Pick<Location, 'id' | 'name' | 'kind'>[]
  products: Pick<Product, 'id' | 'sku' | 'name' | 'wholesale_price_mur' | 'retail_price_mur'>[]
}

function formatMur(n: number) {
  return n.toLocaleString('en-MU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function POForm({ suppliers, locations, products }: Props) {
  const [isPending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [lines, setLines] = useState<LineItem[]>([
    { product_id: '', qty_ordered: 1, unit_cost_mur: 0 },
  ])

  const addLine = () =>
    setLines((prev) => [...prev, { product_id: '', qty_ordered: 1, unit_cost_mur: 0 }])

  const removeLine = (i: number) =>
    setLines((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev))

  const updateLine = (i: number, patch: Partial<LineItem>) =>
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)))

  const onProductChange = (i: number, productId: string) => {
    const product = products.find((p) => p.id === productId)
    const defaultCost = product?.wholesale_price_mur ?? product?.retail_price_mur ?? 0
    updateLine(i, { product_id: productId, unit_cost_mur: defaultCost })
  }

  const totalCost = lines.reduce((s, l) => s + l.qty_ordered * l.unit_cost_mur, 0)
  const validLineCount = lines.filter((l) => l.product_id).length

  const onSubmit = (form: FormData) => {
    setError(null)
    const validLines = lines.filter((l) => l.product_id)
    if (!validLines.length) {
      setError('Add at least one product line.')
      return
    }
    const productIds = validLines.map((l) => l.product_id)
    if (new Set(productIds).size !== productIds.length) {
      setError('Duplicate products detected — each product can appear only once.')
      return
    }
    form.set('lines', JSON.stringify(validLines))
    start(async () => {
      try {
        await createPurchaseOrder(form)
      } catch (e: unknown) {
        if (e instanceof Error && e.message !== 'NEXT_REDIRECT') setError(e.message)
      }
    })
  }

  return (
    <form action={onSubmit} className="space-y-6">
      {error && <AlertError message={error} />}

      <GlassCard title="Order details" desc="Supplier, delivery location, and expected date.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Supplier">
            <select name="supplier_id" className={inputCls} defaultValue="">
              <option value="">No supplier</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Receiving location" hint="Leave blank for global warehouse.">
            <select name="location_id" className={inputCls} defaultValue="">
              <option value="">Global warehouse</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.kind})
                </option>
              ))}
            </select>
          </Field>

          <Field label="Expected delivery date">
            <input
              type="date"
              name="expected_date"
              className={inputCls}
              min={new Date().toISOString().split('T')[0]}
            />
          </Field>

          <Field label="Notes / reference">
            <input
              type="text"
              name="notes"
              placeholder="Invoice ref, delivery instructions…"
              className={inputCls}
            />
          </Field>
        </div>
      </GlassCard>

      <GlassCard
        title="Line items"
        desc={`${validLineCount} product${validLineCount === 1 ? '' : 's'} · unit cost defaults to wholesale price`}
      >
        <div className="space-y-3">
          {lines.map((line, i) => {
            const lineTotal = line.qty_ordered * line.unit_cost_mur
            const product = products.find((p) => p.id === line.product_id)
            return (
              <div key={i} className="po-line-card">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-ink-500">
                    Line {i + 1}
                  </span>
                  {line.product_id && (
                    <span className="font-display text-sm font-bold tabular-nums text-prime-800">
                      Rs {formatMur(lineTotal)}
                    </span>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-[1fr_88px_120px_auto] sm:items-end">
                  <Field label="Product">
                    <select
                      className={inputCls}
                      value={line.product_id}
                      onChange={(e) => onProductChange(i, e.target.value)}
                      required
                    >
                      <option value="">Select product…</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sku})
                        </option>
                      ))}
                    </select>
                    {product && (
                      <span className="mt-1 block text-[11px] text-ink-500">{product.sku}</span>
                    )}
                  </Field>

                  <Field label="Qty">
                    <input
                      type="number"
                      min={1}
                      step={1}
                      value={line.qty_ordered}
                      onChange={(e) =>
                        updateLine(i, { qty_ordered: Math.max(1, parseInt(e.target.value) || 1) })
                      }
                      className={inputCls}
                      required
                    />
                  </Field>

                  <Field label="Unit (Rs)">
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={line.unit_cost_mur}
                      onChange={(e) =>
                        updateLine(i, { unit_cost_mur: parseFloat(e.target.value) || 0 })
                      }
                      className={inputCls}
                      required
                    />
                  </Field>

                  <button
                    type="button"
                    onClick={() => removeLine(i)}
                    disabled={lines.length === 1}
                    className="mb-0.5 grid h-10 w-10 place-items-center rounded-xl border border-ink-200/80 text-ink-400 transition hover:border-flash-500/80 hover:bg-flash-50 hover:text-flash-600 disabled:pointer-events-none disabled:opacity-30"
                    aria-label="Remove line"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                      <path d="M5 12h14" />
                    </svg>
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <button
          type="button"
          onClick={addLine}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-prime-300/80 bg-prime-50/30 px-4 py-3 text-sm font-semibold text-prime-800 transition hover:border-prime-400 hover:bg-prime-50"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add another line
        </button>

        <div className="mt-5 flex items-end justify-between gap-4 border-t border-ink-200/60 pt-4">
          <p className="text-xs text-ink-500">
            Stock is updated when you receive items on the PO detail page.
          </p>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-ink-500">Estimated total</p>
            <p className="font-display text-2xl font-black tabular-nums text-ink-900">
              Rs {formatMur(totalCost)}
            </p>
          </div>
        </div>
      </GlassCard>

      <input type="hidden" name="lines" value={JSON.stringify(lines)} />

      <FormStickyBar
        backHref="/purchase-orders"
        backLabel="← Purchase Orders"
        submitLabel="Create purchase order"
        pendingLabel="Creating…"
        isPending={isPending}
      />
    </form>
  )
}
