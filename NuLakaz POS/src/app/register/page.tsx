import { redirect } from 'next/navigation'
import { PosShell } from '@/components/PosShell'
import { Topbar } from '@/components/Topbar'
import { EmptyState, PageMain } from '@/components/ui'
import { adminClient, serverClient } from '@/lib/supabase'
import { RegisterHeader } from './RegisterHeader'
import { RegisterScreen, type Product, type ShiftCtx } from './RegisterScreen'

export const dynamic = 'force-dynamic'

type ShiftRow = {
  id: string
  register_id: string
  location_id: string
  opened_at: string
  registers: { code: string; name: string } | null
  locations: { code: string; name: string; currency: string } | null
}

export default async function RegisterRoutePage() {
  const sb = await serverClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect('/login')

  const { data: shiftRow } = await sb
    .from('shifts')
    .select('id, register_id, location_id, opened_at, registers(code, name), locations(code, name, currency)')
    .eq('cashier_id', user.id)
    .eq('status', 'open')
    .order('opened_at', { ascending: false })
    .limit(1)
    .maybeSingle<ShiftRow>()

  if (!shiftRow) {
    return (
      <PosShell>
        <Topbar
          title="Register"
          subtitle="No open shift"
          breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Register' }]}
        />
        <PageMain>
          <EmptyState
            title="Open a shift first"
            description="You need an open shift on a register before you can ring sales."
            action={{ label: '+ Open shift', href: '/shifts/open' }}
          />
        </PageMain>
      </PosShell>
    )
  }

  const since = new Date(Date.now() - 30 * 86400_000).toISOString()

  const [productsRes, stockRes, recentSalesRes, heldCountRes] = await Promise.all([
    sb
      .from('products')
      .select('id, sku, name, retail_price_mur, image_url')
      .eq('active', true)
      .order('name')
      .limit(500),
    sb
      .from('location_stock')
      .select('product_id, on_hand, reserved')
      .eq('location_id', shiftRow.location_id),
    sb
      .from('sales')
      .select('id')
      .eq('location_id', shiftRow.location_id)
      .eq('status', 'completed')
      .gte('created_at', since)
      .limit(2000),
    sb
      .from('sales')
      .select('id', { count: 'exact', head: true })
      .eq('location_id', shiftRow.location_id)
      .eq('status', 'draft'),
  ])

  const products = productsRes.data
  const stock = stockRes.data
  const recentSales = recentSalesRes.data

  const topSellerIds: string[] = []
  if ((recentSales?.length ?? 0) > 0) {
    const { data: linesData } = await sb
      .from('sale_lines')
      .select('product_id, qty')
      .in('sale_id', (recentSales ?? []).map((s) => s.id as string))
    const totals = new Map<string, number>()
    for (const l of linesData ?? []) {
      const id = l.product_id as string
      totals.set(id, (totals.get(id) ?? 0) + Number(l.qty))
    }
    Array.from(totals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .forEach(([id]) => topSellerIds.push(id))
  }

  const heldCount = heldCountRes.count ?? 0

  const stockMap = new Map<string, number>()
  for (const s of stock ?? []) {
    stockMap.set(s.product_id as string, Number(s.on_hand) - Number(s.reserved))
  }

  const productList: Product[] = (products ?? []).map((p) => ({
    id: p.id as string,
    sku: p.sku as string,
    name: p.name as string,
    retail_price_mur: Number(p.retail_price_mur),
    image_url: (p.image_url as string | null) ?? null,
    available: stockMap.has(p.id as string) ? stockMap.get(p.id as string)! : null,
  }))

  const shift: ShiftCtx = {
    id: shiftRow.id,
    register_id: shiftRow.register_id,
    location_id: shiftRow.location_id,
    opened_at: shiftRow.opened_at,
    register_code: shiftRow.registers?.code ?? '—',
    register_name: shiftRow.registers?.name ?? '—',
    location_code: shiftRow.locations?.code ?? '—',
    location_name: shiftRow.locations?.name ?? '—',
    currency: shiftRow.locations?.currency ?? 'MUR',
  }

  const admin = adminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .maybeSingle<{ full_name: string | null }>()

  const cashierName = profile?.full_name ?? user.email ?? user.id.slice(0, 8)

  return (
    <>
      <RegisterHeader
        shift={{
          id: shift.id,
          opened_at: shift.opened_at,
          register_code: shift.register_code,
          register_name: shift.register_name,
          location_code: shift.location_code,
          location_name: shift.location_name,
        }}
        cashierName={cashierName}
        cashierEmail={user.email ?? null}
      />
      <RegisterScreen
        shift={shift}
        products={productList}
        topSellerIds={topSellerIds}
        heldCount={heldCount}
      />
    </>
  )
}
