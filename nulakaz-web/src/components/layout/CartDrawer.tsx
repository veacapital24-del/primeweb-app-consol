"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { removeItem, updateQty } from "@/lib/cart-store";
import { useCart } from "@/lib/use-cart";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { formatPrice } from "@/lib/format";
import { site } from "@/lib/site";

// Slide-out cart drawer. Opens when the Header cart icon dispatches the
// `nulakaz-cart-open` custom event, so this component stays decoupled from
// the trigger and can sit at the layout level once.
//
// On open:
//   • backdrop fades in, panel slides in from the right
//   • body scroll is locked
//   • Esc closes
//   • product details for each cart row are fetched in a single batched
//     Supabase query (browser client + anon key) and cached in component
//     state so re-opens are instant.

export const CART_OPEN_EVENT = "nulakaz-cart-open";

type CartProduct = {
  slug: string;
  name: string;
  image_url: string | null;
  retail_price_mur: string | number;
  is_hard_discount: boolean;
};

const MINOR_UNIT = site.currency.decimals;
const SYMBOL = site.currency.symbol;

function priceMinorUnits(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "0";
  const n = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(n)) return "0";
  return Math.round(n * 100).toString();
}

export function CartDrawer() {
  const cart = useCart();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<Record<string, CartProduct>>({});

  // Avoid SSR mismatch — drawer only renders after first client paint.
  useEffect(() => setMounted(true), []);

  // Listen for the open event fired by the cart icon button.
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener(CART_OPEN_EVENT, handler);
    return () => window.removeEventListener(CART_OPEN_EVENT, handler);
  }, []);

  // Body scroll lock when open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Esc closes.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Fetch any cart rows we don't yet have product data for.
  useEffect(() => {
    if (!open || cart.length === 0) return;
    const missing = cart.map((c) => c.slug).filter((s) => !products[s]);
    if (missing.length === 0) return;

    let cancelled = false;
    const supabase = createSupabaseBrowserClient();
    supabase
      .from("products")
      .select("slug,name,image_url,retail_price_mur,is_hard_discount")
      .in("slug", missing)
      .then(({ data, error }) => {
        if (cancelled || error || !data) return;
        setProducts((prev) => {
          const next = { ...prev };
          for (const p of data as CartProduct[]) next[p.slug] = p;
          return next;
        });
      });

    return () => {
      cancelled = true;
    };
  }, [open, cart, products]);

  if (!mounted) return null;

  // Build resolved line items (cart row + product data, when available).
  const lines = cart.map((row) => ({
    row,
    product: products[row.slug] ?? null,
  }));

  // Subtotal — only counts rows with resolved product data.
  const subtotalMinor = lines.reduce((sum, l) => {
    if (!l.product) return sum;
    const unitMinor = Number(priceMinorUnits(l.product.retail_price_mur));
    return sum + unitMinor * l.row.qty;
  }, 0);
  const subtotal = formatPrice(subtotalMinor.toString(), MINOR_UNIT);
  const aboveFreeShip =
    subtotalMinor / Math.pow(10, MINOR_UNIT) >= site.delivery.freeOver;

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden={!open}
        onClick={() => setOpen(false)}
        className={[
          "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0 pointer-events-none",
        ].join(" ")}
      />

      {/* Panel — slides in from the left edge per the user's request */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={[
          "fixed top-0 left-0 z-50 h-full w-full sm:w-[440px] bg-background flex flex-col",
          "shadow-[30px_0_60px_-30px_rgba(92,51,66,0.45)]",
          "transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)]",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {/* Header */}
        <header className="flex items-center justify-between px-4 sm:px-6 py-5 border-b border-border bg-white">
          <div>
            <span className="block text-[11px] font-semibold uppercase tracking-[0.32em] text-foreground-muted">
              Your trolley
            </span>
            <h2 className="font-fraunces text-foreground text-[22px] leading-tight font-semibold">
              {cart.length === 0 ? (
                "Empty for now."
              ) : (
                <>
                  <span className="tabular-nums">
                    {cart.reduce((s, r) => s + r.qty, 0)}
                  </span>{" "}
                  <em className="italic font-light text-brand">
                    {cart.reduce((s, r) => s + r.qty, 0) === 1 ? "item" : "items"}
                  </em>
                </>
              )}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close cart"
            className="inline-flex items-center justify-center w-10 h-10 rounded-xl text-foreground/75 hover:text-brand hover:bg-brand-soft/40 ring-1 ring-transparent hover:ring-brand/15 transition-all duration-200 active:scale-95"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        {/* Free-delivery progress strip */}
        {cart.length > 0 && (
          <div className="px-4 sm:px-6 py-3 bg-brand-soft/40 border-b border-border">
            {aboveFreeShip ? (
              <p className="text-[12px] font-semibold text-foreground/85 inline-flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5e7f54]" />
                <span>
                  Free delivery{" "}
                  <em className="font-fraunces italic text-foreground">
                    unlocked
                  </em>{" "}
                  · spend {subtotal}
                </span>
              </p>
            ) : (
              <FreeShipProgress
                currentMinor={subtotalMinor}
                threshold={site.delivery.freeOver}
              />
            )}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <EmptyState onClose={() => setOpen(false)} />
          ) : (
            <ul className="divide-y divide-border">
              {lines.map(({ row, product }) => (
                <CartLine
                  key={row.id}
                  row={row}
                  product={product}
                  onClose={() => setOpen(false)}
                />
              ))}
            </ul>
          )}
        </div>

        {/* Sticky footer */}
        {cart.length > 0 && (
          <footer className="border-t border-border bg-white px-4 sm:px-6 py-5 space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground-muted">
                Subtotal
              </span>
              <span className="font-fraunces font-semibold text-foreground text-[24px] tabular-nums">
                {subtotal}
              </span>
            </div>
            <p className="text-[11.5px] text-foreground-muted">
              Taxes &amp; delivery calculated at checkout.
            </p>
            <Link
              href="/checkout"
              onClick={() => setOpen(false)}
              className="w-full inline-flex items-center justify-center gap-2 bg-brand text-white rounded-full h-12 font-semibold tracking-wide hover:bg-brand-dark transition-colors active:scale-[0.99]"
            >
              Checkout
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                aria-hidden
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="13 5 20 12 13 19" />
              </svg>
            </Link>
            <Link
              href="/cart"
              onClick={() => setOpen(false)}
              className="block text-center text-[12.5px] font-semibold tracking-wide text-foreground/70 hover:text-brand transition-colors"
            >
              View full cart
            </Link>
          </footer>
        )}
      </aside>
    </>
  );
}

function FreeShipProgress({
  currentMinor,
  threshold,
}: {
  currentMinor: number;
  threshold: number;
}) {
  const currentMajor = currentMinor / Math.pow(10, MINOR_UNIT);
  const remaining = Math.max(0, threshold - currentMajor);
  const pct = Math.min(100, Math.round((currentMajor / threshold) * 100));
  return (
    <>
      <p className="text-[12px] text-foreground/85 mb-1.5">
        <span className="font-semibold">{SYMBOL}{remaining.toFixed(0)}</span> away
        from{" "}
        <em className="font-fraunces italic text-brand">free delivery</em>.
      </p>
      <div className="h-1 bg-white rounded-full overflow-hidden">
        <div
          className="h-full bg-brand transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </>
  );
}

function CartLine({
  row,
  product,
  onClose,
}: {
  row: { id: number; slug: string; qty: number };
  product: CartProduct | null;
  onClose: () => void;
}) {
  const unitMinor = product
    ? priceMinorUnits(product.retail_price_mur)
    : "0";
  const lineMinor = (Number(unitMinor) * row.qty).toString();

  return (
    <li className="px-4 sm:px-6 py-4 flex items-start gap-3">
      <Link
        href={`/product/${row.slug}`}
        onClick={onClose}
        className="relative w-20 h-20 shrink-0 rounded-2xl bg-brand-soft/30 ring-1 ring-border overflow-hidden"
      >
        {product?.image_url && (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="80px"
            className="object-cover"
          />
        )}
      </Link>

      <div className="flex-1 min-w-0">
        <Link
          href={`/product/${row.slug}`}
          onClick={onClose}
          className="block font-fraunces font-semibold text-foreground text-[15px] leading-snug line-clamp-2 hover:text-brand transition-colors"
        >
          {product?.name ?? row.slug}
        </Link>
        <p className="mt-0.5 text-[12px] text-foreground-muted">
          <span className="font-fraunces italic">
            {formatPrice(unitMinor, MINOR_UNIT)}
          </span>{" "}
          each
        </p>

        <div className="mt-2.5 flex items-center justify-between gap-2">
          <div className="inline-flex items-center bg-white rounded-full ring-1 ring-border h-10 p-0.5">
            <button
              type="button"
              onClick={() => updateQty(row.id, row.qty - 1)}
              aria-label="Decrease"
              className="w-9 h-9 inline-flex items-center justify-center rounded-full text-foreground/70 hover:text-brand hover:bg-brand-soft/50 transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            <span className="w-8 text-center font-fraunces font-semibold text-[14px] text-foreground tabular-nums">
              {row.qty}
            </span>
            <button
              type="button"
              onClick={() => updateQty(row.id, row.qty + 1)}
              aria-label="Increase"
              className="w-9 h-9 inline-flex items-center justify-center rounded-full text-foreground/70 hover:text-brand hover:bg-brand-soft/50 transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
                <line x1="5" y1="12" x2="19" y2="12" />
                <line x1="12" y1="5" x2="12" y2="19" />
              </svg>
            </button>
          </div>

          <span className="font-fraunces font-semibold text-foreground text-[15px] tabular-nums shrink-0">
            {formatPrice(lineMinor, MINOR_UNIT)}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => removeItem(row.id)}
        aria-label={`Remove ${product?.name ?? row.slug}`}
        className="shrink-0 w-7 h-7 inline-flex items-center justify-center rounded-full text-foreground-muted hover:text-[#a85a44] hover:bg-[#f1d9d4]/60 transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      </button>
    </li>
  );
}

function EmptyState({ onClose }: { onClose: () => void }) {
  return (
    <div className="px-6 py-12 text-center">
      <span className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-soft/50 text-brand mb-5">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="9" cy="20" r="1.2" />
          <circle cx="19" cy="20" r="1.2" />
          <path d="M2 3h3l2.4 11.5a2 2 0 0 0 2 1.5h7.6a2 2 0 0 0 2-1.5L21 7H6" />
        </svg>
      </span>
      <h3 className="font-fraunces text-foreground text-xl font-semibold mb-1">
        Nothing in the trolley.
      </h3>
      <p className="text-[13px] text-foreground/70 mb-6 max-w-xs mx-auto">
        Add a few essentials and we&rsquo;ll bring them to your door tomorrow.
      </p>
      <Link
        href="/shop"
        onClick={onClose}
        className="inline-flex items-center gap-2 bg-brand text-white rounded-full h-11 px-6 text-sm font-semibold tracking-wide hover:bg-brand-dark transition-colors"
      >
        Start shopping
      </Link>
    </div>
  );
}
