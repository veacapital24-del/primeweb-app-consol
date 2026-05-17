"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { removeItem, updateQty } from "@/lib/cart-store";
import { useCart } from "@/lib/use-cart";
import { formatPrice } from "@/lib/format";
import { site } from "@/lib/site";
import type { WcProduct } from "@/types/wp";

// Cart page body — editorial header in the sticky summary, card-style line
// items (no more spreadsheet-y desktop table), modern brand-soft qty
// stepper, free-delivery progress meter, trust cues, and a clean totals
// breakdown that includes savings vs MSRP.

export function CartView({ products }: { products: WcProduct[] }) {
  const cart = useCart();
  const byId = useMemo(
    () => new Map(products.map((p) => [p.id, p] as const)),
    [products],
  );

  const items = cart
    .map((c) => {
      const p = byId.get(c.id);
      return p ? { product: p, qty: c.qty } : null;
    })
    .filter((x): x is { product: WcProduct; qty: number } => Boolean(x));

  const minorUnit = items[0]?.product.prices.currency_minor_unit ?? 2;
  const div = Math.pow(10, minorUnit);

  // Subtotal at active price (sale price if on_sale).
  const subtotalMinor = items.reduce((sum, { product, qty }) => {
    const unit = product.on_sale
      ? Number(product.prices.sale_price)
      : Number(product.prices.price);
    return sum + unit * qty;
  }, 0);

  // What the same trolley would cost at MSRP — the difference is "savings".
  const msrpMinor = items.reduce((sum, { product, qty }) => {
    const reg = Number(product.prices.regular_price) || Number(product.prices.price);
    return sum + reg * qty;
  }, 0);
  const savingsMinor = Math.max(0, msrpMinor - subtotalMinor);

  const freeOverMinor = site.delivery.freeOver * div;
  const shippingMinor =
    subtotalMinor === 0
      ? 0
      : subtotalMinor >= freeOverMinor
        ? 0
        : 150 * div;
  const totalMinor = subtotalMinor + shippingMinor;

  const totalQty = items.reduce((s, { qty }) => s + qty, 0);

  if (items.length === 0) return <EmptyState />;

  return (
    <>
      {/* Editorial header */}
      <header className="mb-8 md:mb-10">
        <span className="inline-flex items-center gap-2 text-foreground-muted text-[11px] font-semibold uppercase tracking-[0.32em]">
          <span className="w-9 h-px bg-brand/40" />
          Your cart
        </span>
        <h1 className="mt-2 font-fraunces text-foreground text-[28px] xs:text-[32px] sm:text-[40px] md:text-[52px] leading-[0.95] tracking-tight font-semibold">
          Your{" "}
          <em className="italic font-light text-brand">trolley</em>
          <span className="text-brand">.</span>
        </h1>
        <p className="mt-2 text-sm text-foreground/70">
          <span className="font-semibold text-foreground tabular-nums">
            {totalQty}
          </span>{" "}
          {totalQty === 1 ? "item" : "items"} totalling{" "}
          <span className="font-fraunces font-semibold text-foreground tabular-nums">
            {formatPrice(subtotalMinor, minorUnit)}
          </span>
          {savingsMinor > 0 && (
            <>
              {" "}— you&rsquo;re saving{" "}
              <span className="font-fraunces italic text-[#5e7f54]">
                {formatPrice(savingsMinor, minorUnit)}
              </span>
            </>
          )}
          .
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] lg:grid-cols-[1fr_380px] gap-4 md:gap-6 lg:gap-8">
        {/* Line items column */}
        <section className="flex flex-col gap-3">
          {/* Free-delivery progress meter */}
          <FreeShipMeter
            currentMinor={subtotalMinor}
            thresholdMajor={site.delivery.freeOver}
            minorUnit={minorUnit}
          />

          {/* Card-style line items (replaces the desktop table). One layout
              for every breakpoint — fewer styles to maintain. */}
          <ul className="bg-white rounded-2xl ring-1 ring-border divide-y divide-border overflow-hidden">
            {items.map(({ product: p, qty }) => (
              <CartLine
                key={p.id}
                product={p}
                qty={qty}
                minorUnit={minorUnit}
              />
            ))}
          </ul>

          {/* Footer row: continue shopping + coupon */}
          <div className="flex items-center justify-between flex-wrap gap-3 mt-2">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-[12.5px] font-semibold uppercase tracking-[0.18em] text-foreground/75 hover:text-brand transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Continue shopping
            </Link>

            <CouponForm />
          </div>
        </section>

        {/* Totals panel */}
        <aside className="bg-white rounded-2xl ring-1 ring-border p-5 sm:p-6 h-fit md:sticky md:top-20 lg:top-24">
          <header className="mb-5 pb-4 border-b border-dashed border-foreground/15">
            <span className="block text-[11px] font-semibold uppercase tracking-[0.32em] text-foreground-muted">
              Summary
            </span>
            <h2 className="font-fraunces text-foreground text-[22px] leading-tight font-semibold mt-1">
              The{" "}
              <em className="italic font-light text-brand">tally</em>.
            </h2>
          </header>

          <dl className="space-y-3 text-[13.5px] mb-5">
            <Row
              label="Subtotal"
              value={formatPrice(subtotalMinor, minorUnit)}
            />
            {savingsMinor > 0 && (
              <Row
                label="Savings"
                value={`− ${formatPrice(savingsMinor, minorUnit)}`}
                tint="#5e7f54"
              />
            )}
            <Row
              label="Delivery"
              value={
                shippingMinor === 0
                  ? "Free"
                  : formatPrice(shippingMinor, minorUnit)
              }
              hint={
                shippingMinor === 0
                  ? site.delivery.window
                  : `Free over ${site.currency.symbol}${site.delivery.freeOver.toLocaleString()}`
              }
              tint={shippingMinor === 0 ? "#5e7f54" : undefined}
            />
          </dl>

          <div className="flex items-baseline justify-between mb-5 pt-4 border-t border-dashed border-foreground/15">
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground-muted">
              Total
            </span>
            <span className="font-fraunces font-semibold text-[28px] text-foreground tabular-nums">
              {formatPrice(totalMinor, minorUnit)}
            </span>
          </div>

          <Link
            href="/checkout"
            className="w-full inline-flex items-center justify-center gap-2 bg-brand text-white rounded-full h-12 font-semibold tracking-wide hover:bg-brand-dark transition-colors active:scale-[0.99] shadow-[0_10px_24px_-12px_rgba(183,90,116,0.6)]"
          >
            Proceed to checkout
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="13 5 20 12 13 19" />
            </svg>
          </Link>

          {/* Mini trust strip */}
          <ul className="mt-5 grid grid-cols-3 gap-2 text-[11.5px] text-foreground/70">
            <TrustCue
              label="Next-day"
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
              label="Secure"
              tint="#f5e7c4"
              tintFg="#a98937"
              icon={
                <>
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </>
              }
            />
            <TrustCue
              label="Returns"
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
          </ul>

          <p className="mt-4 text-[11px] text-foreground-muted text-center leading-relaxed">
            Taxes calculated at checkout · {site.delivery.leadTime}
          </p>
        </aside>
      </div>
    </>
  );
}

