import { notFound } from 'next/navigation'
import { Topbar } from '@/components/Topbar'
import { FormPanel, PageMain, PageStack } from '@/components/ui'
import { serverClient } from '@/lib/supabase'
import type { Register } from '@/lib/types'
import { RegisterForm } from '../RegisterForm'

export const dynamic = 'force-dynamic'

type PageProps = { params: Promise<{ id: string }> }

export default async function EditRegisterPage({ params }: PageProps) {
  const { id } = await params
  const sb = await serverClient()

  const [{ data: reg }, { data: locations }] = await Promise.all([
    sb.from('registers').select('*').eq('id', id).maybeSingle<Register>(),
    sb.from('locations').select('id, code, name').order('code'),
  ])

  if (!reg) notFound()

  return (
    <>
      <Topbar
        title={reg.name}
        subtitle={reg.code}
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Registers', href: '/registers' },
          { label: reg.code },
        ]}
      />
      <PageMain>
        <PageStack width="3xl">
          <FormPanel>
            <RegisterForm mode="edit" initial={reg} locations={locations ?? []} />
          </FormPanel>
        </PageStack>
      </PageMain>
    </>
  )
}
