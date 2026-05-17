'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { adminClient } from '@/lib/supabase'

type CategoryInput = {
  slug: string
  name: string
  parent_slug: string | null
  sort_order: number
  active: boolean
  image_url: string | null
  description: string | null
}

function fromForm(form: FormData): CategoryInput {
  const str = (k: string) => String(form.get(k) ?? '').trim()
  const num = (k: string) => Number(form.get(k) || 0)
  const bool = (k: string) => form.get(k) === 'on'
  return {
    slug: str('slug').toLowerCase().replace(/[^a-z0-9-]+/g, '-'),
    name: str('name'),
    parent_slug: str('parent_slug') || null,
    sort_order: num('sort_order'),
    active: bool('active'),
    image_url: str('image_url') || null,
    description: str('description') || null,
  }
}

export async function createCategory(form: FormData) {
  const input = fromForm(form)
  if (!input.slug || !input.name) throw new Error('Slug and name are required')

  const sb = adminClient()
  const { error } = await sb.from('categories').insert(input)
  if (error) throw new Error(error.message)

  revalidatePath('/categories')
  revalidatePath('/products')
  revalidatePath('/brands')
  redirect(`/categories/${input.slug}`)
}

export async function updateCategory(slug: string, form: FormData) {
  const input = fromForm(form)
  if (input.slug !== slug) {
    throw new Error('Slug cannot be changed once a category is created.')
  }
  // Refuse self-parenting.
  if (input.parent_slug === slug) {
    throw new Error('A category cannot be its own parent.')
  }

  const sb = adminClient()
  const { error } = await sb.from('categories').update(input).eq('slug', slug)
  if (error) throw new Error(error.message)

  revalidatePath('/categories')
  revalidatePath(`/categories/${slug}`)
  revalidatePath('/products')
  revalidatePath('/brands')
}

export async function deleteCategory(slug: string) {
  const sb = adminClient()
  // Detach the category from any product still referencing it. The FK on
  // categories.parent_slug already cascades via SET NULL, so child
  // categories will simply unparent.
  const { error: detachErr } = await sb
    .from('products')
    .update({ category_slug: null })
    .eq('category_slug', slug)
  if (detachErr) throw new Error(detachErr.message)

  const { error } = await sb.from('categories').delete().eq('slug', slug)
  if (error) throw new Error(error.message)

  revalidatePath('/categories')
  revalidatePath('/products')
  revalidatePath('/brands')
  redirect('/categories')
}
