import { PageHeader } from '@/components/PageHeader'
import { SettingsNav } from './SettingsNav'
import { SettingsContentHeader } from './SettingsShell'

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="settings-layout">
      <PageHeader
        title="Settings"
        subtitle="Configure your store, channels, team access, and integrations"
        breadcrumbs={[{ label: 'Admin', href: '/' }, { label: 'Settings' }]}
      />

      <div className="settings-layout-grid">
        <aside className="settings-layout-aside">
          <div className="settings-nav-card">
            <p className="settings-nav-card-title">Sections</p>
            <SettingsNav />
          </div>
        </aside>

        <div className="settings-layout-main min-w-0">
          <SettingsContentHeader />
          <div className="settings-layout-content">{children}</div>
        </div>
      </div>
    </div>
  )
}
