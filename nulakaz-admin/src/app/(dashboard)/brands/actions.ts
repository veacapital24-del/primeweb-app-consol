'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { adminClient } from '@/lib/supabase'
import { BRAND_TINTS, type BrandTint } from '@/lib/types'

type BrandInput = {
  slug: string
  name: string
  logo_url: string | null
  origin: string | null
  tagline: string | null
  body: string | null
  category_slug: string | null
  category_label: string | null
  tint: BrandTint
  sort_order: number
  active: boolean
}

function fromForm(form: FormData): BrandInput {
  const str = (k: string) => String(form.get(k) ?? '').trim()
  const num = (k: string) => Number(form.get(k) || 0)
  const bool = (k: string) => form.get(k) === 'on'
  const tintRaw = str('tint')
  const tint = (BRAND_TINTS as readonly string[]).includes(tintRaw)
    ? (tintRaw as BrandTint)
    : 'sage'
  return {
    slug: str('slug').toLowerCase().replace(/[^a-z0-9-]+/g, '-'),
    name: str('name'),
    logo_url: str('logo_url') || null,
    origin: str('origin') || null,
    tagline: str('tagline') || null,
    body: str('body') || null,
    category_slug: str('category_slug') || null,
    category_label: str('category_label') || null,
    tint,
    sort_order: num('sort_order'),
    active: bool('active'),
  }
}

export async function createBrand(form: FormData) {
  const input = fromForm(form)
  if (!input.slug || !input.name) throw new Error('Slug and name are required')

  const sb = adminClient()
  const { error } = await sb.from('brands').insert(input)
  if (error) throw new Error(error.message)

  revalidatePath('/brands')
  revalidatePath('/products')
  redirect(`/brands/${input.slug}`)
}

export async function updateBrand(slug: string, form: FormData) {
  const input = fromForm(form)
  const sb = adminClient()
  // The slug is the primary key — if the user renames it we need to issue
  // a new row + update referencing products. Keep it simple: forbid slug
  // changes from the edit form.
  if (input.slug !== slug) {
    throw new Error('Slug cannot be changed once a brand is created.')
  }
  const { error } = await sb.from('brands').update(input).eq('slug', slug)
  if (error) throw new Error(error.message)

  revalidatePath('/brands')
  revalidatePath(`/brands/${slug}`)
  revalidatePath('/products')
}

export async function deleteBrand(slug: string) {
  const sb = adminClient()
  // Detach the brand from any product still referencing it. category_slug
  // already cascades via ON DELETE SET NULL but brand_slug is a plain text
  // column without a FK, so we clean it up explicitly.
  const { error: detachErr } = await sb
    .from('products')
    .update({ brand_slug: null })
    .eq('brand_slug', slug)
  if (detachErr) throw new Error(detachErr.message)

  const { error } = await sb.from('brands').delete().eq('slug', slug)
  if (error) throw new Error(error.message)

  revalidatePath('/brands')
  revalidatePath('/products')
  redirect('/brands')
}
