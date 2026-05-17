import { redirect } from 'next/navigation'
import { Topbar } from '@/components/Topbar'
import { FormPanel, PageMain, PageStack } from '@/components/ui'
import { adminClient } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'
import { listUsersWithEmail } from '../actions'
import { StaffForm } from '../StaffForm'

export const dynamic = 'force-dynamic'

export default async function NewStaffPage() {
  await requireAdmin()
  const admin = adminClient()

  const [users, { data: locations }] = await Promise.all([
    listUsersWithEmail(),
    admin.from('locations').select('id, code, name').eq('active', true).order('code'),
  ])

  if (!locations || locations.length === 0) redirect('/staff')

  return (
    <>
      <Topbar
        title="Assign staff"
        subtitle="Give a user access to a location"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Staff', href: '/staff' },
          { label: 'New' },
        ]}
      />
      <PageMain>
        <PageStack width="2xl">
          <FormPanel>
            <StaffForm users={users} locations={locations} />
          </FormPanel>
        </PageStack>
      </PageMain>
    </>
  )
}
