import Link from 'next/link'
import { adminClient } from '@/lib/supabase'
import { PageHeader } from '@/components/PageHeader'

export const dynamic = 'force-dynamic'

type ReelRow = {
  id: string
  slug: string
  platform: string
  caption: string | null
  thumbnail_url: string | null
  posted_at: string | null
  active: boolean
  reel_products: Array<{ product_id: string; products: { name: string; retail_price_mur: number } | null }>
}

export default async function ReelsListPage() {
  const sb = adminClient()

  const { data: reels } = await sb
    .from('reels')
    .select('id, slug, platform, caption, thumbnail_url, posted_at, active, reel_products(product_id, products(name, retail_price_mur))')
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

  return (
    <div>
      <PageHeader
        title="Reels"
        subtitle="Reel-to-cart landing pages for Instagram, TikTok, and Facebook"
        breadcrumbs={[{ label: 'Catalog' }, { label: 'Reels' }]}
        actions={
          <Link href="/reels/new" className="rounded-xl bg-prime-700 px-4 py-2 text-sm font-bold text-paper transition hover:bg-prime-800">
            + New reel
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(reels ?? []).map((r) => {
          const stats = counts.get(r.id) ?? {}
          const url = `${storefront}/reel/${r.slug}`
          return (
            <article key={r.id} className="overflow-hidden rounded-2xl border border-ink-300/60 bg-paper transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-ink-900/10">
              <Link href={`/reels/${r.id}`} className="relative block aspect-[9/16] overflow-hidden bg-ink-100">
                {r.thumbnail_url && <img src={r.thumbnail_url} alt="" className="h-full w-full object-cover" />}
                <span className="absolute left-2 top-2 rounded-full bg-paper/85 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-ink-900 backdrop-blur">
                  {r.platform}
                </span>
                {!r.active && (
                  <span className="absolute right-2 top-2 rounded-full bg-flash-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
                    Inactive
                  </span>
                )}
              </Link>
              <div className="space-y-3 p-4">
                <div>
                  <Link href={`/reels/${r.id}`} className="line-clamp-2 text-sm font-semibold hover:text-prime-700">{r.caption ?? '—'}</Link>
                  <div className="mt-0.5 font-mono text-[11px] uppercase tracking-wider text-ink-500">{r.slug}</div>
                </div>

                <div className="rounded-lg bg-paper-dim/60 px-2 py-1.5 text-[11px]">
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
                  <Link href={`/reels/${r.id}`} className="text-xs font-semibold text-prime-700 underline">Edit →</Link>
                  {r.posted_at && (
                    <span className="text-[10px] text-ink-500">{new Date(r.posted_at).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            </article>
          )
        })}

        {(!reels || reels.length === 0) && (
          <div className="col-span-full rounded-2xl border border-dashed border-ink-300 bg-paper-dim/40 p-12 text-center">
            <p className="text-ink-700">No reels yet — create the first one to start tracking the funnel.</p>
            <Link href="/reels/new" className="mt-3 inline-block rounded-xl bg-prime-700 px-4 py-2 text-sm font-bold text-paper hover:bg-prime-800">
              + New reel
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
