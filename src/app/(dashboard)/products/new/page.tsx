import { PageHeader } from '@/components/PageHeader'
import { ProductForm } from '../ProductForm'

export default function NewProductPage() {
  return (
    <div>
      <PageHeader
        title="New product"
        breadcrumbs={[{ label: 'Catalog' }, { label: 'Products', href: '/products' }, { label: 'New' }]}
      />
      <ProductForm mode="create" />
    </div>
  )
}
