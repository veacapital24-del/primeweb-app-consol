import { NavIcon } from '@/components/nav/NavIcon'
import { PageHeader } from '@/components/PageHeader'
import { ButtonLink, ModuleLinkCard, PageMain, Panel } from '@/components/ui'
import { POS_NAV } from '@/lib/nav'
import { getMe } from '@/lib/auth'
import { firstName, formatHubDate, timeGreeting } from '@/lib/greeting'

export const dynamic = 'force-dynamic'

export default async function PosHubPage() {
  const me = await getMe()
  const greeting = timeGreeting()
  const name = firstName(me.full_name, me.email)
  const today = formatHubDate()

  const quickModules = POS_NAV.flatMap((s) => s.items).filter(
    (item) => item.href && !item.external && !item.disabled && item.id !== 'hub',
  )

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Choose a module from the menu, or use the shortcuts below."
        breadcrumbs={[{ label: 'Dashboard' }]}
        actions={
          <ButtonLink href="/register">
            Open register
            <span aria-hidden>→</span>
          </ButtonLink>
        }
      />

      <PageMain spacing="loose">
        <section className="glass-card p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-500">{today}</p>
          <h2 className="mt-1 font-display text-2xl font-black tracking-tight text-ink-900 sm:text-3xl">
            {greeting}, {name}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-700">
            Use the left menu to open any module. For selling, open the register or start a shift first.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <ButtonLink href="/register" variant="primary" className="gap-2">
              <NavIcon id="register" className="h-4 w-4" />
              Register
            </ButtonLink>
            <ButtonLink href="/shifts/open" variant="secondary" className="gap-2">
              <NavIcon id="shifts" className="h-4 w-4 text-prime-700" />
              Open shift
            </ButtonLink>
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-ink-500">All modules</h3>
          <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {quickModules.map((item) => (
              <li key={item.id}>
                <ModuleLinkCard
                  href={item.href!}
                  icon={<NavIcon id={item.icon} className="h-5 w-5" />}
                  label={item.label}
                  description={item.description}
                />
              </li>
            ))}
          </ul>
        </section>
      </PageMain>
    </>
  )
}
