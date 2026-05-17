import { adminClient } from '@/lib/supabase'
import { PageHeader } from '@/components/PageHeader'
import { StatCard, TableHead, TableShell } from '@/components/admin/ui'
import type { WhatsAppMessage } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function WhatsAppPage() {
  const sb = adminClient()
  const { data } = await sb
    .from('whatsapp_messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)
    .returns<WhatsAppMessage[]>()

  const messages = data ?? []
  const cloudConfigured = !!process.env.WHATSAPP_PHONE_NUMBER_ID && !!process.env.WHATSAPP_ACCESS_TOKEN
  const inbound = messages.filter((m) => m.direction === 'in').length

  return (
    <div className="space-y-6">
      <PageHeader
        title="WhatsApp"
        subtitle="Inbox and outbox. Deep-links by default; Cloud API enables auto-confirmations and templates."
        breadcrumbs={[{ label: 'Channels' }, { label: 'WhatsApp' }]}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Recent messages" value={messages.length} />
        <StatCard label="Inbound" value={inbound} accent="mint" />
        <StatCard
          label="API status"
          value={cloudConfigured ? 'Connected' : 'Deep-link'}
          accent={cloudConfigured ? 'prime' : 'amber'}
        />
      </div>

      <div
        className={`glass-card p-4 md:p-5 ${
          cloudConfigured ? 'ring-1 ring-mint-400/40' : 'ring-1 ring-prime-200/60'
        }`}
      >
        <p className="font-display text-sm font-bold text-ink-900">
          {cloudConfigured ? 'Cloud API connected' : 'Cloud API not configured'}
        </p>
        <p className="mt-1 text-sm text-ink-600">
          {cloudConfigured
            ? 'Outbound messages dispatch via Meta Graph API; statuses sync via webhook.'
            : 'Set WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN to enable. Until then, customers use wa.me links with a pre-filled cart.'}
        </p>
      </div>

      <TableShell>
        <TableHead>
          <tr>
            <th className="px-4 py-3">When</th>
            <th className="px-4 py-3">Dir</th>
            <th className="px-4 py-3">Phone</th>
            <th className="px-4 py-3">Message</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </TableHead>
        <tbody className="divide-y divide-ink-200/50">
          {messages.map((m) => (
            <tr key={m.id} className="transition hover:bg-prime-50/20">
              <td className="px-4 py-3 text-xs text-ink-500">{new Date(m.created_at).toLocaleString()}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${
                    m.direction === 'in'
                      ? 'bg-mint-50 text-mint-700 ring-1 ring-mint-500/25'
                      : 'bg-prime-50 text-prime-700 ring-1 ring-prime-200/80'
                  }`}
                >
                  {m.direction === 'in' ? '← in' : '→ out'}
                </span>
              </td>
              <td className="px-4 py-3 font-mono text-xs">{m.phone}</td>
              <td className="max-w-md truncate px-4 py-3" title={m.body ?? ''}>
                {m.body}
              </td>
              <td className="px-4 py-3 text-xs capitalize text-ink-600">{m.status ?? '—'}</td>
            </tr>
          ))}
          {messages.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-12 text-center text-sm text-ink-500">
                No messages yet.
              </td>
            </tr>
          )}
        </tbody>
      </TableShell>
    </div>
  )
}
