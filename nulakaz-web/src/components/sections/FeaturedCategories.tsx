import Link from "next/link";

// Editorial "shop-by-category" shelf. Each tile is a full-bleed food
// photograph with a per-category tinted gradient overlaid for color identity
// and an Fraunces-italic numeral / caption layer pinned on top. Seven tiles
// land on a single row at lg+, fold to 4 across at md, and stack 2-up on
// mobile.
//
// Background art is loaded as plain CSS `background-image`, so we don't have
// to thread the Unsplash host through `next/image`'s `remotePatterns`
// allowlist. The slow Ken-Burns zoom on hover is achieved by scaling a
// duplicated background layer, leaving the tinted overlay still.

type Tile = {
  label: string;
  slug: string;
  src: string;
  // tinted gradient stacked above the photo for color identity
  tint: string;
  // accent line under the label on hover
  accent: string;
  // small italic word that whispers the category mood
  whisper: string;
  // optional emphasis when the tile is the season's pick
  feature?: boolean;
};

const TILES: Tile[] = [
  {
    label: "Fresh Produce",
    slug: "fresh-produce",
    src: "https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=1200&q=80",
    tint:
      "linear-gradient(180deg, rgba(48,68,42,0.18) 0%, rgba(48,68,42,0.35) 55%, rgba(48,68,42,0.78) 100%)",
    accent: "#cbd9a8",
    whisper: "in season",
    feature: true,
  },
  {
    label: "Meat",
    slug: "meat",
    src: "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&w=1200&q=80",
    tint:
      "linear-gradient(180deg, rgba(74,28,28,0.2) 0%, rgba(118,52,46,0.4) 55%, rgba(74,28,28,0.82) 100%)",
    accent: "#e6b39a",
    whisper: "by the cut",
  },
  {
    label: "Seafood",
    slug: "fish-seafood",
    src: "https://images.unsplash.com/photo-1535007813616-79dc02ba4021?auto=format&fit=crop&w=1200&q=80",
    tint:
      "linear-gradient(180deg, rgba(28,52,76,0.2) 0%, rgba(45,90,124,0.4) 55%, rgba(28,52,76,0.82) 100%)",
    accent: "#b3cee0",
    whisper: "the daily catch",
  },
  {
    label: "Cheese",
    slug: "cheese",
    src: "https://images.unsplash.com/photo-1452195100486-9cc805987862?auto=format&fit=crop&w=1200&q=80",
    tint:
      "linear-gradient(180deg, rgba(82,55,18,0.18) 0%, rgba(120,90,40,0.4) 55%, rgba(82,55,18,0.8) 100%)",
    accent: "#f0d99a",
    whisper: "from the wheel",
  },
  {
    label: "Milk",
    slug: "milk",
    src: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=1200&q=80",
    tint:
      "linear-gradient(180deg, rgba(46,60,76,0.18) 0%, rgba(80,98,118,0.38) 55%, rgba(46,60,76,0.78) 100%)",
    accent: "#dfe6ec",
    whisper: "dairy daily",
  },
  {
    label: "Essentials",
    slug: "essentials",
    src: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=1200&q=80",
    tint:
      "linear-gradient(180deg, rgba(78,52,32,0.18) 0%, rgba(120,82,52,0.4) 55%, rgba(78,52,32,0.8) 100%)",
    accent: "#e7c9b1",
    whisper: "the basics",
  },
  {
    label: "Others",
    slug: "others",
    src: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80",
    tint:
      "linear-gradient(180deg, rgba(92,51,66,0.2) 0%, rgba(130,68,90,0.42) 55%, rgba(92,51,66,0.82) 100%)",
    accent: "#e2c2cf",
    whisper: "shop the rest",
  },
];

