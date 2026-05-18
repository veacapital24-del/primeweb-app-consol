import { adminClient } from '@/lib/supabase'
import { SettingForm } from '../SettingForm'

export const dynamic = 'force-dynamic'

type Setting = { key: string; value: Record<string, unknown> }

export default async function BusinessSettingsPage() {
  const sb = adminClient()
  const { data } = await sb.from('app_settings').select('key, value').eq('key', 'business').returns<Setting[]>()
  const values = data?.[0]?.value ?? {}

  return (
    <SettingForm
      settingKey="business"
      subtitle="Your storefront identity — used in the WhatsApp message, footer, and emails."
      values={values}
      fields={[
        { name: 'name',    label: 'Trade name', type: 'text', placeholder: 'Primeweb' },
        { name: 'tagline', label: 'Tagline',    type: 'text', placeholder: 'Hard discount + B2B + social' },
        { name: 'phone',   label: 'WhatsApp business phone', type: 'tel', hint: 'E.164 without the +, e.g. 23057000000' },
        { name: 'address', label: 'Address',    type: 'text', placeholder: 'Port Louis, Mauritius' },
        { name: 'vat_id',  label: 'VAT / BRN',  type: 'text', placeholder: 'Optional' },
      ]}
    />
  )
}
