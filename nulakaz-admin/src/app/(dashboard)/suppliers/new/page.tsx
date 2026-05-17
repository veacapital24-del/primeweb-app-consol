import { PageHeader } from '@/components/PageHeader'
import { SupplierForm } from '../SupplierForm'

export const metadata = { title: 'New Supplier — NuLakaz Admin' }

export default function NewSupplierPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-6">
      <PageHeader title="New Supplier" subtitle="Add a vendor to your supplier directory." />
      <SupplierForm />
    </div>
  )
}
