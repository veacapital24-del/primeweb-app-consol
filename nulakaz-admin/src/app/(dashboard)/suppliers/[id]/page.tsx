import { notFound } from 'next/navigation'
import Link from 'next/link'
import { adminClient } from '@/lib/supabase'
import { PageHeader } from '@/components/PageHeader'
import { ActiveBadge } from '@/components/admin/ui'
import { SupplierForm } from '../SupplierForm'
import { toggleSupplierActive } from '../actions'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ id: string }> }

export default async function SupplierDetailPage({ params }: Props) {
  const { id } = await params
  const sb = adminClient()

  const { data: supplier } = await sb
    .from('suppliers')
    .select('*')
    .eq('id', id)
    .single()

  if (!supplier) notFound()

  const { data: pos } = await sb
    .from('purchase_orders')
    .select('id, po_number, status, created_at')
    .eq('supplier_id', id)
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-6">
      <PageHeader
        title={supplier.name}
        subtitle="Supplier profile and purchase history."
        breadcrumbs={[{ label: 'Suppliers', href: '/suppliers' }, { label: supplier.name }]}
        actions={
          <div className="flex items-center gap-3">
            <ActiveBadge active={supplier.active} />
            <form action={toggleSupplierActive.bind(null, id, !supplier.active)}>
              <button
                type="submit"
                className="text-xs font-semibold text-ink-500 underline underline-offset-2 transition hover:text-ink-900"
              >
                {supplier.active ? 'Deactivate' : 'Activate'}
              </button>
            </form>
          </div>
        }
      />

      <SupplierForm supplier={supplier} />

      {/* Recent POs */}
      {!!pos?.length && (
        <div className="glass-card overflow-hidden">
          <div className="border-b border-ink-200/60 px-5 py-4">
            <h2 className="font-display text-base font-bold text-ink-900">Recent purchase orders</h2>
          </div>
          <ul className="divide-y divide-ink-200/40">
            {pos.map((po) => (
              <li key={po.id}>
                <Link
                  href={`/purchase-orders/${po.id}`}
                  className="flex items-center justify-between px-5 py-3 text-sm transition hover:bg-canvas/50"
                >
                  <span className="font-mono font-semibold text-ink-900">{po.po_number}</span>
                  <span className="text-xs text-ink-500 capitalize">{po.status}</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="border-t border-ink-200/60 px-5 py-3">
            <Link
              href={`/purchase-orders`}
              className="text-xs font-semibold text-prime-700 hover:text-prime-900"
            >
              View all purchase orders →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
