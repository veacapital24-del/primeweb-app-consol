import Link from "next/link";

// "The delivery promise" — a two-panel editorial card.
//
// Left panel: full-bleed produce photograph with a sage-green tint, oversized
// Fraunces italic-mixed headline, and an island-wide promise. Right panel
// reads like a service-receipt tear-off — a perforated left edge, four rows
// of operating details, and a primary CTA. Stacks vertically on mobile so
// both panels stay equally weighted.

const PHOTO_BG =
  "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1600&q=80";

type Row = { label: string; value: string; whisper?: string };

const RECEIPT: Row[] = [
  { label: "Days", value: "Monday — Friday", whisper: "weekend pickup at the shop" },
  { label: "Window", value: "10:00 — 20:00", whisper: "two-hour slots at checkout" },
  { label: "Minimum", value: "Rs 1,000", whisper: "delivery is on us above this" },
  { label: "Cut-off", value: "Order before 18:00", whisper: "for next-day arrival" },
];

export function DeliveryBanner() {
  return (
    <section className="mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24 mt-14">
      <div className="grid grid-cols-1 lg:grid-cols-[1.55fr_1fr] gap-3 md:gap-4 rounded-[28px] overflow-hidden ring-1 ring-black/[0.06] shadow-[0_24px_60px_-30px_rgba(48,68,42,0.55)]">
        {/* ─────────────────────────── Photo panel ─────────────────────────── */}
        <article className="group relative isolate min-h-[360px] sm:min-h-[420px] lg:min-h-[460px] flex flex-col justify-end overflow-hidden">
          {/* Background photo, slow zoom on hover */}
          <span
            aria-hidden
            className="absolute inset-0 transition-transform duration-[1500ms] ease-out group-hover:scale-[1.05]"
            style={{
              backgroundImage: `url(${PHOTO_BG})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          {/* Sage tint overlay */}
          <span
            aria-hidden
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(115deg, rgba(48,68,42,0.85) 0%, rgba(94,127,84,0.62) 50%, rgba(142,172,107,0.32) 100%)",
            }}
          />
          {/* Paper-grain warmth */}
          <span
            aria-hidden
            className="absolute inset-0 opacity-[0.18] mix-blend-overlay pointer-events-none"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='5'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.4 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
            }}
          />

          {/* Top eyebrow — "service ledger" feel */}
          <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 sm:px-7 md:px-10 pt-5 sm:pt-7 md:pt-9">
            <span className="inline-flex items-center gap-2 text-white/90 text-[10px] tracking-[0.34em] uppercase font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#dde7c5]" />
              Service · The promise
            </span>
            <span className="font-fraunces italic text-white/85 text-[11px] sm:text-sm tracking-[0.2em]">
              <span className="text-white">N°</span>03
            </span>
          </div>

          {/* Headline + body */}
          <div className="relative z-10 px-5 sm:px-7 md:px-10 pb-8 sm:pb-10 md:pb-14 max-w-2xl">
            <h2 className="font-fraunces text-white text-[32px] xs:text-[36px] sm:text-[48px] md:text-[60px] leading-[0.95] tracking-tight font-semibold">
              Next-day delivery,{" "}
              <em className="italic font-light text-[#dde7c5] underline decoration-white/35 underline-offset-[10px]">
                anywhere
              </em>{" "}
              on the island.
            </h2>
            <p className="mt-4 sm:mt-5 text-white/85 text-[13px] sm:text-sm md:text-base leading-relaxed max-w-xl">
              We pack it fresh from the shelf, keep the cold chain, and drop it
              at your door — Monday through Friday, between{" "}
              <span className="font-fraunces italic">10:00</span> and{" "}
              <span className="font-fraunces italic">20:00</span>.
            </p>

            <Link
              href="/shop"
              className="mt-7 inline-flex items-center gap-2.5 text-white/95 text-xs font-semibold tracking-[0.22em] uppercase group/cta"
            >
              Track an order
              <span
                aria-hidden
                className="inline-block w-7 h-px bg-white/80 transition-all duration-300 group-hover/cta:w-12 group-hover/cta:bg-white"
              />
            </Link>
          </div>
        </article>

        {/* ───────────────────────── Receipt panel ───────────────────────── */}
        <aside className="relative bg-[#f9f4ec] flex flex-col">
          {/* Perforated dashed seam (visible on lg+ at the panel's left edge) */}
          <span
            aria-hidden
            className="hidden lg:block absolute inset-y-6 left-0 w-px"
            style={{
              backgroundImage:
                "repeating-linear-gradient(to bottom, rgba(92,51,66,0.35) 0 6px, transparent 6px 12px)",
            }}
          />
          {/* Punched holes, top + bottom — gives the tear-off ticket vibe */}
          <span
            aria-hidden
            className="hidden lg:block absolute -left-2.5 top-9 w-5 h-5 rounded-full bg-background ring-1 ring-black/[0.06]"
          />
          <span
            aria-hidden
            className="hidden lg:block absolute -left-2.5 bottom-9 w-5 h-5 rounded-full bg-background ring-1 ring-black/[0.06]"
          />

          <div className="px-5 sm:px-7 md:px-9 py-7 sm:py-9 md:py-10 flex flex-col h-full">
            {/* Heading row */}
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-dashed border-foreground/15">
              <span className="font-fraunces italic text-foreground text-[12px] sm:text-[13px] tracking-[0.18em] uppercase">
                NuLakaz · Mauritius
              </span>
              <span className="font-fraunces italic text-foreground-muted text-[11px] sm:text-xs tracking-wide">
                v.2026
              </span>
            </div>

            <h3 className="mt-4 sm:mt-5 font-fraunces text-foreground text-[22px] sm:text-[26px] md:text-[30px] leading-[1.05] font-semibold">
              The delivery{" "}
              <em className="italic font-light text-brand">ledger</em>.
            </h3>

            <ul className="mt-4 sm:mt-5 flex flex-col divide-y divide-dashed divide-foreground/15">
              {RECEIPT.map((row) => (
                <li
                  key={row.label}
                  className="py-3 sm:py-3.5 grid grid-cols-[72px_1fr] sm:grid-cols-[88px_1fr] items-baseline gap-3"
                >
                  <span className="text-[10px] font-bold tracking-[0.28em] uppercase text-foreground-muted">
                    {row.label}
                  </span>
                  <div>
                    <span className="block font-fraunces text-foreground text-[16px] sm:text-[18px] font-semibold leading-snug">
                      {row.value}
                    </span>
                    {row.whisper && (
                      <span className="block mt-0.5 font-fraunces italic text-foreground-muted text-[12px] tracking-wide">
                        {row.whisper}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {/* CTA + free-delivery promise.
                Mobile (<sm): CTA spans the full row; the "Free over Rs 1,000"
                  promise sits underneath as a flat tinted pill — the rotated
                  circular stamp doesn't read well at this size and was
                  competing with the CTA for horizontal space.
                sm+ : restores the hand-stamped seal feel, pinned to the
                  bottom-right next to the CTA. */}
            <div className="relative mt-6 sm:mt-7 pt-5 sm:pt-6 border-t border-dashed border-foreground/15 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <Link
                href="/shop"
                className="inline-flex items-center justify-between sm:justify-start gap-2.5 sm:gap-3 bg-brand text-white rounded-full h-11 sm:h-12 pl-5 sm:pl-6 pr-2 sm:pr-2.5 text-[11px] sm:text-xs font-bold tracking-[0.22em] uppercase hover:bg-brand-dark transition-colors group/plan w-full sm:w-auto"
              >
                Plan my delivery
                <span
                  aria-hidden
                  className="inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white text-brand transition-transform group-hover/plan:translate-x-0.5"
                >
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
                </span>
              </Link>

              {/* Mobile: flat editorial pill, sage palette. */}
              <span
                aria-hidden
                className="sm:hidden inline-flex items-center gap-2 self-center px-3 py-2 rounded-full bg-[#dde7c5] text-foreground/85 ring-1 ring-[#5e7f54]/30"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#5e7f54]" />
                <span className="text-[10px] font-semibold tracking-[0.22em] uppercase">
                  Free
                </span>
                <span className="font-fraunces italic text-[12.5px] leading-none text-foreground">
                  over Rs 1,000
                </span>
              </span>

              {/* Tablet+ : rotated circular stamp. */}
              <span
                aria-hidden
                className="hidden sm:flex flex-col items-center justify-center w-20 h-20 rounded-full bg-[#dde7c5] text-foreground -rotate-[8deg] shadow-[0_8px_22px_-10px_rgba(48,68,42,0.45)] border-[3px] border-dashed border-[#5e7f54]/35 shrink-0"
              >
                <span className="font-fraunces italic text-[10px] tracking-[0.18em] uppercase text-foreground/60">
                  Free
                </span>
                <span className="font-fraunces font-semibold text-2xl -mt-0.5 text-foreground">
                  Rs 1k+
                </span>
              </span>
            </div>
          </div>
        </aside>
      </div>

      {/* Editorial caption strip — repeats the rhythm used elsewhere */}
      <div className="mt-6 flex flex-wrap items-baseline justify-between gap-3 text-[11px] tracking-[0.32em] uppercase text-foreground-muted">
        <span className="font-semibold">Cold chain · Tracked from shelf to door</span>
        <span className="font-fraunces italic text-sm tracking-normal text-foreground/70">
          Same island, faster shelf
        </span>
      </div>
    </section>
  );
}
