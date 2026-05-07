import { adminClient } from '@/lib/supabase'
import { SettingForm } from '../SettingForm'

export const dynamic = 'force-dynamic'

type Setting = { key: string; value: Record<string, unknown> }

export default async function WhatsAppSettingsPage() {
  const sb = adminClient()
  const { data } = await sb.from('app_settings').select('key, value').eq('key', 'whatsapp').returns<Setting[]>()
  const values = data?.[0]?.value ?? {}

  return (
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
  )
}
