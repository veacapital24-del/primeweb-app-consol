import { notFound } from 'next/navigation'
import { Topbar } from '@/components/Topbar'
import { FormPanel, PageMain, PageStack } from '@/components/ui'
import { serverClient } from '@/lib/supabase'
import type { Location } from '@/lib/types'
import { LocationForm } from '../LocationForm'

export const dynamic = 'force-dynamic'

type PageProps = { params: Promise<{ id: string }> }

export default async function EditLocationPage({ params }: PageProps) {
  const { id } = await params
  const sb = await serverClient()
  const { data } = await sb.from('locations').select('*').eq('id', id).maybeSingle<Location>()

  if (!data) notFound()

  return (
    <>
      <Topbar
        title={data.name}
        subtitle={`${data.code} · ${data.kind}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Locations', href: '/locations' },
          { label: data.code },
        ]}
      />
      <PageMain>
        <PageStack width="3xl">
          <FormPanel>
            <LocationForm mode="edit" initial={data} />
          </FormPanel>
        </PageStack>
      </PageMain>
    </>
  )
}
