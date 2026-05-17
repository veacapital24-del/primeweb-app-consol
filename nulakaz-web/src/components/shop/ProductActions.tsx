"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { addItem } from "@/lib/cart-store";

// Qty stepper + Add-to-cart + Buy-now. Modernised: stepper has a soft
// brand-tinted shell, the Add button shows a subtle "Added ✓" success
// state, and Buy now is the primary dark CTA. Live unit-price feeds the
// stepper subtotal line shown above the buttons.
export function ProductActions({
  productId,
  productSlug,
  productName,
  inStock,
  unitPriceMinor,
  minorUnit,
  currencySymbol,
}: {
  productId: number;
  productSlug: string;
  productName: string;
  inStock: boolean;
  /** Active price in minor units (cents); shown × qty in the live total */
  unitPriceMinor?: string;
  minorUnit?: number;
  currencySymbol?: string;
}) {
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const disabled = !inStock;

  // Compute the live subtotal for the chosen qty — purely visual feedback.
  const liveTotals =
    unitPriceMinor && minorUnit !== undefined && currencySymbol
      ? (() => {
          const unitVal = Number(unitPriceMinor);
          if (!Number.isFinite(unitVal)) return null;
          const div = Math.pow(10, minorUnit);
          return {
            unit: `${currencySymbol}${(unitVal / div).toFixed(2)}`,
            total: `${currencySymbol}${((unitVal * qty) / div).toFixed(2)}`,
          };
        })()
      : null;

  function handleAdd() {
    if (disabled) return;
    addItem({ id: productId, slug: productSlug, qty });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  }

  function handleBuyNow() {
    if (disabled) return;
    addItem({ id: productId, slug: productSlug, qty });
    router.push("/checkout");
  }

  return (
    <div className="space-y-3">
      {/* Live subtotal for the chosen qty */}
      {liveTotals && qty > 1 && (
        <p className="text-[12px] text-foreground-muted">
          <span className="font-fraunces italic">{qty}</span>
          <span className="mx-1.5">×</span>
          <span className="text-foreground/85 font-medium">
            {liveTotals.unit}
          </span>
          <span className="font-semibold text-foreground">
            {" "}= {liveTotals.total}
          </span>
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {/* Qty stepper */}
        <div className="inline-flex items-center bg-brand-soft/40 ring-1 ring-brand/15 rounded-full p-1">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1}
            className="w-9 h-9 flex items-center justify-center rounded-full text-brand bg-white ring-1 ring-brand/10 hover:bg-brand hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Decrease quantity"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <input
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
            className="w-12 text-center bg-transparent text-foreground font-fraunces font-semibold text-[17px] tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            type="button"
            onClick={() => setQty((q) => q + 1)}
            className="w-9 h-9 flex items-center justify-center rounded-full text-brand bg-white ring-1 ring-brand/10 hover:bg-brand hover:text-white transition-colors"
            aria-label="Increase quantity"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
              <line x1="5" y1="12" x2="19" y2="12" />
              <line x1="12" y1="5" x2="12" y2="19" />
            </svg>
          </button>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={disabled}
          aria-label={`Add ${productName} to cart`}
          className={[
            "inline-flex items-center gap-2 rounded-full h-11 px-6 font-semibold tracking-wide transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95",
            added
              ? "bg-[#5e7f54] text-white shadow-[0_8px_22px_-10px_rgba(94,127,84,0.55)]"
              : "bg-brand text-white hover:bg-brand-dark shadow-[0_10px_24px_-12px_rgba(183,90,116,0.6)]",
          ].join(" ")}
        >
          {added ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Added
            </>
          ) : (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="9" cy="20" r="1.2" />
                <circle cx="19" cy="20" r="1.2" />
                <path d="M2 3h3l2.4 11.5a2 2 0 0 0 2 1.5h7.6a2 2 0 0 0 2-1.5L21 7H6" />
              </svg>
              Add to cart
            </>
          )}
        </button>

        <button
          type="button"
          aria-label="Save to wishlist"
          className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-white ring-1 ring-border text-foreground/70 hover:text-brand hover:ring-brand/40 hover:bg-brand-soft/30 transition-all duration-200 active:scale-95"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      <button
        type="button"
        onClick={handleBuyNow}
        disabled={disabled}
        className="w-full inline-flex items-center justify-center gap-2 bg-foreground text-white rounded-full h-12 font-semibold tracking-wide hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
      >
        Buy now
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="13 5 20 12 13 19" />
        </svg>
      </button>
    </div>
  );
}
