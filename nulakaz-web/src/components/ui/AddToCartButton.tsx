"use client";

import { useState } from "react";
import { addItem } from "@/lib/cart-store";

type Variant = "icon" | "pill" | "block";

export function AddToCartButton({
  productId,
  productSlug,
  productName,
  qty = 1,
  disabled = false,
  variant = "icon",
  className = "",
  label = "Add to cart",
}: {
  productId: number;
  productSlug: string;
  productName: string;
  qty?: number;
  disabled?: boolean;
  variant?: Variant;
  className?: string;
  label?: string;
}) {
  const [added, setAdded] = useState(false);

  function handleClick() {
    if (disabled) return;
    addItem({ id: productId, slug: productSlug, qty });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  }

  const base = "transition-colors inline-flex items-center justify-center font-bold shrink-0 disabled:opacity-50 disabled:cursor-not-allowed";

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        aria-label={`Add ${productName} to cart`}
        aria-live="polite"
        className={[
          base,
          "w-10 h-10 sm:w-9 sm:h-9 rounded-full border",
          added
            ? "bg-[#5a8a3d] border-[#5a8a3d] text-white"
            : "bg-white border-brand/30 text-brand hover:bg-brand hover:text-white hover:border-brand",
          className,
        ].join(" ")}
      >
        {added ? <CheckIcon /> : <CartIcon />}
      </button>
    );
  }

  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        aria-label={`Add ${productName} to cart`}
        className={[
          base,
          "gap-1.5 h-9 px-3 rounded-full text-[12px]",
          added
            ? "bg-[#5a8a3d] text-white"
            : "bg-brand text-white hover:bg-brand-dark",
          className,
        ].join(" ")}
      >
        {added ? (
          <>
            <CheckIcon /> Added
          </>
        ) : (
          <>
            <CartIcon /> {label}
          </>
        )}
      </button>
    );
  }

  // block — full width CTA used on product detail
  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      aria-label={`Add ${productName} to cart`}
      className={[
        base,
        "h-11 px-7 rounded-full text-sm",
        added
          ? "bg-[#5a8a3d] text-white"
          : "bg-brand text-white hover:bg-brand-dark",
        className,
      ].join(" ")}
    >
      {added ? "Added to cart ✓" : label}
    </button>
  );
}

function CartIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
