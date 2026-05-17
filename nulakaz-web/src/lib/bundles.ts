// Monthly-essentials bundles. Each tier is a curated list of {slug, qty} the
// user can preview, customize, and add to cart. Target budget is aspirational
// — actual computed total comes from live product prices at render time.
//
// All slugs reference real rows in the live Prime Supabase catalog (see
// Prime Bankend/supabase/migrations/20260508030000_grocery_seed_expand.sql),
// so the planner hydrates with product data on every render.

export type BundleTierKey = "essentials" | "family" | "household";

export interface BundleLine {
  slug: string;
  qty: number;
}

export interface BundleTier {
  key: BundleTierKey;
  name: string;
  tagline: string;
  household: string;
  targetRs: number;
  accent: string; // tailwind color class for the header strip
  accentSoft: string;
  iconPath: string; // SVG path data for the small tier icon
  // A short marketing preview — chips rendered on the tier card.
  preview: string[];
  items: BundleLine[];
}

export const BUNDLES: BundleTier[] = [
  {
    key: "essentials",
    name: "Essentials",
    tagline: "The month's basics — produce, dairy, eggs and one-protein-a-week.",
    household: "1–2 people",
    targetRs: 4000,
    accent: "bg-[#8eac6b]",
    accentSoft: "bg-[#8eac6b]/10 text-[#5a6f3f]",
    iconPath: "M3 10h18M5 10v10h14V10M9 20v-6h6v6",
    preview: ["Eggs ×2", "Milk ×6", "Bread", "Chicken", "Cheddar", "Yogurt"],
    items: [
      // Dairy & eggs
      { slug: "fresh-eggs-12pk", qty: 2 },
      { slug: "fresh-milk-1l", qty: 6 },
      { slug: "plain-yogurt-500g", qty: 2 },
      { slug: "butter-salted-200g", qty: 1 },
      { slug: "mauritian-cheddar-200g", qty: 1 },
      // Bakery
      { slug: "pain-maison-pack", qty: 6 },
      // Fresh produce
      { slug: "tomatoes-1kg", qty: 2 },
      { slug: "onions-1kg", qty: 2 },
      { slug: "potatoes-2kg", qty: 1 },
      { slug: "carrots-1kg", qty: 1 },
      { slug: "bananas-1kg", qty: 2 },
      // Proteins
      { slug: "chicken-breast-1kg", qty: 1 },
      { slug: "white-fish-fillet-500g", qty: 1 },
      // Pantry
      { slug: "basmati-rice-5kg", qty: 1 },
      { slug: "sunflower-oil-1l", qty: 1 },
      { slug: "white-flour-1kg", qty: 1 },
      { slug: "brown-sugar-500g", qty: 1 },
      { slug: "red-lentils-500g", qty: 1 },
      { slug: "spaghetti-500g", qty: 1 },
      { slug: "mayonnaise-400g", qty: 1 },
      { slug: "maggi-2min-noodles", qty: 2 },
      // Drinks
      { slug: "mineral-water-1-5l", qty: 8 },
      { slug: "bois-cheri-vanilla-100g", qty: 1 },
    ],
  },
  {
    key: "family",
    name: "Family",
    tagline: "A full month's basket — extra proteins, fruit variety, weekly treats.",
    household: "3–4 people",
    targetRs: 8000,
    accent: "bg-brand",
    accentSoft: "bg-brand-soft/60 text-brand",
    iconPath: "M3 10h18M5 10v10h14V10M9 20v-6h6v6M8 3 2 8h20L16 3z",
    preview: ["Eggs ×3", "Milk ×10", "Salmon", "Lamb", "Brie", "Mangoes"],
    items: [
      // Dairy & eggs
      { slug: "fresh-eggs-12pk", qty: 3 },
      { slug: "fresh-milk-1l", qty: 10 },
      { slug: "plain-yogurt-500g", qty: 3 },
      { slug: "butter-salted-200g", qty: 2 },
      { slug: "cooking-cream-200ml", qty: 2 },
      { slug: "mauritian-cheddar-200g", qty: 1 },
      { slug: "brie-de-meaux-150g", qty: 1 },
      { slug: "mozzarella-fior-di-latte", qty: 1 },
      // Bakery
      { slug: "pain-maison-pack", qty: 8 },
      // Fresh produce
      { slug: "tomatoes-1kg", qty: 3 },
      { slug: "onions-1kg", qty: 3 },
      { slug: "potatoes-2kg", qty: 2 },
      { slug: "carrots-1kg", qty: 2 },
      { slug: "lettuce-head", qty: 1 },
      // Fruit
      { slug: "bananas-1kg", qty: 3 },
      { slug: "mangoes-1kg", qty: 1 },
      { slug: "pineapple-each", qty: 1 },
      // Proteins
      { slug: "chicken-whole-1-2kg", qty: 1 },
      { slug: "chicken-breast-1kg", qty: 1 },
      { slug: "beef-mince-500g", qty: 1 },
      { slug: "lamb-shoulder-1kg", qty: 1 },
      { slug: "fresh-salmon-fillet-500g", qty: 1 },
      { slug: "prawns-frozen-500g", qty: 1 },
      // Pantry
      { slug: "basmati-rice-5kg", qty: 1 },
      { slug: "sunflower-oil-1l", qty: 1 },
      { slug: "white-flour-1kg", qty: 2 },
      { slug: "brown-sugar-500g", qty: 1 },
      { slug: "red-lentils-500g", qty: 1 },
      { slug: "spaghetti-500g", qty: 2 },
      { slug: "mayonnaise-400g", qty: 1 },
      // Drinks & treats
      { slug: "mineral-water-1-5l", qty: 12 },
      { slug: "coca-cola-1-5l", qty: 2 },
      { slug: "bois-cheri-vanilla-100g", qty: 1 },
      { slug: "dark-chocolate-100g", qty: 2 },
    ],
  },
  {
    key: "household",
    name: "Household+",
    tagline: "Premium monthly pantry — seafood, specialty meats, weekly treats.",
    household: "5+ people",
    targetRs: 12000,
    accent: "bg-[#d4a24a]",
    accentSoft: "bg-[#d4a24a]/15 text-[#8a6420]",
    iconPath: "M3 10h18M5 10v10h14V10M9 20v-6h6v6M8 3 2 8h20L16 3zM12 10v10",
    preview: ["Lamb shoulder", "Salmon", "Prawns ×2", "Brie", "Cheddar", "Mangoes ×2"],
    items: [
      // Dairy & eggs
      { slug: "fresh-eggs-12pk", qty: 4 },
      { slug: "fresh-milk-1l", qty: 14 },
      { slug: "plain-yogurt-500g", qty: 4 },
      { slug: "butter-salted-200g", qty: 2 },
      { slug: "cooking-cream-200ml", qty: 3 },
      { slug: "mauritian-cheddar-200g", qty: 1 },
      { slug: "brie-de-meaux-150g", qty: 1 },
      { slug: "mozzarella-fior-di-latte", qty: 1 },
      // Bakery
      { slug: "pain-maison-pack", qty: 12 },
      // Fresh produce
      { slug: "tomatoes-1kg", qty: 4 },
      { slug: "onions-1kg", qty: 4 },
      { slug: "potatoes-2kg", qty: 3 },
      { slug: "carrots-1kg", qty: 3 },
      { slug: "lettuce-head", qty: 2 },
      // Fruit
      { slug: "bananas-1kg", qty: 4 },
      { slug: "mangoes-1kg", qty: 2 },
      { slug: "pineapple-each", qty: 2 },
      // Proteins
      { slug: "chicken-whole-1-2kg", qty: 1 },
      { slug: "chicken-breast-1kg", qty: 2 },
      { slug: "beef-mince-500g", qty: 2 },
      { slug: "lamb-shoulder-1kg", qty: 1 },
      { slug: "fresh-salmon-fillet-500g", qty: 1 },
      { slug: "prawns-frozen-500g", qty: 2 },
      { slug: "white-fish-fillet-500g", qty: 1 },
      // Pantry
      { slug: "basmati-rice-5kg", qty: 2 },
      { slug: "sunflower-oil-1l", qty: 2 },
      { slug: "white-flour-1kg", qty: 2 },
      { slug: "brown-sugar-500g", qty: 2 },
      { slug: "red-lentils-500g", qty: 2 },
      { slug: "spaghetti-500g", qty: 2 },
      { slug: "mayonnaise-400g", qty: 1 },
      { slug: "maggi-2min-noodles", qty: 3 },
      // Drinks & treats
      { slug: "mineral-water-1-5l", qty: 18 },
      { slug: "coca-cola-1-5l", qty: 3 },
      { slug: "phenix-beer-66cl", qty: 4 },
      { slug: "bois-cheri-vanilla-100g", qty: 1 },
      { slug: "green-tea-bags-25", qty: 1 },
      { slug: "dark-chocolate-100g", qty: 3 },
    ],
  },
];

