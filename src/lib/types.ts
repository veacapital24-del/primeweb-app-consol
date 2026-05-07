export type UserRole = 'customer' | 'retailer' | 'wholesaler' | 'admin'

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
  status: 'pending' | 'confirmed' | 'fulfilled' | 'cancelled'
  whatsapp_phone: string | null
  customer_name: string | null
  notes: string | null
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
