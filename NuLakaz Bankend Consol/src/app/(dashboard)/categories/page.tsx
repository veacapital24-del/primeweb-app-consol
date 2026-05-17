import Link from 'next/link'
import { adminClient } from '@/lib/supabase'
import { PageHeader } from '@/components/PageHeader'
import {
  ActiveBadge,
  BtnEdit,
  BtnPrimary,
  EmptyState,
  IconPlus,
  StatCard,
  TableHead,
  TableShell,
} from '@/components/admin/ui'
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

  const { data: usage } = await sb
    .from('products')
    .select('category_slug')
    .not('category_slug', 'is', null)
  const usageMap = new Map<string, number>()
  for (const r of usage ?? []) {
    if (!r.category_slug) continue
    usageMap.set(r.category_slug, (usageMap.get(r.category_slug) ?? 0) + 1)
  }

  const list = categories ?? []
  const tops = list.filter((c) => !c.parent_slug)
  const childrenOf = (slug: string) => list.filter((c) => c.parent_slug === slug)
  const activeCount = list.filter((c) => c.active).length
  const topLevel = tops.length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        subtitle="Top-level shelves and sub-shelves for storefront navigation."
        breadcrumbs={[{ label: 'Catalog' }, { label: 'Categories' }]}
        actions={
          <BtnPrimary href="/categories/new">
            <IconPlus />
            New category
          </BtnPrimary>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Total categories" value={list.length} />
        <StatCard label="Top-level shelves" value={topLevel} accent="prime" />
        <StatCard label="Active" value={activeCount} accent="mint" />
      </div>

      {list.length === 0 ? (
        <EmptyState
          title="No categories yet — create the first one to start tagging products."
          action={{ href: '/categories/new', label: 'Create category' }}
        />
      ) : (
        <>
          <ul className="space-y-2 sm:hidden">
            {tops.map((top) => (
              <CategoryMobileRow
                key={top.slug}
                row={top}
                indent={0}
                count={usageMap.get(top.slug) ?? 0}
                children={childrenOf(top.slug)}
                usageMap={usageMap}
                childrenOf={childrenOf}
              />
            ))}
          </ul>

          <TableShell>
            <TableHead>
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Slug</th>
                <th className="px-5 py-3">Sort</th>
                <th className="px-5 py-3">Products</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right"> </th>
              </tr>
            </TableHead>
            <tbody className="divide-y divide-ink-200/50">
              {tops.map((top) => (
                <CategoryRow
                  key={top.slug}
                  row={top}
                  indent={0}
                  count={usageMap.get(top.slug) ?? 0}
                  children={childrenOf(top.slug)}
                  usageMap={usageMap}
                  childrenOf={childrenOf}
                />
              ))}
            </tbody>
          </TableShell>
        </>
      )}
    </div>
  )
}

function CategoryRow({
  row,
  indent,
  count,
  children,
  usageMap,
  childrenOf,
}: {
  row: Category
  indent: number
  count: number
  children: Category[]
  usageMap: Map<string, number>
  childrenOf: (slug: string) => Category[]
}) {
  return (
    <>
      <tr className="transition hover:bg-prime-50/30">
        <td className="px-5 py-3.5">
          <Link
            href={`/categories/${row.slug}`}
            className="block font-semibold text-ink-900 hover:text-prime-700"
            style={{ paddingLeft: indent * 16 }}
          >
            {indent > 0 && <span className="mr-2 text-ink-300">↳</span>}
            {row.name}
          </Link>
        </td>
        <td className="px-5 py-3.5 font-mono text-[11px] text-ink-500">{row.slug}</td>
        <td className="px-5 py-3.5 tabular-nums text-ink-700">{row.sort_order}</td>
        <td className="px-5 py-3.5 tabular-nums text-ink-700">{count}</td>
        <td className="px-5 py-3.5">
          <ActiveBadge active={row.active} />
        </td>
        <td className="px-5 py-3.5 text-right">
          <BtnEdit href={`/categories/${row.slug}`} />
        </td>
      </tr>
      {children.map((c) => (
        <CategoryRow
          key={c.slug}
          row={c}
          indent={indent + 1}
          count={usageMap.get(c.slug) ?? 0}
          children={childrenOf(c.slug)}
          usageMap={usageMap}
          childrenOf={childrenOf}
        />
      ))}
    </>
  )
}

function CategoryMobileRow({
  row,
  indent,
  count,
  children,
  usageMap,
  childrenOf,
}: {
  row: Category
  indent: number
  count: number
  children: Category[]
  usageMap: Map<string, number>
  childrenOf: (slug: string) => Category[]
}) {
  return (
    <>
      <li>
        <Link
          href={`/categories/${row.slug}`}
          className="glass-card flex items-center justify-between gap-3 p-4 transition active:scale-[0.99]"
          style={{ marginLeft: indent * 12 }}
        >
          <div>
            <p className="font-semibold text-ink-900">{row.name}</p>
            <p className="font-mono text-[11px] text-ink-500">{row.slug}</p>
          </div>
          <div className="text-right">
            <ActiveBadge active={row.active} />
            <p className="mt-1 text-[11px] tabular-nums text-ink-500">{count} products</p>
          </div>
        </Link>
      </li>
      {children.map((c) => (
        <CategoryMobileRow
          key={c.slug}
          row={c}
          indent={indent + 1}
          count={usageMap.get(c.slug) ?? 0}
          children={childrenOf(c.slug)}
          usageMap={usageMap}
          childrenOf={childrenOf}
        />
      ))}
    </>
  )
}
