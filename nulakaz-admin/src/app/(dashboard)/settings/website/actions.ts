'use server'

import { revalidatePath } from 'next/cache'
import { updateWebsiteSetting } from '@/lib/supabase'

export async function setMaintenanceMode(formData: FormData) {
  const enabled = formData.get('enabled') === 'true'
  const id = (formData.get('id') as string) || undefined

  await updateWebsiteSetting(
    {
      id,
      setting_name: 'maintenance_mode',
      setting_value: enabled ? 'true' : 'false',
      data_type: 'boolean',
    },
    true,
  )

  revalidatePath('/settings/website')
}
