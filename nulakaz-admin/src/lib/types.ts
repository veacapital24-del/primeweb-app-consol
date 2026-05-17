export type UserRole = 'customer' | 'retailer' | 'wholesaler' | 'admin'

// Physical location — store, warehouse, or pop-up. Shared between the
// admin console (this app) and the POS, so a location created here
// immediately appears in POS pickers.
export const LOCATION_KINDS = ['store', 'warehouse', 'kiosk', 'popup'] as const
export type LocationKind = (typeof LOCATION_KINDS)[number]

export type Location = {
  id: string
  code: string
  name: string
  kind: LocationKind
  address: string | null
  phone: string | null
  timezone: string
  currency: string
  active: boolean
  created_at: string
}

// Storefront-facing taxonomy. Persisted in Postgres so the admin console
// can manage them at runtime (see /brands and /categories admin pages).
export type Category = {
  slug: string
  name: string
  parent_slug: string | null
  sort_order: number
  active: boolean
  image_url: string | null
  description: string | null
  created_at: string
  updated_at: string
}

export const BRAND_TINTS = [
  'sage',
  'ocean',
  'mustard',
  'dusty-pink',
  'terracotta',
  'stone',
] as const
export type BrandTint = (typeof BRAND_TINTS)[number]

export type Brand = {
  slug: string
  name: string
  logo_url: string | null
  origin: string | null
  tagline: string | null
  body: string | null
  category_slug: string | null
  category_label: string | null
  tint: BrandTint
  sort_order: number
  active: boolean
  created_at: string
  updated_at: string
}

export type Product = {
  id: string
  sku: string
  slug: string
  name: string
  description: string | null
  image_url: string | null
  retail_price_mur: number
  wholesale_price_mur: number | null
  wholesale_min_qty: number
  is_hard_discount: boolean
  active: boolean
  // Surfaced on the NuLakaz storefront (category page, brand page, search
  // tag chips). Slug values reference the `categories` and `brands`
  // tables — manage them at /categories and /brands in the admin console.
  category_slug: string | null
  brand_slug: string | null
  tags: string[] | null
}

export type InventoryRow = {
  product_id: string
  on_hand: number
  reserved: number
  low_stock_threshold: number
  updated_at: string
}

export type ProductStockView = {
  id: string
  sku: string
  slug: string
  name: string
  image_url: string | null
  retail_price_mur: number
  wholesale_price_mur: number | null
  wholesale_min_qty: number
  is_hard_discount: boolean
  available: number
  low_stock_threshold: number
}

export type Reel = {
  id: string
  slug: string
  platform: 'instagram' | 'tiktok' | 'facebook'
  external_url: string | null
  thumbnail_url: string | null
  caption: string | null
  posted_at: string | null
  active: boolean
  created_at: string
}

export type ReelProduct = { reel_id: string; product_id: string; position: number }

export type Order = {
  id: string
  order_number: string
  customer_id: string | null
  channel: 'web' | 'whatsapp' | 'reel'
  reel_id: string | null
  is_wholesale: boolean
  subtotal_mur: number
  status:
    | 'pending'
    | 'confirmed'
    | 'packing'
    | 'packed'
    | 'delivery_in_progress'
    | 'delivered'
    | 'completed'
    | 'cancelled'
  whatsapp_phone: string | null
  customer_name: string | null
  notes: string | null
  created_at: string
}

export type Supplier = {
  id: string
  name: string
  contact_name: string | null
  email: string | null
  phone: string | null
  address: string | null
  notes: string | null
  active: boolean
  created_at: string
  updated_at: string
}

export const PO_STATUSES = ['draft', 'sent', 'partial', 'received', 'cancelled'] as const
export type PoStatus = (typeof PO_STATUSES)[number]

export type PurchaseOrder = {
  id: string
  po_number: string
  supplier_id: string | null
  location_id: string | null
  status: PoStatus
  expected_date: string | null
  notes: string | null
  total_cost_mur: number
  created_at: string
  updated_at: string
}

export type PurchaseOrderLine = {
  id: string
  po_id: string
  product_id: string
  qty_ordered: number
  qty_received: number
  unit_cost_mur: number
  created_at: string
}

export type WhatsAppMessage = {
  id: number
  direction: 'in' | 'out'
  phone: string
  body: string | null
  payload: unknown
  order_id: string | null
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
  provider_message_id: string | null
  created_at: string
}
