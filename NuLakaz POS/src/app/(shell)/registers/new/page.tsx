import { redirect } from 'next/navigation'
import { Topbar } from '@/components/Topbar'
import { FormPanel, PageMain, PageStack } from '@/components/ui'
import { serverClient } from '@/lib/supabase'
import { RegisterForm } from '../RegisterForm'

export const dynamic = 'force-dynamic'

type PageProps = { searchParams: Promise<{ location?: string }> }

export default async function NewRegisterPage({ searchParams }: PageProps) {
  const { location } = await searchParams

  const sb = await serverClient()
  const { data: locations } = await sb
    .from('locations')
    .select('id, code, name')
    .eq('active', true)
    .order('code')

  if (!locations || locations.length === 0) {
    redirect('/registers')
  }

  return (
    <>
      <Topbar
        title="New register"
        subtitle="A POS terminal at a location"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Registers', href: '/registers' },
          { label: 'New' },
        ]}
      />
      <PageMain>
        <PageStack width="3xl">
          <FormPanel>
            <RegisterForm mode="create" locations={locations} defaultLocationId={location} />
          </FormPanel>
        </PageStack>
      </PageMain>
    </>
  )
}
