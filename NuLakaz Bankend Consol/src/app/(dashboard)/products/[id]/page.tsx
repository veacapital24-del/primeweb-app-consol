import { notFound } from 'next/navigation'
import { adminClient } from '@/lib/supabase'
import { PageHeader } from '@/components/PageHeader'
import { ProductForm } from '../ProductForm'
import type { Brand, Category, Product } from '@/lib/types'

export const dynamic = 'force-dynamic'

type PageProps = { params: Promise<{ id: string }> }

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params
  const sb = adminClient()

  const [
    { data: product },
    { data: inv },
    { data: categories },
    { data: brands },
  ] = await Promise.all([
    sb.from('products').select('*').eq('id', id).maybeSingle<Product>(),
    sb
      .from('inventory')
      .select('low_stock_threshold')
      .eq('product_id', id)
      .maybeSingle<{ low_stock_threshold: number }>(),
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
  if (!product) notFound()

  // Default the low-stock threshold to 5 if no inventory row exists yet —
  // matches the storefront fallback in nulakaz-web/src/lib/data.ts.
  const enriched = { ...product, low_stock_threshold: inv?.low_stock_threshold ?? 5 }

  return (
    <div className="space-y-6">
      <PageHeader
        title={product.name}
        subtitle={`SKU ${product.sku} · edit pricing, visibility, and inventory thresholds`}
        breadcrumbs={[{ label: 'Catalog' }, { label: 'Products', href: '/products' }, { label: product.name }]}
      />
      <ProductForm
        mode="edit"
        product={enriched}
        categories={categories ?? []}
        brands={brands ?? []}
      />
    </div>
  )
}
