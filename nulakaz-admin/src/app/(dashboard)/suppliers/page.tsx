import Link from 'next/link'
import { adminClient } from '@/lib/supabase'
import { PageHeader } from '@/components/PageHeader'
import {
  ActiveBadge,
  BtnPrimary,
  EmptyState,
  IconPlus,
  TableHead,
  TableShell,
} from '@/components/admin/ui'

export const dynamic = 'force-dynamic'

export default async function SuppliersPage() {
  const sb = adminClient()

  const { data: suppliers } = await sb
    .from('suppliers')
    .select('id, name, contact_name, email, phone, active, created_at')
    .order('name')

  // PO count per supplier
  const { data: poCounts } = await sb
    .from('purchase_orders')
    .select('supplier_id')

  const countMap = Object.fromEntries(
    (suppliers ?? []).map((s) => [
      s.id,
      poCounts?.filter((p) => p.supplier_id === s.id).length ?? 0,
    ]),
  )

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
      <PageHeader
        title="Suppliers"
        subtitle="Manage your suppliers and vendor contacts."
        actions={
          <BtnPrimary href="/suppliers/new">
            <IconPlus />
            New Supplier
          </BtnPrimary>
        }
      />

      {!suppliers?.length ? (
        <EmptyState
          title="No suppliers yet"
          action={{ href: '/suppliers/new', label: 'Add your first supplier' }}
        />
      ) : (
        <>
          {/* Desktop table */}
          <TableShell>
            <TableHead>
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Email / Phone</th>
                <th className="px-4 py-3 text-right">POs</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </TableHead>
            <tbody className="divide-y divide-ink-200/40">
              {suppliers.map((s) => (
                <tr key={s.id} className="group transition hover:bg-canvas/40">
                  <td className="px-4 py-3 font-semibold text-ink-900">{s.name}</td>
                  <td className="px-4 py-3 text-sm text-ink-600">
                    {s.contact_name ?? <span className="text-ink-400">—</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-ink-600">
                    <div>{s.email ?? '—'}</div>
                    {s.phone && <div className="text-xs text-ink-400">{s.phone}</div>}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-sm font-semibold text-ink-900">
                    {countMap[s.id]}
                  </td>
                  <td className="px-4 py-3">
                    <ActiveBadge active={s.active} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/suppliers/${s.id}`}
                      className="text-xs font-semibold text-prime-700 transition hover:text-prime-900"
                    >
                      Edit →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </TableShell>

          {/* Mobile cards */}
          <div className="space-y-3 sm:hidden">
            {suppliers.map((s) => (
              <Link
                key={s.id}
                href={`/suppliers/${s.id}`}
                className="glass-card block p-4 transition hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-ink-900">{s.name}</p>
                    {s.contact_name && (
                      <p className="mt-0.5 text-xs text-ink-500">{s.contact_name}</p>
                    )}
                  </div>
                  <ActiveBadge active={s.active} />
                </div>
                {(s.email || s.phone) && (
                  <p className="mt-2 text-xs text-ink-500">
                    {s.email}
                    {s.email && s.phone ? ' · ' : ''}
                    {s.phone}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