export function getBundle(key: BundleTierKey): BundleTier {
  const b = BUNDLES.find((x) => x.key === key);
  if (!b) throw new Error(`Unknown bundle tier: ${key}`);
  return b;
}

// Bucket a product into one of the display categories used on the planner.
// Derived from category name + slug patterns since the WP categories alone
// mix produce/fruit/berries and leave bakery/drinks uncategorized.
export function bucketFor(opts: {
  categoryNames: string[];
  slug: string;
}): string {
  const s = opts.slug.toLowerCase();
  const cats = opts.categoryNames.map((c) => c.toLowerCase());

  if (s.includes("egg")) return "Eggs";
  if (
    cats.includes("milk") ||
    cats.includes("cheese") ||
    s.includes("milk") ||
    s.includes("cheese") ||
    s.includes("yogurt") ||
    s.includes("butter") ||
    s.includes("cream") ||
    s.includes("brie") ||
    s.includes("mozzarella") ||
    s.includes("cheddar")
  )
    return "Dairy";
  if (
    s.includes("bread") ||
    s.includes("ciabatta") ||
    s.includes("tortilla") ||
    s.includes("filo") ||
    s.includes("pastry") ||
    s.includes("pain-")
  )
    return "Bakery";
  if (
    s.includes("juice") ||
    s.includes("water") ||
    s.includes("coco-") ||
    s.includes("vita-coco") ||
    s.includes("tea") ||
    s.includes("cola") ||
    s.includes("beer") ||
    s.includes("bois-cheri")
  )
    return "Drinks";
  if (
    cats.includes("seafood") ||
    cats.includes("fish-seafood") ||
    s.includes("salmon") ||
    s.includes("prawn") ||
    s.includes("fish")
  )
    return "Seafood";
  if (
    cats.includes("meat") ||
    s.includes("chicken") ||
    s.includes("beef") ||
    s.includes("lamb") ||
    s.includes("pork")
  )
    return "Meat";
  if (
    cats.includes("essentials") ||
    s.includes("rice") ||
    s.includes("oil") ||
    s.includes("flour") ||
    s.includes("sugar") ||
    s.includes("lentils") ||
    s.includes("spaghetti") ||
    s.includes("noodles") ||
    s.includes("mayonnaise") ||
    s.includes("chocolate")
  )
    return "Pantry";
  return "Fresh Produce";
}

export const BUCKET_ORDER = [
  "Fresh Produce",
  "Meat",
  "Seafood",
  "Dairy",
  "Eggs",
  "Bakery",
  "Pantry",
  "Drinks",
] as const;
