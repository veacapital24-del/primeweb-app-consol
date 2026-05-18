'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { adminClient } from '@/lib/supabase'

type ReelInput = {
  slug: string
  platform: 'instagram' | 'tiktok' | 'facebook'
  external_url: string | null
  thumbnail_url: string | null
  video_url: string | null
  caption: string | null
  posted_at: string | null
  active: boolean
  product_ids: string[]
}

function fromForm(form: FormData): ReelInput {
  const str = (k: string) => {
    const v = form.get(k)
    if (v == null || String(v).trim() === '') return null
    return String(v).trim()
  }
  const required = (k: string) => {
    const v = str(k)
    if (!v) throw new Error(`${k} is required`)
    return v
  }
  const platform = String(form.get('platform') ?? 'instagram') as ReelInput['platform']
  const productIdsRaw = String(form.get('product_ids_ordered') ?? '')

  return {
    slug: required('slug'),
    platform,
    external_url: str('external_url'),
    thumbnail_url: str('thumbnail_url'),
    video_url: str('video_url'),
    caption: str('caption'),
    posted_at: str('posted_at'),
    active: form.get('active') === 'on',
    product_ids: productIdsRaw.split(',').map((s) => s.trim()).filter(Boolean),
  }
}

async function syncProducts(reelId: string, productIds: string[]) {
  const sb = adminClient()
  await sb.from('reel_products').delete().eq('reel_id', reelId)
  if (productIds.length === 0) return
  const rows = productIds.map((id, i) => ({ reel_id: reelId, product_id: id, position: i }))
  await sb.from('reel_products').insert(rows)
}

export async function createReel(form: FormData) {
  const input = fromForm(form)
  const sb = adminClient()
  const { data, error } = await sb
    .from('reels')
    .insert({
      slug: input.slug,
      platform: input.platform,
      external_url: input.external_url,
      thumbnail_url: input.thumbnail_url,
      video_url: input.video_url,
      caption: input.caption,
      posted_at: input.posted_at,
      active: input.active,
    })
    .select('id')
    .single()
  if (error) throw new Error(error.message)
  await syncProducts(data.id, input.product_ids)
  revalidatePath('/reels')
  redirect(`/reels/${data.id}`)
}

export async function updateReel(id: string, form: FormData) {
  const input = fromForm(form)
  const sb = adminClient()
  const { error } = await sb
    .from('reels')
    .update({
      slug: input.slug,
      platform: input.platform,
      external_url: input.external_url,
      thumbnail_url: input.thumbnail_url,
      video_url: input.video_url,
      caption: input.caption,
      posted_at: input.posted_at,
      active: input.active,
    })
    .eq('id', id)
  if (error) throw new Error(error.message)
  await syncProducts(id, input.product_ids)
  revalidatePath('/reels')
  revalidatePath(`/reels/${id}`)
}

export async function deleteReel(id: string) {
  const sb = adminClient()
  const { error } = await sb.from('reels').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/reels')
  redirect('/reels')
}
