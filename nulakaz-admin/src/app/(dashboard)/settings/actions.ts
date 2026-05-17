'use server'

import { revalidatePath } from 'next/cache'
import { adminClient } from '@/lib/supabase'

export async function saveSettings(key: string, form: FormData) {
  const sb = adminClient()
  const value: Record<string, unknown> = {}
  for (const [k, v] of form.entries()) {
    if (k.startsWith('_')) continue
    if (v === 'on') value[k] = true
    else if (typeof v === 'string' && /^-?\d+(\.\d+)?$/.test(v)) value[k] = Number(v)
    else value[k] = v
  }

  // For checkboxes that aren't checked, FormData simply omits them — patch the missing ones to false
  // by inspecting the hidden _bools field which lists all checkbox keys.
  const boolKeys = String(form.get('_bools') ?? '').split(',').filter(Boolean)
  for (const bk of boolKeys) {
    if (!(bk in value)) value[bk] = false
  }

  const { error } = await sb
    .from('app_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() })
  if (error) throw new Error(error.message)
  revalidatePath('/settings')
}
