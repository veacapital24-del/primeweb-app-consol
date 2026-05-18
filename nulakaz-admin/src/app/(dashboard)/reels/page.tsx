import Link from 'next/link'
import { adminClient } from '@/lib/supabase'
import { PageHeader } from '@/components/PageHeader'
import {
  ActiveBadge,
  BtnEdit,
  BtnPrimary,
  CatalogCard,
  EmptyState,
  IconPlus,
  StatCard,
} from '@/components/admin/ui'

export const dynamic = 'force-dynamic'

type ReelRow = {
  id: string
  slug: string
  platform: string
  caption: string | null
  thumbnail_url: string | null
  video_url: string | null
  posted_at: string | null
  active: boolean
  reel_products: Array<{ product_id: string; products: { name: string; retail_price_mur: number } | null }>
}

export default async function ReelsListPage() {
  const sb = adminClient()

  const { data: reels } = await sb
    .from('reels')
    .select('id, slug, platform, caption, thumbnail_url, video_url, posted_at, active, reel_products(product_id, products(name, retail_price_mur))')
    .order('posted_at', { ascending: false, nullsFirst: false })
    .returns<ReelRow[]>()

  const { data: rawEvents } = await sb.from('reel_events').select('reel_id, event_type')
  const counts = new Map<string, Record<string, number>>()
  for (const e of rawEvents ?? []) {
    if (!e.reel_id) continue
    const cur = counts.get(e.reel_id) ?? {}
    cur[e.event_type] = (cur[e.event_type] ?? 0) + 1
    counts.set(e.reel_id, cur)
  }

  const storefront = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'http://localhost:3002'
  const list = reels ?? []
  const activeCount = list.filter((r) => r.active).length
  const totalViews = list.reduce((s, r) => s + ((counts.get(r.id) ?? {}).view ?? 0), 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reels"
        subtitle="Reel-to-cart landing pages for Instagram, TikTok, and Facebook"
        breadcrumbs={[{ label: 'Catalog' }, { label: 'Reels' }]}
        actions={
          <BtnPrimary href="/reels/new">
            <IconPlus />
            New reel
          </BtnPrimary>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Reels" value={list.length} />
        <StatCard label="Active" value={activeCount} accent="prime" />
        <StatCard label="Total views" value={totalViews} accent="mint" />
      </div>

      {list.length === 0 ? (
        <EmptyState
          title="No reels yet — create the first one to start tracking the funnel."
          action={{ href: '/reels/new', label: 'New reel' }}
        />
      ) : (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((r) => {
          const stats = counts.get(r.id) ?? {}
          const url = `${storefront}/reel/${r.slug}`
          return (
            <CatalogCard key={r.id} href={`/reels/${r.id}`} className="!p-0">
              <div className="relative block aspect-[9/16] overflow-hidden bg-ink-100">
                {r.thumbnail_url && <img src={r.thumbnail_url} alt="" className="h-full w-full object-cover" />}
                <span className="absolute left-2 top-2 rounded-full bg-paper/85 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-ink-900 backdrop-blur">
                  {r.platform}
                </span>
                {r.video_url ? (
                  <span className="absolute left-2 bottom-2 rounded-full bg-mint-100/95 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-mint-800 backdrop-blur">
                    In-app video
                  </span>
                ) : (
                  <span className="absolute left-2 bottom-2 rounded-full bg-amber-100/95 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-900 backdrop-blur">
                    No video URL
                  </span>
                )}
                {!r.active && (
                  <span className="absolute right-2 top-2">
                    <ActiveBadge active={false} />
                  </span>
                )}
              </div>
              <div className="space-y-3 p-4">
                <div>
                  <p className="line-clamp-2 text-sm font-semibold text-ink-900 group-hover:text-prime-700">{r.caption ?? '—'}</p>
                  <div className="mt-0.5 font-mono text-[11px] uppercase tracking-wider text-ink-500">{r.slug}</div>
                </div>

                <div className="rounded-xl bg-canvas/60 px-2 py-1.5 text-[11px] ring-1 ring-ink-200/50">
                  <a href={url} target="_blank" rel="noreferrer" className="font-mono text-prime-700 underline truncate block">{url}</a>
                </div>

                <div className="text-[11px] text-ink-700">
                  <span className="font-semibold">{r.reel_products.length} products</span>
                  {r.reel_products.length > 0 && (
                    <span className="text-ink-500">
                      {' · '}
                      {r.reel_products.slice(0, 2).map((rp) => rp.products?.name).join(', ')}
                      {r.reel_products.length > 2 && ` +${r.reel_products.length - 2}`}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-1 text-center text-[10px] sm:grid-cols-4">
                  {(['view', 'add_to_cart', 'whatsapp_click', 'order'] as const).map((k) => (
                    <div key={k} className="rounded-md bg-ink-100 px-1 py-1">
                      <div className="text-sm font-bold tabular-nums">{stats[k] ?? 0}</div>
                      <div className="capitalize text-ink-500">{k.replace('_', ' ')}</div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <BtnEdit href={`/reels/${r.id}`} />
                  {r.posted_at && (
                    <span className="text-[10px] text-ink-500">{new Date(r.posted_at).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            </CatalogCard>
          )
        })}

      </div>
      )}
    </div>
  )
}
