import { notFound } from 'next/navigation'
import { adminClient } from '@/lib/supabase'
import { PageHeader } from '@/components/PageHeader'
import { BrandForm } from '../BrandForm'
import type { Brand, Category } from '@/lib/types'

export const dynamic = 'force-dynamic'

type PageProps = { params: Promise<{ slug: string }> }

export default async function EditBrandPage({ params }: PageProps) {
  const { slug } = await params
  const sb = adminClient()

  const [{ data: brand }, { data: categories }] = await Promise.all([
    sb.from('brands').select('*').eq('slug', slug).maybeSingle<Brand>(),
    sb
      .from('categories')
      .select('slug, name')
      .order('sort_order', { ascending: true })
      .returns<Pick<Category, 'slug' | 'name'>[]>(),
  ])

  if (!brand) notFound()

  return (
    <div>
      <PageHeader
        title={brand.name}
        subtitle={`Brand · ${brand.slug}`}
        breadcrumbs={[
          { label: 'Catalog' },
          { label: 'Brands', href: '/brands' },
          { label: brand.name },
        ]}
      />
      <BrandForm mode="edit" brand={brand} categories={categories ?? []} />
    </div>
  )
}
