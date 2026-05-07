'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { createProduct, updateProduct, deleteProduct } from './actions'
import type { Product } from '@/lib/types'

type Mode = 'create' | 'edit'

type Props = {
  mode: Mode
  product?: Product & { initial_stock?: number }
}

export function ProductForm({ mode, product }: Props) {
  const [isPending, start] = useTransition()
  const [hasWholesale, setHasWholesale] = useState(product?.wholesale_price_mur != null)
  const [name, setName] = useState(product?.name ?? '')
  const [slug, setSlug] = useState(product?.slug ?? '')
  const [error, setError] = useState<string | null>(null)

  const onSubmit = (form: FormData) => {
    setError(null)
    start(async () => {
      try {
        if (mode === 'create') await createProduct(form)
        else await updateProduct(product!.id, form)
      } catch (e: unknown) {
        // redirect() throws a special error in server actions — let it through
        if (e instanceof Error && e.message !== 'NEXT_REDIRECT') setError(e.message)
      }
    })
  }

  const onDelete = () => {
    if (!product) return
    if (!confirm(`Supprimer "${product.name}" ? Cette action est irréversible.`)) return
    start(async () => {
      try { await deleteProduct(product.id) }
      catch (e) { if (e instanceof Error && e.message !== 'NEXT_REDIRECT') setError(e.message) }
    })
  }

  return (
    <form action={onSubmit} className="space-y-6">
      {error && (
        <div className="rounded-xl border border-flash-500/40 bg-flash-50 px-4 py-3 text-sm text-flash-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Left column */}
        <div className="space-y-6">
          <Card title="Identity">
            <div className="grid gap-4 sm:grid-cols-[1fr_240px]">
              <Field label="Name" required>
                <input
                  name="name"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (mode === 'create' && !slug) {
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))
                    }
                  }}
                  className={inputCls}
                />
              </Field>
              <Field label="SKU" required>
                <input name="sku" required defaultValue={product?.sku ?? ''} className={`${inputCls} font-mono uppercase`} />
              </Field>
              <Field label="Slug" required hint="Used in /p/{slug}">
                <input
                  name="slug"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className={`${inputCls} font-mono`}
                />
              </Field>
              <Field label="Image URL">
                <input name="image_url" type="url" defaultValue={product?.image_url ?? ''} placeholder="https://…" className={inputCls} />
              </Field>
            </div>
            <Field label="Description" className="mt-4">
              <textarea
                name="description"
                rows={4}
                defaultValue={product?.description ?? ''}
                className={`${inputCls} resize-y`}
              />
            </Field>
          </Card>

          <Card title="Pricing">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Retail price (MUR)" required>
                <PriceInput name="retail_price_mur" defaultValue={product?.retail_price_mur ?? 0} />
              </Field>
              <Field label="" className="self-end">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={hasWholesale}
                    onChange={(e) => setHasWholesale(e.target.checked)}
                    className="h-4 w-4 rounded border-ink-300 text-prime-700 focus:ring-prime-500"
                  />
                  <span className="font-medium">Wholesale tier</span>
                </label>
              </Field>
            </div>

            {hasWholesale && (
              <div className="mt-4 grid gap-4 rounded-xl bg-prime-50 p-4 sm:grid-cols-2">
                <Field label="Wholesale price (MUR)">
                  <PriceInput name="wholesale_price_mur" defaultValue={product?.wholesale_price_mur ?? 0} />
                </Field>
                <Field label="Min. wholesale qty">
                  <input
                    name="wholesale_min_qty"
                    type="number"
                    min={1}
                    defaultValue={product?.wholesale_min_qty ?? 6}
                    className={inputCls}
                  />
                </Field>
              </div>
            )}
            {!hasWholesale && <input type="hidden" name="wholesale_price_mur" value="" />}
          </Card>

          {mode === 'create' && (
            <Card title="Initial inventory">
              <Field label="On hand" hint="Starting quantity in the warehouse">
                <input name="initial_stock" type="number" min={0} defaultValue={0} className={inputCls} />
              </Field>
            </Card>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <Card title="Status">
            <label className="flex items-center justify-between gap-3 rounded-xl bg-paper-dim/60 p-3">
              <div>
                <div className="text-sm font-semibold">Active</div>
                <div className="text-xs text-ink-500">Show on storefront</div>
              </div>
              <input
                type="checkbox"
                name="active"
                defaultChecked={product?.active ?? true}
                className="h-5 w-9 cursor-pointer appearance-none rounded-full bg-ink-200 transition checked:bg-prime-700 relative
                  before:absolute before:left-0.5 before:top-0.5 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition checked:before:translate-x-4"
              />
            </label>
            <label className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-paper-dim/60 p-3">
              <div>
                <div className="text-sm font-semibold">Hard discount</div>
                <div className="text-xs text-ink-500">Surface in the homepage feed</div>
              </div>
              <input
                type="checkbox"
                name="is_hard_discount"
                defaultChecked={product?.is_hard_discount ?? false}
                className="h-5 w-9 cursor-pointer appearance-none rounded-full bg-ink-200 transition checked:bg-prime-700 relative
                  before:absolute before:left-0.5 before:top-0.5 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition checked:before:translate-x-4"
              />
            </label>
          </Card>

          {product?.image_url && (
            <Card title="Preview">
              <img src={product.image_url} alt="" className="aspect-square w-full rounded-xl object-cover" />
            </Card>
          )}

          {mode === 'edit' && product && (
            <Card title="Danger">
              <button
                type="button"
                onClick={onDelete}
                disabled={isPending}
                className="w-full rounded-xl border border-flash-500/50 bg-flash-50 px-4 py-2 text-sm font-bold text-flash-700 transition hover:bg-flash-500 hover:text-white"
              >
                Delete product
              </button>
              <p className="mt-2 text-xs text-ink-500">
                Removes the catalog entry and its inventory row. Past orders are preserved.
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Sticky save bar */}
      <div className="sticky bottom-4 flex flex-col-reverse gap-2 rounded-2xl border border-ink-300/60 bg-paper px-4 py-3 shadow-lg shadow-ink-900/10 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-5">
        <Link href="/products" className="text-center text-sm font-semibold text-ink-700 underline sm:text-left">← Back to list</Link>
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-prime-700 px-5 py-3 text-sm font-bold text-paper transition hover:bg-prime-800 disabled:opacity-50 sm:w-auto sm:py-2.5"
        >
          {isPending ? 'Saving…' : mode === 'create' ? 'Create product' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}

const inputCls =
  'w-full rounded-lg border border-ink-300 bg-paper px-3 py-2 text-sm text-ink-900 placeholder:text-ink-500 focus:border-prime-500 focus:outline-none focus:ring-2 focus:ring-prime-200'

function Field({ label, required, hint, children, className = '' }: { label: string; required?: boolean; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      {label && (
        <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-500">
          {label} {required && <span className="text-flash-500">*</span>}
        </span>
      )}
      {children}
      {hint && <span className="mt-1 block text-[11px] text-ink-500">{hint}</span>}
    </label>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-ink-300/60 bg-paper p-5">
      <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-ink-500">{title}</h2>
      {children}
    </section>
  )
}

function PriceInput({ name, defaultValue }: { name: string; defaultValue: number }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-500">Rs</span>
      <input
        name={name}
        type="number"
        step="0.01"
        min={0}
        defaultValue={defaultValue}
        className={`${inputCls} pl-9 font-bold tabular-nums`}
      />
    </div>
  )
}
