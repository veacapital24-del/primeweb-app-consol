// TypeScript types for WordPress / WooCommerce REST API responses.
// Focused on the subset we actually use for the static rebuild.

export type WpRendered = { rendered: string; protected?: boolean };

export interface WpPage {
  id: number;
  slug: string;
  title: WpRendered;
  content: WpRendered;
  excerpt: WpRendered;
  link: string;
  template: string;
  parent: number;
  menu_order: number;
}

export interface WpPost {
  id: number;
  slug: string;
  date: string;
  modified: string;
  title: WpRendered;
  excerpt: WpRendered;
  content: WpRendered;
  link: string;
  featured_media: number;
  categories: number[];
  tags: number[];
}

export interface WpMedia {
  id: number;
  slug: string;
  title: WpRendered;
  source_url: string;
  alt_text: string;
  media_details?: {
    width?: number;
    height?: number;
    sizes?: Record<
      string,
      { file: string; width: number; height: number; source_url: string }
    >;
  };
}

// Woo Store API (public, no auth required)

export interface WcImage {
  id: number;
  src: string;
  thumbnail: string;
  srcset: string;
  sizes: string;
  name: string;
  alt: string;
}

export interface WcPriceBundle {
  price: string;
  regular_price: string;
  sale_price: string;
  price_range: { min_amount: string; max_amount: string } | null;
  currency_code: string;
  currency_symbol: string;
  currency_minor_unit: number;
  currency_decimal_separator: string;
  currency_thousand_separator: string;
  currency_prefix: string;
  currency_suffix: string;
}

export interface WcProductTerm {
  id: number;
  name: string;
  slug: string;
  link?: string;
}

export interface WcProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  type: "simple" | "variable" | "grouped" | "external";
  sku: string;
  description: string; // HTML
  short_description: string; // HTML
  on_sale: boolean;
  prices: WcPriceBundle;
  price_html: string;
  average_rating: string;
  review_count: number;
  images: WcImage[];
  categories: WcProductTerm[];
  tags: WcProductTerm[];
  attributes: Array<{
    id: number;
    name: string;
    taxonomy: string | null;
    has_variations: boolean;
    terms: WcProductTerm[];
  }>;
  variations: number[];
  is_in_stock: boolean;
  low_stock_remaining: number | null;
  stock_availability: { text: string; class: string };
  add_to_cart: { text: string; description: string; url: string };
  // Non-Woo extension — set by the adapter when products.brand_slug
  // matches one of the partner brands in lib/brands.ts.
  brand?: {
    slug: string;
    name: string;
    origin: string;
    tagline: string;
    tint: string;
    logo: string;
  };
}

export interface WcProductCategory {
  id: number;
  name: string;
  slug: string;
  parent: number;
  count: number;
  description: string;
  image: WcImage | null;
}
