"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

// Editorial-magazine hero. Three slides crossfade on a 7s loop with a
// progress meter on the active tab, prev/next chevrons that reveal on hover,
// and a tiny "01 / 03" pagination chip in the top-right corner. The
// newsletter form lives on slide one so the conversion entry-point survives
// the redesign.
//
// Slide art is loaded as plain CSS `background-image` so we don't have to
// thread Unsplash through next/image's `remotePatterns` allowlist.

type Slide = {
  eyebrow: string;
  headline: React.ReactNode;
  copy: string;
  bg: string;
  tint: string;
  cta?: { href: string; label: string };
  variant?: "newsletter";
};

const SLIDES: Slide[] = [
  {
    eyebrow: "Mauritius · Daily deliveries",
    headline: (
      <>
        <span className="block">Don&rsquo;t miss out on</span>
        <span className="block">
          tasty grocery{" "}
          <em className="font-fraunces font-light italic text-[#f5d9c4]">
            deals
          </em>
          .
        </span>
      </>
    ),
    copy: "Sign up for the daily newsletter — fresh picks, hand-tied bouquets of savings, straight to your inbox before 6am.",
    bg: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1800&q=80",
    tint:
      "linear-gradient(105deg, rgba(114,60,79,0.92) 0%, rgba(167,82,108,0.78) 45%, rgba(183,90,116,0.55) 100%)",
    variant: "newsletter",
  },
  {
    eyebrow: "Monthly Essentials",
    headline: (
      <>
        <span className="block">
          Your month,{" "}
          <em className="font-fraunces italic font-light text-[#dde7c5]">
            handled
          </em>
          .
        </span>
        <span className="block">One box. Zero planning.</span>
      </>
    ),
    copy: "Pre-built household boxes from Rs 1,500. Toggle what you don't need, lock in next-day delivery in one tap.",
    bg: "https://images.unsplash.com/photo-1506617564039-2f3b650b7010?auto=format&fit=crop&w=1800&q=80",
    tint:
      "linear-gradient(115deg, rgba(48,68,42,0.92) 0%, rgba(94,127,84,0.7) 50%, rgba(142,172,107,0.45) 100%)",
    cta: { href: "/monthly-essentials", label: "Build my box" },
  },
  {
    eyebrow: "Free Delivery · Mon–Fri",
    headline: (
      <>
        <span className="block">Free delivery,</span>
        <span className="block">
          anywhere on the{" "}
          <em className="font-fraunces italic font-light text-[#fde7c4]">
            island
          </em>
          .
        </span>
      </>
    ),
    copy: "Spend over Rs 1,000 and we drop everything at your door, between 10am and 6pm, weekdays.",
    bg: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1800&q=80",
    tint:
      "linear-gradient(110deg, rgba(45,79,109,0.9) 0%, rgba(86,138,177,0.65) 50%, rgba(100,151,184,0.35) 100%)",
    cta: { href: "/shop", label: "Shop the island" },
  },
];

const ROTATE_MS = 7000;

