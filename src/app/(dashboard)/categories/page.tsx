import Link from 'next/link'
import { adminClient } from '@/lib/supabase'
import { PageHeader } from '@/components/PageHeader'
import type { Category } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function CategoriesListPage() {
  const sb = adminClient()

  const { data: categories } = await sb
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })
    .returns<Category[]>()

  // How many products reference each category — surfaces orphans + scale.
  const { data: usage } = await sb
    .from('products')
    .select('category_slug')
    .not('category_slug', 'is', null)
  const usageMap = new Map<string, number>()
  for (const r of usage ?? []) {
    if (!r.category_slug) continue
    usageMap.set(r.category_slug, (usageMap.get(r.category_slug) ?? 0) + 1)
  }

  // Group by parent so the list reads as a hierarchy.
  const tops = (categories ?? []).filter((c) => !c.parent_slug)
  const childrenOf = (slug: string) =>
    (categories ?? []).filter((c) => c.parent_slug === slug)

  return (
    <div>
      <PageHeader
        title="Categories"
        subtitle="Top-level shelves + sub-shelves the storefront uses for navigation."
        breadcrumbs={[{ label: 'Catalog' }, { label: 'Categories' }]}
        actions={
          <Link
            href="/categories/new"
            className="rounded-xl bg-prime-700 px-4 py-2 text-sm font-bold text-paper transition hover:bg-prime-800"
          >
            + New category
          </Link>
        }
      />

      <div className="overflow-hidden rounded-2xl border border-ink-300/60 bg-paper">
        <table className="w-full text-sm">
          <thead className="bg-paper-dim/60 text-left text-[11px] font-bold uppercase tracking-widest text-ink-500">
            <tr>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Slug</th>
              <th className="px-5 py-3">Sort</th>
              <th className="px-5 py-3">Products</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">—</th>
            </tr>
          </thead>
          <tbody>
            {tops.map((top) => (
              <Row
                key={top.slug}
                row={top}
                indent={0}
                count={usageMap.get(top.slug) ?? 0}
                children={childrenOf(top.slug)}
                usageMap={usageMap}
              />
            ))}
            {tops.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-ink-500">
                  No categories yet — create the first one to start tagging
                  products.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Row({
  row,
  indent,
  count,
  children,
  usageMap,
}: {
  row: Category
  indent: number
  count: number
  children: Category[]
  usageMap: Map<string, number>
}) {
  return (
    <>
      <tr className="border-t border-ink-300/40 transition hover:bg-paper-dim/40">
        <td className="px-5 py-3">
          <Link
            href={`/categories/${row.slug}`}
            className="block font-semibold text-ink-900 hover:text-prime-700"
            style={{ paddingLeft: indent * 18 }}
          >
            {indent > 0 && (
              <span aria-hidden className="mr-2 text-ink-300">
                ↳
              </span>
            )}
            {row.name}
          </Link>
        </td>
        <td className="px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-ink-500">
          {row.slug}
        </td>
        <td className="px-5 py-3 tabular-nums text-ink-700">{row.sort_order}</td>
        <td className="px-5 py-3 tabular-nums text-ink-700">{count}</td>
        <td className="px-5 py-3">
          {row.active ? (
            <span className="inline-flex rounded-full bg-mint-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-mint-600">
              Active
            </span>
          ) : (
            <span className="inline-flex rounded-full bg-flash-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-flash-700">
              Off
            </span>
          )}
        </td>
        <td className="px-5 py-3 text-right">
          <Link
            href={`/categories/${row.slug}`}
            className="text-xs font-semibold text-prime-700 underline"
          >
            Edit →
          </Link>
        </td>
      </tr>
      {children.map((c) => (
        <Row
          key={c.slug}
          row={c}
          indent={indent + 1}
          count={usageMap.get(c.slug) ?? 0}
          children={[]}
          usageMap={usageMap}
        />
      ))}
    </>
  )
}
