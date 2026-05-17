import { adminClient } from './supabase'

export type BusinessSettings = {
  name: string
  phone: string | null
  address: string | null
  vat_id: string | null
  tagline: string | null
}

export type PosSettings = {
  receipt_header: string | null
  receipt_footer: string | null
  email_subject: string | null
  default_float_mur: number | null
  low_stock_threshold: number | null
}

const DEFAULTS: PosSettings = {
  receipt_header: null,
  receipt_footer: null,
  email_subject: 'Receipt {{number}} — {{business}}',
  default_float_mur: 0,
  low_stock_threshold: 5,
}

// Fetch one or more app_settings rows and return them as a typed map.
// Uses the admin client so settings are visible regardless of RLS.
export async function getSettings() {
  const admin = adminClient()
  const { data } = await admin.from('app_settings').select('key, value').in('key', ['business', 'pos'])
  const byKey = new Map((data ?? []).map((r) => [r.key as string, r.value as Record<string, unknown>]))

  const biz = byKey.get('business') ?? {}
  const pos = byKey.get('pos') ?? {}

  const business: BusinessSettings = {
    name: String(biz.name ?? 'NuLakaz'),
    phone: (biz.phone as string) ?? null,
    address: (biz.address as string) ?? null,
    vat_id: (biz.vat_id as string) ?? null,
    tagline: (biz.tagline as string) ?? null,
  }

  const posSettings: PosSettings = {
    receipt_header: (pos.receipt_header as string) ?? DEFAULTS.receipt_header,
    receipt_footer: (pos.receipt_footer as string) ?? DEFAULTS.receipt_footer,
    email_subject: (pos.email_subject as string) ?? DEFAULTS.email_subject,
    default_float_mur:
      typeof pos.default_float_mur === 'number'
        ? pos.default_float_mur
        : DEFAULTS.default_float_mur,
    low_stock_threshold:
      typeof pos.low_stock_threshold === 'number'
        ? pos.low_stock_threshold
        : DEFAULTS.low_stock_threshold,
  }

  return { business, pos: posSettings }
}

// Render the email subject template with sale-specific tokens.
export function renderTemplate(
  tpl: string | null,
  tokens: { number: string; business: string; total: string },
) {
  const fallback = DEFAULTS.email_subject!
  return (tpl && tpl.trim() ? tpl : fallback)
    .replaceAll('{{number}}', tokens.number)
    .replaceAll('{{business}}', tokens.business)
    .replaceAll('{{total}}', tokens.total)
}
