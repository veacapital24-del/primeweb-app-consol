import Link from "next/link";

// Editorial promo grid: one tall feature card + two stacked half-height cards.
// Each card layers a brand-tinted gradient over a real food photograph and
// pins a hand-stamped circular discount sticker into the corner.
//
// Background art is delivered via plain CSS so we don't have to thread these
// Unsplash hosts through the next/image `remotePatterns` allowlist.

type Promo = {
  eyebrow: string;
  titleLead: string;
  titleAccent: string;
  titleTail?: string;
  href: string;
  bg: string;
  tint: string;
  badge: { line1: string; line2: string };
  swatch: string; // chip color shown above title
};

const FEATURED: Promo = {
  eyebrow: "Selected farms",
  titleLead: "Delicious",
  titleAccent: "cheese",
  titleTail: "from selected dairy farms.",
  href: "/category/cheese",
  bg: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=1600&q=80",
  tint:
    "linear-gradient(160deg, rgba(48,68,42,0.72) 0%, rgba(94,127,84,0.55) 55%, rgba(142,172,107,0.28) 100%)",
  badge: { line1: "Save", line2: "33%" },
  swatch: "#dde7c5",
};

const SECONDARY: Promo[] = [
  {
    eyebrow: "South Africa",
    titleLead: "Everyday",
    titleAccent: "fresh fruits",
    titleTail: "delivered before noon.",
    href: "/category/fresh-fruit",
    bg: "https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=1400&q=80",
    tint:
      "linear-gradient(120deg, rgba(45,79,109,0.7) 0%, rgba(86,138,177,0.45) 60%, rgba(100,151,184,0.18) 100%)",
    badge: { line1: "Save", line2: "25%" },
    swatch: "#cfdfeb",
  },
  {
    eyebrow: "Cuts of the week",
    titleLead: "Tasty",
    titleAccent: "steaks",
    titleTail: "from our best butcher.",
    href: "/category/meat",
    bg: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=1400&q=80",
    tint:
      "linear-gradient(125deg, rgba(74,46,46,0.72) 0%, rgba(140,80,76,0.5) 55%, rgba(214,176,140,0.18) 100%)",
    badge: { line1: "Today's", line2: "deal" },
    swatch: "#e6ddc4",
  },
];

export function PromoBanners() {
  return (
    <section className="mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24 mt-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6 lg:auto-rows-[260px]">
        {/* Featured (tall) */}
        <PromoCard
          promo={FEATURED}
          className="lg:col-span-2 lg:row-span-2 min-h-[300px] sm:min-h-[360px] lg:min-h-0"
          size="featured"
        />

        {/* Secondary stack */}
        {SECONDARY.map((promo) => (
          <PromoCard key={promo.href} promo={promo} size="compact" />
        ))}
      </div>

      {/* Editorial caption strip — anchors the grid, doubles as a "shelf
          label" pattern repeated on category pages. */}
      <div className="mt-6 flex flex-wrap items-baseline justify-between gap-3 text-xs tracking-[0.32em] uppercase text-foreground-muted">
        <span className="font-semibold">In stores · Restocks every Friday</span>
        <Link
          href="/shop"
          className="font-fraunces italic text-sm tracking-normal text-brand hover:text-brand-dark transition-colors"
        >
          Browse the full shop &nbsp;→
        </Link>
      </div>
    </section>
  );
}

function PromoCard({
  promo,
  className = "",
  size,
}: {
  promo: Promo;
  className?: string;
  size: "featured" | "compact";
}) {
  const isFeatured = size === "featured";

  return (
    <Link
      href={promo.href}
      className={[
        "group relative overflow-hidden rounded-[28px] flex flex-col justify-end isolate",
        "shadow-[0_20px_55px_-30px_rgba(92,51,66,0.55)] hover:shadow-[0_30px_70px_-25px_rgba(92,51,66,0.6)]",
        "transition-shadow duration-500",
        isFeatured
          ? "min-h-[300px] sm:min-h-[360px]"
          : "min-h-[220px] sm:min-h-[260px]",
        className,
      ].join(" ")}
      style={{
        backgroundImage: `${promo.tint}, url(${promo.bg})`,
        backgroundSize: "cover, cover",
        backgroundPosition: "center, center",
        backgroundRepeat: "no-repeat, no-repeat",
      }}
    >
      {/* Slow Ken-Burns zoom on hover — restrained, not flashy */}
      <div
        aria-hidden
        className="absolute inset-0 transition-transform duration-[1500ms] ease-out group-hover:scale-[1.06]"
        style={{
          backgroundImage: `url(${promo.bg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          mixBlendMode: "soft-light",
          opacity: 0.4,
        }}
      />

      {/* Hand-stamped discount sticker */}
      <span
        aria-hidden
        className={[
          "absolute z-20 flex flex-col items-center justify-center rounded-full bg-white text-brand font-bold leading-none",
          "shadow-[0_8px_24px_-8px_rgba(0,0,0,0.45)] -rotate-[8deg]",
          "border-[3px] border-dashed border-brand/30",
          isFeatured
            ? "top-5 right-5 sm:top-7 sm:right-7 w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28"
            : "top-4 right-4 sm:top-5 sm:right-5 w-16 h-16 sm:w-20 sm:h-20",
        ].join(" ")}
      >
        <span className="font-fraunces italic text-[11px] tracking-[0.18em] uppercase text-brand-dark/70">
          {promo.badge.line1}
        </span>
        <span className="font-fraunces font-semibold text-[28px] -mt-0.5 text-brand">
          {promo.badge.line2}
        </span>
      </span>

      {/* Color swatch dot — small editorial cue */}
      <span
        aria-hidden
        className="absolute z-20 top-5 left-5 sm:top-7 sm:left-7 inline-flex items-center gap-2 text-white/90 text-[10px] tracking-[0.34em] uppercase font-semibold"
      >
        <span
          className="w-2.5 h-2.5 rounded-full ring-1 ring-white/40"
          style={{ backgroundColor: promo.swatch }}
        />
        {promo.eyebrow}
      </span>

      {/* Content */}
      <div className="relative z-10 p-5 sm:p-7 md:p-9">
        <h3
          className={[
            "font-fraunces text-white leading-[0.98] tracking-tight",
            isFeatured
              ? "text-[32px] xs:text-[36px] sm:text-[48px] md:text-[60px] font-semibold"
              : "text-[24px] xs:text-[26px] sm:text-[30px] md:text-[32px] font-semibold",
          ].join(" ")}
        >
          {promo.titleLead}{" "}
          <em className="italic font-light text-white/95 underline decoration-white/40 underline-offset-[10px]">
            {promo.titleAccent}
          </em>
          {promo.titleTail ? (
            <span className="block text-white/85 mt-1 font-light italic">
              {promo.titleTail}
            </span>
          ) : null}
        </h3>

        <span
          className={[
            "mt-5 inline-flex items-center gap-2.5 text-white/95 text-xs font-semibold tracking-[0.22em] uppercase",
            "transition-all duration-300 group-hover:gap-4",
          ].join(" ")}
        >
          Shop now
          <span
            aria-hidden
            className="inline-block w-7 h-px bg-white/80 transition-all duration-300 group-hover:w-10 group-hover:bg-white"
          />
        </span>
      </div>
    </Link>
  );
}
