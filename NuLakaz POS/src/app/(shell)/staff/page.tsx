import { Topbar } from '@/components/Topbar'
import {
  Alert,
  ButtonLink,
  DataTable,
  EmptyState,
  PageMain,
  TableBody,
  TableHead,
  TableHeadRow,
  TableRow,
  Td,
  Th,
} from '@/components/ui'
import { adminClient } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'
import Link from 'next/link'
import { StaffRow } from './StaffRow'
import type { PosRole } from './types'

export const dynamic = 'force-dynamic'

type Row = {
  user_id: string
  location_id: string
  role: PosRole
  created_at: string
  locations: { code: string; name: string } | null
}

export default async function StaffPage() {
  await requireAdmin()
  const admin = adminClient()

  const [{ data: rowsData, error }, { data: usersPage }, { count: locationCount }] = await Promise.all([
    admin
      .from('staff_locations')
      .select('user_id, location_id, role, created_at, locations(code, name)')
      .order('created_at', { ascending: false }),
    admin.auth.admin.listUsers({ page: 1, perPage: 200 }),
    admin.from('locations').select('id', { count: 'exact', head: true }),
  ])

  const rows = (rowsData ?? []) as unknown as Row[]
  const users = usersPage?.users ?? []
  const userById = new Map(users.map((u) => [u.id, u.email]))

  const profileIds = rows.map((r) => r.user_id)
  const { data: profiles } = profileIds.length
    ? await admin.from('profiles').select('id, full_name').in('id', profileIds)
    : { data: [] as { id: string; full_name: string | null }[] }
  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.full_name]))

  const hasLocations = (locationCount ?? 0) > 0

  return (
    <>
      <Topbar
        title="Staff"
        subtitle="Who can sell at which location"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Staff' }]}
        actions={
          hasLocations ? <ButtonLink href="/staff/new">+ Assign staff</ButtonLink> : undefined
        }
      />

      <PageMain>
        {error ? <Alert>{error.message}</Alert> : null}

        {!hasLocations ? (
          <EmptyState
            title="Add a location first"
            description="Staff are scoped to a location."
            action={{ label: '+ New location', href: '/locations/new' }}
          />
        ) : rows.length === 0 ? (
          <EmptyState
            title="No staff assignments yet"
            description="Assign yourself or a teammate to a location so you can open shifts and ring sales."
            action={{ label: '+ Assign staff', href: '/staff/new' }}
          />
        ) : (
          <DataTable minWidth="640px">
            <TableHead>
              <TableHeadRow>
                <Th>User</Th>
                <Th>Location</Th>
                <Th>Role</Th>
                <Th />
              </TableHeadRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => {
                const email = userById.get(r.user_id) ?? '—'
                const name = nameById.get(r.user_id) ?? null
                return (
                  <StaffRow
                    key={r.user_id + '-' + r.location_id}
                    user_id={r.user_id}
                    location_id={r.location_id}
                    initialRole={r.role}
                    userLabel={
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-ink-900">{name ?? email}</div>
                        {name ? <div className="truncate text-xs text-ink-500">{email}</div> : null}
                      </div>
                    }
                    locationLabel={
                      r.locations ? (
                        <Link href={'/locations/' + r.location_id} className="hover:underline">
                          <span className="font-mono text-xs font-bold text-prime-700">{r.locations.code}</span>
                          <span className="ml-2 text-ink-900">{r.locations.name}</span>
                        </Link>
                      ) : (
                        '—'
                      )
                    }
                  />
                )
              })}
            </TableBody>
          </DataTable>
        )}
      </PageMain>
    </>
  )
}
