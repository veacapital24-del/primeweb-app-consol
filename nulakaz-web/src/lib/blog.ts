// Featured image URLs for each blog post (from live nulakaz.com DOM, 2026-04-16).
// Keep in sync with BlogAndTestimonials.tsx if the same mapping is needed there.
export const BLOG_THUMBNAILS: Record<string, string> = {
  "family-friendly-cooking-quick-and-nutritious-meals-for-busy-weeknights":
    "https://nulakaz.com/wp-content/uploads/2023/10/tastydaily-0304533351-765x380.jpg",
  "going-green-tips-for-sustainable-shopping-and-eco-friendly-choices":
    "https://nulakaz.com/wp-content/uploads/2023/10/tastydaily-0304195045-765x380.jpg",
  "diy-charcuterie-boards-crafting-the-perfect-spread-with-our-deli-delights":
    "https://nulakaz.com/wp-content/uploads/2023/10/tastydaily-0304342517-765x380.jpg",
  "delicious-gluten-free-alternatives-a-guide-to-our-gluten-free-product-selection":
    "https://nulakaz.com/wp-content/uploads/2023/10/tastydaily-0304180933-765x380.jpg",
  "cooking-on-a-budget-affordable-meal-ideas-using-store-specials":
    "https://nulakaz.com/wp-content/uploads/2023/10/tastydaily-0304299666-765x380.jpg",
  "fresh-picks-of-the-week-seasonal-fruits-and-vegetables-for-a-healthier-you":
    "https://nulakaz.com/wp-content/uploads/2023/10/tastydaily-0304036055-765x380.jpg",
};

import type { BrandTint } from "@/lib/brands";

// Per-post editorial metadata — topic label, accent tint, estimated read
// minutes. Used by both /blog and /blog/[slug] so the masthead, lead card,
// post detail header and related-card all read from the same source.
export const POST_META: Record<
  string,
  { topic: string; tint: BrandTint; minutes: number }
> = {
  "family-friendly-cooking-quick-and-nutritious-meals-for-busy-weeknights": {
    topic: "Weeknight cooking",
    tint: "terracotta",
    minutes: 6,
  },
  "going-green-tips-for-sustainable-shopping-and-eco-friendly-choices": {
    topic: "Sustainability",
    tint: "sage",
    minutes: 5,
  },
  "diy-charcuterie-boards-crafting-the-perfect-spread-with-our-deli-delights": {
    topic: "Entertaining",
    tint: "mustard",
    minutes: 7,
  },
  "delicious-gluten-free-alternatives-a-guide-to-our-gluten-free-product-selection":
    {
      topic: "Wellness",
      tint: "dusty-pink",
      minutes: 5,
    },
  "cooking-on-a-budget-affordable-meal-ideas-using-store-specials": {
    topic: "On a budget",
    tint: "ocean",
    minutes: 4,
  },
  "fresh-picks-of-the-week-seasonal-fruits-and-vegetables-for-a-healthier-you": {
    topic: "Seasonal",
    tint: "stone",
    minutes: 3,
  },
};

const FALLBACK_TINTS: BrandTint[] = [
  "sage",
  "ocean",
  "mustard",
  "dusty-pink",
  "terracotta",
  "stone",
];

export function pickPostMeta(slug: string, index = 0) {
  return (
    POST_META[slug] ?? {
      topic: "Notebook",
      tint: FALLBACK_TINTS[index % FALLBACK_TINTS.length],
      minutes: 5,
    }
  );
}

// Split the title into "lead words" and the last word so the post page can
// render the final word in italic Fraunces (the same accent treatment used
// on /shop, /cart and /brands).
export function splitTitleAccent(title: string): { lead: string; accent: string } {
  const trimmed = title.replace(/[.!?…]+$/g, "").trim();
  const tokens = trimmed.split(/\s+/);
  if (tokens.length <= 1) return { lead: "", accent: trimmed };
  // If the last token is short (a/the/in/of/etc.), pull the last *two* words
  // into the accent so the italic phrase reads naturally.
  const tail = tokens[tokens.length - 1];
  const isShortTail = tail.length <= 3 || /^(and|or|with|the|for|of|in|on|at)$/i.test(tail);
  if (isShortTail && tokens.length >= 3) {
    return {
      lead: tokens.slice(0, -2).join(" "),
      accent: tokens.slice(-2).join(" "),
    };
  }
  return { lead: tokens.slice(0, -1).join(" "), accent: tail };
}
