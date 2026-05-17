import { PageHeader } from '@/components/PageHeader'
import { LocationForm } from '../LocationForm'

export const dynamic = 'force-dynamic'

export default function NewLocationPage() {
  return (
    <div>
      <PageHeader
        title="New location"
        breadcrumbs={[
          { label: 'Operations' },
          { label: 'Locations', href: '/locations' },
          { label: 'New' },
        ]}
      />
      <LocationForm mode="create" />
    </div>
  )
}
