'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { TenderType } from '@/lib/types'

export type ReceiptSale = {
  id: string
  sale_number: string
  status: string
  subtotal_mur: number
  discount_mur: number
  tax_mur: number
  total_mur: number
  notes: string | null
  created_at: string
  completed_at: string | null
}

export type ReceiptLine = {
  sku: string
  name: string
  qty: number
  unit_price_mur: number
  line_discount_mur: number
  line_total_mur: number
}

export type ReceiptPayment = {
  tender: TenderType
  amount_mur: number
  reference: string | null
}

export type Business = {
  name: string
  phone: string | null
  address: string | null
  vat_id: string | null
} | null

export type Place = {
  code: string
  name: string
  address: string | null
  phone: string | null
} | null

export type Reg = { code: string; name: string } | null

export type Customer = {
  full_name: string | null
  phone: string | null
  email: string | null
} | null

export type ReceiptCopy = {
  header: string | null
  footer: string | null
  emailSubject: string
}

const TENDER_LABEL: Record<TenderType, string> = {
  cash: 'Cash',
  card: 'Card',
  mobile_money: 'Mobile money',
  store_credit: 'Store credit',
  voucher: 'Voucher',
  bank_transfer: 'Bank transfer',
}

const fmt = (n: number) => `Rs ${Number(n).toFixed(2)}`

// Deterministic date format — explicit locale + business timezone so server-side
// rendering and client hydration produce the same string. Without this, Node's
// default locale (often en-US) and the browser's (en-GB / fr-MU) disagree and
// React throws a hydration mismatch.
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', {
    timeZone: 'Indian/Mauritius',
    hour12: false,
  })

