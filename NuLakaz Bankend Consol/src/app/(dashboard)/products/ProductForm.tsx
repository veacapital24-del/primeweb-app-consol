'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { createProduct, updateProduct, deleteProduct } from './actions'
import type { Brand, Category, Product } from '@/lib/types'
import { Field, GlassCard, PriceInput, Toggle, inputCls } from '@/components/products/ui'
import { ProductImagePreview } from '@/components/products/ProductImagePreview'

type Mode = 'create' | 'edit'

type Props = {
  mode: Mode
  product?: Product & {
    initial_stock?: number
    low_stock_threshold?: number
  }
  categories: Pick<Category, 'slug' | 'name'>[]
  brands: Pick<Brand, 'slug' | 'name'>[]
}

export function ProductForm({ mode, product, categories, brands }: Props) {
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
        if (e instanceof Error && e.message !== 'NEXT_REDIRECT') setError(e.message)
      }
    })
  }

  const onDelete = () => {
    if (!product) return
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return
    start(async () => {
      try {
        await deleteProduct(product.id)
      } catch (e) {
        if (e instanceof Error && e.message !== 'NEXT_REDIRECT') setError(e.message)
      }
    })
  }

  return (
    <form action={onSubmit} className="space-y-6">
      {error && (
        <div className="rounded-xl border border-flash-500/40 bg-flash-50 px-4 py-3 text-sm text-flash-700">
          {error}
        </div>
      )}
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <GlassCard title="Identity" desc="Name, SKU, and storefront URL slug.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Product name" required className="sm:col-span-2">
                <input
                  name="name"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (mode === 'create' && !slug) {
                      setSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/^-|-$/g, ''),
                      )
                    }
                  }}
                  className={inputCls}
                  placeholder="e.g. Basmati Rice 5kg"
                />
              </Field>
              <Field label="SKU" required>
                <input
                  name="sku"
                  required
                  defaultValue={product?.sku ?? ''}
                  className={`${inputCls} font-mono uppercase tracking-wide`}
                  placeholder="RICE-5KG"
                />
              </Field>
              <Field label="URL slug" required hint="Storefront path /product/{slug}">
                <input
                  name="slug"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className={`${inputCls} font-mono text-sm`}
                />
              </Field>
            </div>
            {slug && (
              <p className="mt-3 rounded-lg bg-prime-50 px-3 py-2 text-xs text-prime-800 ring-1 ring-prime-200/60">
                Preview: <span className="font-mono font-semibold">/product/{slug}</span>
              </p>
            )}
            <Field label="Description" className="mt-4">
              <textarea
                name="description"
                rows={4}
                defaultValue={product?.description ?? ''}
                className={`${inputCls} min-h-[100px] resize-y`}
                placeholder="Short description for the product page…"
              />
            </Field>
          </GlassCard>

          <GlassCard title="Pricing" desc="Retail is required. Wholesale is optional for B2B.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Retail price" required>
                <PriceInput name="retail_price_mur" defaultValue={product?.retail_price_mur ?? 0} />
              </Field>
              <div className="flex items-end">
                <label className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-ink-200/80 bg-canvas/50 px-4 py-3 transition hover:border-prime-300 hover:bg-prime-50/40">
                  <input
                    type="checkbox"
                    checked={hasWholesale}
                    onChange={(e) => setHasWholesale(e.target.checked)}
                    className="h-4 w-4 rounded border-ink-300 text-prime-700 focus:ring-prime-500"
                  />
                  <span className="text-sm font-semibold text-ink-800">Enable wholesale tier</span>
                </label>
              </div>
            </div>

            {hasWholesale ? (
              <div className="mt-4 grid gap-4 rounded-2xl border border-prime-200/80 bg-gradient-to-br from-prime-50 to-paper p-4 sm:grid-cols-2 ring-1 ring-prime-200/50">
                <Field label="Wholesale price">
                  <PriceInput name="wholesale_price_mur" defaultValue={product?.wholesale_price_mur ?? 0} />
                </Field>
                <Field label="Minimum quantity">
                  <input
                    name="wholesale_min_qty"
                    type="number"
                    min={1}
                    defaultValue={product?.wholesale_min_qty ?? 6}
                    className={inputCls}
                  />
                </Field>
              </div>
            ) : (
              <input type="hidden" name="wholesale_price_mur" value="" />
            )}
          </GlassCard>

          <GlassCard
            title="Categorisation"
            desc="Controls shelves, brand pages, and search tags on the storefront."
          >
            <div className="mb-4 flex flex-wrap gap-2 text-xs">
              <Link
                href="/categories"
                className="rounded-full bg-paper px-3 py-1 font-semibold text-prime-700 ring-1 ring-prime-200/80 hover:bg-prime-50"
              >
                Manage categories
              </Link>
              <Link
                href="/brands"
                className="rounded-full bg-paper px-3 py-1 font-semibold text-prime-700 ring-1 ring-prime-200/80 hover:bg-prime-50"
              >
                Manage brands
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Category">
                <select name="category_slug" defaultValue={product?.category_slug ?? ''} className={inputCls}>
                  <option value="">— None —</option>
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Brand">
                <select name="brand_slug" defaultValue={product?.brand_slug ?? ''} className={inputCls}>
                  <option value="">— Unbranded —</option>
                  {brands.map((b) => (
                    <option key={b.slug} value={b.slug}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Tags" hint="Comma-separated — used for search facets." className="mt-4">
              <input
                name="tags"
                defaultValue={(product?.tags ?? []).join(', ')}
                placeholder="organic, halal, bulk"
                className={inputCls}
              />
            </Field>
          </GlassCard>

          <GlassCard
            title={mode === 'create' ? 'Initial inventory' : 'Inventory'}
            desc={
              mode === 'create'
                ? 'Starting stock and low-stock alert threshold.'
                : 'Adjust when the “Only X left” badge appears on the storefront.'
            }
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {mode === 'create' && (
                <Field label="On hand">
                  <input
                    name="initial_stock"
                    type="number"
                    min={0}
                    defaultValue={0}
                    className={inputCls}
                  />
                </Field>
              )}
              <Field label="Low-stock threshold">
                <input
                  name="low_stock_threshold"
                  type="number"
                  min={0}
                  defaultValue={product?.low_stock_threshold ?? 5}
                  className={inputCls}
                />
              </Field>
            </div>
          </GlassCard>
        </div>

        <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
          <GlassCard title="Visibility">
            <div className="space-y-3">
              <Toggle name="active" label="Active" desc="Visible on the storefront" defaultChecked={product?.active ?? true} />
              <Toggle
                name="is_hard_discount"
                label="Hard discount"
                desc="Featured in the homepage feed"
                defaultChecked={product?.is_hard_discount ?? false}
              />
            </div>
          </GlassCard>

          <GlassCard title="Product image" desc="Paste a public image URL.">
            <ProductImagePreview initialUrl={product?.image_url} />
          </GlassCard>

          {mode === 'edit' && product && (
            <GlassCard title="Danger zone" desc="Permanent removal from the catalog.">
              <button
                type="button"
                onClick={onDelete}
                disabled={isPending}
                className="w-full rounded-xl border border-flash-500/50 bg-flash-50 px-4 py-2.5 text-sm font-bold text-flash-700 transition hover:bg-flash-500 hover:text-paper disabled:opacity-50"
              >
                Delete product
              </button>
              <p className="mt-2 text-[11px] leading-relaxed text-ink-500">
                Removes the catalog entry and inventory row. Past orders are kept.
              </p>
            </GlassCard>
          )}
        </aside>
      </div>

      <div className="sticky bottom-4 flex flex-col-reverse gap-2 rounded-2xl border border-ink-300/50 bg-paper/95 px-4 py-3 shadow-xl shadow-prime-900/10 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <Link
          href="/products"
          className="text-center text-sm font-semibold text-ink-700 underline sm:text-left"
        >
          ← Back to catalog
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-prime-700 px-5 py-2.5 text-sm font-bold text-paper shadow-md shadow-prime-900/15 transition hover:bg-prime-800 disabled:opacity-50 sm:w-auto"
        >
          {isPending ? 'Saving…' : mode === 'create' ? 'Create product' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}
