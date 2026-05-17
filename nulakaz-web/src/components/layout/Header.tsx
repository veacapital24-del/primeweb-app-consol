"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AccountMenu } from "@/components/layout/AccountMenu";
import { CartIconBadge } from "@/components/layout/CartIconBadge";
import { CategoriesMenu } from "@/components/layout/CategoriesMenu";
import { site } from "@/lib/site";

// Modern application-style site header.
//
//   • Sticky, with a permanent hairline border at rest and a subtle shadow
//     on scroll.
//   • Slim "compact on scroll" — the bar shrinks from 80→64 on desktop
//     after 24 px of scroll, similar to premium SaaS / e-commerce apps.
//   • Layout:
//       mobile (<md): row 1 = wordmark + Categories pill + icons cluster
//                     row 2 = search field (full width)
//       md+        : single row: wordmark · Categories · search · icons
//   • Search uses a clean neutral field (white bg + border-border) instead
//     of the previous tinted pink, so it doesn't compete with the burgundy
//     Categories pill. Magnifier glass is always visible.
export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={[
        "sticky top-0 z-30 transition-[box-shadow,background,border-color] duration-300",
        "bg-white/92 backdrop-blur-md",
        scrolled
          ? "border-b border-border/60 shadow-[0_8px_24px_-18px_rgba(92,51,66,0.4)]"
          : "border-b border-border/35",
      ].join(" ")}
    >
      <div
        className={[
          "mx-auto w-full px-3 sm:px-4 md:px-6 lg:px-10 xl:px-16 2xl:px-24",
          "py-3 md:py-0 flex flex-wrap items-center gap-2 sm:gap-3 md:gap-5",
          // Compact-on-scroll: shrink the desktop row gently when scrolled.
          scrolled ? "md:h-[64px]" : "md:h-[80px]",
          "transition-[height] duration-300",
        ].join(" ")}
      >
        {/* Logo — full NuLakaz wordmark. Local asset (Logo/Mo Lakaz Logo 2025
            vendored into /public/logo/) so the storefront isn't dependent on
            the legacy nulakaz.com WP host. */}
        <Link
          href="/"
          aria-label={site.name}
          className="shrink-0 inline-flex items-center"
        >
          <Image
            src="/logo/nulakaz-wordmark.webp"
            alt={site.name}
            // Native asset is 3139×1015 (≈3.09:1).
            width={170}
            height={55}
            preload
            className={[
              "w-auto object-contain transition-[height] duration-300",
              scrolled ? "h-8 sm:h-9" : "h-9 sm:h-10 md:h-11",
            ].join(" ")}
          />
        </Link>

        {/* Categories mega menu — ml-auto on mobile so it hugs the right edge */}
        <CategoriesMenu />

        {/* Search — sits beside the Categories pill on the mobile second row,
            expands to fill on md+. White field, neutral border, brand-tinted
            focus ring. Always shows the magnifier glass on the left for
            instant recognition. */}
        <form
          role="search"
          className={[
            "order-5 md:order-none flex-1 min-w-0 md:flex-1 max-w-2xl",
            "flex items-center gap-2 bg-white rounded-full h-11 pl-3 sm:pl-4 pr-1.5",
            "border border-border hover:border-brand/40",
            "focus-within:border-brand/55 focus-within:ring-2 focus-within:ring-brand/15",
            "transition-colors",
          ].join(" ")}
          action="/shop"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-foreground-muted shrink-0"
            aria-hidden
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="search"
            name="q"
            placeholder="Search products, brands, recipes…"
            className="flex-1 min-w-0 bg-transparent outline-none placeholder:text-foreground-muted/70 text-foreground text-sm md:text-[15px]"
          />
          <button
            type="submit"
            aria-label="Search"
            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-brand text-white hover:bg-brand-dark transition-colors shrink-0"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="13 5 20 12 13 19" />
            </svg>
          </button>
        </form>

        {/* Monthly Box CTA — sits between the search and the icon cluster on
            md+. Soft brand-tinted pill at idle, full brand burgundy on hover.
            ml-auto pushes both this button AND the icons cluster all the way
            to the right edge of the row. Hidden on mobile to keep the
            header tight; the homepage promotes /monthly-essentials there. */}
        <Link
          href="/monthly-essentials"
          className="hidden md:inline-flex items-center gap-2 md:ml-auto shrink-0 h-10 px-4 rounded-full bg-brand-soft/40 ring-1 ring-brand/15 text-brand text-[13px] font-semibold tracking-tight hover:bg-brand hover:text-white hover:ring-brand transition-all duration-200 active:scale-[0.97] group/box"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.85"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform duration-200 group-hover/box:scale-110 group-hover/box:rotate-[-6deg]"
            aria-hidden
          >
            <path d="m12.89 1.45 8 4A2 2 0 0 1 22 7.24v9.53a2 2 0 0 1-1.11 1.79l-8 4a2 2 0 0 1-1.79 0l-8-4A2 2 0 0 1 2 16.76V7.24a2 2 0 0 1 1.11-1.79l8-4a2 2 0 0 1 1.78 0z" />
            <polyline points="2.32 6.16 12 11 21.68 6.16" />
            <line x1="12" y1="22.76" x2="12" y2="11" />
          </svg>
          Monthly Box
        </Link>

        {/* Right icons cluster — modern unified icon-button language with
            a clearly-designed idle state: tinted brand-soft pill background,
            thin brand-tinted ring, and a deeper brand fill on hover.
            Wishlist / Account / Cart all share the exact same pattern so
            the cluster reads as one crafted nav element. */}
        <div className="order-2 md:order-none ml-auto md:ml-0 flex items-center gap-1.5 md:gap-2 shrink-0 bg-brand-soft/30 ring-1 ring-brand/10 rounded-lg p-1 md:p-1.5">
          {/* Monthly Box — mobile-only quick access. The "Monthly Box" pill
              earlier in the header serves the same purpose at md+, so we
              hide this icon there to avoid duplicating the entry point. */}
          <Link
            href="/monthly-essentials"
            aria-label="Monthly Box"
            className="md:hidden group/icon relative inline-flex items-center justify-center w-9 h-9 rounded-md bg-white text-brand ring-1 ring-brand/10 hover:bg-brand hover:text-white hover:ring-brand active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 transition-all duration-200"
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
              <path d="m12.89 1.45 8 4A2 2 0 0 1 22 7.24v9.53a2 2 0 0 1-1.11 1.79l-8 4a2 2 0 0 1-1.79 0l-8-4A2 2 0 0 1 2 16.76V7.24a2 2 0 0 1 1.11-1.79l8-4a2 2 0 0 1 1.78 0z" />
              <polyline points="2.32 6.16 12 11 21.68 6.16" />
              <line x1="12" y1="22.76" x2="12" y2="11" />
            </svg>
          </Link>
          <Link
            href="/wishlist"
            aria-label="Wishlist"
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
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </Link>
          <AccountMenu />
          <CartIconBadge />
        </div>

        {/* Mobile-only row-break sentinel: forces the Categories pill +
            Search field to wrap onto a second row below the logo + icons.
            order-3 sits between the icons cluster (order-2) and the
            CategoriesMenu (order-4) so the wrap lands in the right spot. */}
        <div
          aria-hidden
          className="order-3 basis-full h-0 md:hidden"
        />
      </div>
    </header>
  );
}
