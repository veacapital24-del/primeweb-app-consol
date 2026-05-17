import { redirect } from 'next/navigation'
import { Topbar } from '@/components/Topbar'
import { ButtonLink, EmptyState, FormPanel, PageMain, PageStack } from '@/components/ui'
import { serverClient } from '@/lib/supabase'
import { getSettings } from '@/lib/settings'
import { OpenShiftForm } from '../OpenShiftForm'

export const dynamic = 'force-dynamic'

type RegRow = {
  id: string
  code: string
  name: string
  active: boolean
  location_id: string
}

type LocRow = { id: string; code: string; name: string }

export default async function OpenShiftPage() {
  const sb = await serverClient()
  const {
    data: { user },
  } = await sb.auth.getUser()
  if (!user) redirect('/login?next=/shifts/open')

  const settings = await getSettings()

  const { data: existingShift } = await sb
    .from('shifts')
    .select('id')
    .eq('cashier_id', user.id)
    .eq('status', 'open')
    .maybeSingle<{ id: string }>()

  if (existingShift) {
    redirect('/register')
  }

  const { data: rowsData, error: regListErr } = await sb
    .from('registers')
    .select('id, code, name, active, location_id')
    .eq('active', true)
    .order('code')

  const rows = (rowsData ?? []) as RegRow[]

  const locIds = Array.from(new Set(rows.map((r) => r.location_id)))
  const locById = new Map<string, LocRow>()

  if (locIds.length > 0) {
    const { data: locs } = await sb.from('locations').select('id, code, name').in('id', locIds)
    for (const loc of (locs ?? []) as LocRow[]) {
      locById.set(loc.id, loc)
    }
  }

  const { data: openShifts, error: shiftsErr } = await sb
    .from('shifts')
    .select('register_id')
    .eq('status', 'open')

  const loadError = regListErr?.message ?? shiftsErr?.message ?? null
  const busy = new Set((openShifts ?? []).map((s) => s.register_id as string))

  const registers = rows
    .filter((r) => !busy.has(r.id))
    .map((r) => {
      const loc = locById.get(r.location_id)
      return {
        id: r.id,
        code: r.code,
        name: r.name,
        location_code: loc?.code ?? '—',
        location_name: loc?.name ?? '—',
      }
    })

  const isRecursion =
    loadError?.toLowerCase().includes('stack depth') ||
    loadError?.toLowerCase().includes('infinite recursion')

  return (
    <>
      <Topbar
        title="Open shift"
        subtitle="Pick a register and set the opening cash float"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Shifts', href: '/shifts' },
          { label: 'Open' },
        ]}
      />
      <PageMain>
        <PageStack width="2xl">
          {loadError ? (
            <EmptyState
              title="Could not load registers"
              description={
                isRecursion
                  ? 'Database policy recursion (admin check). Apply the latest Supabase migration `20260517120000_fix_rls_admin_recursion.sql` in the NuLakaz backend project, then try again.'
                  : loadError
              }
              action={{ label: 'Back to shifts', href: '/shifts' }}
            />
          ) : registers.length === 0 ? (
            <EmptyState
              title={rows.length === 0 ? 'No registers set up' : 'No free register'}
              description={
                rows.length === 0
                  ? 'Create a location and register before opening a shift.'
                  : 'Every register you can access already has an open shift, or you are not assigned to a location yet.'
              }
              action={
                rows.length === 0
                  ? { label: '+ New location', href: '/locations/new' }
                  : { label: 'View shifts', href: '/shifts' }
              }
            />
          ) : (
            <FormPanel>
              <OpenShiftForm
                registers={registers}
                defaultFloat={settings.pos.default_float_mur ?? 0}
              />
            </FormPanel>
          )}

          {rows.length === 0 && !loadError ? (
            <p className="text-center text-sm text-ink-500">
              <ButtonLink href="/registers/new" variant="secondary" size="sm">
                + Create a register
              </ButtonLink>
            </p>
          ) : null}
        </PageStack>
      </PageMain>
    </>
  )
}
