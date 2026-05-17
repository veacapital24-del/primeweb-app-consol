import { PageHeader } from '@/components/PageHeader'

type Crumb = { label: string; href?: string }

/** Page title bar — use inside {@link PosShell} layout (sidebar + canvas). */
export function Topbar({
  title,
  subtitle,
  breadcrumbs,
  actions,
}: {
  title: string
  subtitle?: string
  breadcrumbs?: Crumb[]
  actions?: React.ReactNode
}) {
  return (
    <PageHeader
      title={title}
      subtitle={subtitle}
      breadcrumbs={breadcrumbs}
      actions={actions}
    />
  )
}
