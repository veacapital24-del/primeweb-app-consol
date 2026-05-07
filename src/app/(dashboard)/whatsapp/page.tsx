import { adminClient } from '@/lib/supabase'
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

  const cloudConfigured = !!process.env.WHATSAPP_PHONE_NUMBER_ID && !!process.env.WHATSAPP_ACCESS_TOKEN

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">WhatsApp</h1>
        <p className="mt-1 text-sm text-ink-500">
          Inbox + outbox. The storefront uses{' '}
          <code className="rounded bg-white px-1.5 py-0.5 text-xs">wa.me</code> deep-links by default; switching on
          Cloud API enables auto-confirmations and template messages.
        </p>
      </div>

      <div className={`rounded-xl border p-4 ${cloudConfigured ? 'border-emerald-300 bg-emerald-50' : 'border-prime-500 bg-prime-50'}`}>
        <div className="font-semibold">
          {cloudConfigured ? 'Cloud API: connected' : 'Cloud API: not configured (deep-link mode)'}
        </div>
        <p className="mt-1 text-sm">
          {cloudConfigured
            ? 'Outbound messages are dispatched via Meta Graph API and statuses sync via webhook.'
            : 'Set WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN to enable. Until then, customers tap a wa.me link with a pre-filled cart.'}
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-ink-300 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-ink-100 text-left text-xs uppercase tracking-wide text-ink-500">
            <tr>
              <th className="px-4 py-2">When</th>
              <th className="px-4 py-2">Dir</th>
              <th className="px-4 py-2">Phone</th>
              <th className="px-4 py-2">Message</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-300">
            {(data ?? []).map((m) => (
              <tr key={m.id}>
                <td className="px-4 py-3 text-xs text-ink-500">{new Date(m.created_at).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${m.direction === 'in' ? 'bg-emerald-100 text-emerald-700' : 'bg-prime-100 text-prime-700'}`}>
                    {m.direction === 'in' ? '← in' : '→ out'}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{m.phone}</td>
                <td className="px-4 py-3 max-w-md truncate" title={m.body ?? ''}>{m.body}</td>
                <td className="px-4 py-3 capitalize">{m.status}</td>
              </tr>
            ))}
            {(!data || data.length === 0) && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-ink-500">No messages yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
