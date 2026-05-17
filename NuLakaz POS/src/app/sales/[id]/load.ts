import { adminClient } from '@/lib/supabase'
import { getSettings } from '@/lib/settings'
import type { TenderType } from '@/lib/types'
import type {
  Business,
  Customer,
  Place,
  Reg,
  ReceiptCopy,
  ReceiptLine,
  ReceiptPayment,
  ReceiptSale,
} from './Receipt'

type SaleRow = ReceiptSale & {
  cashier_id: string
  customer_id: string | null
  locations: { code: string; name: string; address: string | null; phone: string | null } | null
  registers: { code: string; name: string } | null
}

export type ReceiptData = {
  sale: ReceiptSale
  lines: ReceiptLine[]
  payments: ReceiptPayment[]
  business: Business
  location: Place
  register: Reg
  cashierName: string
  customer: Customer
  copy: ReceiptCopy
} | null

export async function loadReceipt(id: string): Promise<ReceiptData> {
  const admin = adminClient()

  const [{ data: saleData }, settings] = await Promise.all([
    admin
      .from('sales')
      .select(
        'id, sale_number, status, subtotal_mur, discount_mur, tax_mur, total_mur, notes, created_at, completed_at, cashier_id, customer_id, locations(code, name, address, phone), registers(code, name)',
      )
      .eq('id', id)
      .maybeSingle<SaleRow>(),
    getSettings(),
  ])

  if (!saleData) return null

  const [{ data: linesData }, { data: paysData }, { data: cashierProfile }, cashierUser] = await Promise.all([
    admin
      .from('sale_lines')
      .select('sku, name, qty, unit_price_mur, line_discount_mur, line_total_mur')
      .eq('sale_id', id)
      .order('id'),
    admin
      .from('payments')
      .select('tender, amount_mur, reference')
      .eq('sale_id', id)
      .order('id'),
    admin.from('profiles').select('full_name').eq('id', saleData.cashier_id).maybeSingle<{ full_name: string | null }>(),
    admin.auth.admin.getUserById(saleData.cashier_id),
  ])

  let customer: Customer = null
  if (saleData.customer_id) {
    const [{ data: cp }, cu] = await Promise.all([
      admin.from('profiles').select('full_name, phone').eq('id', saleData.customer_id).maybeSingle<{
        full_name: string | null
        phone: string | null
      }>(),
      admin.auth.admin.getUserById(saleData.customer_id),
    ])
    customer = {
      full_name: cp?.full_name ?? null,
      phone: cp?.phone ?? null,
      email: cu.data?.user?.email ?? null,
    }
  }

  const business: Business = {
    name: settings.business.name,
    phone: settings.business.phone,
    address: settings.business.address,
    vat_id: settings.business.vat_id,
  }

  const location: Place = saleData.locations
    ? {
        code: saleData.locations.code,
        name: saleData.locations.name,
        address: saleData.locations.address,
        phone: saleData.locations.phone,
      }
    : null

  const register: Reg = saleData.registers
    ? { code: saleData.registers.code, name: saleData.registers.name }
    : null

  const cashierName =
    cashierProfile?.full_name ?? cashierUser.data?.user?.email ?? saleData.cashier_id.slice(0, 8)

  return {
    sale: {
      id: saleData.id,
      sale_number: saleData.sale_number,
      status: saleData.status,
      subtotal_mur: Number(saleData.subtotal_mur),
      discount_mur: Number(saleData.discount_mur),
      tax_mur: Number(saleData.tax_mur),
      total_mur: Number(saleData.total_mur),
      notes: saleData.notes,
      created_at: saleData.created_at,
      completed_at: saleData.completed_at,
    },
    lines: (linesData ?? []).map((l) => ({
      sku: l.sku as string,
      name: l.name as string,
      qty: Number(l.qty),
      unit_price_mur: Number(l.unit_price_mur),
      line_discount_mur: Number(l.line_discount_mur),
      line_total_mur: Number(l.line_total_mur),
    })) as ReceiptLine[],
    payments: (paysData ?? []).map((p) => ({
      tender: p.tender as TenderType,
      amount_mur: Number(p.amount_mur),
      reference: (p.reference as string | null) ?? null,
    })) as ReceiptPayment[],
    business,
    location,
    register,
    cashierName,
    customer,
    copy: {
      header: settings.pos.receipt_header,
      footer: settings.pos.receipt_footer,
      emailSubject: settings.pos.email_subject ?? 'Receipt {{number}} — {{business}}',
    },
  }
}
