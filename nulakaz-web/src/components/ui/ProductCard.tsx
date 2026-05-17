import Image from "next/image";
import Link from "next/link";
import type { WcProduct } from "@/types/wp";
import { AddToCartButton } from "@/components/ui/AddToCartButton";
import { formatPrice, formatPriceRange, stripHtml } from "@/lib/format";

// Matches the original product card: image on top, body (description),
// category, price (regular+sale strike if applicable), and a circular cart
// button in the bottom-right. "FEATURED" corner badge if applicable.
export function ProductCard({
  product,
  featured = false,
}: {
  product: WcProduct;
  featured?: boolean;
}) {
  const img = product.images?.[0];
  const category = product.categories?.[0]?.name;
  const hasRange = !!product.prices.price_range;
  const priceBlock = hasRange ? (
    <span className="text-brand-2 font-bold text-base">
      {formatPriceRange(
        product.prices.price_range!.min_amount,
        product.prices.price_range!.max_amount,
        product.prices.currency_minor_unit,
      )}
    </span>
  ) : product.on_sale ? (
    <span className="flex items-baseline gap-2">
      <span className="text-foreground-muted/70 line-through text-sm">
        {formatPrice(
          product.prices.regular_price,
          product.prices.currency_minor_unit,
        )}
      </span>
      <span className="text-brand-2 font-bold text-base">
        {formatPrice(
          product.prices.sale_price,
          product.prices.currency_minor_unit,
        )}
      </span>
    </span>
  ) : (
    <span className="text-brand-2 font-bold text-base">
      {formatPrice(product.prices.price, product.prices.currency_minor_unit)}
    </span>
  );

  return (
    <div className="relative bg-white flex flex-col p-5 h-full">
      {featured && (
        <span className="absolute top-3 left-3 z-10 bg-amber-400 text-[10px] font-bold text-white px-2 py-0.5 rounded-sm tracking-wider">
          FEATURED
        </span>
      )}
      <Link href={`/product/${product.slug}`} className="block">
        {/* Photo fills the square edge-to-edge (object-cover). Tinted
            background only shows when there's no image at all. */}
        <div className="relative aspect-square mb-4 rounded-xl overflow-hidden bg-brand-soft/30">
          {img ? (
            <Image
              src={img.src}
              alt={img.alt || product.name}
              fill
              sizes="(max-width: 768px) 50vw, 20vw"
              className="object-cover transition-transform duration-700 ease-out hover:scale-[1.05]"
            />
          ) : (
            <div className="absolute inset-0 bg-brand-soft/40" />
          )}
        </div>
        <h3 className="text-brand font-bold text-[15px] leading-snug mb-2 line-clamp-2">
          {product.name}
        </h3>
      </Link>

      {product.short_description && (
        <p className="text-[13px] text-foreground/80 leading-relaxed line-clamp-2 mb-3">
          {stripHtml(product.short_description)}
        </p>
      )}

      <div className="mt-auto pt-3 border-t border-border flex items-end justify-between">
        <div>
          {category && (
            <p className="text-[11px] text-foreground-muted uppercase tracking-wide mb-1">
              {category}
            </p>
          )}
          {priceBlock}
        </div>
        <AddToCartButton
          productId={product.id}
          productSlug={product.slug}
          productName={product.name}
          disabled={!product.is_in_stock}
          variant="icon"
        />
      </div>
    </div>
  );
}
