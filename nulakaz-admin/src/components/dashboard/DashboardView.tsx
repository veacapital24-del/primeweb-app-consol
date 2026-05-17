import Link from 'next/link'

export type DashboardData = {
  greeting: string
  dateLabel: string
  metrics: {
    products: number
    pending: number
    revenue: number
    revenueFormatted: string
    ordersWeek: number
    stockAlerts: number
    soldOut: number
    lowStock: number
  }
  channelMix: Record<string, number>
  channelTotal: number
  wholesaleShare: number
  whatsappCount: number
  stock: {
    soldOut: { id: string; name: string }[]
    low: { id: string; name: string; available: number }[]
  }
  orders: {
    id: string
    order_number: string
    channel: string
    is_wholesale: boolean
    subtotal_mur: number
    status: string
    created_at: string
    customer_name: string | null
  }[]
}

export function DashboardView({ data }: { data: DashboardData }) {
  const { metrics, stock } = data
  const stockCount = stock.soldOut.length + stock.low.length

  return (
    <div className="dashboard space-y-6 md:space-y-8">
      {/* Hero */}
      <section className="dashboard-hero relative overflow-hidden rounded-[1.75rem] px-6 py-8 text-paper shadow-2xl shadow-prime-900/25 md:px-10 md:py-10">
        <div className="dashboard-hero-glow pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="text-sm font-medium text-prime-100/90">{data.dateLabel}</p>
            <h1 className="font-display mt-2 text-3xl font-black tracking-tight md:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
              {data.greeting}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-prime-100/80 md:text-base">
              Your store at a glance — catalog health, orders, channels, and stock in one place.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link href="/products/new" className="dashboard-cta-primary">
              <IconPlus />
              New product
            </Link>
            <Link href="/orders" className="dashboard-cta-secondary">
              View orders
            </Link>
          </div>
        </div>
        <dl className="relative z-10 mt-8 grid grid-cols-2 gap-3 border-t border-white/15 pt-6 sm:grid-cols-4">
          <HeroStat label="Week revenue" value={data.metrics.revenueFormatted} />
          <HeroStat label="Orders (7d)" value={String(metrics.ordersWeek)} />
          <HeroStat label="Pending" value={String(metrics.pending)} highlight={metrics.pending > 0} />
          <HeroStat label="Alerts" value={String(metrics.stockAlerts)} highlight={metrics.soldOut > 0} />
        </dl>
      </section>

      {/* Metric tiles — overlap hero */}
      <section
        aria-label="Key metrics"
        className="relative z-20 -mt-2 grid gap-3 sm:grid-cols-2 xl:grid-cols-4 xl:gap-4"
      >
        <MetricTile
          href="/products"
          label="Active products"
          value={metrics.products}
          sub="In catalog"
          accent="neutral"
          icon={<IconBox />}
        />
        <MetricTile
          href="/orders?status=pending"
          label="Pending orders"
          value={metrics.pending}
          sub="Need action"
          accent={metrics.pending > 0 ? 'amber' : 'neutral'}
          icon={<IconClock />}
        />
        <MetricTile
          href="/orders"
          label="Revenue"
          value={data.metrics.revenueFormatted}
          sub={`${metrics.ordersWeek} orders · 7 days`}
          accent="prime"
          icon={<IconChart />}
          large
        />
        <MetricTile
          href="/inventory"
          label="Stock alerts"
          value={metrics.stockAlerts}
          sub={`${metrics.soldOut} out · ${metrics.lowStock} low`}
          accent={metrics.soldOut > 0 ? 'flash' : 'neutral'}
          icon={<IconAlert />}
        />
      </section>

      {/* Bento insights */}
      <section className="grid gap-4 lg:grid-cols-12 lg:gap-5" aria-label="Insights">
        <article className="glass-card lg:col-span-7 lg:p-7">
          <CardHead
            title="Sales channels"
            desc="Where orders came from this week"
            action={{ href: '/orders', label: 'Details' }}
          />
          <ChannelDonut mix={data.channelMix} total={data.channelTotal} />
          <div className="mt-6 flex items-center justify-between rounded-2xl bg-gradient-to-r from-prime-50 to-paper-dim px-4 py-3 ring-1 ring-prime-200/60">
            <span className="text-sm font-medium text-ink-700">Wholesale (B2B)</span>
            <span className="font-display text-2xl font-black text-prime-700">
              {data.wholesaleShare.toFixed(0)}%
            </span>
          </div>
        </article>

        <div className="flex flex-col gap-4 lg:col-span-5 lg:gap-5">
          <article className="glass-card flex-1 p-6">
            <CardHead title="WhatsApp" desc="Last 7 days" action={{ href: '/whatsapp', label: 'Inbox' }} />
            <div className="mt-4 flex items-center gap-5">
              <div className="relative grid h-20 w-20 shrink-0 place-items-center">
                <svg className="absolute inset-0 -rotate-90" viewBox="0 0 36 36" aria-hidden>
                  <circle cx="18" cy="18" r="15.5" fill="none" className="stroke-ink-100" strokeWidth="3" />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.5"
                    fill="none"
                    className="stroke-mint-500"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${Math.min(100, (data.whatsappCount / Math.max(data.whatsappCount, 20)) * 97)} 100`}
                  />
                </svg>
                <IconWhatsApp className="relative text-mint-600" />
              </div>
              <div>
                <p className="font-display text-5xl font-black tabular-nums tracking-tight text-ink-900">
                  {data.whatsappCount}
                </p>
                <p className="mt-1 text-sm text-ink-500">messages handled</p>
              </div>
            </div>
          </article>

          <article className="glass-card p-6">
            <CardHead
              title="Stock watch"
              desc={stockCount === 0 ? 'All clear' : `${stockCount} need attention`}
              action={{ href: '/inventory', label: 'Warehouse' }}
            />
            <ul className="mt-3 max-h-48 space-y-1 overflow-y-auto nav-scrollbar">
              {stock.soldOut.map((r) => (
                <StockItem key={r.id} name={r.name} badge="Out of stock" variant="flash" />
              ))}
              {stock.low.map((r) => (
                <StockItem key={r.id} name={r.name} badge={`${r.available} left`} variant="amber" />
              ))}
              {stockCount === 0 && (
                <li className="rounded-xl bg-mint-100/50 px-4 py-6 text-center text-sm text-mint-600 ring-1 ring-mint-500/20">
                  Everything is above threshold
                </li>
              )}
            </ul>
          </article>
        </div>
      </section>

      {/* Orders feed */}
      <article className="glass-card p-6 md:p-7">
        <CardHead
          title="Recent orders"
          desc="Latest checkouts across all channels"
          action={{ href: '/orders', label: 'View all' }}
        />
        <ul className="mt-4 space-y-2">
          {data.orders.map((o) => (
            <OrderRow key={o.id} order={o} />
          ))}
          {data.orders.length === 0 && (
            <li className="rounded-2xl border border-dashed border-ink-300/80 bg-canvas/50 px-6 py-14 text-center">
              <p className="text-sm font-medium text-ink-700">No orders yet</p>
              <p className="mt-1 text-xs text-ink-500">New orders will stream in here in real time.</p>
            </li>
          )}
        </ul>
      </article>
    </div>
  )
}

// ─── Primitives ───────────────────────────────────────────────────────────────

function HeroStat({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-prime-100/70">{label}</dt>
      <dd
        className={`font-display mt-1 text-xl font-black tabular-nums md:text-2xl ${
          highlight ? 'text-amber-200' : 'text-paper'
        }`}
      >
        {value}
      </dd>
    </div>
  )
}

function MetricTile({
  href,
  label,
  value,
  sub,
  accent,
  icon,
  large,
}: {
  href: string
  label: string
  value: number | string
  sub: string
  accent: 'neutral' | 'prime' | 'amber' | 'flash'
  icon: React.ReactNode
  large?: boolean
}) {
  const accents = {
    neutral: 'hover:ring-ink-300/80',
    prime: 'ring-prime-200/80 hover:ring-prime-300',
    amber: 'ring-amber-400/40 hover:ring-amber-400/60',
    flash: 'ring-flash-500/35 hover:ring-flash-500/55',
  }
  const iconBg = {
    neutral: 'bg-ink-100 text-ink-700',
    prime: 'bg-prime-700 text-paper shadow-lg shadow-prime-900/20',
    amber: 'bg-amber-500 text-paper',
    flash: 'bg-flash-500 text-paper',
  }

  return (
    <Link
      href={href}
      className={`glass-card group flex flex-col justify-between p-5 ring-1 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 ${accents[accent]}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className={`grid h-11 w-11 place-items-center rounded-2xl ${iconBg[accent]}`}>{icon}</div>
        <span className="text-ink-400 transition group-hover:translate-x-0.5 group-hover:text-prime-600" aria-hidden>
          →
        </span>
      </div>
      <div className="mt-5">
        <p className="text-xs font-semibold text-ink-500">{label}</p>
        <p
          className={`font-display mt-1 font-black tabular-nums tracking-tight text-ink-900 ${
            large ? 'text-2xl md:text-3xl' : 'text-3xl'
          }`}
        >
          {value}
        </p>
        <p className="mt-1.5 text-xs text-ink-500">{sub}</p>
      </div>
    </Link>
  )
}

