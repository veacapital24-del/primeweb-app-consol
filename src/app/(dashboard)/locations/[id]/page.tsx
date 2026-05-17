import { notFound } from 'next/navigation'
import { adminClient } from '@/lib/supabase'
import { PageHeader } from '@/components/PageHeader'
import { LocationForm } from '../LocationForm'
import type { Location } from '@/lib/types'

export const dynamic = 'force-dynamic'

type PageProps = { params: Promise<{ id: string }> }

export default async function EditLocationPage({ params }: PageProps) {
  const { id } = await params
  const sb = adminClient()

  const { data: location } = await sb
    .from('locations')
    .select('*')
    .eq('id', id)
    .maybeSingle<Location>()
  if (!location) notFound()

  return (
    <div>
      <PageHeader
        title={location.name}
        subtitle={`${location.code} · ${location.kind}`}
        breadcrumbs={[
          { label: 'Operations' },
          { label: 'Locations', href: '/locations' },
          { label: location.name },
        ]}
      />
      <LocationForm mode="edit" location={location} />
    </div>
  )
}
