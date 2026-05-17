'use client'

import { useState, useTransition } from 'react'
import { createBrand, updateBrand, deleteBrand } from './actions'
import { BRAND_TINTS, type Brand, type Category } from '@/lib/types'
import {
  AlertError,
  Field,
  FormStickyBar,
  GlassCard,
  Toggle,
  inputCls,
} from '@/components/admin/ui'

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
      {error && <AlertError message={error} />}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <GlassCard title="Identity" desc="Name, slug, and logo shown on the storefront brand showcase.">
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
          </GlassCard>

          <GlassCard title="Storyline" desc="Copy for brand cards and the dedicated brand page.">
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
          </GlassCard>

          <GlassCard
            title="Storefront link"
            desc="Optional shortcut — if set, the brand card links to this category with the label below as chip text."
          >
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
          </GlassCard>
        </div>

        <div className="space-y-6">
          <GlassCard title="Status">
            <Toggle name="active" label="Active" desc="Show on storefront" defaultChecked={brand?.active ?? true} />
            <Field label="Sort order" className="mt-4" hint="Lower numbers come first.">
              <input
                name="sort_order"
                type="number"
                defaultValue={brand?.sort_order ?? 100}
                className={inputCls}
              />
            </Field>
          </GlassCard>

          <GlassCard
            title="Brand tint"
            desc="Editorial accent colour — chip backgrounds, accent rules, and the brand card stripe."
          >
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
          </GlassCard>

          {brand?.logo_url && (
            <GlassCard title="Preview">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={brand.logo_url}
                alt=""
                className="h-16 w-full rounded-xl bg-white object-contain ring-1 ring-ink-300/60"
              />
            </GlassCard>
          )}

          {mode === 'edit' && brand && (
            <GlassCard title="Danger zone" desc="Permanent — products keep their data but lose this brand link.">
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
            </GlassCard>
          )}
        </div>
      </div>

      <FormStickyBar
        backHref="/brands"
        backLabel="← Back to brands"
        submitLabel={mode === 'create' ? 'Create brand' : 'Save changes'}
        isPending={isPending}
      />
    </form>
  )
}
