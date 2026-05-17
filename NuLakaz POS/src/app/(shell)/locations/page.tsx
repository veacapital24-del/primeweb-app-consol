import { Topbar } from '@/components/Topbar'
import {
  Alert,
  Badge,
  ButtonLink,
  DataTable,
  EmptyState,
  PageMain,
  TableBody,
  TableHead,
  TableHeadRow,
  TableRow,
  Td,
  TextLink,
  Th,
} from '@/components/ui'
import { serverClient } from '@/lib/supabase'
import type { Location } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function LocationsPage() {
  const sb = await serverClient()
  const { data, error } = await sb
    .from('locations')
    .select('*')
    .order('created_at', { ascending: false })

  const rows = (data ?? []) as Location[]

  return (
    <>
      <Topbar
        title="Locations"
        subtitle="Stores, warehouses, kiosks and pop-ups"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Locations' }]}
        actions={<ButtonLink href="/locations/new">+ New location</ButtonLink>}
      />

      <PageMain>
        {error ? <Alert>{error.message}</Alert> : null}

        {rows.length === 0 ? (
          <EmptyState
            title="No locations yet"
            description="Create your first store to start setting up registers and shifts."
            action={{ label: '+ Create location', href: '/locations/new' }}
          />
        ) : (
          <DataTable minWidth="720px">
            <TableHead>
              <TableHeadRow>
                <Th>Code</Th>
                <Th>Name</Th>
                <Th>Kind</Th>
                <Th>Phone</Th>
                <Th>Currency</Th>
                <Th>Status</Th>
                <Th />
              </TableHeadRow>
            </TableHead>
            <TableBody>
              {rows.map((loc) => (
                <TableRow key={loc.id}>
                  <Td className="font-mono text-xs font-bold text-prime-700">{loc.code}</Td>
                  <Td className="font-semibold text-ink-900">{loc.name}</Td>
                  <Td className="capitalize text-ink-700">{loc.kind}</Td>
                  <Td className="text-ink-700">{loc.phone ?? '—'}</Td>
                  <Td className="font-mono text-xs text-ink-700">{loc.currency}</Td>
                  <Td>
                    <Badge variant={loc.active ? 'success' : 'muted'}>
                      {loc.active ? 'Active' : 'Hidden'}
                    </Badge>
                  </Td>
                  <Td align="right">
                    <TextLink href={'/locations/' + loc.id}>Edit →</TextLink>
                  </Td>
                </TableRow>
              ))}
            </TableBody>
          </DataTable>
        )}
      </PageMain>
    </>
  )
}
