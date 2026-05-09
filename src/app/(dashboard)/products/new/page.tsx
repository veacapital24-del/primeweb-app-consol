import { adminClient } from '@/lib/supabase'
import { PageHeader } from '@/components/PageHeader'
import { ProductForm } from '../ProductForm'
import type { Brand, Category } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function NewProductPage() {
  const sb = adminClient()
  const [{ data: categories }, { data: brands }] = await Promise.all([
    sb
      .from('categories')
      .select('slug, name')
      .eq('active', true)
      .order('sort_order', { ascending: true })
      .returns<Pick<Category, 'slug' | 'name'>[]>(),
    sb
      .from('brands')
      .select('slug, name')
      .eq('active', true)
      .order('sort_order', { ascending: true })
      .returns<Pick<Brand, 'slug' | 'name'>[]>(),
  ])

  return (
    <div>
      <PageHeader
        title="New product"
        breadcrumbs={[
          { label: 'Catalog' },
          { label: 'Products', href: '/products' },
          { label: 'New' },
        ]}
      />
      <ProductForm
        mode="create"
        categories={categories ?? []}
        brands={brands ?? []}
      />
    </div>
  )
}
