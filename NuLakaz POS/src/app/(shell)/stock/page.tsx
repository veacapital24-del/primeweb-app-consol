import { Topbar } from '@/components/Topbar'
import { Button, EmptyState, PageMain, SELECT_CLASS } from '@/components/ui'
import { adminClient } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'
import { StockBoard, type StockItem } from './StockBoard'

export const dynamic = 'force-dynamic'

type SearchParams = Promise<{ location?: string }>

type ProductRow = {
  id: string
  sku: string
  name: string
  image_url: string | null
  retail_price_mur: number
}

type StockRow = {
  product_id: string
  on_hand: number
  low_stock_threshold: number
}

type MovementRow = {
  product_id: string
  delta: number
  created_at: string
}

export default async function StockPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdmin()
  const { location: locationParam } = await searchParams

  const admin = adminClient()

  const { data: locations } = await admin
    .from('locations')
    .select('id, code, name')
    .eq('active', true)
    .order('code')

  const locs = (locations ?? []) as { id: string; code: string; name: string }[]

  if (locs.length === 0) {
    return (
      <>
        <Topbar
          title="Stock"
          subtitle="Per-location on-hand counts"
          breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Stock' }]}
        />
        <PageMain>
          <EmptyState
            title="Add a location first"
            description="Stock is tracked per location."
            action={{ label: '+ New location', href: '/locations/new' }}
          />
        </PageMain>
      </>
    )
  }

  const activeLocId =
    locationParam && locs.find((l) => l.id === locationParam) ? locationParam : locs[0].id
  const activeLoc = locs.find((l) => l.id === activeLocId)!

  const [{ data: products }, { data: stock }, { data: movements }] = await Promise.all([
    admin
      .from('products')
      .select('id, sku, name, image_url, retail_price_mur')
      .eq('active', true)
      .order('name')
      .limit(1000),
    admin
      .from('location_stock')
      .select('product_id, on_hand, low_stock_threshold')
      .eq('location_id', activeLocId),
    admin
      .from('stock_movements')
      .select('product_id, delta, created_at')
      .eq('location_id', activeLocId)
      .order('created_at', { ascending: false })
      .limit(500),
  ])

  const productList = (products ?? []) as ProductRow[]
  const stockMap = new Map<string, { on_hand: number; threshold: number }>()
  for (const s of (stock ?? []) as StockRow[]) {
    stockMap.set(s.product_id, { on_hand: Number(s.on_hand), threshold: Number(s.low_stock_threshold) })
  }

  const lastMov = new Map<string, MovementRow>()
  for (const m of (movements ?? []) as MovementRow[]) {
    if (!lastMov.has(m.product_id)) lastMov.set(m.product_id, m)
  }

  const items: StockItem[] = productList.map((p) => {
    const s = stockMap.get(p.id)
    const lm = lastMov.get(p.id)
    return {
      product_id: p.id,
      sku: p.sku,
      name: p.name,
      image_url: p.image_url,
      retail_price_mur: Number(p.retail_price_mur),
      on_hand: s ? s.on_hand : null,
      threshold: s ? s.threshold : 5,
      last_delta: lm ? Number(lm.delta) : null,
      last_at: lm ? lm.created_at : null,
    }
  })

  return (
    <>
      <Topbar
        title="Stock"
        subtitle={`${activeLoc.code} · ${activeLoc.name}`}
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Stock' }]}
        actions={
          locs.length > 1 ? (
            <form className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-ink-500">Location</span>
              <select name="location" defaultValue={activeLocId} className={SELECT_CLASS}>
                {locs.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.code} · {l.name}
                  </option>
                ))}
              </select>
              <Button type="submit" variant="secondary" size="sm">
                Switch
              </Button>
            </form>
          ) : null
        }
      />

      <PageMain>
        <StockBoard
          items={items}
          locationId={activeLocId}
          locationLabel={`${activeLoc.code} · ${activeLoc.name}`}
        />
      </PageMain>
    </>
  )
}
