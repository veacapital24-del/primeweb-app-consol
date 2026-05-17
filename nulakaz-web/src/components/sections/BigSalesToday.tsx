import Image from "next/image";
import Link from "next/link";
import type { WcProduct } from "@/types/wp";
import { formatPrice, formatPriceRange, stripHtml } from "@/lib/format";
import { Countdown } from "@/components/ui/Countdown";

// "Today's big cut" — editorial markdowns block.
//
// Header pairs a Fraunces oversized italic-mixed headline with a tall
// dark "countdown card" on the right. The grid drops the cell-with-borders
// look in favour of individual rounded white cards with stamped discount
// stickers, an editorial scarcity bar, and a hover lift to match the rest
// of the home page.

export function BigSalesToday({ products }: { products: WcProduct[] }) {
  if (!products.length) return null;

  return (
    <section className="mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24 mt-16">
      {/* Editorial header — eyebrow + headline + countdown card */}
      <header className="flex flex-wrap items-end justify-between gap-6 mb-8 md:mb-12">
        <div>
          <span className="inline-flex items-center gap-2 text-foreground-muted text-[11px] font-semibold uppercase tracking-[0.32em]">
            <span className="w-9 h-px bg-brand/40" />
            Today&rsquo;s markdowns
          </span>
          <h2 className="mt-3 font-fraunces text-foreground text-[32px] xs:text-[36px] sm:text-[44px] md:text-[56px] leading-[0.95] tracking-tight font-semibold">
            Today&rsquo;s big{" "}
            <em className="italic font-light text-brand">cut</em>
            <span className="text-brand">.</span>
          </h2>
          <p className="mt-3 max-w-md text-foreground/70 text-[14px] leading-relaxed">
            A short list of price drops we mean — the discount expires{" "}
            <span className="font-fraunces italic">tonight at midnight</span>,
            no extensions.
          </p>
        </div>

        {/* Countdown card — pill rail above the timer */}
        <div className="self-start md:self-end inline-flex flex-col items-end">
          <span className="inline-flex items-center gap-2 mb-3 text-foreground-muted text-[10px] font-semibold uppercase tracking-[0.32em]">
            <span className="relative flex w-2 h-2">
              <span className="absolute inset-0 rounded-full bg-brand animate-ping opacity-75" />
              <span className="relative w-2 h-2 rounded-full bg-brand" />
            </span>
            Sale ends in
          </span>
          <Countdown />
        </div>
      </header>

      {/* Product grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {products.slice(0, 5).map((p) => (
          <SaleCard key={p.id} product={p} />
        ))}
      </div>

      {/* Closing caption strip */}
      <div className="mt-8 flex flex-wrap items-baseline justify-between gap-3 text-[11px] tracking-[0.32em] uppercase text-foreground-muted">
        <span className="font-semibold">Posted at the till · Honoured till midnight</span>
        <Link
          href="/shop"
          className="font-fraunces italic text-sm tracking-normal text-brand hover:text-brand-dark transition-colors normal-case"
        >
          See every markdown &nbsp;→
        </Link>
      </div>
    </section>
  );
}

