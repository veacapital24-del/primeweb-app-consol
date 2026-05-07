import { adminClient } from '@/lib/supabase'
import { PageHeader } from '@/components/PageHeader'
import { SettingForm } from './SettingForm'

export const dynamic = 'force-dynamic'

type Setting = { key: string; value: Record<string, unknown> }

export default async function SettingsPage() {
  const sb = adminClient()
  const { data } = await sb.from('app_settings').select('key, value').returns<Setting[]>()
  const map = new Map((data ?? []).map((r) => [r.key, r.value]))

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Business info, shipping, and channel configuration"
        breadcrumbs={[{ label: 'Admin' }, { label: 'Settings' }]}
      />

      <div className="space-y-6">
        <SettingForm
          settingKey="business"
          title="Business"
          subtitle="Your storefront identity"
          values={map.get('business') ?? {}}
          fields={[
            { name: 'name',    label: 'Trade name', type: 'text', placeholder: 'Primeweb' },
            { name: 'tagline', label: 'Tagline',    type: 'text', placeholder: 'Hard discount + B2B + social' },
            { name: 'phone',   label: 'WhatsApp business phone', type: 'tel', hint: 'E.164 without the +, e.g. 23057000000' },
            { name: 'address', label: 'Address',    type: 'text', placeholder: 'Port Louis, Mauritius' },
            { name: 'vat_id',  label: 'VAT / BRN',  type: 'text', placeholder: 'Optional' },
          ]}
        />

        <SettingForm
          settingKey="shipping"
          title="Shipping & checkout"
          subtitle="Storefront and order summary use these values"
          values={map.get('shipping') ?? {}}
          fields={[
            { name: 'free_threshold_mur', label: 'Free shipping above', type: 'number', suffix: 'Rs', hint: 'Shown as a progress bar in the cart' },
            { name: 'default_fee_mur',    label: 'Default delivery fee', type: 'number', suffix: 'Rs' },
            { name: 'currency',           label: 'Currency code', type: 'text', placeholder: 'MUR' },
          ]}
        />

        <SettingForm
          settingKey="whatsapp"
          title="WhatsApp"
          subtitle="Cloud API + business hours"
          values={map.get('whatsapp') ?? {}}
          fields={[
            { name: 'enabled',         label: 'WhatsApp ordering active', type: 'bool', hint: 'When off, the storefront hides WhatsApp CTAs.' },
            { name: 'auto_reply',      label: 'Auto-reply on inbound',     type: 'bool', hint: 'Requires Cloud API credentials.' },
            { name: 'business_hours',  label: 'Business hours', type: 'text', placeholder: '9h-18h Lundi-Samedi' },
            { name: 'verify_token',    label: 'Webhook verify token', type: 'text', hint: 'Must match the Meta dashboard value.' },
          ]}
        />

        <section className="rounded-2xl border border-ink-300/60 bg-paper p-5">
          <h2 className="font-display text-lg font-black tracking-tight">Integrations</h2>
          <p className="mt-1 text-xs text-ink-500">Configure the WhatsApp Cloud API + Supabase secrets via the CLI.</p>
          <div className="mt-3 space-y-2 rounded-xl bg-paper-dim/60 p-3 font-mono text-[11px] text-ink-700">
            <div>$ supabase secrets set WHATSAPP_PHONE_NUMBER_ID=…</div>
            <div>$ supabase secrets set WHATSAPP_ACCESS_TOKEN=…</div>
            <div>$ supabase functions deploy whatsapp-webhook --no-verify-jwt</div>
            <div>$ supabase functions deploy whatsapp-send</div>
          </div>
          <p className="mt-3 text-xs text-ink-500">
            Once tokens are set, the <strong>Auto-reply</strong> toggle above will start dispatching outbound messages.
          </p>
        </section>
      </div>
    </div>
  )
}
