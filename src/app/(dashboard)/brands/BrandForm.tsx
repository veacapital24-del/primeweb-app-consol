'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { createBrand, updateBrand, deleteBrand } from './actions'
import { BRAND_TINTS, type Brand, type Category } from '@/lib/types'

type Mode = 'create' | 'edit'

type Props = {
  mode: Mode
  brand?: Brand
  categories: Pick<Category, 'slug' | 'name'>[]
}

// Tint preview swatches — same hex values used by the storefront
// (BRAND_TINTS in nulakaz-web/src/lib/brands.ts), so the picker shows what
// the brand card will actually look like.
const TINT_PREVIEW: Record<string, { bg: string; fg: string }> = {
  sage: { bg: '#dde7c5', fg: '#5e7f54' },
  ocean: { bg: '#cfdfeb', fg: '#3a6f93' },
  mustard: { bg: '#f5e7c4', fg: '#a98937' },
  'dusty-pink': { bg: '#e7d3da', fg: '#82445a' },
  terracotta: { bg: '#f1d9d4', fg: '#a85a44' },
  stone: { bg: '#e6dfd6', fg: '#6b6258' },
}

export function BrandForm({ mode, brand, categories }: Props) {
  const [isPending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState(brand?.name ?? '')
  const [slug, setSlug] = useState(brand?.slug ?? '')
  const [tint, setTint] = useState(brand?.tint ?? 'sage')

  const onSubmit = (form: FormData) => {
    setError(null)
    start(async () => {
      try {
        if (mode === 'create') await createBrand(form)
        else await updateBrand(brand!.slug, form)
      } catch (e: unknown) {
        if (e instanceof Error && e.message !== 'NEXT_REDIRECT') setError(e.message)
      }
    })
  }

  const onDelete = () => {
    if (!brand) return
    if (
      !confirm(
        `Delete brand "${brand.name}"? Products currently linked to it will be unbranded — this can't be undone.`,
      )
    )
      return
    start(async () => {
      try {
        await deleteBrand(brand.slug)
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

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card title="Identity">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" required>
                <input
                  name="name"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (mode === 'create' && !brand) {
                      setSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/^-|-$/g, ''),
                      )
                    }
                  }}
                  className={inputCls}
                />
              </Field>
              <Field
                label="Slug"
                required
                hint={mode === 'edit' ? 'Locked once created.' : 'Used in /brands#{slug}.'}
              >
                <input
                  name="slug"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  readOnly={mode === 'edit'}
                  className={`${inputCls} font-mono ${mode === 'edit' ? 'bg-paper-dim/60 text-ink-500' : ''}`}
                />
              </Field>
            </div>
            <Field label="Logo URL" className="mt-4" hint="Square or wide PNG/WebP. Stored URL only — host the file separately.">
              <input
                name="logo_url"
                type="url"
                defaultValue={brand?.logo_url ?? ''}
                placeholder="https://…"
                className={inputCls}
              />
            </Field>
          </Card>

          <Card title="Storyline">
            <Field label="Origin" hint="One line — country / region / character. Shown above the tagline.">
              <input
                name="origin"
                defaultValue={brand?.origin ?? ''}
                placeholder="Mauritius · Family farms"
                className={inputCls}
              />
            </Field>
            <Field label="Tagline" className="mt-4" hint="Short italic accent on the brand card.">
              <input
                name="tagline"
                defaultValue={brand?.tagline ?? ''}
                placeholder="Family-grown, certified organic."
                className={inputCls}
              />
            </Field>
            <Field label="Body" className="mt-4" hint="Long-form paragraph for the dedicated brand page.">
              <textarea
                name="body"
                rows={4}
                defaultValue={brand?.body ?? ''}
                className={`${inputCls} resize-y`}
              />
            </Field>
          </Card>

          <Card title="Storefront link">
            <p className="-mt-2 mb-4 text-[11px] text-ink-500">
              Optional shortcut — if set, the storefront brand card will link
              to this category and use the label below as the chip text.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Linked category">
                <select
                  name="category_slug"
                  defaultValue={brand?.category_slug ?? ''}
                  className={inputCls}
                >
                  <option value="">— None —</option>
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Category label" hint="Display name. Defaults to the category's own name if blank.">
                <input
                  name="category_label"
                  defaultValue={brand?.category_label ?? ''}
                  placeholder="e.g. Fresh Produce"
                  className={inputCls}
                />
              </Field>
            </div>
          </Card>
        </div>

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
                defaultChecked={brand?.active ?? true}
                className="h-5 w-9 cursor-pointer appearance-none rounded-full bg-ink-200 transition checked:bg-prime-700 relative
                  before:absolute before:left-0.5 before:top-0.5 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition checked:before:translate-x-4"
              />
            </label>
            <Field label="Sort order" className="mt-4" hint="Lower numbers come first.">
              <input
                name="sort_order"
                type="number"
                defaultValue={brand?.sort_order ?? 100}
                className={inputCls}
              />
            </Field>
          </Card>

          <Card title="Brand tint">
            <p className="-mt-2 mb-4 text-[11px] text-ink-500">
              Editorial accent colour used across the storefront — chip
              backgrounds, accent rules, and the brand card stripe.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {BRAND_TINTS.map((t) => {
                const preview = TINT_PREVIEW[t]
                const isActive = tint === t
                return (
                  <label
                    key={t}
                    className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border p-2 text-[11px] font-semibold capitalize transition ${
                      isActive ? 'border-prime-700 bg-prime-50' : 'border-ink-300/60 hover:border-prime-500/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="tint"
                      value={t}
                      checked={isActive}
                      onChange={() => setTint(t)}
                      className="sr-only"
                    />
                    <span
                      aria-hidden
                      className="block h-7 w-7 rounded-full ring-2"
                      style={{
                        backgroundColor: preview.bg,
                        // ringColor not directly settable inline; fake with box-shadow
                        boxShadow: `inset 0 0 0 2px ${preview.fg}`,
                      }}
                    />
                    {t.replace('-', ' ')}
                  </label>
                )
              })}
            </div>
          </Card>

          {brand?.logo_url && (
            <Card title="Preview">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={brand.logo_url}
                alt=""
                className="h-16 w-full rounded-xl bg-white object-contain ring-1 ring-ink-300/60"
              />
            </Card>
          )}

          {mode === 'edit' && brand && (
            <Card title="Danger">
              <button
                type="button"
                onClick={onDelete}
                disabled={isPending}
                className="w-full rounded-xl border border-flash-500/50 bg-flash-50 px-4 py-2 text-sm font-bold text-flash-700 transition hover:bg-flash-500 hover:text-white"
              >
                Delete brand
              </button>
              <p className="mt-2 text-xs text-ink-500">
                Removes the brand row and unlinks it from any product still
                referencing it. The products themselves are kept.
              </p>
            </Card>
          )}
        </div>
      </div>

      <div className="sticky bottom-4 flex flex-col-reverse gap-2 rounded-2xl border border-ink-300/60 bg-paper px-4 py-3 shadow-lg shadow-ink-900/10 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-5">
        <Link
          href="/brands"
          className="text-center text-sm font-semibold text-ink-700 underline sm:text-left"
        >
          ← Back to brands
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-prime-700 px-5 py-3 text-sm font-bold text-paper transition hover:bg-prime-800 disabled:opacity-50 sm:w-auto sm:py-2.5"
        >
          {isPending ? 'Saving…' : mode === 'create' ? 'Create brand' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}

const inputCls =
  'w-full rounded-lg border border-ink-300 bg-paper px-3 py-2 text-sm text-ink-900 placeholder:text-ink-500 focus:border-prime-500 focus:outline-none focus:ring-2 focus:ring-prime-200'

function Field({
  label,
  required,
  hint,
  children,
  className = '',
}: {
  label: string
  required?: boolean
  hint?: string
  children: React.ReactNode
  className?: string
}) {
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
      <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-ink-500">
        {title}
      </h2>
      {children}
    </section>
  )
}
