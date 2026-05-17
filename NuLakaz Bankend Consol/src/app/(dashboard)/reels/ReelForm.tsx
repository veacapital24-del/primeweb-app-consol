'use client'

import { useState, useTransition, useMemo } from 'react'
import { createReel, updateReel, deleteReel } from './actions'

import {
  AlertError,
  Field,
  FormStickyBar,
  GlassCard,
  Toggle,
  inputCls,
} from '@/components/admin/ui'

type Mode = 'create' | 'edit'

type Reel = {
  id: string
  slug: string
  platform: 'instagram' | 'tiktok' | 'facebook'
  external_url: string | null
  thumbnail_url: string | null
  caption: string | null
  posted_at: string | null
  active: boolean
}

type Product = {
  id: string
  sku: string
  name: string
  image_url: string | null
  retail_price_mur: number
}

type Props = {
  mode: Mode
  reel?: Reel
  initialProductIds?: string[]
  allProducts: Product[]
}

const STOREFRONT = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'http://localhost:3002'

export function ReelForm({ mode, reel, initialProductIds = [], allProducts }: Props) {
  const [isPending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [slug, setSlug] = useState(reel?.slug ?? '')
  const [caption, setCaption] = useState(reel?.caption ?? '')
  const [platform, setPlatform] = useState(reel?.platform ?? 'instagram')
  const [thumbnail, setThumbnail] = useState(reel?.thumbnail_url ?? '')
  const [selected, setSelected] = useState<string[]>(initialProductIds)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return allProducts
    const q = search.toLowerCase()
    return allProducts.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
  }, [allProducts, search])

  const selectedSet = new Set(selected)
  const selectedProducts = selected
    .map((id) => allProducts.find((p) => p.id === id))
    .filter(Boolean) as Product[]

  const toggle = (id: string) => {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  }
  const move = (idx: number, dir: -1 | 1) => {
    setSelected((s) => {
      const next = [...s]
      const j = idx + dir
      if (j < 0 || j >= next.length) return next
      ;[next[idx], next[j]] = [next[j], next[idx]]
      return next
    })
  }

  const onSubmit = (form: FormData) => {
    setError(null)
    form.set('product_ids_ordered', selected.join(','))
    start(async () => {
      try {
        if (mode === 'create') await createReel(form)
        else await updateReel(reel!.id, form)
      } catch (e: unknown) {
        if (e instanceof Error && e.message !== 'NEXT_REDIRECT') setError(e.message)
      }
    })
  }

  const onDelete = () => {
    if (!reel) return
    if (!confirm(`Delete reel "${reel.slug}"? This is irreversible.`)) return
    start(async () => {
      try { await deleteReel(reel.id) }
      catch (e) { if (e instanceof Error && e.message !== 'NEXT_REDIRECT') setError(e.message) }
    })
  }

  const bioLink = `${STOREFRONT}/reel/${slug || '[slug]'}`

  return (
    <form action={onSubmit} className="space-y-6">
      {error && <AlertError message={error} />}

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* ── Identity + Products ── */}
        <div className="space-y-6">
          <GlassCard title="Identity">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Slug" required hint={`Bio link: ${bioLink}`}>
                <input
                  name="slug"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-'))}
                  className={`${inputCls} font-mono`}
                />
              </Field>
              <Field label="Platform" required>
                <select
                  name="platform"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as Reel['platform'])}
                  className={inputCls}
                >
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="facebook">Facebook</option>
                </select>
              </Field>
            </div>
            <Field label="Caption" className="mt-4">
              <textarea
                name="caption"
                rows={3}
                value={caption}
                onChange={(e) => {
                  setCaption(e.target.value)
                  if (mode === 'create' && !slug) {
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40).replace(/^-|-$/g, ''))
                  }
                }}
                className={`${inputCls} resize-y`}
                placeholder="Short hook shown on the landing page header"
              />
            </Field>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="External URL" hint="Link to the original Instagram / TikTok / Facebook post">
                <input
                  name="external_url"
                  type="url"
                  defaultValue={reel?.external_url ?? ''}
                  placeholder="https://www.instagram.com/reel/…"
                  className={inputCls}
                />
              </Field>
              <Field label="Posted at">
                <input
                  name="posted_at"
                  type="datetime-local"
                  defaultValue={reel?.posted_at ? new Date(reel.posted_at).toISOString().slice(0, 16) : ''}
                  className={inputCls}
                />
              </Field>
            </div>
            <Field label="Thumbnail URL" hint="Vertical 9:16 image works best" className="mt-4">
              <input
                name="thumbnail_url"
                type="url"
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
                placeholder="https://…"
                className={inputCls}
              />
            </Field>
          </GlassCard>

          <GlassCard title={`Linked products${selected.length > 0 ? ` · ${selected.length}` : ''}`}>
            {selectedProducts.length > 0 ? (
              <ol className="mb-4 space-y-2">
                {selectedProducts.map((p, i) => (
                  <li key={p.id} className="flex items-center gap-2 rounded-xl border border-prime-200 bg-prime-50 p-2">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-prime-700 text-[11px] font-bold text-paper">{i + 1}</span>
                    {p.image_url && <img src={p.image_url} alt="" className="h-10 w-10 rounded-lg object-cover" />}
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">{p.name}</div>
                      <div className="font-mono text-[11px] text-ink-500">{p.sku}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="rounded-md border border-ink-300 bg-paper p-1 text-xs disabled:opacity-30 hover:bg-ink-100">↑</button>
                      <button type="button" onClick={() => move(i, 1)} disabled={i === selectedProducts.length - 1} className="rounded-md border border-ink-300 bg-paper p-1 text-xs disabled:opacity-30 hover:bg-ink-100">↓</button>
                      <button type="button" onClick={() => toggle(p.id)} className="rounded-md border border-flash-500/40 bg-flash-50 px-2 py-1 text-xs font-bold text-flash-700 hover:bg-flash-500 hover:text-white">remove</button>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mb-4 rounded-xl border border-dashed border-ink-300 p-4 text-center text-xs text-ink-500">
                No products linked yet. Pick at least one — they appear on the reel landing in this order.
              </p>
            )}

            <div className="rounded-xl border border-ink-300/60 bg-paper-dim/40 p-3">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search catalog…"
                className="w-full rounded-lg border border-ink-300 bg-paper px-3 py-1.5 text-xs focus:border-prime-500 focus:outline-none"
              />
              <ul className="mt-2 max-h-64 space-y-1 overflow-y-auto pr-1">
                {filtered.map((p) => {
                  const isOn = selectedSet.has(p.id)
                  return (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => toggle(p.id)}
                        className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition ${
                          isOn ? 'bg-prime-700 text-paper' : 'hover:bg-paper'
                        }`}
                      >
                        <span className={`grid h-4 w-4 place-items-center rounded border ${isOn ? 'border-paper bg-paper text-prime-700' : 'border-ink-300'}`}>
                          {isOn && '✓'}
                        </span>
                        {p.image_url && <img src={p.image_url} alt="" className="h-7 w-7 rounded object-cover" />}
                        <span className="flex-1 truncate font-semibold">{p.name}</span>
                        <span className={isOn ? 'text-paper/70' : 'text-ink-500'}>Rs {Number(p.retail_price_mur).toFixed(0)}</span>
                      </button>
                    </li>
                  )
                })}
                {filtered.length === 0 && (
                  <li className="py-3 text-center text-xs text-ink-500">No matches.</li>
                )}
              </ul>
            </div>
          </GlassCard>
        </div>

        {/* ── Status + preview ── */}
        <div className="space-y-6">
          <GlassCard title="Status">
            <label className="flex items-center justify-between gap-3 rounded-xl bg-paper-dim/60 p-3">
              <div>
                <div className="text-sm font-semibold">Active</div>
                <div className="text-xs text-ink-500">Makes the reel page reachable</div>
              </div>
              <input
                type="checkbox"
                name="active"
                defaultChecked={reel?.active ?? true}
                className="h-5 w-9 cursor-pointer appearance-none rounded-full bg-ink-200 transition checked:bg-prime-700 relative
                  before:absolute before:left-0.5 before:top-0.5 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition checked:before:translate-x-4"
              />
            </label>
          </GlassCard>

          <GlassCard title="Bio link">
            <div className="rounded-xl bg-paper-dim/60 p-3 font-mono text-[11px] break-all text-ink-700">{bioLink}</div>
            {mode === 'edit' && (
              <a href={bioLink} target="_blank" rel="noreferrer" className="mt-3 inline-block text-xs font-semibold text-prime-700 underline">
                Open landing page →
              </a>
            )}
          </GlassCard>

          <GlassCard title="Thumbnail preview">
            <div className="aspect-[9/16] overflow-hidden rounded-xl bg-paper-dim ring-1 ring-ink-300/60">
              {thumbnail ? (
                <img src={thumbnail} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full place-items-center text-xs text-ink-500">Paste a thumbnail URL above</div>
              )}
            </div>
          </GlassCard>

          {mode === 'edit' && reel && (
            <GlassCard title="Danger">
              <button
                type="button"
                onClick={onDelete}
                disabled={isPending}
                className="w-full rounded-xl border border-flash-500/50 bg-flash-50 px-4 py-2 text-sm font-bold text-flash-700 transition hover:bg-flash-500 hover:text-white"
              >
                Delete reel
              </button>
              <p className="mt-2 text-xs text-ink-500">
                Removes the landing page and its product mapping. Past orders & analytics are preserved.
              </p>
            </GlassCard>
          )}
        </div>
      </div>

      {/* Sticky save */}
      <FormStickyBar
        backHref="/reels"
        backLabel="← Back to reels"
        submitLabel={mode === 'create' ? 'Create reel' : 'Save changes'}
        isPending={isPending}
      /></form>
  )
}

