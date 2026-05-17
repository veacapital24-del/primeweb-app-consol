"use client";

import { useCartCount } from "@/lib/use-cart";
import { CART_OPEN_EVENT } from "@/components/layout/CartDrawer";

// Cart icon-button — clicking dispatches a `nulakaz-cart-open` event that
// the CartDrawer (mounted in the root layout) listens for. Decoupled trigger
// so the badge stays a tiny header element without owning drawer state.
//
// Right-click (or middle-click "open in new tab") still falls through to
// nothing — by design we keep cart contents in the drawer; the dedicated
// /cart page is reachable from inside the drawer.
export function CartIconBadge() {
  const count = useCartCount();
  const hasItems = count > 0;
  const display = count > 99 ? "99+" : count.toString();

  function openDrawer() {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent(CART_OPEN_EVENT));
  }

  return (
    <button
      type="button"
      onClick={openDrawer}
      aria-label={`Open cart (${count} ${count === 1 ? "item" : "items"})`}
      className="group/icon relative inline-flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-md bg-white text-brand ring-1 ring-brand/10 hover:bg-brand hover:text-white hover:ring-brand active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 transition-all duration-200"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.85"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-transform duration-200 group-hover/icon:scale-110"
        aria-hidden
      >
        <circle cx="9" cy="20" r="1.2" />
        <circle cx="19" cy="20" r="1.2" />
        <path d="M2 3h3l2.4 11.5a2 2 0 0 0 2 1.5h7.6a2 2 0 0 0 2-1.5L21 7H6" />
      </svg>

      {hasItems && (
        <span
          aria-hidden
          className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 inline-flex items-center justify-center rounded-full bg-brand text-white text-[10.5px] font-bold tabular-nums leading-none ring-2 ring-white shadow-[0_2px_6px_-2px_rgba(92,51,66,0.55)] group-hover/icon:bg-foreground transition-colors"
        >
          {display}
        </span>
      )}
    </button>
  );
}
