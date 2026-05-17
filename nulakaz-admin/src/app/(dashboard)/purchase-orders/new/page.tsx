import { adminClient } from '@/lib/supabase'
import { PageHeader } from '@/components/PageHeader'
import { POForm } from './POForm'

export const metadata = { title: 'New Purchase Order — NuLakaz Admin' }

export default async function NewPurchaseOrderPage() {
  const sb = adminClient()

  const [{ data: suppliers }, { data: locations }, { data: products }] = await Promise.all([
    sb.from('suppliers').select('id, name').eq('active', true).order('name'),
    sb.from('locations').select('id, name, kind').eq('active', true).order('name'),
    sb
      .from('products')
      .select('id, sku, name, wholesale_price_mur, retail_price_mur')
      .eq('active', true)
      .order('name'),
  ])

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="New purchase order"
        subtitle="Order stock from a supplier and track delivery into inventory."
        breadcrumbs={[
          { label: 'Admin', href: '/' },
          { label: 'Purchase Orders', href: '/purchase-orders' },
          { label: 'New' },
        ]}
      />
      <POForm
        suppliers={suppliers ?? []}
        locations={locations ?? []}
        products={products ?? []}
      />
    </div>
  )
}
