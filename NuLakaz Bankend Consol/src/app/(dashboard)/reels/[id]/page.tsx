import { notFound } from 'next/navigation'
import { adminClient } from '@/lib/supabase'
import { PageHeader } from '@/components/PageHeader'
import { ReelForm } from '../ReelForm'

export const dynamic = 'force-dynamic'

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

type PageProps = { params: Promise<{ id: string }> }

export default async function EditReelPage({ params }: PageProps) {
  const { id } = await params
  const sb = adminClient()

  const { data: reel } = await sb
    .from('reels')
    .select('id, slug, platform, external_url, thumbnail_url, caption, posted_at, active')
    .eq('id', id)
    .maybeSingle<Reel>()
  if (!reel) notFound()

  const [products, links] = await Promise.all([
    sb.from('products').select('id, sku, name, image_url, retail_price_mur').eq('active', true).order('name'),
    sb.from('reel_products').select('product_id, position').eq('reel_id', id).order('position'),
  ])

  const ids = (links.data ?? []).map((r) => r.product_id)

  return (
    <div>
      <PageHeader
        title={reel.caption ?? reel.slug}
        subtitle={`/reel/${reel.slug}`}
        breadcrumbs={[{ label: 'Catalog' }, { label: 'Reels', href: '/reels' }, { label: reel.slug }]}
      />
      <ReelForm
        mode="edit"
        reel={reel}
        initialProductIds={ids}
        allProducts={products.data ?? []}
      />
    </div>
  )
}
