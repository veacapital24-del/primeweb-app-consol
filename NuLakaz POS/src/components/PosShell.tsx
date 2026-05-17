import { PosSidebar } from '@/components/nav/PosSidebar'
import { getMe } from '@/lib/auth'

export async function PosShell({ children }: { children: React.ReactNode }) {
  const me = await getMe()

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <PosSidebar me={me} />
      <main className="dashboard-canvas min-w-0 flex-1">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10">{children}</div>
      </main>
    </div>
  )
}
