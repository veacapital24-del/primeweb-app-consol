import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShopToolbar } from "@/components/shop/ShopToolbar";
import { ProductCard } from "@/components/ui/ProductCard";
import { getCategories, getProducts } from "@/lib/data";

type Params = Promise<{ slug: string }>;

// Category listings bake live stock from Prime Supabase. Re-render in the
// background every 60s so admin changes show up without a redeploy.
export const revalidate = 60;

// Pre-render every category slug at build time (static export friendly).
export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getCategories();
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) return { title: "Category" };
  return {
    title: cat.name,
    description:
      cat.description ||
      `Shop ${cat.name} products from NuLakaz — next-day delivery in Mauritius.`,
  };
}

export default async function CategoryPage({ params }: { params: Params }) {
  const { slug } = await params;
  const [categories, allProducts] = await Promise.all([
    getCategories(),
    getProducts(),
  ]);
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  // Descendant ids (include grandchildren) so hitting "Fresh Fruit" also
  // lists products tagged under its children like "Berries".
  const descendantIds = new Set<number>([category.id]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const c of categories) {
      if (descendantIds.has(c.parent) && !descendantIds.has(c.id)) {
        descendantIds.add(c.id);
        grew = true;
      }
    }
  }

  const products = allProducts.filter((p) =>
    p.categories.some((pc) => descendantIds.has(pc.id)),
  );

  // Live counts per top-level category — fed to the chip rail so each chip
  // shows accurate product totals (not the stale WP snapshot numbers).
  const countsBySlug: Record<string, number> = {};
  for (const p of allProducts) {
    for (const c of p.categories) {
      countsBySlug[c.slug] = (countsBySlug[c.slug] ?? 0) + 1;
    }
  }

  return (
    <>
      <ShopToolbar
        total={products.length}
        categories={categories}
        countsBySlug={countsBySlug}
        activeSlug={category.slug}
        activeLabel={category.name}
      />

      <div className="mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24 py-10">
        {products.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border p-12 text-center">
            <p className="font-fraunces text-foreground text-2xl font-semibold mb-1">
              Empty isle for now.
            </p>
            <p className="text-sm text-foreground/70 mb-6">
              We&rsquo;ll restock {category.name.toLowerCase()} soon — try a
              neighbouring shelf.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-brand text-white rounded-full h-11 px-6 text-sm font-semibold tracking-wide hover:bg-brand-dark transition-colors"
            >
              Browse the full shop
            </Link>
          </div>
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
