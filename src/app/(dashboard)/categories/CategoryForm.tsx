'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { createCategory, updateCategory, deleteCategory } from './actions'
import type { Category } from '@/lib/types'

type Mode = 'create' | 'edit'

type Props = {
  mode: Mode
  category?: Category
  // All other categories — used for the "Parent" dropdown. The current
  // category is filtered out by the page so the form can show every option.
  parents: Pick<Category, 'slug' | 'name' | 'parent_slug'>[]
}

export function CategoryForm({ mode, category, parents }: Props) {
  const [isPending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState(category?.name ?? '')
  const [slug, setSlug] = useState(category?.slug ?? '')

  const onSubmit = (form: FormData) => {
    setError(null)
    start(async () => {
      try {
        if (mode === 'create') await createCategory(form)
        else await updateCategory(category!.slug, form)
      } catch (e: unknown) {
        if (e instanceof Error && e.message !== 'NEXT_REDIRECT') setError(e.message)
      }
    })
  }

  const onDelete = () => {
    if (!category) return
    if (
      !confirm(
        `Delete category "${category.name}"? Products linked to it will be uncategorised, and child categories will be unparented.`,
      )
    )
      return
    start(async () => {
      try {
        await deleteCategory(category.slug)
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
                    if (mode === 'create' && !category) {
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
                hint={
                  mode === 'edit'
                    ? 'Locked once created.'
                    : 'Used in /category/{slug} on the storefront.'
                }
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
          </Card>

          <Card title="Hierarchy">
            <Field
              label="Parent category"
              hint="Leave empty for a top-level shelf. Only top-level categories appear in the storefront's category rail."
            >
              <select
                name="parent_slug"
                defaultValue={category?.parent_slug ?? ''}
                className={inputCls}
              >
                <option value="">— None (top-level) —</option>
                {parents.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.parent_slug ? `${p.parent_slug} / ${p.name}` : p.name}
                  </option>
                ))}
              </select>
            </Field>
          </Card>

          <Card title="Presentation">
            <Field label="Image URL" hint="Optional cover used on category landing pages.">
              <input
                name="image_url"
                type="url"
                defaultValue={category?.image_url ?? ''}
                placeholder="https://…"
                className={inputCls}
              />
            </Field>
            <Field label="Description" className="mt-4" hint="Short paragraph shown above the product grid.">
              <textarea
                name="description"
                rows={3}
                defaultValue={category?.description ?? ''}
                className={`${inputCls} resize-y`}
              />
            </Field>
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
                defaultChecked={category?.active ?? true}
                className="h-5 w-9 cursor-pointer appearance-none rounded-full bg-ink-200 transition checked:bg-prime-700 relative
                  before:absolute before:left-0.5 before:top-0.5 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition checked:before:translate-x-4"
              />
            </label>
            <Field label="Sort order" className="mt-4" hint="Lower numbers come first.">
              <input
                name="sort_order"
                type="number"
                defaultValue={category?.sort_order ?? 100}
                className={inputCls}
              />
            </Field>
          </Card>

          {category?.image_url && (
            <Card title="Preview">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={category.image_url}
                alt=""
                className="aspect-[3/2] w-full rounded-xl object-cover ring-1 ring-ink-300/60"
              />
            </Card>
          )}

          {mode === 'edit' && category && (
            <Card title="Danger">
              <button
                type="button"
                onClick={onDelete}
                disabled={isPending}
                className="w-full rounded-xl border border-flash-500/50 bg-flash-50 px-4 py-2 text-sm font-bold text-flash-700 transition hover:bg-flash-500 hover:text-white"
              >
                Delete category
              </button>
              <p className="mt-2 text-xs text-ink-500">
                Removes the category. Products that reference it will be
                uncategorised, child categories will be unparented.
              </p>
            </Card>
          )}
        </div>
      </div>

      <div className="sticky bottom-4 flex flex-col-reverse gap-2 rounded-2xl border border-ink-300/60 bg-paper px-4 py-3 shadow-lg shadow-ink-900/10 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-5">
        <Link
          href="/categories"
          className="text-center text-sm font-semibold text-ink-700 underline sm:text-left"
        >
          ← Back to categories
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-prime-700 px-5 py-3 text-sm font-bold text-paper transition hover:bg-prime-800 disabled:opacity-50 sm:w-auto sm:py-2.5"
        >
          {isPending ? 'Saving…' : mode === 'create' ? 'Create category' : 'Save changes'}
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
