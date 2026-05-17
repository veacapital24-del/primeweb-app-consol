import { Topbar } from '@/components/Topbar'
import { FormPanel, PageMain, PageStack } from '@/components/ui'
import { LocationForm } from '../LocationForm'

export const dynamic = 'force-dynamic'

export default function NewLocationPage() {
  return (
    <>
      <Topbar
        title="New location"
        subtitle="Add a store, warehouse, kiosk or pop-up"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Locations', href: '/locations' },
          { label: 'New' },
        ]}
      />
      <PageMain>
        <PageStack width="3xl">
          <FormPanel>
            <LocationForm mode="create" />
          </FormPanel>
        </PageStack>
      </PageMain>
    </>
  )
}
