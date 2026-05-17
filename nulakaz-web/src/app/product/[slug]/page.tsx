import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { ProductActions } from "@/components/shop/ProductActions";
import { ProductCard } from "@/components/ui/ProductCard";
import {
  getProducts,
  getProductBySlug,
  getCategories,
} from "@/lib/data";
import {
  formatPrice,
  formatPriceRange,
  stripHtml,
} from "@/lib/format";
import { BRAND_TINTS, type BrandTint } from "@/lib/brands";

type Params = Promise<{ slug: string }>;

// Detail pages bake live stock + pricing from Prime Supabase. Refresh in the
// background every 60s; new product slugs missing from the build manifest
// are still rendered on demand thanks to dynamicParams defaulting to true.
export const revalidate = 60;

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product" };
  return {
    title: product.name,
    description: stripHtml(product.short_description).slice(0, 160),
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const primaryCategory = product.categories[0];
  const [categories, allProducts] = await Promise.all([
    getCategories(),
    primaryCategory ? getProducts() : Promise.resolve([]),
  ]);

  // Related = same primary category, excluding this product. Pull more than
  // 4 so the row can flex up to 5 cards on xl.
  const related = primaryCategory
    ? allProducts
        .filter(
          (p) =>
            p.id !== product.id &&
            p.categories.some((c) => c.id === primaryCategory.id),
        )
        .slice(0, 5)
    : [];

  // Find primary category in the categories list for the breadcrumb.
  const catInTree = primaryCategory
    ? categories.find((c) => c.id === primaryCategory.id)
    : null;

  // Active price (sale wins over regular). Used by the live qty subtotal.
  const activeUnitMinor = product.on_sale
    ? product.prices.sale_price
    : product.prices.price;

  // Stock urgency — derived from low_stock_remaining. The adapter sets this
  // to a small int when inventory is at-or-below threshold, else null.
  const lowLeft =
    typeof product.low_stock_remaining === "number"
      ? product.low_stock_remaining
      : null;

  const cleanShortDesc = stripHtml(product.short_description);

  return (
    <>
      {/* Editorial breadcrumb strip — replaces the heavy page-header bar */}
      <nav
        aria-label="Breadcrumb"
        className="bg-white border-b border-border"
      >
        <ol className="mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24 py-4 flex flex-wrap items-center gap-2 text-[11.5px] uppercase tracking-[0.22em] text-foreground-muted font-semibold">
          <li>
            <Link
              href="/"
              className="hover:text-brand transition-colors"
            >
              Home
            </Link>
          </li>
          <BreadcrumbSep />
          <li>
            <Link
              href="/shop"
              className="hover:text-brand transition-colors"
            >
              Shop
            </Link>
          </li>
          {catInTree && (
            <>
              <BreadcrumbSep />
              <li>
                <Link
                  href={`/category/${catInTree.slug}`}
                  className="hover:text-brand transition-colors"
                >
                  {catInTree.name}
                </Link>
              </li>
            </>
          )}
          <BreadcrumbSep />
          <li className="font-fraunces italic normal-case tracking-normal text-[14px] text-brand">
            {product.name}
          </li>
        </ol>
      </nav>

      {/* Detail body */}
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] gap-8 lg:gap-14">
          <ProductGallery images={product.images} alt={product.name} />

          <div className="lg:pt-2">
            {/* Eyebrow — primary category as a small uppercase tag */}
            {catInTree && (
              <Link
                href={`/category/${catInTree.slug}`}
                className="inline-flex items-center gap-2 text-[11px] tracking-[0.32em] uppercase font-semibold text-foreground-muted hover:text-brand transition-colors"
              >
                <span className="w-7 h-px bg-brand/40" />
                {catInTree.name}
              </Link>
            )}

            {/* Title in Fraunces */}
            <h1 className="mt-3 font-fraunces text-foreground text-[26px] xs:text-[30px] sm:text-[36px] md:text-[44px] leading-[1.02] tracking-tight font-semibold">
              {product.name}
            </h1>

            {/* SKU + brand chip + on-sale stamped sticker */}
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {product.sku && (
                <span className="inline-flex items-center gap-1.5 text-[11.5px] text-foreground-muted">
                  <span className="font-semibold tracking-[0.18em] uppercase">
                    SKU
                  </span>
                  <span className="font-fraunces italic text-foreground/80">
                    {product.sku}
                  </span>
                </span>
              )}
              {product.brand && (() => {
                const t = BRAND_TINTS[product.brand.tint as BrandTint];
                return (
                  <Link
                    href={`/brands#${product.brand.slug}`}
                    className="inline-flex items-center gap-2 rounded-full px-2.5 py-1 transition-colors hover:opacity-80"
                    style={{ backgroundColor: t.bg, color: t.fg }}
                    aria-label={`Brand: ${product.brand.name}`}
                  >
                    <span className="text-[10px] font-semibold tracking-[0.18em] uppercase">
                      By
                    </span>
                    <span className="font-fraunces font-semibold text-[12.5px]">
                      {product.brand.name}
                    </span>
                  </Link>
                );
              })()}
              {product.on_sale && (
                <span className="inline-flex items-center gap-1 bg-brand-soft/60 text-brand text-[10.5px] font-bold tracking-[0.18em] uppercase px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                  On sale today
                </span>
              )}
            </div>

            {/* Price block */}
            <div className="mt-5">
              {product.prices.price_range ? (
                <span className="font-fraunces font-semibold text-brand text-[34px] leading-none">
                  {formatPriceRange(
                    product.prices.price_range.min_amount,
                    product.prices.price_range.max_amount,
                    product.prices.currency_minor_unit,
                  )}
                </span>
              ) : product.on_sale ? (
                <div className="flex items-baseline gap-3">
                  <span className="font-fraunces italic text-foreground-muted/80 line-through text-[18px]">
                    {formatPrice(
                      product.prices.regular_price,
                      product.prices.currency_minor_unit,
                    )}
                  </span>
                  <span className="font-fraunces font-semibold text-brand text-[36px] leading-none">
                    {formatPrice(
                      product.prices.sale_price,
                      product.prices.currency_minor_unit,
                    )}
                  </span>
                </div>
              ) : (
                <span className="font-fraunces font-semibold text-brand text-[36px] leading-none">
                  {formatPrice(
                    product.prices.price,
                    product.prices.currency_minor_unit,
                  )}
                </span>
              )}
            </div>

            {/* Short description */}
            {cleanShortDesc && (
              <p className="mt-5 text-foreground/80 text-[15px] leading-relaxed max-w-prose">
                {cleanShortDesc}
              </p>
            )}

            {/* Stock + delivery cue */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span
                className={[
                  "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] font-semibold",
                  product.is_in_stock
                    ? "bg-[#dde7c5]/60 text-[#3f5b35]"
                    : "bg-[#f1d9d4] text-[#7a3026]",
                ].join(" ")}
              >
                <span className="relative flex w-2 h-2">
                  <span
                    className={[
                      "absolute inset-0 rounded-full opacity-70",
                      product.is_in_stock
                        ? "bg-[#5e7f54] animate-ping"
                        : "bg-[#a85a44]",
                    ].join(" ")}
                  />
                  <span
                    className={[
                      "relative w-2 h-2 rounded-full",
                      product.is_in_stock ? "bg-[#5e7f54]" : "bg-[#a85a44]",
                    ].join(" ")}
                  />
                </span>
                {product.is_in_stock
                  ? lowLeft !== null
                    ? `Only ${lowLeft} left`
                    : "In stock"
                  : "Out of stock"}
              </span>

              <span className="inline-flex items-center gap-1.5 text-[12px] text-foreground-muted">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.85"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-foreground/50"
                  aria-hidden
                >
                  <path d="M3 6.5h11v9.5H3z" />
                  <path d="M14 9.5h4l3 3v3.5h-7" />
                  <circle cx="7" cy="17" r="2" />
                  <circle cx="17" cy="17" r="2" />
                </svg>
                Next-day delivery in Mauritius
              </span>
            </div>

            {/* Qty + actions */}
            <div className="mt-6">
              <ProductActions
                productId={product.id}
                productSlug={product.slug}
                productName={product.name}
                inStock={product.is_in_stock}
                unitPriceMinor={activeUnitMinor}
                minorUnit={product.prices.currency_minor_unit}
                currencySymbol={product.prices.currency_symbol}
              />
            </div>

            {/* Mini trust strip */}
            <ul className="mt-7 grid grid-cols-3 gap-2 text-[11.5px] text-foreground/70">
              <TrustCue
                label="Free over Rs 1,000"
                tint="#dde7c5"
                tintFg="#5e7f54"
                icon={
                  <>
                    <path d="M3 6.5h11v9.5H3z" />
                    <path d="M14 9.5h4l3 3v3.5h-7" />
                    <circle cx="7" cy="17" r="2" />
                    <circle cx="17" cy="17" r="2" />
                  </>
                }
              />
              <TrustCue
                label="30-day returns"
                tint="#e7d3da"
                tintFg="#82445a"
                icon={
                  <>
                    <path d="M3 12a9 9 0 0 1 15.5-6.3L21 8" />
                    <polyline points="21 3 21 8 16 8" />
                    <path d="M21 12a9 9 0 0 1-15.5 6.3L3 16" />
                    <polyline points="3 21 3 16 8 16" />
                  </>
                }
              />
              <TrustCue
                label="Secure checkout"
                tint="#f5e7c4"
                tintFg="#a98937"
                icon={
                  <>
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </>
                }
              />
            </ul>

            {/* About the maker — only when the product has a brand */}
            {product.brand && (() => {
              const t = BRAND_TINTS[product.brand.tint as BrandTint];
              return (
                <Link
                  href={`/brands#${product.brand.slug}`}
                  className="group mt-7 flex items-center gap-4 bg-white rounded-2xl ring-1 ring-border hover:ring-brand/30 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-25px_rgba(92,51,66,0.4)] transition-all duration-300 p-4 pr-5"
                >
                  {/* Logo plinth — solid tint, no gradient */}
                  <span
                    aria-hidden
                    className="relative shrink-0 w-16 h-16 rounded-xl bg-white ring-1 ring-border flex items-center justify-center overflow-hidden"
                  >
                    <span
                      aria-hidden
                      className="absolute inset-x-0 top-0 h-0.5"
                      style={{ backgroundColor: t.fg }}
                    />
                    <Image
                      src={product.brand.logo}
                      alt=""
                      width={48}
                      height={32}
                      className="object-contain max-w-[48px] max-h-[32px]"
                    />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p
                      className="text-[10.5px] font-semibold tracking-[0.22em] uppercase"
                      style={{ color: t.fg }}
                    >
                      Made by
                    </p>
                    <p className="font-fraunces font-semibold text-foreground text-[16px] leading-tight">
                      {product.brand.name}
                    </p>
                    <p className="font-fraunces italic text-foreground-muted text-[12.5px] leading-snug">
                      {product.brand.tagline} · {product.brand.origin}
                    </p>
                  </div>

                  <span
                    aria-hidden
                    className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full text-foreground-muted group-hover:text-white group-hover:bg-brand transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="13 5 20 12 13 19" />
                    </svg>
                  </span>
                </Link>
              );
            })()}

            {/* Tags + share */}
            {product.tags.length > 0 && (
              <div className="mt-7 pt-5 border-t border-dashed border-foreground/15 flex flex-wrap items-center gap-2">
                <span className="text-[10.5px] font-semibold uppercase tracking-[0.2em] text-foreground-muted mr-1">
                  Tags
                </span>
                {product.tags.map((t) => (
                  <span
                    key={t.id}
                    className="text-[12px] rounded-full bg-white border border-border text-foreground/75 px-2.5 py-1"
                  >
                    {t.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Description section — editorial header + clean prose */}
        {product.description && (
          <section className="mt-16 md:mt-20">
            <header className="mb-6">
              <span className="inline-flex items-center gap-2 text-foreground-muted text-[11px] font-semibold uppercase tracking-[0.32em]">
                <span className="w-9 h-px bg-brand/40" />
                The detail
              </span>
              <h2 className="mt-2 font-fraunces text-foreground text-[28px] md:text-[34px] leading-[1.05] tracking-tight font-semibold">
                About this <em className="italic font-light text-brand">product</em>
                <span className="text-brand">.</span>
              </h2>
            </header>
            <div
              className="prose prose-sm md:prose-base max-w-3xl text-foreground/85 leading-relaxed
                         prose-headings:text-foreground prose-headings:font-semibold
                         prose-a:text-brand prose-a:no-underline hover:prose-a:underline
                         prose-strong:text-foreground"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </section>
        )}

        {/* Related products */}
        {related.length > 0 && (
          <section className="mt-16 md:mt-20">
            <header className="flex flex-wrap items-end justify-between gap-4 mb-6 md:mb-8">
              <div>
                <span className="inline-flex items-center gap-2 text-foreground-muted text-[11px] font-semibold uppercase tracking-[0.32em]">
                  <span className="w-9 h-px bg-brand/40" />
                  From the same shelf
                </span>
                <h2 className="mt-2 font-fraunces text-foreground text-[28px] md:text-[34px] leading-[1.05] tracking-tight font-semibold">
                  More like{" "}
                  <em className="italic font-light text-brand">this</em>
                  <span className="text-brand">.</span>
                </h2>
              </div>
              {catInTree && (
                <Link
                  href={`/category/${catInTree.slug}`}
                  className="font-fraunces italic text-sm text-brand hover:text-brand-dark transition-colors"
                >
                  Browse all {catInTree.name.toLowerCase()} &nbsp;→
                </Link>
              )}
            </header>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-px bg-border border border-border rounded-2xl overflow-hidden">
              {related.map((p) => (
                <div key={p.id} className="bg-white">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

function BreadcrumbSep() {
  return (
    <li
      aria-hidden
      className="text-foreground-muted/40 select-none"
    >
      /
    </li>
  );
}

function TrustCue({
  label,
  tint,
  tintFg,
  icon,
}: {
  label: string;
  tint: string;
  tintFg: string;
  icon: React.ReactNode;
}) {
  return (
    <li className="flex items-center gap-2 bg-white rounded-xl ring-1 ring-border px-2.5 py-2">
      <span
        className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-lg"
        style={{ backgroundColor: tint }}
        aria-hidden
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke={tintFg}
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {icon}
        </svg>
      </span>
      <span className="font-medium text-foreground/85 leading-tight">
        {label}
      </span>
    </li>
  );
}
