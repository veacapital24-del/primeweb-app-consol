import { adminClient } from '@/lib/supabase'
import { SettingForm } from '../SettingForm'

export const dynamic = 'force-dynamic'

type Setting = { key: string; value: Record<string, unknown> }

export default async function WhatsAppSettingsPage() {
  const sb = adminClient()
  const { data } = await sb.from('app_settings').select('key, value').eq('key', 'whatsapp').returns<Setting[]>()
  const values = data?.[0]?.value ?? {}

  const cloudConfigured = !!process.env.WHATSAPP_PHONE_NUMBER_ID && !!process.env.WHATSAPP_ACCESS_TOKEN

  return (
    <div className="space-y-6">
      <SettingForm
        settingKey="whatsapp"
        title="WhatsApp"
        subtitle="Channel availability + Cloud API webhook settings."
        values={values}
        fields={[
          { name: 'enabled',        label: 'WhatsApp ordering active', type: 'bool', hint: 'When off, the storefront hides WhatsApp CTAs.' },
          { name: 'auto_reply',     label: 'Auto-reply on inbound',    type: 'bool', hint: 'Requires Cloud API credentials.' },
          { name: 'business_hours', label: 'Business hours',           type: 'text', placeholder: '9h-18h Lundi-Samedi' },
          { name: 'verify_token',   label: 'Webhook verify token',     type: 'text', hint: 'Must match the Meta dashboard value.' },
        ]}
      />

      <section className="rounded-2xl bg-paper p-5 ring-1 ring-ink-200">
        <header className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-ink-500">Cloud API setup</h3>
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
            cloudConfigured
              ? 'bg-mint-100 text-mint-600'
              : 'bg-amber-50 text-amber-700'
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${cloudConfigured ? 'bg-mint-500' : 'bg-amber-500'}`} />
            {cloudConfigured ? 'Connected' : 'Deep-link only'}
          </span>
        </header>

        <p className="text-sm text-ink-700">
          Without the Cloud API token the storefront still works — the order button opens
          <code className="mx-1 rounded bg-paper-dim px-1.5 py-0.5 text-[11px]">wa.me</code>
          with a prefilled message. Set the secrets below in Vercel to enable auto-confirmations and template messages.
        </p>

        <pre className="mt-3 overflow-x-auto rounded-xl bg-ink-900 px-4 py-3 font-mono text-[11px] leading-relaxed text-paper">
{`# In Vercel → Settings → Environment Variables
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_ACCESS_TOKEN=...

# Then deploy the edge functions
supabase functions deploy whatsapp-webhook --no-verify-jwt
supabase functions deploy whatsapp-send`}
        </pre>

        <p className="mt-3 text-[11px] text-ink-500">
          Once tokens are present, the <strong>Auto-reply</strong> toggle above starts dispatching outbound messages.
        </p>
      </section>
    </div>
  )
}
