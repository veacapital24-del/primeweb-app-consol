import { adminClient } from '@/lib/supabase'
import { PageHeader } from '@/components/PageHeader'
import { BrandForm } from '../BrandForm'
import type { Category } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function NewBrandPage() {
  const sb = adminClient()
  const { data: categories } = await sb
    .from('categories')
    .select('slug, name')
    .order('sort_order', { ascending: true })
    .returns<Pick<Category, 'slug' | 'name'>[]>()

  return (
    <div>
      <PageHeader
        title="New brand"
        breadcrumbs={[
          { label: 'Catalog' },
          { label: 'Brands', href: '/brands' },
          { label: 'New' },
        ]}
      />
      <BrandForm mode="create" categories={categories ?? []} />
    </div>
  )
}