export function Receipt({
  sale,
  lines,
  payments,
  business,
  location,
  register,
  cashierName,
  customer,
  copy,
  embedded,
}: {
  sale: ReceiptSale
  lines: ReceiptLine[]
  payments: ReceiptPayment[]
  business: Business
  location: Place
  register: Reg
  cashierName: string
  customer: Customer
  copy: ReceiptCopy
  embedded?: boolean
}) {
  const totalPaid = payments.reduce((s, p) => s + Number(p.amount_mur), 0)
  const change = Math.max(0, totalPaid - Number(sale.total_mur))
  const dt = sale.completed_at ?? sale.created_at

  function emailUrl() {
    const lineLines = lines
      .map(
        (l) =>
          `${l.qty} × ${l.name}  ${fmt(l.unit_price_mur)}${
            l.line_discount_mur > 0 ? `  (-${fmt(l.line_discount_mur)})` : ''
          }`,
      )
      .join('\n')
    const payLines = payments
      .map((p) => `${TENDER_LABEL[p.tender]}: ${fmt(p.amount_mur)}${p.reference ? ` (${p.reference})` : ''}`)
      .join('\n')

    const body = [
      business?.name ?? 'NuLakaz',
      business?.address ?? '',
      business?.phone ? `Tel ${business.phone}` : '',
      '',
      `Receipt ${sale.sale_number}`,
      `${fmtDate(dt)}`,
      location ? `${location.code} · ${location.name}` : '',
      `Cashier: ${cashierName}`,
      '',
      '─────────────────────',
      lineLines,
      '─────────────────────',
      `Subtotal: ${fmt(sale.subtotal_mur)}`,
      Number(sale.discount_mur) > 0 ? `Discount: -${fmt(sale.discount_mur)}` : '',
      Number(sale.tax_mur) > 0 ? `Tax: ${fmt(sale.tax_mur)}` : '',
      `Total: ${fmt(sale.total_mur)}`,
      '',
      payLines,
      change > 0 ? `Change: ${fmt(change)}` : '',
      '',
      'Thank you for your visit!',
    ]
      .filter(Boolean)
      .join('\n')

    const subject = copy.emailSubject
      .replaceAll('{{number}}', sale.sale_number)
      .replaceAll('{{business}}', business?.name ?? 'NuLakaz')
      .replaceAll('{{total}}', fmt(sale.total_mur))
    const to = customer?.email ?? ''
    return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  return (
    <>
      {!embedded && (
        <header className="no-print sticky top-0 z-30 border-b border-ink-950 bg-ink-900 text-paper">
          <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-6">
            <Link href="/" className="flex items-center gap-2" aria-label="NuLakaz POS">
              <Image
                src="/nulakaz-mark.webp"
                alt="NuLakaz"
                width={32}
                height={32}
                priority
                className="h-7 w-auto object-contain"
              />
              <span className="rounded-full bg-prime-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-paper">
                POS
              </span>
              <span className="ml-2 hidden text-xs text-ink-500 sm:inline">· Receipt {sale.sale_number}</span>
            </Link>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="rounded-lg bg-prime-700 px-3 py-1.5 text-xs font-bold text-paper transition hover:bg-prime-800"
              >
                Print
              </button>
              <a
                href={emailUrl()}
                className="rounded-lg bg-ink-800/80 px-3 py-1.5 text-xs font-bold text-paper ring-1 ring-ink-700 hover:bg-ink-700"
                title={customer?.email ? `To ${customer.email}` : 'No customer email — opens blank email'}
              >
                Email
              </a>
              <Link
                href="/register"
                className="hidden rounded-lg bg-ink-800/80 px-3 py-1.5 text-xs font-bold text-paper ring-1 ring-ink-700 hover:bg-ink-700 sm:inline-block"
              >
                Register →
              </Link>
            </div>
          </div>
        </header>
      )}

      {embedded && (
        <div className="no-print mb-3 flex items-center justify-end gap-2">
          <button
            onClick={() => window.print()}
            className="rounded-lg bg-prime-700 px-3 py-1.5 text-xs font-bold text-paper hover:bg-prime-800"
          >
            Print
          </button>
          <a
            href={emailUrl()}
            className="rounded-lg border border-ink-300 bg-paper px-3 py-1.5 text-xs font-bold text-ink-900 hover:border-ink-700"
            title={customer?.email ? `To ${customer.email}` : 'No customer email — opens blank email'}
          >
            Email
          </a>
        </div>
      )}

      <main className={embedded ? 'flex justify-center' : 'mx-auto flex max-w-3xl items-start justify-center px-4 py-6 print:p-0'}>
        <article className="receipt w-[80mm] rounded-2xl border border-ink-300/60 bg-paper p-5 font-mono text-[11px] leading-snug print:rounded-none print:border-0 print:p-0 print:shadow-none">
          {/* Header */}
          <header className="mb-3 text-center">
            {copy.header && (
              <div className="mb-1 whitespace-pre-line text-[10px] font-semibold uppercase tracking-widest text-ink-500">
                {copy.header}
              </div>
            )}
            {business?.name && (
              <div className="font-display text-base font-black tracking-tight">{business.name}</div>
            )}
            {business?.address && <div className="mt-0.5 text-[10px] text-ink-700">{business.address}</div>}
            {business?.phone && <div className="text-[10px] text-ink-700">Tel {business.phone}</div>}
            {business?.vat_id && <div className="text-[10px] text-ink-700">VAT {business.vat_id}</div>}
          </header>

          {sale.status !== 'completed' && (
            <div className="mb-2 rounded border border-flash-500/40 bg-flash-50 px-2 py-1 text-center text-[10px] font-bold uppercase text-flash-700">
              {sale.status.replace('_', ' ')}
            </div>
          )}

          {/* Sale meta */}
          <div className="border-t border-dashed border-ink-300 pt-2">
            <KV label="Sale" value={sale.sale_number} />
            <KV label="Date" value={fmtDate(dt)} />
            {location && <KV label="Location" value={`${location.code} · ${location.name}`} />}
            {register && <KV label="Register" value={`${register.code} · ${register.name}`} />}
            <KV label="Cashier" value={cashierName} />
            {customer && (customer.full_name || customer.phone) && (
              <KV
                label="Customer"
                value={`${customer.full_name ?? ''}${customer.phone ? ` (${customer.phone})` : ''}`.trim()}
              />
            )}
          </div>

          {/* Lines */}
          <div className="mt-2 border-t border-dashed border-ink-300 pt-2">
            {lines.map((l, i) => (
              <div key={i} className="mb-1.5">
                <div className="truncate font-semibold">{l.name}</div>
                <div className="flex items-baseline justify-between text-[10px]">
                  <span className="text-ink-500">
                    {Number(l.qty)} × {fmt(l.unit_price_mur)}
                    {l.line_discount_mur > 0 && (
                      <span className="ml-1 text-flash-700">−{fmt(l.line_discount_mur)}</span>
                    )}
                  </span>
                  <span className="tabular-nums">{fmt(l.line_total_mur)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-2 border-t border-dashed border-ink-300 pt-2">
            <KV label="Subtotal" value={fmt(sale.subtotal_mur)} />
            {Number(sale.discount_mur) > 0 && <KV label="Discount" value={`−${fmt(sale.discount_mur)}`} />}
            {Number(sale.tax_mur) > 0 && <KV label="Tax" value={fmt(sale.tax_mur)} />}
            <div className="mt-1 flex items-baseline justify-between border-t border-ink-300 pt-1">
              <span className="font-display text-base font-black">TOTAL</span>
              <span className="font-display text-base font-black tabular-nums">{fmt(sale.total_mur)}</span>
            </div>
          </div>

          {/* Payments */}
          <div className="mt-2 border-t border-dashed border-ink-300 pt-2">
            {payments.map((p, i) => (
              <KV
                key={i}
                label={`${TENDER_LABEL[p.tender]}${p.reference ? ` · ${p.reference}` : ''}`}
                value={fmt(p.amount_mur)}
              />
            ))}
            {change > 0 && (
              <div className="mt-1 border-t border-ink-300 pt-1">
                <KV label="Change" value={fmt(change)} bold />
              </div>
            )}
          </div>

          {/* Footer */}
          <footer className="mt-4 border-t border-dashed border-ink-300 pt-3 text-center">
            {copy.footer ? (
              <div className="whitespace-pre-line text-[10px] text-ink-700">{copy.footer}</div>
            ) : (
              <>
                <div className="text-[10px] uppercase tracking-widest text-ink-500">Thank you</div>
                <div className="mt-1 text-[10px] text-ink-700">Keep this receipt for returns and exchanges.</div>
              </>
            )}
            {sale.notes && <div className="mt-2 italic text-ink-500">{sale.notes}</div>}
          </footer>
        </article>
      </main>
    </>
  )
}

function KV({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between ${bold ? 'font-bold' : ''}`}>
      <span className="text-ink-500">{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  )
}
