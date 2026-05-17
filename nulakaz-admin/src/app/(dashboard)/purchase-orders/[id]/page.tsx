import { notFound } from 'next/navigation'
import Link from 'next/link'
import { adminClient } from '@/lib/supabase'
import { PageHeader } from '@/components/PageHeader'
import { GlassCard, StatCard } from '@/components/admin/ui'
import { PoStatusBadge } from '@/components/purchase-orders/PoStatusBadge'
import { ReceivePanel } from './ReceivePanel'
import { updatePoStatus } from '../actions'
import { PO_STATUS_ACCENT, PO_STATUS_DETAIL_LABEL } from '@/lib/po-status'
import type { PoStatus } from '@/lib/types'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ id: string }> }

export default async function PurchaseOrderDetailPage({ params }: Props) {
  const { id } = await params
  const sb = adminClient()

  const { data: po } = await sb
    .from('purchase_orders')
    .select('*, suppliers(id, name, email, phone), locations(id, name, kind)')
    .eq('id', id)
    .single()

  if (!po) notFound()

  const { data: lines } = await sb
    .from('purchase_order_lines')
    .select('*, products(id, sku, name, image_url)')
    .eq('po_id', id)
    .order('created_at')

  const status = po.status as PoStatus
  const supplier = po.suppliers as {
    id: string
    name: string
    email: string | null
    phone: string | null
  } | null
  const location = po.locations as { id: string; name: string; kind: string } | null

  const canSend = status === 'draft'
  const canReceive = status === 'sent' || status === 'partial'
  const canCancel = status === 'draft' || status === 'sent'

  const enrichedLines = (lines ?? []).map((l) => {
    const product = l.products as { id: string; sku: string; name: string; image_url: string | null } | null
    return {
      id: l.id,
      product_id: l.product_id,
      qty_ordered: l.qty_ordered,
      qty_received: l.qty_received,
      unit_cost_mur: Number(l.unit_cost_mur),
      product_name: product?.name ?? 'Unknown',
      product_sku: product?.sku ?? '',
      line_total: l.qty_ordered * Number(l.unit_cost_mur),
    }
  })

  const receivedUnits = enrichedLines.reduce((s, l) => s + l.qty_received, 0)
  const orderedUnits = enrichedLines.reduce((s, l) => s + l.qty_ordered, 0)
  const receiptPct = orderedUnits > 0 ? Math.round((receivedUnits / orderedUnits) * 100) : 0

  return (
    <div className="space-y-6">
      <PageHeader
        title={po.po_number}
        subtitle={PO_STATUS_DETAIL_LABEL[status]}
        breadcrumbs={[
          { label: 'Admin', href: '/' },
          { label: 'Purchase Orders', href: '/purchase-orders' },
          { label: po.po_number },
        ]}
      />

      <div className="po-detail-hero flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-paper/70">Purchase order</p>
          <p className="font-mono text-2xl font-bold tracking-tight">{po.po_number}</p>
        </div>
        <PoStatusBadge status={status} size="md" />
      </div>

      {(canSend || canCancel) && (
        <div className="glass-card flex flex-wrap gap-2 p-4">
          {canSend && (
            <form action={updatePoStatus.bind(null, id, 'sent')}>
              <button
                type="submit"
                className="settings-form-submit"
              >
                Mark as sent
              </button>
            </form>
          )}
          {canCancel && (
            <form action={updatePoStatus.bind(null, id, 'cancelled')}>
              <button
                type="submit"
                className="rounded-xl border border-flash-500/40 bg-flash-50 px-4 py-2.5 text-sm font-semibold text-flash-700 transition hover:bg-flash-100"
              >
                Cancel PO
              </button>
            </form>
          )}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total cost"
          value={`Rs ${Number(po.total_cost_mur).toLocaleString('en-MU', { minimumFractionDigits: 2 })}`}
          accent={PO_STATUS_ACCENT[status]}
        />
        <StatCard label="Units received" value={`${receivedUnits} / ${orderedUnits}`} accent="amber" />
        <StatCard label="Receipt progress" value={`${receiptPct}%`} accent="mint" />
        <StatCard
          label="Expected"
          value={
            po.expected_date
              ? new Date(po.expected_date).toLocaleDateString('en-MU', { day: 'numeric', month: 'short' })
              : '—'
          }
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <GlassCard title="Supplier">
          {supplier ? (
            <div className="space-y-1">
              <Link
                href={`/suppliers/${supplier.id}`}
                className="text-sm font-semibold text-prime-700 hover:text-prime-900 hover:underline"
              >
                {supplier.name}
              </Link>
              {supplier.email && <p className="text-xs text-ink-500">{supplier.email}</p>}
              {supplier.phone && <p className="text-xs text-ink-500">{supplier.phone}</p>}
            </div>
          ) : (
            <p className="text-sm text-ink-400">No supplier linked</p>
          )}
        </GlassCard>

        <GlassCard title="Receiving location">
          <p className="text-sm font-semibold text-ink-900">
            {location ? `${location.name} (${location.kind})` : 'Global warehouse'}
          </p>
        </GlassCard>

        <GlassCard title="Notes">
          <p className="text-sm text-ink-700">{po.notes?.trim() ? po.notes : '—'}</p>
        </GlassCard>
      </div>

      <div className="glass-card overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-ink-200/60 bg-canvas/40 text-left text-[10px] font-bold uppercase tracking-wider text-ink-500">
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3 text-right">Ordered</th>
              <th className="px-4 py-3 text-right">Received</th>
              <th className="px-4 py-3 text-right">Unit</th>
              <th className="px-4 py-3 text-right">Line total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-200/40">
            {enrichedLines.map((line) => {
              const pct = line.qty_ordered > 0 ? (line.qty_received / line.qty_ordered) * 100 : 0
              return (
                <tr key={line.id} className="transition hover:bg-canvas/30">
                  <td className="px-4 py-3.5">
                    <p className="font-semibold text-ink-900">{line.product_name}</p>
                    <p className="text-xs text-ink-500">{line.product_sku}</p>
                  </td>
                  <td className="px-4 py-3.5 text-right tabular-nums">{line.qty_ordered}</td>
                  <td className="px-4 py-3.5 text-right">
                    <span
                      className={`tabular-nums text-sm font-semibold ${
                        pct >= 100 ? 'text-mint-700' : pct > 0 ? 'text-amber-700' : 'text-ink-400'
                      }`}
                    >
                      {line.qty_received}
                    </span>
                    <div className="mt-1.5 ml-auto h-1.5 w-20 overflow-hidden rounded-full bg-ink-100">
                      <div
                        className={`h-full rounded-full ${pct >= 100 ? 'bg-mint-500' : 'bg-prime-500'}`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right tabular-nums text-ink-600">
                    Rs {line.unit_cost_mur.toLocaleString('en-MU', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3.5 text-right font-semibold tabular-nums text-ink-900">
                    Rs {line.line_total.toLocaleString('en-MU', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-ink-200/60 bg-canvas/30">
              <td colSpan={4} className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-ink-500">
                Total
              </td>
              <td className="px-4 py-3 text-right font-display text-lg font-black tabular-nums text-ink-900">
                Rs {Number(po.total_cost_mur).toLocaleString('en-MU', { minimumFractionDigits: 2 })}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {canReceive && <ReceivePanel poId={id} lines={enrichedLines} />}
    </div>
  )
}
