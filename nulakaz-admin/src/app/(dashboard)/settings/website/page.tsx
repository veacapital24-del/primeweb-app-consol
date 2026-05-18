import { getWebsiteSettings, updateWebsiteSetting, deleteWebsiteSetting } from '@/lib/supabase'
import { SettingsPanel, SettingsStatusPill } from '../SettingsShell'
import { MaintenanceModeToggle } from '@/components/settings/MaintenanceModeToggle'
import { inputCls } from '@/components/admin/ui'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function WebsiteSettingsPage() {
  const settings = await getWebsiteSettings(true)
  const maintenanceSetting = settings.find(
    (s: { setting_name: string }) => s.setting_name === 'maintenance_mode',
  )
  const maintenanceEnabled = maintenanceSetting?.setting_value === 'true'
  const otherSettings = settings.filter(
    (s: { setting_name: string }) => s.setting_name !== 'maintenance_mode',
  )

  async function handleUpsert(formData: FormData) {
    'use server'
    const id = formData.get('id') as string | undefined
    const setting_name = (formData.get('setting_name') as string).trim()
    const setting_value = (formData.get('setting_value') as string | null) ?? null
    const data_type = (formData.get('data_type') as string).trim() || 'string'

    await updateWebsiteSetting({ id, setting_name, setting_value, data_type }, true)
    redirect('/settings/website')
  }

  async function handleDelete(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    await deleteWebsiteSetting(id, true)
    redirect('/settings/website')
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,340px)_1fr]">
      <SettingsPanel title="Add setting" subtitle="Create a new key-value pair for the storefront.">
        <form action={handleUpsert} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-ink-600">Setting name</span>
            <input type="text" name="setting_name" required placeholder="e.g. site_title" className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-ink-600">Value</span>
            <input type="text" name="setting_value" placeholder="e.g. NuLakaz - Online Grocery" className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-ink-600">Data type</span>
            <select name="data_type" className={inputCls} defaultValue="string">
              <option value="string">String</option>
              <option value="number">Number</option>
              <option value="boolean">Boolean</option>
              <option value="json">JSON</option>
            </select>
          </label>
          <button type="submit" className="settings-form-submit w-full justify-center">
            Add setting
          </button>
        </form>
      </SettingsPanel>

      <div className="space-y-6">
        <SettingsPanel
          title="Maintenance mode"
          subtitle="Take the public storefront offline while you deploy or run updates."
          badge={
            <SettingsStatusPill tone={maintenanceEnabled ? 'flash' : 'mint'}>
              {maintenanceEnabled ? 'Offline' : 'Live'}
            </SettingsStatusPill>
          }
        >
          <MaintenanceModeToggle
            settingId={maintenanceSetting?.id}
            enabled={maintenanceEnabled}
          />
        </SettingsPanel>

        <SettingsPanel
          title="Existing settings"
          subtitle={`${otherSettings.length} key${otherSettings.length === 1 ? '' : 's'} configured`}
        >
          {otherSettings.length === 0 ? (
            <p className="text-sm text-ink-500">No other settings yet. Add one on the left.</p>
          ) : (
            <ul className="divide-y divide-ink-200/70">
              {otherSettings.map((setting: {
                id: string
                setting_name: string
                setting_value: string | null
                data_type: string
              }) => (
                <li key={setting.id} className="py-4 first:pt-0 last:pb-0">
                  <form action={handleUpsert} className="space-y-3">
                    <input type="hidden" name="id" value={setting.id} />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-ink-500">
                          Name
                        </span>
                        <input
                          type="text"
                          name="setting_name"
                          defaultValue={setting.setting_name}
                          readOnly
                          className={`${inputCls} bg-canvas/60`}
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-ink-500">
                          Type
                        </span>
                        <input
                          type="text"
                          name="data_type"
                          defaultValue={setting.data_type}
                          readOnly
                          className={`${inputCls} bg-canvas/60`}
                        />
                      </label>
                    </div>
                    <label className="block">
                      <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-ink-500">
                        Value
                      </span>
                      <input
                        type="text"
                        name="setting_value"
                        defaultValue={setting.setting_value ?? ''}
                        className={inputCls}
                      />
                    </label>
                    <button
                      type="submit"
                      className="rounded-lg bg-prime-700 px-3 py-2 text-xs font-bold text-paper hover:bg-prime-800"
                    >
                      Update
                    </button>
                  </form>
                  <form action={handleDelete} className="mt-2">
                    <input type="hidden" name="id" value={setting.id} />
                    <button type="submit" className="text-xs font-semibold text-flash-600 hover:text-flash-700">
                      Delete
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </SettingsPanel>
      </div>
    </div>
  )
}