function SaleCard({ product }: { product: WcProduct }) {
  const img = product.images?.[0];
  const discount =
    product.on_sale &&
    Number(product.prices.regular_price) > 0 &&
    Number(product.prices.sale_price) > 0
      ? Math.round(
          (1 -
            Number(product.prices.sale_price) /
              Number(product.prices.regular_price)) *
            100,
        )
      : null;

  // Pseudo-deterministic scarcity numbers (Store API doesn't expose this) —
  // derived from the slug hash so layout is stable across renders.
  const sold = ((product.id * 7) % 40) + 8;
  const available = ((product.id * 11) % 20) + 2;
  const total = sold + available;
  const soldPct = Math.min(95, Math.round((sold / total) * 100));
  const isLow = available <= 5;
  const isMarkdown = product.id % 3 === 0;

  return (
    <article className="group relative bg-white rounded-[22px] ring-1 ring-border hover:ring-brand/30 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_18px_40px_-22px_rgba(92,51,66,0.4)] overflow-hidden flex flex-col">
      {/* Stamped discount sticker — top-right, rotated like vintage deli sales */}
      {discount && (
        <span
          aria-hidden
          className="absolute top-3 right-3 z-20 flex flex-col items-center justify-center w-14 h-14 rounded-full bg-white text-brand font-bold leading-none -rotate-[8deg] shadow-[0_6px_18px_-8px_rgba(0,0,0,0.45)] border-[2.5px] border-dashed border-brand/30"
        >
          <span className="font-fraunces italic text-[8px] tracking-[0.2em] uppercase text-brand-dark/70 leading-none">
            Save
          </span>
          <span className="font-fraunces font-semibold text-[15px] -mt-0.5 text-brand">
            {discount}%
          </span>
        </span>
      )}

      {/* Top-left pill stack */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {isMarkdown && (
          <span className="inline-flex items-center gap-1 bg-foreground text-white text-[9px] font-bold tracking-[0.18em] uppercase px-2 py-0.5 rounded-full">
            <span className="w-1 h-1 rounded-full bg-[#dde7c5]" />
            Markdown
          </span>
        )}
        {!product.is_in_stock && (
          <span className="bg-[#a85a44] text-white text-[9px] font-bold tracking-[0.18em] uppercase px-2 py-0.5 rounded-full">
            Sold out
          </span>
        )}
      </div>

      {/* Image with hover zoom — fills the framed square edge-to-edge */}
      <Link
        href={`/product/${product.slug}`}
        className="block relative aspect-square m-3 mb-0 rounded-[16px] bg-brand-soft/30 overflow-hidden"
      >
        {img && (
          <Image
            src={img.src}
            alt={img.alt || product.name}
            fill
            sizes="(max-width: 768px) 50vw, 20vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
          />
        )}
      </Link>

      {/* Body */}
      <div className="px-4 sm:px-5 pt-3 sm:pt-4 pb-4 sm:pb-5 flex flex-col flex-1">
        {/* Editorial scarcity bar */}
        <div className="mb-3.5">
          <div className="relative h-1 bg-brand-soft/50 rounded-full overflow-hidden">
            <div
              className={[
                "h-full rounded-full transition-all duration-500",
                isLow ? "bg-[#a85a44]" : "bg-brand",
              ].join(" ")}
              style={{ width: `${soldPct}%` }}
            />
          </div>
          <div className="mt-1.5 flex items-baseline justify-between gap-2 text-[10.5px] tracking-[0.18em] uppercase">
            <span className="text-foreground-muted font-semibold">
              Sold <span className="font-fraunces italic normal-case tracking-normal text-foreground/80 text-[12px]">{sold}</span>
            </span>
            <span
              className={[
                "font-semibold",
                isLow ? "text-[#a85a44]" : "text-foreground-muted",
              ].join(" ")}
            >
              <span className="font-fraunces italic normal-case tracking-normal text-[12px]">
                {available} left
              </span>
            </span>
          </div>
        </div>

        <Link href={`/product/${product.slug}`} className="block">
          <h3 className="font-fraunces text-foreground text-[17px] leading-tight font-semibold line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {product.short_description && (
          <p className="mt-1.5 text-[12.5px] text-foreground/70 leading-relaxed line-clamp-2">
            {stripHtml(product.short_description)}
          </p>
        )}

        {/* Price + cart action */}
        <div className="mt-auto pt-4 border-t border-dashed border-foreground/15 flex items-end justify-between gap-3">
          <div>
            <p className="font-fraunces italic text-[10.5px] text-foreground-muted tracking-[0.16em] uppercase mb-0.5">
              {product.categories?.[0]?.name ?? "All"}
            </p>
            {product.on_sale ? (
              <span className="flex flex-col leading-tight">
                <span className="font-fraunces italic text-foreground-muted/80 line-through text-[12px]">
                  {formatPrice(
                    product.prices.regular_price,
                    product.prices.currency_minor_unit,
                  )}
                </span>
                <span className="font-fraunces font-semibold text-brand text-[18px] leading-none">
                  {formatPrice(
                    product.prices.sale_price,
                    product.prices.currency_minor_unit,
                  )}
                </span>
              </span>
            ) : product.prices.price_range ? (
              <span className="font-fraunces font-semibold text-brand text-[16px]">
                {formatPriceRange(
                  product.prices.price_range.min_amount,
                  product.prices.price_range.max_amount,
                  product.prices.currency_minor_unit,
                )}
              </span>
            ) : (
              <span className="font-fraunces font-semibold text-brand text-[18px]">
                {formatPrice(
                  product.prices.price,
                  product.prices.currency_minor_unit,
                )}
              </span>
            )}
          </div>

          <button
            type="button"
            aria-label={`Add ${product.name} to cart`}
            disabled={!product.is_in_stock}
            className="shrink-0 w-10 h-10 rounded-full bg-foreground text-white flex items-center justify-center hover:bg-brand transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <circle cx="9" cy="20" r="1" />
              <circle cx="19" cy="20" r="1" />
              <path d="M2 3h3l2.4 11.5a2 2 0 0 0 2 1.5h7.6a2 2 0 0 0 2-1.5L21 7H6" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}
