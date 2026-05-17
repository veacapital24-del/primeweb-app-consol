// Action input/output types extracted out of `actions.ts`.
// 'use server' files should ideally only export async functions; types live here.

import type { TenderType } from '@/lib/types'

export type CommitLine = {
  product_id: string
  sku: string
  name: string
  qty: number
  unit_price_mur: number
  line_discount_mur: number
}

export type CommitPayment = {
  tender: TenderType
  amount_mur: number
  reference?: string | null
}

export type CommitSaleInput = {
  client_uuid: string
  shift_id: string
  customer_id?: string | null
  cart_discount_mur: number
  notes?: string | null
  lines: CommitLine[]
  payments: CommitPayment[]
}

export type CommitSaleResult =
  | { ok: true; sale_id: string; sale_number: string; total_mur: number }
  | { ok: false; error: string }

export type HeldLine = {
  product_id: string
  sku: string
  name: string
  qty: number
  unit_price_mur: number
  line_discount_mur: number
}

export type ParkSaleInput = {
  client_uuid: string
  shift_id: string
  customer_id?: string | null
  cart_discount_mur: number
  label: string | null
  lines: CommitLine[]
}

export type ParkSaleResult =
  | { ok: true; sale_id: string; sale_number: string }
  | { ok: false; error: string }