function CardHead({
  title,
  desc,
  action,
}: {
  title: string
  desc: string
  action?: { href: string; label: string }
}) {
  return (
    <header className="flex items-start justify-between gap-4">
      <div>
        <h2 className="font-display text-lg font-bold tracking-tight text-ink-900 md:text-xl">{title}</h2>
        <p className="mt-0.5 text-sm text-ink-500">{desc}</p>
      </div>
      {action && (
        <Link
          href={action.href}
          className="shrink-0 rounded-full bg-prime-50 px-3.5 py-1.5 text-xs font-bold text-prime-700 ring-1 ring-prime-200/80 transition hover:bg-prime-100"
        >
          {action.label}
        </Link>
      )}
    </header>
  )
}

function ChannelDonut({ mix, total }: { mix: Record<string, number>; total: number }) {
  const channels = [
    { key: 'web', label: 'Web', hex: '#82445a', tw: 'bg-prime-700' },
    { key: 'whatsapp', label: 'WhatsApp', hex: '#5e7f54', tw: 'bg-mint-500' },
    { key: 'reel', label: 'Reel', hex: '#a85a44', tw: 'bg-flash-500' },
  ] as const

  if (total === 0) {
    return (
      <div className="mt-6 flex flex-col items-center justify-center rounded-2xl bg-canvas/80 py-12 text-center ring-1 ring-ink-200/50">
        <p className="text-sm font-medium text-ink-600">No orders this week</p>
        <p className="mt-1 text-xs text-ink-500">Channel split will appear when sales come in.</p>
      </div>
    )
  }

  let cursor = 0
  const stops: string[] = []
  for (const ch of channels) {
    const n = mix[ch.key] ?? 0
    const pct = (n / total) * 100
    if (pct <= 0) continue
    stops.push(`${ch.hex} ${cursor}% ${cursor + pct}%`)
    cursor += pct
  }

  return (
    <div className="mt-6 flex flex-col items-center gap-8 sm:flex-row sm:items-center sm:justify-between">
      <div
        className="relative h-44 w-44 shrink-0 rounded-full p-3 shadow-inner ring-1 ring-ink-200/50"
        style={{ background: `conic-gradient(${stops.join(', ')})` }}
        role="img"
        aria-label="Channel distribution chart"
      >
        <div className="grid h-full w-full place-items-center rounded-full bg-paper text-center shadow-sm">
          <span className="font-display text-3xl font-black text-ink-900">{total}</span>
          <span className="text-[11px] font-semibold text-ink-500">orders</span>
        </div>
      </div>
      <ul className="w-full min-w-0 space-y-3 sm:max-w-xs sm:flex-1">
        {channels.map((ch) => {
          const count = mix[ch.key] ?? 0
          const pct = total > 0 ? Math.round((count / total) * 100) : 0
          return (
            <li key={ch.key}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-medium text-ink-800">
                  <span className={`h-2.5 w-2.5 rounded-full ${ch.tw}`} />
                  {ch.label}
                </span>
                <span className="tabular-nums text-ink-500">
                  <strong className="text-ink-900">{count}</strong> · {pct}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-ink-100">
                <span
                  className={`block h-full rounded-full ${ch.tw} transition-all duration-700`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function StockItem({
  name,
  badge,
  variant,
}: {
  name: string
  badge: string
  variant: 'flash' | 'amber'
}) {
  const styles =
    variant === 'flash'
      ? 'bg-flash-50 text-flash-700 ring-flash-500/25'
      : 'bg-amber-50 text-amber-700 ring-amber-500/25'
  return (
    <li className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-canvas/90">
      <span className={`h-2 w-2 shrink-0 rounded-full ${variant === 'flash' ? 'bg-flash-500' : 'bg-amber-500'}`} />
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink-800">{name}</span>
      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ${styles}`}>
        {badge}
      </span>
    </li>
  )
}

function OrderRow({ order: o }: { order: DashboardData['orders'][number] }) {
  const initial = (o.customer_name?.[0] ?? o.order_number[0] ?? '?').toUpperCase()
  const status = STATUS[o.status] ?? STATUS.default

  return (
    <li>
      <Link
        href={`/orders/${o.id}`}
        className="group flex flex-wrap items-center gap-4 rounded-2xl border border-transparent bg-canvas/40 px-4 py-3.5 transition hover:border-prime-200/60 hover:bg-prime-50/50 hover:shadow-sm sm:flex-nowrap"
      >
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-prime-600 to-prime-800 text-sm font-bold text-paper shadow-md shadow-prime-900/15">
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-bold text-ink-900 group-hover:text-prime-800">
              {o.order_number}
            </span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${status}`}>
              {o.status.replace(/_/g, ' ')}
            </span>
            {o.is_wholesale && (
              <span className="rounded-full bg-prime-100 px-2 py-0.5 text-[10px] font-bold text-prime-800">
                B2B
              </span>
            )}
          </div>
          <p className="mt-0.5 truncate text-sm text-ink-600">{o.customer_name ?? 'Guest checkout'}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="font-display text-lg font-black tabular-nums text-ink-900">
            Rs {Number(o.subtotal_mur).toFixed(0)}
          </p>
          <p className="mt-0.5 text-xs capitalize text-ink-500">
            {o.channel} · {formatRelative(o.created_at)}
          </p>
        </div>
      </Link>
    </li>
  )
}

const STATUS: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-800 ring-amber-400/30',
  confirmed: 'bg-prime-50 text-prime-800 ring-prime-300/50',
  packing: 'bg-prime-100 text-prime-800 ring-prime-400/35',
  packed: 'bg-ink-100 text-ink-700 ring-ink-300/40',
  delivery_in_progress: 'bg-mint-50 text-mint-800 ring-mint-400/35',
  delivered: 'bg-mint-100 text-mint-700 ring-mint-500/30',
  completed: 'bg-mint-100 text-mint-600 ring-mint-500/30',
  fulfilled: 'bg-mint-100 text-mint-600 ring-mint-500/30',
  cancelled: 'bg-ink-100 text-ink-500 ring-ink-300/40',
  default: 'bg-ink-100 text-ink-600 ring-ink-200/50',
}

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const ic = 'h-5 w-5'

function IconPlus() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}
function IconBox() {
  return (
    <svg viewBox="0 0 24 24" className={ic} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
    </svg>
  )
}
function IconClock() {
  return (
    <svg viewBox="0 0 24 24" className={ic} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  )
}
function IconChart() {
  return (
    <svg viewBox="0 0 24 24" className={ic} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20V10M10 20V4M16 20v-6M22 20H2" />
    </svg>
  )
}
function IconAlert() {
  return (
    <svg viewBox="0 0 24 24" className={ic} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 9v4M12 17h.01" />
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    </svg>
  )
}
function IconWhatsApp({ className = ic }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a8 8 0 1 1-3.6-6.7L21 4l-1 4A8 8 0 0 1 21 12Z" />
    </svg>
  )
}
