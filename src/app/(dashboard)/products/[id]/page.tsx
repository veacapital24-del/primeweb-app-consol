import { notFound } from 'next/navigation'
import { adminClient } from '@/lib/supabase'
import { PageHeader } from '@/components/PageHeader'
import { ProductForm } from '../ProductForm'
import type { Product } from '@/lib/types'

export const dynamic = 'force-dynamic'

type PageProps = { params: Promise<{ id: string }> }

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params
  const sb = adminClient()

  const { data: product } = await sb
    .from('products')
    .select('*')
    .eq('id', id)
    .maybeSingle<Product>()
  if (!product) notFound()

  return (
    <div>
      <PageHeader
        title={product.name}
        subtitle={`SKU ${product.sku}`}
        breadcrumbs={[{ label: 'Catalog' }, { label: 'Products', href: '/products' }, { label: product.name }]}
      />
      <ProductForm mode="edit" product={product} />
    </div>
  )
}
