import { adminClient, serverClient } from '@/lib/supabase'
import { DashboardView, type DashboardData } from '@/components/dashboard/DashboardView'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const sb = adminClient()
  const auth = await serverClient()
  const { data: { user } } = await auth.auth.getUser()

  const since = new Date(Date.now() - 7 * 86400_000).toISOString()
  const hour = new Date().getHours()
  const greetingTime = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  let displayName = 'there'
  if (user) {
    const { data: profile } = await sb
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .maybeSingle<{ full_name: string | null }>()
    const name = profile?.full_name?.trim()
    if (name) displayName = name.split(/\s+/)[0] ?? name
  }

  const [
    products, lowStock, outStock, ordersWeek, ordersPending, whatsappWeek, recentOrders,
    reelEventsWeek, activeReels, openPOs,
  ] =
    await Promise.all([
      sb.from('products').select('id', { count: 'exact', head: true }).eq('active', true),
      sb
        .from('product_stock')
        .select('id, name, available')
        .lte('available', 5)
        .gt('available', 0)
        .order('available')
        .limit(8),
      sb.from('product_stock').select('id, name').eq('available', 0).limit(8),
      sb
        .from('orders')
        .select('id, subtotal_mur, channel, is_wholesale, created_at')
        .gte('created_at', since),
      sb.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      sb
        .from('whatsapp_messages')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', since),
      sb
        .from('orders')
        .select(
          'id, order_number, channel, is_wholesale, subtotal_mur, status, created_at, customer_name',
        )
        .order('created_at', { ascending: false })
        .limit(8),
      sb
        .from('reel_events')
        .select('event_type')
        .gte('created_at', since)
        .in('event_type', ['view', 'add_to_cart']),
      sb.from('reels').select('id', { count: 'exact', head: true }).eq('active', true),
      sb
        .from('purchase_orders')
        .select('id', { count: 'exact', head: true })
        .in('status', ['draft', 'sent', 'partial']),
    ])

  const week = ordersWeek.data ?? []
  const revenueWeek = week.reduce((s, o) => s + Number(o.subtotal_mur ?? 0), 0)
  const channelMix = week.reduce<Record<string, number>>((acc, o) => {
    acc[o.channel] = (acc[o.channel] ?? 0) + 1
    return acc
  }, {})
  const wholesaleShare =
    week.length > 0 ? (week.filter((o) => o.is_wholesale).length / week.length) * 100 : 0

  const reelEvents = reelEventsWeek.data ?? []
  const reelViewsWeek = reelEvents.filter((e) => e.event_type === 'view').length
  const reelAddToCartWeek = reelEvents.filter((e) => e.event_type === 'add_to_cart').length

  const data: DashboardData = {
    greeting: `${greetingTime}, ${displayName}`,
    dateLabel: new Date().toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    metrics: {
      products: products.count ?? 0,
      pending: ordersPending.count ?? 0,
      revenue: revenueWeek,
      revenueFormatted: `Rs ${Math.round(revenueWeek).toLocaleString()}`,
      ordersWeek: week.length,
      stockAlerts: (lowStock.data?.length ?? 0) + (outStock.data?.length ?? 0),
      soldOut: outStock.data?.length ?? 0,
      lowStock: lowStock.data?.length ?? 0,
    },
    channelMix,
    channelTotal: week.length,
    wholesaleShare,
    whatsappCount: whatsappWeek.count ?? 0,
    reels: {
      activeCount: activeReels.count ?? 0,
      viewsWeek: reelViewsWeek,
      addToCartWeek: reelAddToCartWeek,
    },
    procurement: {
      openCount: openPOs.count ?? 0,
    },
    stock: {
      soldOut: outStock.data ?? [],
      low: (lowStock.data ?? []).map((r) => ({
        id: r.id,
        name: r.name,
        available: r.available,
      })),
    },
    orders: (recentOrders.data ?? []).map((o) => ({
      ...o,
      subtotal_mur: Number(o.subtotal_mur),
    })),
  }

  return <DashboardView data={data} />
}
