import { adminClient } from '@/lib/supabase'
import { PageHeader } from '@/components/PageHeader'
import { PoList, type PoListRow } from '@/components/purchase-orders/PoList'
import { BtnPrimary, EmptyState, FilterPill, IconPlus, StatCard } from '@/components/admin/ui'
import { PO_STATUS_LABEL } from '@/lib/po-status'
import { PO_STATUSES, type PoStatus } from '@/lib/types'

export const dynamic = 'force-dynamic'

type SearchParams = { status?: string }

export default async function PurchaseOrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const { status = 'all' } = await searchParams
  const sb = adminClient()

  let query = sb
    .from('purchase_orders')
    .select('id, po_number, status, expected_date, total_cost_mur, created_at, suppliers(name)')
    .order('created_at', { ascending: false })

  if (status !== 'all') {
    query = query.eq('status', status)
  }

  const { data: pos } = await query

  const { data: counts } = await sb.from('purchase_orders').select('status, total_cost_mur')

  const countMap = Object.fromEntries(
    PO_STATUSES.map((s) => [s, counts?.filter((r) => r.status === s).length ?? 0]),
  ) as Record<PoStatus, number>
  const total = counts?.length ?? 0
  const openValue = (counts ?? [])
    .filter((r) => r.status === 'draft' || r.status === 'sent' || r.status === 'partial')
    .reduce((s, r) => s + Number(r.total_cost_mur), 0)

  const rows: PoListRow[] = (pos ?? []).map((po) => ({
    id: po.id,
    po_number: po.po_number,
    status: po.status as PoStatus,
    expected_date: po.expected_date,
    total_cost_mur: Number(po.total_cost_mur),
    created_at: po.created_at,
    supplier_name: (po.suppliers as unknown as { name: string } | null)?.name ?? null,
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase Orders"
        subtitle="Order stock from suppliers and track receipts into inventory."
        breadcrumbs={[{ label: 'Admin', href: '/' }, { label: 'Purchase Orders' }]}
        actions={
          <BtnPrimary href="/purchase-orders/new">
            <IconPlus />
            New PO
          </BtnPrimary>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Total POs" value={total} />
        <StatCard
          label="Open value"
          value={`Rs ${openValue.toLocaleString('en-MU', { maximumFractionDigits: 0 })}`}
          accent="prime"
        />
        <StatCard
          label="Awaiting receipt"
          value={(countMap.sent ?? 0) + (countMap.partial ?? 0)}
          accent="amber"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterPill href="/purchase-orders" active={status === 'all'} label="All" count={total} />
        {PO_STATUSES.map((s) => (
          <FilterPill
            key={s}
            href={`/purchase-orders?status=${s}`}
            active={status === s}
            label={PO_STATUS_LABEL[s]}
            count={countMap[s]}
          />
        ))}
      </div>

      {!rows.length ? (
        <EmptyState
          title="No purchase orders yet"
          action={{ href: '/purchase-orders/new', label: 'Create your first PO' }}
        />
      ) : (
        <PoList rows={rows} />
      )}
    </div>
  )
}