function CartLine({
  product: p,
  qty,
  minorUnit,
}: {
  product: WcProduct;
  qty: number;
  minorUnit: number;
}) {
  const unit = p.on_sale
    ? Number(p.prices.sale_price)
    : Number(p.prices.price);
  const lineMinor = unit * qty;
  const img = p.images?.[0];

  // Discount % — only when both prices are real and there's an actual gap.
  const reg = Number(p.prices.regular_price);
  const sale = Number(p.prices.sale_price);
  const discountPct =
    p.on_sale && reg > 0 && sale > 0 && reg > sale
      ? Math.round((1 - sale / reg) * 100)
      : null;

  // Stock micro-chip — sage / mustard / terracotta based on availability.
  const stockChip = p.is_in_stock
    ? p.low_stock_remaining !== null && p.low_stock_remaining !== undefined
      ? {
          label: `Only ${p.low_stock_remaining} left`,
          bg: "#fbe8da",
          fg: "#a85a44",
          dot: "#a85a44",
        }
      : {
          label: "In stock",
          bg: "#e7eed4",
          fg: "#3f5b35",
          dot: "#5e7f54",
        }
    : {
        label: "Out of stock",
        bg: "#f1d9d4",
        fg: "#7a3026",
        dot: "#a85a44",
      };

  return (
    <li className="group/line relative p-4 sm:p-5 flex items-start gap-4 transition-colors hover:bg-brand-soft/15">
      {/* Image — slow zoom on hover, optional stamped sale sticker */}
      <Link
        href={`/product/${p.slug}`}
        className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-2xl bg-brand-soft/30 ring-1 ring-border overflow-hidden"
      >
        {img && (
          <Image
            src={img.src}
            alt={img.alt || p.name}
            fill
            sizes="112px"
            className="object-cover transition-transform duration-700 ease-out group-hover/line:scale-[1.05]"
          />
        )}
        {discountPct !== null && (
          <span
            aria-hidden
            className="absolute -top-1.5 -right-1.5 inline-flex flex-col items-center justify-center w-12 h-12 rounded-full bg-white text-brand font-bold leading-none -rotate-[10deg] shadow-[0_5px_12px_-4px_rgba(0,0,0,0.35)] border-[2px] border-dashed border-brand/30"
          >
            <span className="font-fraunces italic text-[7.5px] tracking-[0.18em] uppercase text-brand-dark/70 leading-none">
              Save
            </span>
            <span className="font-fraunces font-semibold text-[12px] -mt-0.5 text-brand">
              {discountPct}%
            </span>
          </span>
        )}
      </Link>

      <div className="flex-1 min-w-0">
        {/* Top row: category + name + remove */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {p.categories?.[0] && (
              <Link
                href={`/category/${p.categories[0].slug}`}
                className="inline-block text-[10.5px] font-semibold uppercase tracking-[0.22em] text-foreground-muted hover:text-brand transition-colors mb-0.5"
              >
                {p.categories[0].name}
              </Link>
            )}
            <Link
              href={`/product/${p.slug}`}
              className="block font-fraunces font-semibold text-foreground text-[16px] sm:text-[17.5px] leading-snug hover:text-brand transition-colors line-clamp-2"
            >
              {p.name}
            </Link>

            {/* Price + stock row */}
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px]">
              {p.on_sale && reg > sale && (
                <span className="line-through font-fraunces italic text-foreground-muted/80">
                  {formatPrice(p.prices.regular_price, minorUnit)}
                </span>
              )}
              <span className="font-fraunces italic text-foreground/85">
                {formatPrice(unit, minorUnit)}{" "}
                <span className="text-foreground-muted/80 not-italic font-sans">
                  each
                </span>
              </span>
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-semibold"
                style={{ backgroundColor: stockChip.bg, color: stockChip.fg }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: stockChip.dot }}
                />
                {stockChip.label}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => removeItem(p.id)}
            aria-label={`Remove ${p.name}`}
            className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full text-foreground-muted hover:text-[#a85a44] hover:bg-[#f1d9d4]/60 transition-colors active:scale-95"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>

        {/* Bottom row: stepper + "qty × unit" breakdown + line total */}
        <div className="mt-3 pt-3 border-t border-dashed border-foreground/10 flex items-center justify-between gap-3 flex-wrap">
          <QtyControl
            qty={qty}
            onIncrement={() => updateQty(p.id, qty + 1)}
            onDecrement={() => updateQty(p.id, Math.max(1, qty - 1))}
          />
          <div className="flex items-baseline gap-2 ml-auto">
            {qty > 1 && (
              <span className="text-[11.5px] text-foreground-muted hidden sm:inline">
                <span className="font-fraunces italic">{qty}</span>
                <span className="mx-1">×</span>
                <span className="font-fraunces italic">
                  {formatPrice(unit, minorUnit)}
                </span>
              </span>
            )}
            <span className="font-fraunces font-semibold text-foreground text-[19px] tabular-nums">
              {formatPrice(lineMinor, minorUnit)}
            </span>
          </div>
        </div>
      </div>
    </li>
  );
}

