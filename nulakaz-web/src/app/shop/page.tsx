import type { Metadata } from "next";
import Link from "next/link";
import { ShopToolbar } from "@/components/shop/ShopToolbar";
import { ProductCard } from "@/components/ui/ProductCard";
import { getCategories, getProducts } from "@/lib/data";

export const metadata: Metadata = {
  title: "Shop",
  description: "Browse every product available from NuLakaz online grocery.",
};

// Stock and pricing live in Prime Supabase; regenerate the catalog page in
// the background every 60s so admin changes propagate without a redeploy.
export const revalidate = 60;

type SearchParams = Promise<{ q?: string }>;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const q = (params.q ?? "").trim().toLowerCase();

  const [allProducts, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  // Live counts per top-level category — based on real catalog state, not
  // the stale numbers baked into the WP categories.json snapshot.
  const countsBySlug: Record<string, number> = {};
  for (const p of allProducts) {
    for (const c of p.categories) {
      countsBySlug[c.slug] = (countsBySlug[c.slug] ?? 0) + 1;
    }
  }

  // Free-text search filter — name + descriptions. Tags omitted because
  // tag.name shape varies; cheaper to extend later.
  const products = q
    ? allProducts.filter((p) => {
        const hay = [
          p.name,
          p.short_description,
          p.description,
          ...p.categories.map((c) => c.name),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      })
    : allProducts;

  return (
    <>
      <ShopToolbar
        total={products.length}
        categories={categories}
        countsBySlug={countsBySlug}
        query={q || undefined}
      />

      <div className="mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24 py-10">
        {products.length === 0 ? (
          <EmptyState query={q} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-px bg-border border border-border rounded-2xl overflow-hidden">
            {products.map((p) => (
              <div key={p.id} className="bg-white">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-12 text-center">
      <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-soft/60 text-brand mb-5">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.85"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </span>
      <h2 className="font-fraunces text-foreground text-2xl font-semibold mb-1">
        Nothing on the shelf {query ? (
          <>
            for{" "}
            <em className="italic font-light text-brand">“{query}”</em>
          </>
        ) : (
          "yet"
        )}
        .
      </h2>
      <p className="text-sm text-foreground/70 max-w-md mx-auto mb-6">
        Try a broader term, or browse categories from the chip rail above.
      </p>
      <Link
        href="/shop"
        className="inline-flex items-center gap-2 bg-brand text-white rounded-full h-11 px-6 text-sm font-semibold tracking-wide hover:bg-brand-dark transition-colors"
      >
        Show every product
      </Link>
    </div>
  );
}
