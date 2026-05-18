import { adminClient } from '@/lib/supabase'
import { SettingForm } from '../SettingForm'

export const dynamic = 'force-dynamic'

type Setting = { key: string; value: Record<string, unknown> }

export default async function ShippingSettingsPage() {
  const sb = adminClient()
  const { data } = await sb.from('app_settings').select('key, value').eq('key', 'shipping').returns<Setting[]>()
  const values = data?.[0]?.value ?? {}

  return (
    <SettingForm
      settingKey="shipping"
      subtitle="The storefront cart progress bar and order summary read these values."
      values={values}
      fields={[
        { name: 'free_threshold_mur', label: 'Free shipping above', type: 'number', suffix: 'Rs', hint: 'Storefront cart shows a live progress bar to this amount' },
        { name: 'default_fee_mur',    label: 'Default delivery fee', type: 'number', suffix: 'Rs' },
        { name: 'currency',           label: 'Currency code',        type: 'text',   placeholder: 'MUR' },
      ]}
    />
  )
}
