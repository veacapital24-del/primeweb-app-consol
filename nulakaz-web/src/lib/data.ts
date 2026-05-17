// Storefront data layer.
//
// Products + product categories are pulled live from the shared Prime
// Supabase project (the same DB that powers Prime Backend admin and Prime
// POS). Everything is reshaped into the WooCommerce `WcProduct` /
// `WcProductCategory` types so existing UI components continue to work
// unchanged — this file is the single mapping seam between Prime's domain
// model and the Woo-shaped contract the UI was originally built against.
//
// WordPress/Woo-only content (pages, posts, media) still reads from the
// JSON snapshot in /content; migrating those is a separate task.

import "server-only";
import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import { catalogClient } from "@/lib/supabase/anon";
import { site } from "@/lib/site";
import { getBrand } from "@/lib/brands";
import type {
  WcImage,
  WcProduct,
  WcProductCategory,
  WpPage,
  WpPost,
  WpMedia,
} from "@/types/wp";

const CONTENT_DIR = path.join(process.cwd(), "content");

function read<T>(file: string): T {
  const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf8");
  return JSON.parse(raw) as T;
}

// ---------------------------------------------------------------------------
// Static WP content (unchanged)
// ---------------------------------------------------------------------------

export function getPages(): WpPage[] {
  return read<WpPage[]>("pages.json");
}

export function getPosts(): WpPost[] {
  return read<WpPost[]>("posts.json");
}

export function getMedia(): WpMedia[] {
  return read<WpMedia[]>("media.json");
}

// ---------------------------------------------------------------------------
// Live catalog (Prime Supabase)
// ---------------------------------------------------------------------------

// Shape of the product row + embedded inventory we read from Postgres.
// Embeds come back as arrays via PostgREST; we collapse to a single record.
type PrimeInventoryRow = {
  on_hand: number;
  reserved: number;
  low_stock_threshold: number;
};

type PrimeProductRow = {
  id: string;
  sku: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  retail_price_mur: string | number;
  wholesale_price_mur: string | number | null;
  wholesale_min_qty: number;
  is_hard_discount: boolean;
  category_slug: string | null;
  tags: string[] | null;
  brand_slug: string | null;
  created_at: string;
  inventory: PrimeInventoryRow[] | PrimeInventoryRow | null;
};

const PRODUCT_SELECT = [
  "id",
  "sku",
  "slug",
  "name",
  "description",
  "image_url",
  "retail_price_mur",
  "wholesale_price_mur",
  "wholesale_min_qty",
  "is_hard_discount",
  "category_slug",
  "tags",
  "brand_slug",
  "created_at",
  "inventory(on_hand, reserved, low_stock_threshold)",
].join(",");

// Stable 32-bit FNV-1a hash of the slug. The UI assumes WcProduct.id is a
// number (cart, react keys, planner state); Prime uses uuid. Slug is unique
// and durable across reseeds, so hashing it gives a deterministic int we can
// round-trip to localStorage without breaking carts on data refresh.
function slugToId(slug: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < slug.length; i++) {
    hash ^= slug.charCodeAt(i);
    hash = (hash + ((hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24))) >>> 0;
  }
  return hash >>> 0;
}

function priceMinorUnits(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "0";
  const n = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(n)) return "0";
  return Math.round(n * 100).toString();
}

function pickInventory(
  raw: PrimeProductRow["inventory"],
): PrimeInventoryRow | null {
  if (!raw) return null;
  if (Array.isArray(raw)) return raw[0] ?? null;
  return raw;
}

function emptyImage(): WcImage[] {
  return [];
}

function buildImages(row: PrimeProductRow): WcImage[] {
  if (!row.image_url) return emptyImage();
  const img: WcImage = {
    id: 0,
    src: row.image_url,
    thumbnail: row.image_url,
    srcset: "",
    sizes: "",
    name: row.name,
    alt: row.name,
  };
  return [img];
}

function buildCategories(row: PrimeProductRow, all: WcProductCategory[]) {
  if (!row.category_slug) return [];
  const cat = all.find((c) => c.slug === row.category_slug);
  if (!cat) return [];
  return [{ id: cat.id, name: cat.name, slug: cat.slug }];
}

function buildTags(row: PrimeProductRow) {
  if (!row.tags?.length) return [];
  return row.tags.map((t, i) => ({
    id: i + 1,
    name: t,
    slug: t.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  }));
}