export function FeaturedCategories() {
  return (
    <section className="mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24 mt-14">
      {/* Editorial heading row */}
      <header className="flex flex-wrap items-end justify-between gap-6 mb-8 md:mb-12">
        <div>
          <span className="inline-flex items-center gap-2 text-foreground-muted text-[11px] font-semibold uppercase tracking-[0.32em]">
            <span className="w-9 h-px bg-brand/40" />
            Shop by category
          </span>
          <h2 className="mt-3 font-fraunces text-foreground text-[32px] xs:text-[36px] sm:text-[44px] md:text-[56px] leading-[0.95] tracking-tight font-semibold">
            Find your{" "}
            <em className="italic font-light text-brand">isle</em>
            <span className="text-brand">.</span>
          </h2>
        </div>

        <Link
          href="/shop"
          className="self-start md:self-end inline-flex items-center gap-3 text-brand text-sm font-semibold tracking-[0.18em] uppercase group/all"
        >
          <span className="font-fraunces italic text-base normal-case tracking-normal">
            All {TILES.length} categories
          </span>
          <span
            aria-hidden
            className="inline-block w-8 h-px bg-brand transition-all group-hover/all:w-12"
          />
          <span aria-hidden className="text-brand">
            →
          </span>
        </Link>
      </header>

      {/* Tile shelf */}
      <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 md:gap-4">
        {TILES.map((t, i) => (
          <li key={t.slug}>
            <Link
              href={`/category/${t.slug}`}
              className="group relative block aspect-[4/5] rounded-[26px] overflow-hidden isolate ring-1 ring-black/[0.08] hover:ring-white/40 transition-all duration-500 hover:-translate-y-1 shadow-[0_18px_40px_-25px_rgba(0,0,0,0.4)] hover:shadow-[0_24px_50px_-22px_rgba(0,0,0,0.45)]"
            >
              {/* Photographic background — duplicated so we can zoom this layer
                  on hover while the tinted overlay stays still. */}
              <span
                aria-hidden
                className="absolute inset-0 transition-transform duration-[1500ms] ease-out group-hover:scale-[1.08]"
                style={{
                  backgroundImage: `url(${t.src})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />

              {/* Per-category tint — preserves color identity over photos */}
              <span
                aria-hidden
                className="absolute inset-0"
                style={{ backgroundImage: t.tint }}
              />

              {/* Faint paper-grain overlay for warmth */}
              <span
                aria-hidden
                className="absolute inset-0 opacity-[0.18] mix-blend-overlay pointer-events-none"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='5'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.4 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
                }}
              />

              {/* Editorial numeral, top-left */}
              <span className="absolute top-3 left-3 z-20 font-fraunces italic text-[13px] text-white/90 tracking-[0.22em]">
                <span className="text-white/65">N°</span>
                {String(i + 1).padStart(2, "0")}
              </span>

              {/* "Pick" pin — only on the seasonal feature */}
              {t.feature && (
                <span
                  aria-hidden
                  className="absolute top-3 right-3 z-20 inline-flex items-center gap-1 bg-white/95 text-brand text-[10px] font-bold px-2 py-1 rounded-full tracking-[0.14em] uppercase shadow-sm"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                  Pick
                </span>
              )}

              {/* Caption block, bottom */}
              <span className="absolute inset-x-0 bottom-0 z-10 px-4 pb-4 pt-12">
                <span className="block font-fraunces italic text-white/85 text-[11px] tracking-[0.16em] uppercase">
                  {t.whisper}
                </span>
                <span className="mt-1 flex items-baseline justify-between gap-2">
                  <span className="font-fraunces font-semibold text-white text-[18px] md:text-[19px] leading-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.3)]">
                    {t.label}
                  </span>
                  <span
                    aria-hidden
                    className="inline-block h-px transition-all duration-500 w-4 group-hover:w-8"
                    style={{ backgroundColor: t.accent }}
                  />
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {/* Editorial caption strip — repeats the rhythm used under the promo grid */}
      <div className="mt-8 flex flex-wrap items-baseline justify-between gap-3 text-[11px] tracking-[0.32em] uppercase text-foreground-muted">
        <span className="font-semibold">A curated shelf · Updated weekly</span>
        <span className="font-fraunces italic text-sm tracking-normal text-foreground/70">
          7 isles, one trolley
        </span>
      </div>
    </section>
  );
}
