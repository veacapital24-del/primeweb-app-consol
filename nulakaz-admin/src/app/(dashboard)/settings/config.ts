export type SettingsGroupId = 'store' | 'channels' | 'people' | 'system'

export type SettingsSection = {
  href: string
  label: string
  desc: string
  group: SettingsGroupId
}

export const SETTINGS_GROUPS: { id: SettingsGroupId; label: string }[] = [
  { id: 'store', label: 'Store' },
  { id: 'channels', label: 'Channels' },
  { id: 'people', label: 'People' },
  { id: 'system', label: 'System' },
]

export const SETTINGS_SECTIONS: SettingsSection[] = [
  { href: '/settings/business', label: 'Business', desc: 'Trade name, contact, VAT', group: 'store' },
  { href: '/settings/shipping', label: 'Shipping', desc: 'Free threshold, delivery fees', group: 'store' },
  { href: '/settings/pos', label: 'POS', desc: 'Receipts, shifts, defaults', group: 'store' },
  { href: '/settings/whatsapp', label: 'WhatsApp', desc: 'Channel + Cloud API', group: 'channels' },
  { href: '/settings/website', label: 'Website', desc: 'Maintenance, site config', group: 'channels' },
  { href: '/settings/team', label: 'Admin users', desc: 'Roles and access', group: 'people' },
  { href: '/settings/integrations', label: 'Integrations', desc: 'QuickBooks, external APIs', group: 'system' },
]

export function getActiveSection(pathname: string): SettingsSection | undefined {
  return SETTINGS_SECTIONS.find(
    (s) => pathname === s.href || pathname.startsWith(`${s.href}/`),
  )
}
