export const dynamic = 'force-dynamic'

export default function IntegrationsPage() {
  const quickbooksConfigured =
    !!process.env.QUICKBOOKS_CLIENT_ID &&
    !!process.env.QUICKBOOKS_CLIENT_SECRET &&
    !!process.env.QUICKBOOKS_REALM_ID

  const region = process.env.QUICKBOOKS_REGION || 'sandbox'

  return (
    <div className="space-y-5">
      <header>
        <h2 className="font-display text-2xl font-black tracking-tight">Integrations</h2>
        <p className="mt-1 text-sm text-ink-500">External services Primeweb depends on.</p>
      </header>

      <Card
        title="QuickBooks Online"
        right={
          <Pill tone={quickbooksConfigured ? 'mint' : 'amber'}>
            {quickbooksConfigured ? 'Connected' : 'Not connected'}
          </Pill>
        }
      >
        <p className="text-sm text-ink-700">
          Sync confirmed orders, customer records, and stock adjustments into QuickBooks Online so accounting stays in
          one place. Once connected, every fulfilled order posts an Invoice + Payment in QuickBooks; warehouse
          adjustments post Inventory Quantity Adjustments tagged with the Primeweb reason.
        </p>

        <dl className="mt-4 grid gap-1.5 text-sm">
          <Row k="Environment" v={region} mono />
          <Row k="Realm ID"    v={process.env.QUICKBOOKS_REALM_ID ?? '—'} mono />
          <Row k="Client ID"   v={process.env.QUICKBOOKS_CLIENT_ID ? mask(process.env.QUICKBOOKS_CLIENT_ID) : '—'} mono />
        </dl>

        {!quickbooksConfigured && (
          <pre className="mt-4 overflow-x-auto rounded-xl bg-ink-900 px-4 py-3 font-mono text-[11px] leading-relaxed text-paper">
{`# Set in Vercel → Settings → Environment Variables
QUICKBOOKS_CLIENT_ID=...
QUICKBOOKS_CLIENT_SECRET=...
QUICKBOOKS_REALM_ID=...           # company file ID
QUICKBOOKS_REGION=sandbox          # or "production"
QUICKBOOKS_REDIRECT_URI=https://primewebappconsol.prumira.com/api/quickbooks/callback`}
          </pre>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <a
            href={quickbooksConfigured ? '/api/quickbooks/connect' : 'https://developer.intuit.com/app/developer/qbo/docs/develop'}
            target={quickbooksConfigured ? '_self' : '_blank'}
            rel="noreferrer"
            className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${
              quickbooksConfigured
                ? 'bg-prime-700 text-paper hover:bg-prime-800'
                : 'border border-ink-300 bg-paper text-ink-900 hover:border-ink-700'
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
      </Card>

      <Card title="What syncs">
        <ul className="grid gap-2 text-sm">
          <SyncRow label="Confirmed orders"     to="QuickBooks Invoice"             direction="→" />
          <SyncRow label="Order status: fulfilled" to="QuickBooks Payment received" direction="→" />
          <SyncRow label="Customer accounts"    to="QuickBooks Customer"            direction="↔" />
          <SyncRow label="Stock adjustments"    to="Inventory Qty Adjustment"       direction="→" />
          <SyncRow label="Wholesale tier"       to="Customer Type / Price level"    direction="→" />
        </ul>
      </Card>
    </div>
  )
}

function Card({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-paper p-5 ring-1 ring-ink-200">
      <header className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-ink-500">{title}</h3>
        {right}
      </header>
      <div className="space-y-1">{children}</div>
    </section>
  )
}

function Row({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-xs text-ink-500">{k}</dt>
      <dd className={`break-all text-right ${mono ? 'font-mono text-xs' : ''} text-ink-900`}>{v}</dd>
    </div>
  )
}

function Pill({ tone, children }: { tone: 'mint' | 'amber'; children: React.ReactNode }) {
  const cls = tone === 'mint' ? 'bg-mint-100 text-mint-600' : 'bg-amber-50 text-amber-700'
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${tone === 'mint' ? 'bg-mint-500' : 'bg-amber-500'}`} />
      {children}
    </span>
  )
}

function SyncRow({ label, to, direction }: { label: string; to: string; direction: '→' | '↔' }) {
  return (
    <li className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-xl bg-paper-dim/40 px-3 py-2">
      <span className="text-ink-900">{label}</span>
      <span className="text-xs font-bold text-prime-700">{direction}</span>
      <span className="text-right text-ink-700">{to}</span>
    </li>
  )
}

function mask(s: string) {
  if (s.length <= 8) return '•'.repeat(s.length)
  return `${s.slice(0, 4)}…${s.slice(-4)}`
}
