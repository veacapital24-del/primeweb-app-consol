// Brand partners curated for NuLakaz. Single source of truth for both the
// homepage logo strip and the dedicated /brands showcase page.
// Logo URLs are vendored from the legacy nulakaz.com host (already in
// next.config remotePatterns) — replace with /public/brands/* once we have
// proper SVG/webp assets.

export type BrandTint =
  | "sage"
  | "ocean"
  | "mustard"
  | "dusty-pink"
  | "terracotta"
  | "stone";

export interface Brand {
  slug: string;
  name: string;
  logo: string;
  origin: string;
  tagline: string;
  body: string;
  // Categories the brand most often shows up in — used for "Browse <category>"
  // shortcut on the brand showcase card.
  categorySlug?: string;
  categoryLabel?: string;
  tint: BrandTint;
}

// Tinted palettes — same brand-soft families used elsewhere on the site
// (categories, trust strip, support). Fg used for icons / accent text, bg
// for tile backgrounds, ring for borders.
export const BRAND_TINTS: Record<
  BrandTint,
  { bg: string; fg: string; ring: string }
> = {
  sage: { bg: "#dde7c5", fg: "#5e7f54", ring: "rgba(94,127,84,0.35)" },
  ocean: { bg: "#cfdfeb", fg: "#3a6f93", ring: "rgba(58,111,147,0.35)" },
  mustard: { bg: "#f5e7c4", fg: "#a98937", ring: "rgba(169,137,55,0.35)" },
  "dusty-pink": {
    bg: "#e7d3da",
    fg: "#82445a",
    ring: "rgba(130,68,90,0.35)",
  },
  terracotta: {
    bg: "#fbe8da",
    fg: "#a85a44",
    ring: "rgba(168,90,68,0.35)",
  },
  stone: { bg: "#e6ddc4", fg: "#7a6b4d", ring: "rgba(122,107,77,0.35)" },
};

export const BRANDS: Brand[] = [
  {
    slug: "pure-citrus",
    name: "Pure Citrus",
    logo: "https://nulakaz.com/wp-content/uploads/2023/10/tastydaily-1040828229.jpg",
    origin: "California, USA",
    tagline: "Cold-pressed essentials",
    body: "Sun-grown citrus extracted whole-fruit — natural oils for the kitchen and the home.",
    categorySlug: "others",
    categoryLabel: "Pantry",
    tint: "mustard",
  },
  {
    slug: "earth-check",
    name: "Earth Check",
    logo: "https://nulakaz.com/wp-content/uploads/2023/10/tastydaily-1040532022.jpg",
    origin: "Australia",
    tagline: "Certified-sustainable basics",
    body: "Pantry staples and household goods with a low-waste, climate-checked supply chain.",
    categorySlug: "essentials",
    categoryLabel: "Essentials",
    tint: "sage",
  },
  {
    slug: "crystal-cove",
    name: "Crystal Cove",
    logo: "https://nulakaz.com/wp-content/uploads/2023/10/tastydaily-1040076824.jpg",
    origin: "Coastal Mauritius",
    tagline: "Coastal-inspired groceries",
    body: "Clean-label snacks and condiments with recognisable ingredients — no shortcuts.",
    categorySlug: "essentials",
    categoryLabel: "Essentials",
    tint: "ocean",
  },
  {
    slug: "good-life-organic",
    name: "Good Life Organic",
    logo: "https://nulakaz.com/wp-content/uploads/2023/10/tastydaily-1040286886.jpg",
    origin: "Mauritius · family-run",
    tagline: "Organic everyday staples",
    body: "Family-farm grown produce and pantry items — certified organic, naturally seasonal.",
    categorySlug: "fresh-produce",
    categoryLabel: "Fresh produce",
    tint: "sage",
  },
  {
    slug: "vita-coco",
    name: "Vita Coco",
    logo: "https://nulakaz.com/wp-content/uploads/2023/10/tastydaily-1033714022.jpg",
    origin: "Brooklyn, USA",
    tagline: "100% pure coconut water",
    body: "Straight-from-tropics coconut water — never from concentrate, naturally electrolyte-rich.",
    categorySlug: "others",
    categoryLabel: "Drinks",
    tint: "dusty-pink",
  },
  {
    slug: "james-white",
    name: "James White",
    logo: "https://nulakaz.com/wp-content/uploads/2023/10/tastydaily-1028619405.jpeg",
    origin: "Suffolk, UK",
    tagline: "Cold-pressed organic juice",
    body: "Family-bottled organic fruit and vegetable juices — pressed slow, sealed fresh.",
    categorySlug: "others",
    categoryLabel: "Drinks",
    tint: "terracotta",
  },
];

export function getBrand(slug: string): Brand | undefined {
  return BRANDS.find((b) => b.slug === slug);
}
