import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { AddToCartButton } from "@/components/ui/AddToCartButton";
import { getProducts } from "@/lib/data";
import { formatPrice, stripHtml } from "@/lib/format";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Products you've saved to come back to later.",
};

// Demo wishlist — no persistence yet. Pick a handful of real products so the
// page has proper imagery, names, and pricing to style against.
const WISHLIST_SAMPLE_SLUGS = [
  "basil-1-bunch",
  "mint-1-bunch",
  "kiwi-4-pack",
  "avocados-2-units",
];

export default async function WishlistPage() {
  const all = await getProducts();
  const items = WISHLIST_SAMPLE_SLUGS.map((s) =>
    all.find((p) => p.slug === s),
  ).filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <>
      <PageHeader
        title="Wishlist"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Wishlist" }]}
      />

      <div className="mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24 py-10">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <p className="text-sm text-foreground/70">
            <span className="font-semibold text-foreground">{items.length}</span>{" "}
            {items.length === 1 ? "item" : "items"} saved
          </p>
          <Link
            href="/shop"
            className="text-sm text-brand hover:underline font-semibold"
          >
            ← Continue shopping
          </Link>
        </div>

        {items.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {items.map((p) => {
              const img = p.images?.[0];
              const priceText = p.on_sale
                ? formatPrice(p.prices.sale_price, p.prices.currency_minor_unit)
                : formatPrice(p.prices.price, p.prices.currency_minor_unit);
              return (
                <div
                  key={p.id}
                  className="relative bg-white rounded-2xl border border-border p-4 flex flex-col group"
                >
                  <button
                    type="button"
                    aria-label={`Remove ${p.name} from wishlist`}
                    className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white border border-border text-foreground-muted hover:text-[#c43f3f] hover:border-[#c43f3f] flex items-center justify-center transition-colors"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      aria-hidden
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>

                  <Link
                    href={`/product/${p.slug}`}
                    className="block relative aspect-square mb-3 rounded-xl overflow-hidden bg-brand-soft/30"
                  >
                    {img ? (
                      <Image
                        src={img.src}
                        alt={img.alt || p.name}
                        fill
                        sizes="(max-width: 640px) 50vw, 25vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-brand-soft/40 rounded-xl" />
                    )}
                  </Link>

                  <Link href={`/product/${p.slug}`} className="block mb-1">
                    <h3 className="text-brand font-bold text-[15px] leading-snug line-clamp-2">
                      {p.name}
                    </h3>
                  </Link>

                  {p.short_description && (
                    <p className="text-[12px] text-foreground/70 line-clamp-2 mb-3">
                      {stripHtml(p.short_description)}
                    </p>
                  )}

                  <div className="mt-auto flex items-center justify-between gap-2 pt-3 border-t border-border">
                    <div>
                      {p.on_sale && (
                        <span className="text-foreground-muted/70 line-through text-[12px] mr-1.5">
                          {formatPrice(
                            p.prices.regular_price,
                            p.prices.currency_minor_unit,
                          )}
                        </span>
                      )}
                      <span className="text-brand-2 font-bold">{priceText}</span>
                    </div>
                    <AddToCartButton
                      productId={p.id}
                      productSlug={p.slug}
                      productName={p.name}
                      disabled={!p.is_in_stock}
                      variant="pill"
                      label="Add"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

function EmptyState() {
  return (
    <div className="bg-white rounded-2xl border border-border p-10 text-center">
      <div className="w-14 h-14 mx-auto rounded-full bg-brand-soft/60 text-brand flex items-center justify-center mb-4">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </div>
      <h2 className="text-brand font-bold text-xl mb-1">
        Your wishlist is empty
      </h2>
      <p className="text-sm text-foreground/70 mb-5">
        Save products you love to come back to them later.
      </p>
      <Link
        href="/shop"
        className="inline-flex bg-brand text-white rounded-full h-11 px-6 font-semibold hover:bg-brand-dark transition-colors items-center"
      >
        Browse products
      </Link>
    </div>
  );
}
