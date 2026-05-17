import { adminClient } from '@/lib/supabase'
import { PageHeader } from '@/components/PageHeader'
import { CategoryForm } from '../CategoryForm'
import type { Category } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function NewCategoryPage() {
  const sb = adminClient()
  const { data: parents } = await sb
    .from('categories')
    .select('slug, name, parent_slug')
    .order('sort_order', { ascending: true })
    .returns<Pick<Category, 'slug' | 'name' | 'parent_slug'>[]>()

  return (
    <div>
      <PageHeader
        title="New category"
        breadcrumbs={[
          { label: 'Catalog' },
          { label: 'Categories', href: '/categories' },
          { label: 'New' },
        ]}
      />
      <CategoryForm mode="create" parents={parents ?? []} />
    </div>
  )
}
