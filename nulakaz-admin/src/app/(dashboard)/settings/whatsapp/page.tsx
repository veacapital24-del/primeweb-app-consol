import { adminClient } from '@/lib/supabase'
import { SettingForm } from '../SettingForm'
import { SettingsPanel, SettingsStatusPill } from '../SettingsShell'

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
        subtitle="Channel availability and Cloud API webhook settings."
        values={values}
        fields={[
          { name: 'enabled', label: 'WhatsApp ordering active', type: 'bool', hint: 'When off, the storefront hides WhatsApp CTAs.' },
          { name: 'auto_reply', label: 'Auto-reply on inbound', type: 'bool', hint: 'Requires Cloud API credentials.' },
          { name: 'business_hours', label: 'Business hours', type: 'text', placeholder: '9h-18h Lundi-Samedi' },
          { name: 'verify_token', label: 'Webhook verify token', type: 'text', hint: 'Must match the Meta dashboard value.' },
        ]}
      />

      <SettingsPanel
        title="Cloud API setup"
        badge={
          <SettingsStatusPill tone={cloudConfigured ? 'mint' : 'amber'}>
            {cloudConfigured ? 'Connected' : 'Deep-link only'}
          </SettingsStatusPill>
        }
      >
        <p className="text-sm leading-relaxed text-ink-700">
          Without the Cloud API token the storefront still works — the order button opens
          <code className="mx-1 rounded-md bg-canvas px-1.5 py-0.5 font-mono text-[11px] text-prime-800">wa.me</code>
          with a prefilled message. Set the secrets below in Vercel to enable auto-confirmations and template messages.
        </p>

        <pre className="mt-4 overflow-x-auto rounded-xl bg-ink-950 px-4 py-3.5 font-mono text-[11px] leading-relaxed text-paper/90">
{`# In Vercel → Settings → Environment Variables
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_ACCESS_TOKEN=...

# Then deploy the edge functions
supabase functions deploy whatsapp-webhook --no-verify-jwt
supabase functions deploy whatsapp-send`}
        </pre>

        <p className="mt-4 text-[11px] text-ink-500">
          Once tokens are present, the <strong className="font-semibold text-ink-700">Auto-reply</strong> toggle above starts dispatching outbound messages.
        </p>
      </SettingsPanel>
    </div>
  )
}
