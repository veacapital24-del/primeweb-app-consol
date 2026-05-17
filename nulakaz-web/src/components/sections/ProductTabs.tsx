"use client";

import { useState } from "react";
import Link from "next/link";
import type { WcProduct } from "@/types/wp";
import { ProductCard } from "@/components/ui/ProductCard";

// Editorial "what's selling" section. Two tabs (Popular / Top Rated) sit on
// a segmented pill control with a sliding indicator, paired with a tall
// photographic promo card on the left and 4 product cards across the row.
// Visual language matches the hero / promo / categories redesign:
// uppercase 0.32em-tracked eyebrow, oversized Fraunces italic-mixed
// headline, and a closing micro-caption strip.

type TabId = "popular" | "top";

const TABS: Array<{ id: TabId; label: string; whisper: string }> = [
  { id: "popular", label: "Popular", whisper: "this week" },
  { id: "top", label: "Top Rated", whisper: "by you" },
];

const PROMO_BG =
  "https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&w=1200&q=80";

export function ProductTabs({
  popular,
  topRated,
}: {
  popular: WcProduct[];
  topRated: WcProduct[];
}) {
  const [tab, setTab] = useState<TabId>("popular");
  const items = (tab === "popular" ? popular : topRated).slice(0, 4);
  const tabIndex = TABS.findIndex((t) => t.id === tab);
  const activeMeta = TABS[tabIndex];

  return (
    <section className="mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24 mt-14">
      {/* Editorial header row — eyebrow + Fraunces headline + segmented tabs */}
      <header className="flex flex-wrap items-end justify-between gap-6 mb-8 md:mb-12">
        <div>
          <span className="inline-flex items-center gap-2 text-foreground-muted text-[11px] font-semibold uppercase tracking-[0.32em]">
            <span className="w-9 h-px bg-brand/40" />
            Pinned by Mauritius
          </span>
          <h2 className="mt-3 font-fraunces text-foreground text-[32px] xs:text-[36px] sm:text-[44px] md:text-[56px] leading-[0.95] tracking-tight font-semibold">
            Customer{" "}
            <em className="italic font-light text-brand">favourites</em>
            <span className="text-brand">.</span>
          </h2>
          <p className="mt-3 max-w-md text-foreground/70 text-[14px] leading-relaxed">
            Hand-picked from what&rsquo;s flying off the shelves and what
            you&rsquo;ve rated highest{" "}
            <span className="font-fraunces italic">
              {activeMeta?.whisper}
            </span>
            .
          </p>
        </div>

        {/* Segmented pill tabs with sliding indicator */}
        <div
          role="tablist"
          aria-label="Featured product list"
          className="relative inline-grid grid-flow-col auto-cols-fr items-center bg-brand-soft/40 ring-1 ring-brand/15 rounded-full p-1 gap-0 backdrop-blur-sm"
        >
          {/* Sliding background pill */}
          <span
            aria-hidden
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-brand transition-all duration-500 ease-[cubic-bezier(.4,1.4,.5,1)] shadow-[0_8px_22px_-6px_rgba(183,90,116,0.6)]"
            style={{ left: tab === "popular" ? "4px" : "50%" }}
          />
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={[
                "relative z-10 px-5 sm:px-7 md:px-9 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-[0.24em] whitespace-nowrap transition-colors duration-300",
                tab === t.id
                  ? "text-white"
                  : "text-brand/65 hover:text-brand",
              ].join(" ")}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {/* Promo + product grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        {/* Editorial dark photographic promo */}
        <Link
          href="/category/drinks"
          className="group relative overflow-hidden rounded-[26px] flex flex-col justify-end isolate min-h-[300px] sm:min-h-[360px] sm:col-span-2 lg:col-span-1 lg:min-h-0 ring-1 ring-black/10 hover:ring-white/30 shadow-[0_18px_45px_-25px_rgba(92,51,66,0.55)] hover:shadow-[0_28px_60px_-22px_rgba(92,51,66,0.6)] transition-all duration-500"
        >
          {/* Background photo — duplicated for hover-zoom isolation */}
          <span
            aria-hidden
            className="absolute inset-0 transition-transform duration-[1500ms] ease-out group-hover:scale-[1.07]"
            style={{
              backgroundImage: `url(${PROMO_BG})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          {/* Tinted overlay */}
          <span
            aria-hidden
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(170deg, rgba(110,80,40,0.35) 0%, rgba(140,98,52,0.55) 55%, rgba(74,52,28,0.88) 100%)",
            }}
          />
          {/* Paper grain */}
          <span
            aria-hidden
            className="absolute inset-0 opacity-[0.18] mix-blend-overlay pointer-events-none"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='5'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.4 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
            }}
          />

          {/* Top eyebrow */}
          <span
            aria-hidden
            className="absolute top-6 left-6 z-20 inline-flex items-center gap-2 text-white/90 text-[10px] tracking-[0.34em] uppercase font-semibold"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#f2c97a]" />
            Bestseller · Drinks
          </span>

          {/* Stamped circular badge */}
          <span
            aria-hidden
            className="absolute top-6 right-6 z-20 flex flex-col items-center justify-center w-20 h-20 rounded-full bg-white text-brand font-bold leading-none -rotate-[8deg] shadow-[0_8px_24px_-8px_rgba(0,0,0,0.45)] border-[3px] border-dashed border-brand/30"
          >
            <span className="font-fraunces italic text-[10px] tracking-[0.18em] uppercase text-brand-dark/70">
              Save
            </span>
            <span className="font-fraunces font-semibold text-2xl -mt-0.5 text-brand">
              20%
            </span>
          </span>

          {/* Body */}
          <div className="relative z-10 p-5 sm:p-7">
            <h3 className="font-fraunces text-white text-[28px] sm:text-[34px] md:text-[38px] leading-[0.98] tracking-tight font-semibold">
              Sweet{" "}
              <em className="italic font-light text-[#fde7c4] underline decoration-white/30 underline-offset-[8px]">
                organic
              </em>
              <br />
              drinks.
            </h3>
            <span className="mt-5 inline-flex items-center gap-2.5 text-white/95 text-xs font-semibold tracking-[0.22em] uppercase transition-all duration-300 group-hover:gap-4">
              Shop the shelf
              <span
                aria-hidden
                className="inline-block w-7 h-px bg-white/80 transition-all duration-300 group-hover:w-10 group-hover:bg-white"
              />
            </span>
          </div>
        </Link>

        {/* Product cards — wrapped in a transitioning container so the tab
            switch fades + lifts instead of jump-cutting */}
        {items.map((p, i) => (
          <div
            key={`${tab}-${p.id}`}
            className="bg-white rounded-[22px] ring-1 ring-border hover:ring-brand/30 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_18px_40px_-22px_rgba(92,51,66,0.45)] overflow-hidden tab-fade-in"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <ProductCard product={p} featured={i === items.length - 1} />
          </div>
        ))}
      </div>

      {/* Closing caption strip — same rhythm as categories / promo */}
      <div className="mt-8 flex flex-wrap items-baseline justify-between gap-3 text-[11px] tracking-[0.32em] uppercase text-foreground-muted">
        <span className="font-semibold">Refreshed daily · Live stock from the shelf</span>
        <Link
          href="/shop"
          className="font-fraunces italic text-sm tracking-normal text-brand hover:text-brand-dark transition-colors normal-case"
        >
          Browse the full shop &nbsp;→
        </Link>
      </div>

      {/* Tab-fade keyframes — scoped to this section */}
      <style>{`
        @keyframes nulakaz-tab-fade {
          0%   { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0);  }
        }
        .tab-fade-in {
          animation: nulakaz-tab-fade 500ms cubic-bezier(.22,1,.36,1) both;
        }
      `}</style>
    </section>
  );
}
