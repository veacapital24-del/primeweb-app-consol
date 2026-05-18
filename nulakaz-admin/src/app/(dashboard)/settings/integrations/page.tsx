import { SettingsPanel, SettingsStatusPill } from '../SettingsShell'

export const dynamic = 'force-dynamic'

export default function IntegrationsPage() {
  const quickbooksConfigured =
    !!process.env.QUICKBOOKS_CLIENT_ID &&
    !!process.env.QUICKBOOKS_CLIENT_SECRET &&
    !!process.env.QUICKBOOKS_REALM_ID

  const region = process.env.QUICKBOOKS_REGION || 'sandbox'

  return (
    <div className="space-y-6">
      <SettingsPanel
        title="QuickBooks Online"
        subtitle="Accounting sync for orders, customers, and inventory adjustments."
        badge={
          <SettingsStatusPill tone={quickbooksConfigured ? 'mint' : 'amber'}>
            {quickbooksConfigured ? 'Connected' : 'Not connected'}
          </SettingsStatusPill>
        }
      >
        <p className="text-sm leading-relaxed text-ink-700">
          Sync confirmed orders, customer records, and stock adjustments into QuickBooks Online so accounting stays in
          one place. Every fulfilled order posts an Invoice + Payment; warehouse adjustments post Inventory Quantity
          Adjustments tagged with the Primeweb reason.
        </p>

        <dl className="mt-5 grid gap-3 rounded-xl border border-ink-200/70 bg-canvas/40 p-4 text-sm">
          <Row k="Environment" v={region} mono />
          <Row k="Realm ID" v={process.env.QUICKBOOKS_REALM_ID ?? '—'} mono />
          <Row k="Client ID" v={process.env.QUICKBOOKS_CLIENT_ID ? mask(process.env.QUICKBOOKS_CLIENT_ID) : '—'} mono />
        </dl>

        {!quickbooksConfigured && (
          <pre className="mt-4 overflow-x-auto rounded-xl bg-ink-950 px-4 py-3.5 font-mono text-[11px] leading-relaxed text-paper/90">
{`# Set in Vercel → Settings → Environment Variables
QUICKBOOKS_CLIENT_ID=...
QUICKBOOKS_CLIENT_SECRET=...
QUICKBOOKS_REALM_ID=...           # company file ID
QUICKBOOKS_REGION=sandbox          # or "production"
QUICKBOOKS_REDIRECT_URI=https://nulakazconsol.prumira.com/api/quickbooks/callback`}
          </pre>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <a
            href={quickbooksConfigured ? '/api/quickbooks/connect' : 'https://developer.intuit.com/app/developer/qbo/docs/develop'}
            target={quickbooksConfigured ? '_self' : '_blank'}
            rel="noreferrer"
            className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
              quickbooksConfigured
                ? 'bg-prime-700 text-paper shadow-md shadow-prime-900/15 hover:bg-prime-800'
                : 'border border-ink-300/80 bg-paper text-ink-900 hover:border-prime-400 hover:text-prime-700'
            }`}
          >
            {quickbooksConfigured ? 'Re-authorize QuickBooks' : 'Get QuickBooks credentials ↗'}
          </a>
          {quickbooksConfigured && (
            <span className="text-[11px] text-ink-500">
              Token refreshes automatically every 60 minutes via the connector.
            </span>
          )}
        </div>
      </SettingsPanel>

      <SettingsPanel title="What syncs" subtitle="Data flows from NuLakaz into QuickBooks.">
        <ul className="grid gap-2 text-sm">
          <SyncRow label="Confirmed orders" to="QuickBooks Invoice" direction="→" />
          <SyncRow label="Order status: fulfilled" to="QuickBooks Payment received" direction="→" />
          <SyncRow label="Customer accounts" to="QuickBooks Customer" direction="↔" />
          <SyncRow label="Stock adjustments" to="Inventory Qty Adjustment" direction="→" />
          <SyncRow label="Wholesale tier" to="Customer Type / Price level" direction="→" />
        </ul>
      </SettingsPanel>
    </div>
  )
}

function Row({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-ink-200/50 pb-3 last:border-0 last:pb-0">
      <dt className="text-xs font-semibold uppercase tracking-wider text-ink-500">{k}</dt>
      <dd className={`break-all text-right ${mono ? 'font-mono text-xs' : ''} font-medium text-ink-900`}>{v}</dd>
    </div>
  )
}

function SyncRow({ label, to, direction }: { label: string; to: string; direction: '→' | '↔' }) {
  return (
    <li className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-xl border border-ink-200/60 bg-paper-dim/50 px-3.5 py-2.5">
      <span className="font-medium text-ink-900">{label}</span>
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-prime-100 text-xs font-bold text-prime-800">
        {direction}
      </span>
      <span className="text-right text-ink-600">{to}</span>
    </li>
  )
}

function mask(s: string) {
  if (s.length <= 8) return '•'.repeat(s.length)
  return `${s.slice(0, 4)}…${s.slice(-4)}`
}
