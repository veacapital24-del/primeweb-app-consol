import { PageHeader } from '@/components/PageHeader'
import { SettingsNav } from './SettingsNav'

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Business, channels, team, and customers"
        breadcrumbs={[{ label: 'Admin' }, { label: 'Settings' }]}
      />
      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        <aside className="md:sticky md:top-6 md:self-start">
          <SettingsNav />
        </aside>
        <main className="min-w-0 space-y-6">{children}</main>
      </div>
    </div>
  )
}
