import { adminClient } from '@/lib/supabase'
import { SettingForm } from '../SettingForm'

export const dynamic = 'force-dynamic'

type Setting = { key: string; value: Record<string, unknown> }

export default async function PosSettingsPage() {
  const sb = adminClient()
  const { data } = await sb
    .from('app_settings')
    .select('key, value')
    .eq('key', 'pos')
    .returns<Setting[]>()

  const values = data?.[0]?.value ?? {}

  return (
    <SettingForm
      settingKey="pos"
      title="POS"
      subtitle="Receipt format, shift defaults, and other POS-only options. Read by the Prime POS app."
      values={values}
      fields={[
        {
          name: 'receipt_header',
          label: 'Receipt header',
          type: 'textarea',
          rows: 2,
          placeholder: 'Welcome to our shop',
          hint: 'Extra line(s) above the business name on every receipt. Leave blank to omit.',
        },
        {
          name: 'receipt_footer',
          label: 'Receipt footer',
          type: 'textarea',
          rows: 3,
          placeholder: 'Thank you! Returns within 7 days with this receipt.',
          hint: 'Replaces the default "Thank you / Keep this receipt" footer.',
        },
        {
          name: 'email_subject',
          label: 'Email subject template',
          type: 'text',
          placeholder: 'Receipt {{number}} — {{business}}',
          hint: 'Tokens: {{number}}, {{business}}, {{total}}',
        },
        {
          name: 'default_float_mur',
          label: 'Default opening cash float',
          type: 'number',
          suffix: 'Rs',
          hint: 'Pre-fills the "Opening float" field when a cashier opens a shift.',
        },
        {
          name: 'low_stock_threshold',
          label: 'Low-stock badge threshold',
          type: 'number',
          suffix: 'units',
          hint: 'Below this on-hand count, the register grid shows an amber badge.',
        },
      ]}
    />
  )
}
