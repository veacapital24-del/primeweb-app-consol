import { notFound } from 'next/navigation'
import { adminClient } from '@/lib/supabase'
import { PageHeader } from '@/components/PageHeader'
import { CategoryForm } from '../CategoryForm'
import type { Category } from '@/lib/types'

export const dynamic = 'force-dynamic'

type PageProps = { params: Promise<{ slug: string }> }

export default async function EditCategoryPage({ params }: PageProps) {
  const { slug } = await params
  const sb = adminClient()

  const [{ data: category }, { data: rawParents }] = await Promise.all([
    sb.from('categories').select('*').eq('slug', slug).maybeSingle<Category>(),
    sb
      .from('categories')
      .select('slug, name, parent_slug')
      .order('sort_order', { ascending: true })
      .returns<Pick<Category, 'slug' | 'name' | 'parent_slug'>[]>(),
  ])

  if (!category) notFound()

  // Don't let the user pick themselves as a parent. (Server-side checks
  // also catch this — UI just hides the obviously-wrong option.)
  const parents = (rawParents ?? []).filter((p) => p.slug !== slug)

  return (
    <div>
      <PageHeader
        title={category.name}
        subtitle={`Category · ${category.slug}`}
        breadcrumbs={[
          { label: 'Catalog' },
          { label: 'Categories', href: '/categories' },
          { label: category.name },
        ]}
      />
      <CategoryForm mode="edit" category={category} parents={parents} />
    </div>
  )
}