export function HeroNewsletter() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  // Re-mount the progress bar on each slide change to restart its CSS animation
  // without resorting to JS-driven width updates.
  const progressKey = useRef(0);

  const goTo = useCallback((next: number) => {
    setActive((prev) => {
      if (prev !== next) progressKey.current += 1;
      return (next + SLIDES.length) % SLIDES.length;
    });
  }, []);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(
      () => goTo((activeRef.current + 1) % SLIDES.length),
      ROTATE_MS,
    );
    return () => window.clearInterval(id);
  }, [paused, goTo]);

  // Mirror `active` into a ref so the interval callback always reads the
  // freshest value without re-creating the timer (which would reset progress).
  const activeRef = useRef(active);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  const slide = SLIDES[active];

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured promotions"
      className="mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24 pt-4 sm:pt-6"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="group relative overflow-hidden rounded-[28px] sm:rounded-[36px] min-h-[440px] sm:min-h-[500px] md:min-h-[560px] flex isolate shadow-[0_30px_80px_-40px_rgba(92,51,66,0.55)]">
        {/* Layered slide images — only the active one fades in */}
        {SLIDES.map((s, i) => (
          <div
            key={i}
            aria-hidden={i !== active}
            className="absolute inset-0 transition-opacity duration-[1100ms] ease-[cubic-bezier(.22,1,.36,1)]"
            style={{
              opacity: i === active ? 1 : 0,
              backgroundImage: `${s.tint}, url(${s.bg})`,
              backgroundSize: "cover, cover",
              backgroundPosition: "center, center",
              backgroundRepeat: "no-repeat, no-repeat",
            }}
          />
        ))}

        {/* Faint paper-grain overlay for texture (no extra asset, pure SVG) */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.18] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='5'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.4 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          }}
        />

        {/* Editorial top rail: brand wordmark + "01/03" pagination chip */}
        <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 sm:px-7 md:px-12 pt-5 sm:pt-6 md:pt-7">
          <span className="font-fraunces italic text-white/85 text-[11px] sm:text-sm tracking-[0.18em] uppercase">
            NuLakaz<span className="hidden xs:inline"> · Mo Lakaz</span>
          </span>
          <span className="font-fraunces italic text-white/85 text-[11px] sm:text-sm tracking-[0.2em]">
            <span className="text-white">{String(active + 1).padStart(2, "0")}</span>
            <span className="mx-1 opacity-60">/</span>
            <span>{String(SLIDES.length).padStart(2, "0")}</span>
          </span>
        </div>

        {/* Slide copy block */}
        <div className="relative z-10 flex w-full">
          <div className="w-full md:w-[72%] lg:w-[64%] px-5 sm:px-7 md:px-12 lg:px-16 pt-16 pb-24 sm:py-20 md:py-24 flex flex-col justify-end">
            <span className="inline-flex items-center gap-2 self-start mb-6">
              <span className="w-9 h-px bg-white/70" />
              <span className="text-white/85 text-[11px] tracking-[0.32em] uppercase font-semibold">
                {slide.eyebrow}
              </span>
            </span>

            <h1 className="font-fraunces font-semibold text-white tracking-tight leading-[0.95] text-[36px] xs:text-[42px] sm:text-[56px] md:text-[68px] lg:text-[80px]">
              {slide.headline}
            </h1>

            <p className="mt-4 sm:mt-6 max-w-xl text-white/85 text-[14px] sm:text-base md:text-lg leading-relaxed">
              {slide.copy}
            </p>

            {slide.variant === "newsletter" ? (
              <form
                className="mt-6 sm:mt-8 w-full max-w-sm sm:max-w-md flex items-center bg-white/95 backdrop-blur rounded-full h-12 sm:h-14 pl-4 sm:pl-6 pr-1 sm:pr-1.5 shadow-[0_18px_40px_-15px_rgba(0,0,0,0.45)]"
                action="/api/subscribe"
                method="post"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-brand mr-2 sm:mr-3 shrink-0"
                  aria-hidden
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="Email address"
                  aria-label="Email address"
                  className="flex-1 min-w-0 bg-transparent outline-none text-[13px] sm:text-sm text-foreground placeholder:text-brand/40"
                />
                <button
                  type="submit"
                  aria-label="Subscribe to newsletter"
                  className="shrink-0 bg-brand text-white rounded-full h-10 sm:h-11 px-4 sm:px-6 text-[12px] sm:text-sm font-semibold tracking-wide hover:bg-brand-dark transition-colors"
                >
                  Subscribe
                </button>
              </form>
            ) : slide.cta ? (
              <Link
                href={slide.cta.href}
                className="mt-6 sm:mt-8 self-start inline-flex items-center gap-2.5 sm:gap-3 bg-white text-brand rounded-full h-12 sm:h-14 pl-5 sm:pl-7 pr-2 sm:pr-3 text-[12px] sm:text-sm font-semibold tracking-[0.08em] uppercase hover:bg-[#fdf3e9] transition-colors group/cta"
              >
                {slide.cta.label}
                <span
                  aria-hidden
                  className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-brand text-white transition-transform group-hover/cta:translate-x-1"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="13 5 20 12 13 19" />
                  </svg>
                </span>
              </Link>
            ) : null}
          </div>
        </div>

        {/* Tab indicators bottom-left */}
        <div className="absolute left-5 sm:left-7 md:left-12 bottom-5 sm:bottom-7 md:bottom-9 z-20 flex items-center gap-2 sm:gap-3">
          {SLIDES.map((s, i) => {
            const isActive = i === active;
            return (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Show slide ${i + 1}: ${s.eyebrow}`}
                aria-current={isActive ? "true" : undefined}
                className="group/tab flex items-center gap-1.5 sm:gap-2"
              >
                <span
                  className={[
                    "font-fraunces italic text-[11px] sm:text-xs transition-colors",
                    isActive ? "text-white" : "text-white/50",
                  ].join(" ")}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className={[
                    "relative h-px transition-all duration-300 overflow-hidden",
                    isActive
                      ? "w-14 sm:w-24 md:w-32 bg-white/30"
                      : "w-5 sm:w-8 bg-white/35 group-hover/tab:bg-white/60",
                  ].join(" ")}
                >
                  {isActive && (
                    <span
                      key={progressKey.current}
                      className="absolute inset-y-0 left-0 bg-white origin-left"
                      style={{
                        width: "100%",
                        animation: paused
                          ? "none"
                          : `nulakaz-hero-progress ${ROTATE_MS}ms linear forwards`,
                      }}
                    />
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {/* Prev / next chevrons (reveal on hover) */}
        <button
          type="button"
          onClick={() => goTo(active - 1)}
          aria-label="Previous slide"
          className="hidden md:flex items-center justify-center absolute right-24 bottom-9 z-20 w-12 h-12 rounded-full border border-white/30 text-white/85 backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/15"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <polyline points="15 6 9 12 15 18" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => goTo(active + 1)}
          aria-label="Next slide"
          className="hidden md:flex items-center justify-center absolute right-9 bottom-9 z-20 w-12 h-12 rounded-full border border-white/30 text-white/85 backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/15"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <polyline points="9 6 15 12 9 18" />
          </svg>
        </button>

        {/* Inline keyframes for the progress bar — scoped to this section */}
        <style>{`
          @keyframes nulakaz-hero-progress {
            from { transform: scaleX(0); }
            to   { transform: scaleX(1); }
          }
        `}</style>
      </div>
    </section>
  );
}
