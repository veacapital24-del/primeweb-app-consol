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
  initial_stock?: number
}

function fromForm(form: FormData): ProductInput {
  const num = (k: string) => Number(form.get(k) || 0)
  const str = (k: string) => String(form.get(k) ?? '').trim()
  const bool = (k: string) => form.get(k) === 'on'
  const wholesale = form.get('wholesale_price_mur')
  return {
    sku: str('sku'),
    slug: str('slug'),
    name: str('name'),
    description: str('description'),
    image_url: str('image_url'),
    retail_price_mur: num('retail_price_mur'),
    wholesale_price_mur: wholesale === null || wholesale === '' ? null : Number(wholesale),
    wholesale_min_qty: num('wholesale_min_qty') || 1,
    is_hard_discount: bool('is_hard_discount'),
    active: bool('active'),
    initial_stock: num('initial_stock') || 0,
  }
}

export async function createProduct(form: FormData) {
  const input = fromForm(form)
  if (!input.sku || !input.slug || !input.name) throw new Error('SKU, slug, and name are required')

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
    })
    .select('id, slug')
    .single()
  if (error) throw new Error(error.message)

  await sb.from('inventory').upsert({
    product_id: data.id,
    on_hand: Math.max(0, input.initial_stock ?? 0),
    reserved: 0,
  })

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
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/products')
  revalidatePath(`/products/${id}`)
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