function QtyControl({
  qty,
  onIncrement,
  onDecrement,
}: {
  qty: number;
  onIncrement: () => void;
  onDecrement: () => void;
}) {
  return (
    <div className="inline-flex items-center bg-brand-soft/40 ring-1 ring-brand/15 rounded-full p-1">
      <button
        type="button"
        onClick={onDecrement}
        disabled={qty <= 1}
        aria-label="Decrease quantity"
        className="w-9 h-9 flex items-center justify-center rounded-full text-brand bg-white ring-1 ring-brand/10 hover:bg-brand hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
      <span className="w-9 text-center font-fraunces font-semibold text-[15px] text-foreground tabular-nums">
        {qty}
      </span>
      <button
        type="button"
        onClick={onIncrement}
        aria-label="Increase quantity"
        className="w-9 h-9 flex items-center justify-center rounded-full text-brand bg-white ring-1 ring-brand/10 hover:bg-brand hover:text-white transition-colors"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
          <line x1="5" y1="12" x2="19" y2="12" />
          <line x1="12" y1="5" x2="12" y2="19" />
        </svg>
      </button>
    </div>
  );
}

function FreeShipMeter({
  currentMinor,
  thresholdMajor,
  minorUnit,
}: {
  currentMinor: number;
  thresholdMajor: number;
  minorUnit: number;
}) {
  const div = Math.pow(10, minorUnit);
  const currentMajor = currentMinor / div;
  const remainingMajor = Math.max(0, thresholdMajor - currentMajor);
  const pct = Math.min(100, Math.round((currentMajor / thresholdMajor) * 100));
  const unlocked = remainingMajor === 0;

  return (
    <div
      className={[
        "rounded-2xl px-5 py-4 flex flex-wrap items-center gap-4",
        unlocked
          ? "bg-[#dde7c5]/60 ring-1 ring-[#5e7f54]/25"
          : "bg-brand-soft/45 ring-1 ring-brand/15",
      ].join(" ")}
    >
      <span
        className={[
          "inline-flex items-center justify-center w-10 h-10 rounded-xl shrink-0",
          unlocked ? "bg-[#5e7f54] text-white" : "bg-white text-brand ring-1 ring-brand/15",
        ].join(" ")}
        aria-hidden
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6.5h11v9.5H3z" />
          <path d="M14 9.5h4l3 3v3.5h-7" />
          <circle cx="7" cy="17" r="2" />
          <circle cx="17" cy="17" r="2" />
        </svg>
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-foreground/85">
          {unlocked ? (
            <>
              You&rsquo;ve{" "}
              <em className="font-fraunces italic text-[#3f5b35]">unlocked</em>{" "}
              free delivery — we&rsquo;ll waive the fee at checkout.
            </>
          ) : (
            <>
              Spend{" "}
              <span className="font-fraunces italic text-foreground font-semibold">
                {site.currency.symbol}
                {remainingMajor.toFixed(0)}
              </span>{" "}
              more for{" "}
              <em className="font-fraunces italic text-brand">free delivery</em>.
            </>
          )}
        </p>
        <div className={["mt-2 h-1 rounded-full overflow-hidden", unlocked ? "bg-[#5e7f54]/20" : "bg-white"].join(" ")}>
          <div
            className={["h-full rounded-full transition-all duration-500", unlocked ? "bg-[#5e7f54]" : "bg-brand"].join(" ")}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function CouponForm() {
  const [applied, setApplied] = useState(false);
  return (
    <form
      className="flex items-center gap-2 flex-wrap"
      onSubmit={(e) => {
        e.preventDefault();
        setApplied(true);
        window.setTimeout(() => setApplied(false), 1800);
      }}
    >
      <div className="inline-flex items-center bg-white ring-1 ring-border rounded-full h-10 pl-4 pr-1 focus-within:ring-brand/40 transition-all">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground-muted mr-2" aria-hidden>
          <path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
        <input
          type="text"
          name="coupon"
          placeholder="Coupon code"
          className="bg-transparent outline-none text-[13px] placeholder:text-foreground-muted/70 w-32"
        />
        <button
          type="submit"
          className={[
            "inline-flex items-center justify-center px-4 h-8 rounded-full text-[12px] font-semibold tracking-wide transition-colors",
            applied
              ? "bg-[#5e7f54] text-white"
              : "bg-brand text-white hover:bg-brand-dark",
          ].join(" ")}
        >
          {applied ? "Applied ✓" : "Apply"}
        </button>
      </div>
    </form>
  );
}

function Row({
  label,
  value,
  hint,
  tint,
}: {
  label: string;
  value: string;
  hint?: string;
  tint?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-foreground/75">
        {label}
        {hint && (
          <span className="block text-[11px] text-foreground-muted">
            {hint}
          </span>
        )}
      </dt>
      <dd
        className="font-fraunces font-semibold text-foreground tabular-nums"
        style={tint ? { color: tint } : undefined}
      >
        {value}
      </dd>
    </div>
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
    <li className="flex flex-col items-center gap-1.5 text-center">
      <span
        className="inline-flex items-center justify-center w-9 h-9 rounded-xl"
        style={{ backgroundColor: tint }}
        aria-hidden
      >
        <svg
          width="15"
          height="15"
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
      <span className="font-medium text-foreground/80 leading-tight">
        {label}
      </span>
    </li>
  );
}

function EmptyState() {
  return (
    <>
      <header className="mb-8 md:mb-10">
        <span className="inline-flex items-center gap-2 text-foreground-muted text-[11px] font-semibold uppercase tracking-[0.32em]">
          <span className="w-9 h-px bg-brand/40" />
          Your cart
        </span>
        <h1 className="mt-2 font-fraunces text-foreground text-[28px] xs:text-[32px] sm:text-[40px] md:text-[52px] leading-[0.95] tracking-tight font-semibold">
          Empty{" "}
          <em className="italic font-light text-brand">trolley</em>
          <span className="text-brand">.</span>
        </h1>
        <p className="mt-2 text-sm text-foreground/70">
          Add a few essentials and we&rsquo;ll bring them to your door tomorrow.
        </p>
      </header>

      <div className="bg-white rounded-2xl ring-1 ring-border p-12 text-center">
        <span className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-soft/60 text-brand mb-5">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="9" cy="20" r="1.2" />
            <circle cx="19" cy="20" r="1.2" />
            <path d="M2 3h3l2.4 11.5a2 2 0 0 0 2 1.5h7.6a2 2 0 0 0 2-1.5L21 7H6" />
          </svg>
        </span>
        <h2 className="font-fraunces text-foreground text-2xl font-semibold mb-1">
          Nothing on the list yet.
        </h2>
        <p className="text-sm text-foreground/70 max-w-sm mx-auto mb-6">
          Browse the shelves to start filling your trolley — we&rsquo;ll keep
          everything safe right here.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-brand text-white rounded-full h-11 px-6 text-sm font-semibold tracking-wide hover:bg-brand-dark transition-colors"
          >
            Browse the shop
          </Link>
          <Link
            href="/monthly-essentials"
            className="inline-flex items-center gap-2 bg-white text-brand ring-1 ring-brand/30 rounded-full h-11 px-6 text-sm font-semibold tracking-wide hover:bg-brand hover:text-white transition-colors"
          >
            Try a Monthly Box
          </Link>
        </div>
      </div>
    </>
  );
}
