'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { adminClient } from '@/lib/supabase'

type ProductInput = {
  sku: string
  slug: string
  name: string
  description: string
  image_url: string
  retail_price_mur: number
  wholesale_price_mur: number | null
  wholesale_min_qty: number
  is_hard_discount: boolean
  active: boolean
  // Storefront-facing classification:
  category_slug: string | null
  brand_slug: string | null
  tags: string[]
  // Inventory:
  initial_stock?: number
  low_stock_threshold: number
}

function fromForm(form: FormData): ProductInput {
  const num = (k: string) => Number(form.get(k) || 0)
  const str = (k: string) => String(form.get(k) ?? '').trim()
  const bool = (k: string) => form.get(k) === 'on'
  const wholesale = form.get('wholesale_price_mur')

  // Tags arrive as a comma-separated string; normalise to lowercase-trimmed
  // unique entries so the Postgres text[] stays clean.
  const rawTags = str('tags')
  const tags = rawTags
    ? Array.from(
        new Set(
          rawTags
            .split(',')
            .map((t) => t.trim().toLowerCase())
            .filter(Boolean),
        ),
      )
    : []

  return {
    sku: str('sku'),
    slug: str('slug'),
    name: str('name'),
    description: str('description'),
    image_url: str('image_url'),
    retail_price_mur: num('retail_price_mur'),
    wholesale_price_mur:
      wholesale === null || wholesale === '' ? null : Number(wholesale),
    wholesale_min_qty: num('wholesale_min_qty') || 1,
    is_hard_discount: bool('is_hard_discount'),
    active: bool('active'),
    category_slug: str('category_slug') || null,
    brand_slug: str('brand_slug') || null,
    tags,
    initial_stock: num('initial_stock') || 0,
    low_stock_threshold: num('low_stock_threshold') || 5,
  }
}

export async function createProduct(form: FormData) {
  const input = fromForm(form)
  if (!input.sku || !input.slug || !input.name)
    throw new Error('SKU, slug, and name are required')

  const sb = adminClient()
  const { data, error } = await sb
    .from('products')
    .insert({
      sku: input.sku,
      slug: input.slug,
      name: input.name,
      description: input.description || null,
      image_url: input.image_url || null,
      retail_price_mur: input.retail_price_mur,
      wholesale_price_mur: input.wholesale_price_mur,
      wholesale_min_qty: input.wholesale_min_qty,
      is_hard_discount: input.is_hard_discount,
      active: input.active,
      category_slug: input.category_slug,
      brand_slug: input.brand_slug,
      tags: input.tags.length > 0 ? input.tags : null,
    })
    .select('id, slug')
    .single()
  if (error) throw new Error(error.message)

  const onHand = Math.max(0, input.initial_stock ?? 0)
  const threshold = Math.max(0, input.low_stock_threshold)

  await sb.from('inventory').upsert({
    product_id: data.id,
    on_hand: onHand,
    reserved: 0,
    low_stock_threshold: threshold,
  })

  // Mirror initial stock into the per-location table the POS reads from.
  // Without this, new products show on-hand "—" in the POS stock page even
  // though the storefront sees the inventory row.
  const { data: activeLocs } = await sb
    .from('locations')
    .select('id')
    .eq('active', true)
  if (activeLocs && activeLocs.length > 0) {
    await sb.from('location_stock').upsert(
      activeLocs.map((l) => ({
        product_id: data.id,
        location_id: l.id,
        on_hand: onHand,
        low_stock_threshold: threshold,
      })),
      { onConflict: 'product_id,location_id' },
    )
  }

  revalidatePath('/products')
  revalidatePath('/inventory')
  revalidatePath('/')
  redirect(`/products/${data.id}`)
}

export async function updateProduct(id: string, form: FormData) {
  const input = fromForm(form)
  const sb = adminClient()
  const { error } = await sb
    .from('products')
    .update({
      sku: input.sku,
      slug: input.slug,
      name: input.name,
      description: input.description || null,
      image_url: input.image_url || null,
      retail_price_mur: input.retail_price_mur,
      wholesale_price_mur: input.wholesale_price_mur,
      wholesale_min_qty: input.wholesale_min_qty,
      is_hard_discount: input.is_hard_discount,
      active: input.active,
      category_slug: input.category_slug,
      brand_slug: input.brand_slug,
      tags: input.tags.length > 0 ? input.tags : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
  if (error) throw new Error(error.message)

  // Keep the inventory row's threshold in sync — upsert so a missing row
  // still gets created with sensible defaults.
  const threshold = Math.max(0, input.low_stock_threshold)
  const { error: invErr } = await sb.from('inventory').upsert(
    { product_id: id, low_stock_threshold: threshold },
    { onConflict: 'product_id', ignoreDuplicates: false },
  )
  if (invErr) throw new Error(invErr.message)

  // Mirror the threshold into every active location's row so the POS stays
  // consistent. Stock counts are managed per-location in the POS, so we only
  // sync the threshold here, not on_hand.
  const { data: activeLocs } = await sb
    .from('locations')
    .select('id')
    .eq('active', true)
  if (activeLocs && activeLocs.length > 0) {
    await sb.from('location_stock').upsert(
      activeLocs.map((l) => ({
        product_id: id,
        location_id: l.id,
        low_stock_threshold: threshold,
      })),
      { onConflict: 'product_id,location_id' },
    )
  }

  revalidatePath('/products')
  revalidatePath(`/products/${id}`)
  revalidatePath('/inventory')
  revalidatePath('/')
}

export async function toggleActive(id: string, active: boolean) {
  const sb = adminClient()
  const { error } = await sb.from('products').update({ active }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/products')
}

export async function deleteProduct(id: string) {
  const sb = adminClient()
  const { error } = await sb.from('products').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/products')
  redirect('/products')
}
