import Link from "next/link";
import type { WcProductCategory } from "@/types/wp";

// Top-of-page filter rail for /shop and /category/[slug] — replaces the
// previous left sidebar so the product grid gets the full width (5 cols on
// xl+ instead of 4). Visual language matches the home-page redesign:
// editorial eyebrow + Fraunces oversized headline + closing-style sort
// chip + horizontal-scroll category rail + secondary quick-filter row.

type Props = {
  /** Total products visible after filters */
  total: number;
  /** Top-level categories (parent === 0) */
  categories: WcProductCategory[];
  /** Live count of products under each category slug */
  countsBySlug: Record<string, number>;
  /** Active category slug, if rendered from /category/[slug] */
  activeSlug?: string;
  /** Free-text search query, if any */
  query?: string;
  /** Active category friendly name (used in the headline) */
  activeLabel?: string;
};

export function ShopToolbar({
  total,
  categories,
  countsBySlug,
  activeSlug,
  query,
  activeLabel,
}: Props) {
  // Show only top-level categories that actually have at least 1 product —
  // the sidebar used to surface child categories too, but a horizontal
  // chip rail reads cleanest with one level.
  const topCats = categories.filter(
    (c) => c.parent === 0 && (countsBySlug[c.slug] ?? 0) > 0,
  );

  // Page identity — Fraunces oversized headline. When rendered from a
  // category, the category name swaps into the italic accent.
  const headline = activeLabel ? (
    <>
      The{" "}
      <em className="italic font-light text-brand">
        {activeLabel.toLowerCase()}
      </em>{" "}
      shelf<span className="text-brand">.</span>
    </>
  ) : query ? (
    <>
      Searching{" "}
      <em className="italic font-light text-brand">
        “{query}”
      </em>
      <span className="text-brand">.</span>
    </>
  ) : (
    <>
      The full <em className="italic font-light text-brand">shelf</em>
      <span className="text-brand">.</span>
    </>
  );

  return (
    <section className="bg-white border-b border-border">
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24 pt-8 pb-6">
        {/* Editorial header */}
        <header className="mb-6">
          <span className="inline-flex items-center gap-2 text-foreground-muted text-[11px] font-semibold uppercase tracking-[0.32em]">
            <span className="w-9 h-px bg-brand/40" />
            Browse the catalogue
          </span>
          <h1 className="mt-2 font-fraunces text-foreground text-[36px] md:text-[52px] leading-[0.95] tracking-tight font-semibold">
            {headline}
          </h1>
          <p className="mt-2 text-sm text-foreground/70">
            <span className="font-semibold text-foreground tabular-nums">
              {total}
            </span>{" "}
            {total === 1 ? "product" : "products"}
            {activeSlug ? " in this isle" : ""}
            {query ? " matching your search" : ""}.
          </p>
        </header>

        {/* Category chip rail — horizontal scroll on overflow. The negative
            margins let the row run edge-to-edge on mobile so the last chip
            isn't clipped. */}
        <div
          className="-mx-4 sm:-mx-6 lg:-mx-10 xl:-mx-16 2xl:-mx-24 overflow-x-auto"
          style={{ scrollbarWidth: "none" }}
        >
          <div className="px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24 flex gap-2 pb-1">
            <CategoryChip
              href="/shop"
              label="All products"
              count={Object.values(countsBySlug).reduce((a, b) => a + b, 0) || total}
              active={!activeSlug}
            />
            {topCats.map((c) => (
              <CategoryChip
                key={c.slug}
                href={`/category/${c.slug}`}
                label={c.name}
                count={countsBySlug[c.slug] ?? 0}
                active={activeSlug === c.slug}
              />
            ))}
          </div>
        </div>

        {/* Quick filter chips — secondary row */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.2em] text-foreground-muted mr-1">
            Filter
          </span>
          <FilterChip
            href={prefixed(activeSlug, "on_sale=1")}
            label="On sale"
            tint="#a85a44"
          />
          <FilterChip
            href={prefixed(activeSlug, "in_stock=1")}
            label="In stock"
            tint="#5e7f54"
          />
          <FilterChip
            href={prefixed(activeSlug, "new=1")}
            label="New arrivals"
            tint="#3a6f93"
          />
          <FilterChip
            href={prefixed(activeSlug, "bestseller=1")}
            label="Bestsellers"
            tint="#a98937"
          />
        </div>
      </div>
    </section>
  );
}

function prefixed(slug: string | undefined, qs: string) {
  return slug ? `/category/${slug}?${qs}` : `/shop?${qs}`;
}

function CategoryChip({
  href,
  label,
  count,
  active,
}: {
  href: string;
  label: string;
  count: number;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={[
        "shrink-0 inline-flex items-center gap-2 h-11 px-5 rounded-full text-[13px] font-semibold whitespace-nowrap transition-all duration-200",
        active
          ? "bg-brand text-white shadow-[0_8px_22px_-10px_rgba(183,90,116,0.55)]"
          : "bg-white text-foreground/80 ring-1 ring-border hover:ring-brand/40 hover:text-brand hover:-translate-y-0.5 hover:shadow-[0_6px_14px_-8px_rgba(92,51,66,0.35)]",
      ].join(" ")}
    >
      {label}
      <span
        className={[
          "font-fraunces italic text-[11.5px] tabular-nums leading-none px-1.5 py-0.5 rounded-full",
          active ? "bg-white/20 text-white" : "bg-brand-soft/50 text-brand",
        ].join(" ")}
      >
        {count}
      </span>
    </Link>
  );
}

function FilterChip({
  href,
  label,
  tint,
}: {
  href: string;
  label: string;
  tint: string;
}) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-1.5 text-[12px] font-semibold rounded-full bg-white border border-border text-foreground/75 hover:text-foreground hover:border-brand/30 transition-colors px-3 py-1.5"
    >
      <span
        aria-hidden
        className="w-1.5 h-1.5 rounded-full transition-transform group-hover:scale-125"
        style={{ backgroundColor: tint }}
      />
      {label}
    </Link>
  );
}
