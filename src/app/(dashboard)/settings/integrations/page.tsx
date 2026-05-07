export const dynamic = 'force-dynamic'

export default function IntegrationsPage() {
  const supabaseProject = process.env.NEXT_PUBLIC_SUPABASE_URL?.match(/^https:\/\/([a-z0-9]+)\.supabase\.co/)?.[1]

  return (
    <div className="space-y-5">
      <header>
        <h2 className="font-display text-2xl font-black tracking-tight">Integrations</h2>
        <p className="mt-1 text-sm text-ink-500">External services Primeweb depends on.</p>
      </header>

      <Card
        title="Supabase"
        right={<Pill tone="mint">Connected</Pill>}
      >
        <Row k="Project ref" v={supabaseProject ?? '—'} mono />
        <Row k="API URL"     v={process.env.NEXT_PUBLIC_SUPABASE_URL ?? '—'} mono />
        <Row k="Region"      v="ap-south-1 · Mumbai" />
        {supabaseProject && (
          <a
            href={`https://supabase.com/dashboard/project/${supabaseProject}`}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-prime-700 underline"
          >
            Open Supabase dashboard ↗
          </a>
        )}
      </Card>

      <Card
        title="WhatsApp Cloud API"
        right={<Pill tone={process.env.WHATSAPP_ACCESS_TOKEN ? 'mint' : 'amber'}>
          {process.env.WHATSAPP_ACCESS_TOKEN ? 'Connected' : 'Deep-link only'}
        </Pill>}
      >
        <p className="text-sm text-ink-700">
          Without the Cloud API token the storefront still works — the order button opens
          <code className="mx-1 rounded bg-paper-dim px-1.5 py-0.5 text-[11px]">wa.me</code>
          with a prefilled message. Set the secrets below to enable auto-confirmations.
        </p>
        <pre className="mt-3 overflow-x-auto rounded-xl bg-ink-900 px-4 py-3 font-mono text-[11px] leading-relaxed text-paper">
{`# In Vercel → Settings → Environment Variables
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_ACCESS_TOKEN=...

# Then deploy the edge functions
supabase functions deploy whatsapp-webhook --no-verify-jwt
supabase functions deploy whatsapp-send`}
        </pre>
      </Card>

      <Card title="Vercel deployment">
        <Row k="Storefront" v="primewebshop.prumira.com" />
        <Row k="Admin"      v="primewebappconsol.prumira.com" />
        <Row k="Pipeline"   v="GitHub push → auto-deploy" />
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
      <div className="space-y-1.5 text-sm">{children}</div>
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
  const cls = tone === 'mint'
    ? 'bg-mint-100 text-mint-600'
    : 'bg-amber-50 text-amber-700'
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${tone === 'mint' ? 'bg-mint-500' : 'bg-amber-500'}`} />
      {children}
    </span>
  )
}
