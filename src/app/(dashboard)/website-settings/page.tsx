import { PageHeader } from '@/components/PageHeader'
import { getWebsiteSettings, updateWebsiteSetting, deleteWebsiteSetting } from '@/lib/supabase'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function WebsiteSettingsPage() {
  const settings = await getWebsiteSettings(true)

  async function handleUpsert(formData: FormData) {
    'use server'
    const id = formData.get('id') as string | undefined
    const setting_name = (formData.get('setting_name') as string).trim()
    const setting_value = (formData.get('setting_value') as string | null) ?? null
    const data_type = (formData.get('data_type') as string).trim() || 'string'

    await updateWebsiteSetting({ id, setting_name, setting_value, data_type }, true)
    redirect('/website-settings')
  }

  async function handleDelete(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    await deleteWebsiteSetting(id, true)
    redirect('/website-settings')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Website Settings"
        subtitle="Manage dynamic configuration used across the site."
        breadcrumbs={[{ label: 'Admin' }, { label: 'Settings' }, { label: 'Website Settings' }]}
      />

      <div className="grid gap-6 md:grid-cols-[360px_1fr]">
        <form action={handleUpsert} className="space-y-4 rounded-2xl border border-ink-200/70 bg-paper p-5 shadow-sm">
          <h2 className="text-lg font-bold text-ink-900">Add New Setting</h2>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-ink-700">
              Setting Name
              <input
                type="text"
                name="setting_name"
                required
                placeholder="e.g. site_title"
                className="mt-1 w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm focus:border-prime-500 focus:outline-none"
              />
            </label>
            <label className="block text-sm font-semibold text-ink-700">
              Setting Value
              <input
                type="text"
                name="setting_value"
                placeholder="e.g. NuLakaz - Online Grocery"
                className="mt-1 w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm focus:border-prime-500 focus:outline-none"
              />
            </label>
            <label className="block text-sm font-semibold text-ink-700">
              Data Type
              <select
                name="data_type"
                className="mt-1 w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm focus:border-prime-500 focus:outline-none"
                defaultValue="string"
              >
                <option value="string">String</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
                <option value="json">JSON</option>
              </select>
            </label>
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-lg bg-prime-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-prime-800"
          >
            Add Setting
          </button>
        </form>

        <div className="space-y-4 rounded-2xl border border-ink-200/70 bg-paper p-5 shadow-sm">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-bold text-ink-900">Existing Settings</h2>
            <span className="text-xs text-ink-500">{settings.length} total</span>
          </div>

          {settings.length === 0 ? (
            <p className="text-sm text-ink-600">No settings yet. Add your first setting on the left.</p>
          ) : (
            <div className="divide-y divide-ink-100 border border-ink-100 rounded-xl">
              {settings.map((setting: any) => (
                <div key={setting.id} className="p-4 space-y-3">
                  <form action={handleUpsert} className="space-y-2">
                    <input type="hidden" name="id" value={setting.id} />
                    <label className="block text-xs font-bold text-ink-500">
                      Setting Name
                      <input
                        type="text"
                        name="setting_name"
                        defaultValue={setting.setting_name}
                        readOnly
                        className="mt-1 w-full rounded-lg border border-ink-200 bg-ink-50 px-3 py-2 text-sm text-ink-800"
                      />
                    </label>
                    <label className="block text-xs font-bold text-ink-500">
                      Setting Value
                      <input
                        type="text"
                        name="setting_value"
                        defaultValue={setting.setting_value ?? ''}
                        className="mt-1 w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 focus:border-prime-500 focus:outline-none"
                      />
                    </label>
                    <label className="block text-xs font-bold text-ink-500">
                      Data Type
                      <input
                        type="text"
                        name="data_type"
                        defaultValue={setting.data_type}
                        readOnly
                        className="mt-1 w-full rounded-lg border border-ink-200 bg-ink-50 px-3 py-2 text-sm text-ink-800"
                      />
                    </label>
                    <div className="flex gap-2 pt-1">
                      <button
                        type="submit"
                        className="rounded-lg bg-prime-700 px-3 py-2 text-sm font-semibold text-white hover:bg-prime-800"
                      >
                        Update
                      </button>
                      <form action={handleDelete} className="inline">
                        <input type="hidden" name="id" value={setting.id} />
                        <button
                          type="submit"
                          className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </form>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}