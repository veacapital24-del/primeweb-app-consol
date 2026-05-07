import { adminClient } from '@/lib/supabase'
import { PageHeader } from '@/components/PageHeader'
import { ReelForm } from '../ReelForm'

export const dynamic = 'force-dynamic'

export default async function NewReelPage() {
  const sb = adminClient()
  const { data: products } = await sb
    .from('products')
    .select('id, sku, name, image_url, retail_price_mur')
    .eq('active', true)
    .order('name')
  return (
    <div>
      <PageHeader
        title="New reel"
        breadcrumbs={[{ label: 'Catalog' }, { label: 'Reels', href: '/reels' }, { label: 'New' }]}
      />
      <ReelForm mode="create" allProducts={products ?? []} />
    </div>
  )
}