function mapToWcProduct(
  row: PrimeProductRow,
  categories: WcProductCategory[],
): WcProduct {
  const inv = pickInventory(row.inventory);
  const onHand = inv?.on_hand ?? 0;
  const reserved = inv?.reserved ?? 0;
  const available = Math.max(0, onHand - reserved);
  const lowThreshold = inv?.low_stock_threshold ?? 5;
  const inStock = available > 0;
  const lowRemaining =
    inStock && available <= lowThreshold ? available : null;

  const priceCents = priceMinorUnits(row.retail_price_mur);
  // Prime has no separate sale price; `is_hard_discount` flags discount items
  // for /flash and `BigSalesToday` but `regular === sale` so the strikethrough
  // UI stays inactive. When a real sale_price is added later, surface it here.
  const onSale = row.is_hard_discount;

  return {
    id: slugToId(row.slug),
    name: row.name,
    slug: row.slug,
    permalink: `/product/${row.slug}`,
    type: "simple",
    sku: row.sku,
    description: row.description ?? "",
    short_description: row.description ?? "",
    on_sale: onSale,
    prices: {
      price: priceCents,
      regular_price: priceCents,
      sale_price: priceCents,
      price_range: null,
      currency_code: site.currency.code,
      currency_symbol: site.currency.symbol,
      currency_minor_unit: site.currency.decimals,
      currency_decimal_separator: ".",
      currency_thousand_separator: ",",
      currency_prefix: site.currency.prefix,
      currency_suffix: "",
    },
    price_html: "",
    average_rating: "0",
    review_count: 0,
    images: buildImages(row),
    categories: buildCategories(row, categories),
    tags: buildTags(row),
    attributes: [],
    variations: [],
    is_in_stock: inStock,
    low_stock_remaining: lowRemaining,
    stock_availability: {
      text: inStock
        ? lowRemaining !== null
          ? `Only ${lowRemaining} left`
          : "In stock"
        : "Out of stock",
      class: inStock ? "in-stock" : "out-of-stock",
    },
    add_to_cart: {
      text: "Add to cart",
      description: `Add “${row.name}” to your cart`,
      url: `/product/${row.slug}`,
    },
    brand: row.brand_slug
      ? (() => {
          const b = getBrand(row.brand_slug as string);
          return b
            ? {
                slug: b.slug,
                name: b.name,
                origin: b.origin,
                tagline: b.tagline,
                tint: b.tint,
                logo: b.logo,
              }
            : undefined;
        })()
      : undefined,
  };
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

// Categories taxonomy is still seeded from the WP snapshot — Prime DB has no
// catalog-side categories table yet. Products opt in via `products.category_slug`
// (see Prime Bankend migration 20260508020000_storefront_categories.sql) and
// the adapter looks up the matching entry here.
//
// All loaders below are wrapped in React.cache() so a single page render
// shares one Supabase round-trip even when several components ask for the
// same data (the home page, for example, used to hit Supabase 3× — once per
// `getPopularProducts` / `getTopRatedProducts` / `getOnSaleProducts`).
const loadCategoryCatalog = cache((): WcProductCategory[] => {
  return read<WcProductCategory[]>("categories.json");
});

export const getCategories = cache(
  async (): Promise<WcProductCategory[]> => loadCategoryCatalog(),
);

export const getTopLevelCategories = cache(
  async (): Promise<WcProductCategory[]> =>
    loadCategoryCatalog().filter((c) => c.parent === 0),
);

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

export const getProducts = cache(async (): Promise<WcProduct[]> => {
  const supabase = catalogClient();
  const categories = loadCategoryCatalog();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (error) {
    // Hard fail at request time — a silent fallback to JSON would mask the
    // very integration we just wired up.
    throw new Error(`Failed to load products from Supabase: ${error.message}`);
  }

  const rows = (data ?? []) as unknown as PrimeProductRow[];
  return rows.map((r) => mapToWcProduct(r, categories));
});

export const getProductBySlug = cache(
  async (slug: string): Promise<WcProduct | undefined> => {
    // Reuse the cached full-catalog fetch instead of issuing a second query —
    // detail pages typically render alongside related-product lists that
    // already pull `getProducts()`, so the lookup stays in-memory.
    const all = await getProducts();
    return all.find((p) => p.slug === slug);
  },
);

export const getPopularProducts = cache(
  async (limit = 4): Promise<WcProduct[]> => {
    // Prime DB has no review/popularity column yet; fall back to the same
    // tie-breakers the JSON layer used (on_sale, then newest first).
    const all = await getProducts();
    return [...all]
      .sort(
        (a, b) =>
          Number(b.on_sale) - Number(a.on_sale) ||
          b.id - a.id,
      )
      .slice(0, limit);
  },
);

export const getTopRatedProducts = cache(
  async (limit = 4): Promise<WcProduct[]> => {
    // No ratings stored yet — surface the most recently created products so
    // the homepage tab still has something to show.
    const all = await getProducts();
    return all.slice(0, limit);
  },
);

export const getOnSaleProducts = cache(
  async (limit = 10): Promise<WcProduct[]> => {
    const all = await getProducts();
    return all.filter((p) => p.on_sale).slice(0, limit);
  },
);
