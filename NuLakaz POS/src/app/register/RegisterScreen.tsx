'use client'

import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { TenderType } from '@/lib/types'
import { commitSale, parkSale } from './actions'
import type { CommitSaleInput, HeldLine } from './types'
import { CustomerPicker, type CustomerOption } from './CustomerPicker'
import { HeldSalesDrawer } from './HeldSalesDrawer'

export type Product = {
  id: string
  sku: string
  name: string
  retail_price_mur: number
  image_url: string | null
  available: number | null
}

export type ShiftCtx = {
  id: string
  register_id: string
  location_id: string
  opened_at: string
  register_code: string
  register_name: string
  location_code: string
  location_name: string
  currency: string
}

type CartLine = {
  product_id: string
  sku: string
  name: string
  qty: number
  unit_price_mur: number
  line_discount_mur: number
  image_url: string | null
  available: number | null
}

type TenderEntry = {
  uuid: string
  tender: TenderType
  amount_mur: number
  reference: string
}

type ReceiptInfo = {
  sale_id: string
  sale_number: string
  total: number
  paid: number
  change: number
  customer: CustomerOption | null
  tenders: { tender: TenderType; amount: number }[]
}

const TENDER_LABELS: Record<TenderType, string> = {
  cash: 'Cash',
  card: 'Card',
  mobile_money: 'Mobile money',
  store_credit: 'Store credit',
  voucher: 'Voucher',
  bank_transfer: 'Bank transfer',
}

const TENDERS: TenderType[] = [
  'cash',
  'card',
  'mobile_money',
  'voucher',
  'bank_transfer',
  'store_credit',
]

const fmt = (n: number) => `Rs ${n.toFixed(2)}`

export function RegisterScreen({
  shift,
  products,
  topSellerIds = [],
  heldCount: initialHeldCount = 0,
}: {
  shift: ShiftCtx
  products: Product[]
  topSellerIds?: string[]
  heldCount?: number
}) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [lines, setLines] = useState<CartLine[]>([])
  const [cartDiscount, setCartDiscount] = useState(0)
  const [customer, setCustomer] = useState<CustomerOption | null>(null)
  const [paying, setPaying] = useState(false)
  const [parking, setParking] = useState(false)
  const [parkLabel, setParkLabel] = useState('')
  const [parkError, setParkError] = useState<string | null>(null)
  const [isPendingPark, startPark] = useTransition()
  const [heldOpen, setHeldOpen] = useState(false)
  const [heldCount, setHeldCount] = useState(initialHeldCount)
  const [receipt, setReceipt] = useState<ReceiptInfo | null>(null)
  const [mobileCartOpen, setMobileCartOpen] = useState(false)
  const [tab, setTab] = useState<'all' | 'top'>('all')
  const [recentlyAdded, setRecentlyAdded] = useState<Set<string>>(new Set())
  const searchRef = useRef<HTMLInputElement>(null)
  const topSellerSet = useMemo(() => new Set(topSellerIds), [topSellerIds])

  useEffect(() => {
    searchRef.current?.focus()
  }, [lines.length, paying, receipt])

  // Lock body scroll while the mobile cart sheet is open
  useEffect(() => {
    if (!mobileCartOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [mobileCartOpen])

  const itemCount = lines.reduce((s, l) => s + l.qty, 0)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    let pool = products
    if (tab === 'top' && topSellerIds.length > 0) {
      const order = new Map(topSellerIds.map((id, i) => [id, i]))
      pool = products
        .filter((p) => order.has(p.id))
        .sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0))
    }
    if (!q) return pool.slice(0, 32)
    const exactSku = pool.find((p) => p.sku.toLowerCase() === q)
    if (exactSku) return [exactSku]
    return pool
      .filter((p) => p.sku.toLowerCase().includes(q) || p.name.toLowerCase().includes(q))
      .slice(0, 32)
  }, [search, products, tab, topSellerIds])

  const subtotal = lines.reduce(
    (s, l) => s + l.unit_price_mur * l.qty - l.line_discount_mur,
    0,
  )
  const total = Math.max(0, subtotal - cartDiscount)

  function flashLine(product_id: string) {
    setRecentlyAdded((prev) => {
      const next = new Set(prev)
      next.add(product_id)
      return next
    })
    setTimeout(() => {
      setRecentlyAdded((prev) => {
        const next = new Set(prev)
        next.delete(product_id)
        return next
      })
    }, 700)
  }

  function addProduct(p: Product) {
    setLines((prev) => {
      const existing = prev.find((l) => l.product_id === p.id)
      if (existing) {
        return prev.map((l) =>
          l.product_id === p.id ? { ...l, qty: l.qty + 1 } : l,
        )
      }
      return [
        ...prev,
        {
          product_id: p.id,
          sku: p.sku,
          name: p.name,
          qty: 1,
          unit_price_mur: Number(p.retail_price_mur),
          line_discount_mur: 0,
          image_url: p.image_url,
          available: p.available,
        },
      ]
    })
    flashLine(p.id)
    setSearch('')
  }

  function applyDiscountPercent(pct: number) {
    setCartDiscount(Math.round(subtotal * pct) / 1)
  }

  function commitPark() {
    if (lines.length === 0) return
    setParkError(null)
    const client_uuid = crypto.randomUUID()
    startPark(async () => {
      const result = await parkSale({
        client_uuid,
        shift_id: shift.id,
        customer_id: customer?.id ?? null,
        cart_discount_mur: cartDiscount,
        label: parkLabel || customer?.full_name || customer?.phone || null,
        lines: lines.map((l) => ({
          product_id: l.product_id,
          sku: l.sku,
          name: l.name,
          qty: l.qty,
          unit_price_mur: l.unit_price_mur,
          line_discount_mur: l.line_discount_mur,
        })),
      })
      if (!result.ok) {
        setParkError(result.error)
        return
      }
      clearCart()
      setParkLabel('')
      setParking(false)
      setHeldCount((c) => c + 1)
    })
  }

  function recallHeld({
    customer_id,
    cart_discount_mur,
    lines: recalledLines,
  }: {
    customer_id: string | null
    cart_discount_mur: number
    lines: HeldLine[]
  }) {
    setLines(
      recalledLines.map((l) => {
        const prod = products.find((p) => p.id === l.product_id)
        return {
          product_id: l.product_id,
          sku: l.sku,
          name: l.name,
          qty: l.qty,
          unit_price_mur: l.unit_price_mur,
          line_discount_mur: l.line_discount_mur,
          image_url: prod?.image_url ?? null,
          available: prod?.available ?? null,
        }
      }),
    )
    setCartDiscount(cart_discount_mur)
    setHeldCount((c) => Math.max(0, c - 1))
    if (customer_id) {
      // Customer not in our local data; cashier can re-attach if needed
      setCustomer(null)
    }
    router.refresh()
  }

  function setQty(product_id: string, qty: number) {
    setLines((prev) =>
      prev
        .map((l) => (l.product_id === product_id ? { ...l, qty } : l))
        .filter((l) => l.qty > 0),
    )
  }

  function setLineDiscount(product_id: string, line_discount_mur: number) {
    setLines((prev) =>
      prev.map((l) =>
        l.product_id === product_id
          ? { ...l, line_discount_mur: Math.max(0, line_discount_mur) }
          : l,
      ),
    )
  }

  function removeLine(product_id: string) {
    setLines((prev) => prev.filter((l) => l.product_id !== product_id))
  }

  function clearCart() {
    setLines([])
    setCartDiscount(0)
    setCustomer(null)
  }

  function onSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && filtered.length > 0) {
      e.preventDefault()
      addProduct(filtered[0])
    }
  }

  return (
    <main className="grid gap-4 px-3 pb-24 pt-3 sm:px-6 sm:py-4 md:grid-cols-[1fr_320px] md:pb-4 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_400px]">
      <section className="min-w-0">
        <div className="sticky top-[calc(56px+0.5rem)] z-10 mb-3 rounded-2xl border border-ink-300/60 bg-paper p-2.5 shadow-sm sm:top-[calc(56px+1rem)] sm:mb-4 sm:p-3">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 shrink-0 text-ink-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              ref={searchRef}
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={onSearchKeyDown}
              placeholder="Scan or search…"
              className="w-full bg-transparent py-2 text-base outline-none placeholder:text-ink-500"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="rounded-md bg-ink-100 px-2 py-1 text-xs text-ink-700 hover:bg-ink-200"
              >
                Clear
              </button>
            )}
          </div>
          {filtered.length === 0 && search.trim() !== '' && (
            <div className="mt-2 px-2 text-xs text-flash-700">No matching product.</div>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-3 flex flex-wrap items-center gap-1 rounded-xl border border-ink-300 bg-paper p-1 text-xs font-bold sm:mb-4">
          <button
            onClick={() => setTab('all')}
            className={`rounded-md px-3 py-1.5 transition ${
              tab === 'all' ? 'bg-prime-700 text-paper' : 'text-ink-700 hover:bg-paper-dim'
            }`}
          >
            All products
          </button>
          <button
            onClick={() => setTab('top')}
            disabled={topSellerIds.length === 0}
            className={`rounded-md px-3 py-1.5 transition disabled:opacity-40 ${
              tab === 'top' ? 'bg-prime-700 text-paper' : 'text-ink-700 hover:bg-paper-dim'
            }`}
          >
            Top sellers · 30d{topSellerIds.length > 0 ? ` (${topSellerIds.length})` : ''}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => addProduct(p)}
              className="group flex flex-col rounded-2xl border border-ink-300/60 bg-paper p-2.5 text-left transition hover:-translate-y-0.5 hover:border-prime-500 hover:shadow-md"
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-paper-dim/60">
                {p.image_url ? (
                  <Image src={p.image_url} alt={p.name} fill className="object-cover" sizes="200px" />
                ) : (
                  <div className="grid h-full w-full place-items-center text-3xl text-ink-300">▦</div>
                )}
                {p.available !== null && p.available <= 0 && (
                  <div className="absolute right-1 top-1 rounded-full bg-flash-700 px-1.5 py-0.5 text-[10px] font-bold text-paper">
                    Out
                  </div>
                )}
                {p.available !== null && p.available > 0 && p.available <= 5 && (
                  <div className="absolute right-1 top-1 rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-paper">
                    {p.available}
                  </div>
                )}
                {topSellerSet.has(p.id) && (
                  <div className="absolute left-1 top-1 rounded-full bg-prime-700 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-paper">
                    Top
                  </div>
                )}
              </div>
              <div className="mt-2 line-clamp-2 text-xs font-semibold text-ink-900">{p.name}</div>
              <div className="mt-0.5 flex items-baseline justify-between">
                <span className="font-mono text-[10px] text-ink-500">{p.sku}</span>
                <span className="font-display text-sm font-black tabular-nums text-prime-700">
                  {fmt(Number(p.retail_price_mur))}
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Mobile cart backdrop */}
      {mobileCartOpen && (
        <div
          onClick={() => setMobileCartOpen(false)}
          className="fixed inset-0 z-30 bg-ink-900/60 backdrop-blur-sm md:hidden"
          aria-hidden
        />
      )}

      <aside
        className={`${
          mobileCartOpen
            ? 'fixed inset-x-0 bottom-0 top-14 z-40 md:static md:inset-auto'
            : 'hidden md:block'
        } md:sticky md:top-[calc(56px+1rem)] md:h-[calc(100vh-56px-2rem)] md:self-start md:z-auto`}
      >
        <div className="flex h-full flex-col rounded-t-2xl border border-ink-300/60 bg-paper md:rounded-2xl">
          <div className="border-b border-ink-300/60 bg-gradient-to-r from-paper-dim/60 to-paper px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-lg font-black tracking-tight">Cart</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setHeldOpen(true)}
                  className="inline-flex items-center gap-1 rounded-lg border border-ink-300 bg-paper px-2 py-1 text-[11px] font-bold text-ink-900 hover:border-prime-500"
                  title="View parked / held sales"
                >
                  Held
                  <span
                    className={`grid h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] font-black ${
                      heldCount > 0 ? 'bg-amber-500 text-paper' : 'bg-ink-200 text-ink-700'
                    }`}
                  >
                    {heldCount}
                  </span>
                </button>
                {lines.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm('Clear the cart?')) clearCart()
                    }}
                    className="text-xs font-semibold text-flash-700 underline hover:text-flash-500"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={() => setMobileCartOpen(false)}
                  className="grid h-8 w-8 place-items-center rounded-full bg-paper-dim/80 text-ink-700 hover:bg-paper-dim md:hidden"
                  aria-label="Close cart"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="mt-0.5 text-xs text-ink-500">
              {lines.length === 0
                ? 'Empty'
                : `${lines.length} line${lines.length === 1 ? '' : 's'} · ${itemCount} item${
                    itemCount === 1 ? '' : 's'
                  }`}
            </div>
          </div>

          <div className="border-b border-ink-300/60 px-4 py-3">
            <CustomerPicker value={customer} onChange={setCustomer} />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
            {lines.length === 0 ? (
              <div className="grid h-full place-items-center px-4 text-center text-sm text-ink-500">
                <div>
                  <div className="text-3xl">🛒</div>
                  <div className="mt-2">Scan or tap a product to add it.</div>
                </div>
              </div>
            ) : (
              <ul className="space-y-3">
                {lines.map((l) => (
                  <li
                    key={l.product_id}
                    className={`rounded-xl border p-3 transition-colors duration-500 ${
                      recentlyAdded.has(l.product_id)
                        ? 'border-prime-500 bg-prime-50'
                        : 'border-ink-300/60 bg-paper-dim/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">{l.name}</div>
                        <div className="mt-0.5 flex items-baseline gap-2">
                          <span className="font-mono text-[10px] text-ink-500">{l.sku}</span>
                          <span className="text-xs text-ink-700">{fmt(l.unit_price_mur)} ea.</span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeLine(l.product_id)}
                        className="text-xs font-semibold text-ink-500 hover:text-flash-700"
                        aria-label="Remove"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-2">
                      <div className="inline-flex items-center rounded-lg border border-ink-300 bg-paper">
                        <button
                          onClick={() => setQty(l.product_id, l.qty - 1)}
                          className="grid h-10 w-10 place-items-center text-xl font-bold text-ink-700 hover:bg-ink-100 active:bg-ink-200"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          value={l.qty}
                          onChange={(e) => setQty(l.product_id, Number(e.target.value) || 0)}
                          className="h-10 w-12 bg-transparent text-center text-sm tabular-nums outline-none"
                          min={0}
                          step={1}
                        />
                        <button
                          onClick={() => setQty(l.product_id, l.qty + 1)}
                          className="grid h-10 w-10 place-items-center text-xl font-bold text-ink-700 hover:bg-ink-100 active:bg-ink-200"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <div className="font-mono text-sm font-bold tabular-nums">
                        {fmt(l.unit_price_mur * l.qty - l.line_discount_mur)}
                      </div>
                    </div>

                    {l.line_discount_mur > 0 && (
                      <div className="mt-1 flex items-center justify-between text-[11px] text-flash-700">
                        <span>Line discount</span>
                        <span className="font-mono">−{fmt(l.line_discount_mur)}</span>
                      </div>
                    )}
                    <details className="mt-1.5">
                      <summary className="cursor-pointer text-[11px] text-ink-500 hover:text-ink-900">
                        Discount this line…
                      </summary>
                      <div className="mt-1.5 flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={l.line_discount_mur || ''}
                          onChange={(e) => setLineDiscount(l.product_id, Number(e.target.value) || 0)}
                          placeholder="0.00"
                          className="w-24 rounded-md border border-ink-300 bg-paper px-2 py-1 text-xs"
                        />
                        <span className="text-[11px] text-ink-500">Rs off this line</span>
                      </div>
                    </details>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-ink-300/60 px-4 py-3">
            <div className="space-y-1.5 text-sm">
              <Row label="Subtotal" value={fmt(subtotal)} />
              <div className="flex items-center justify-between">
                <span className="text-ink-700">Cart discount</span>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={cartDiscount || ''}
                  onChange={(e) => setCartDiscount(Math.max(0, Number(e.target.value) || 0))}
                  placeholder="0.00"
                  className="w-24 rounded-md border border-ink-300 bg-paper px-2 py-1 text-right text-sm tabular-nums"
                />
              </div>
              {/* Discount preset chips */}
              {subtotal > 0 && (
                <div className="flex flex-wrap items-center gap-1 pt-1">
                  {[0.05, 0.1, 0.15, 0.2].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => applyDiscountPercent(pct)}
                      className="rounded-md border border-ink-300 bg-paper px-2 py-0.5 text-[11px] font-bold text-ink-700 hover:border-prime-500 hover:text-prime-700"
                    >
                      −{Math.round(pct * 100)}%
                    </button>
                  ))}
                  {cartDiscount > 0 && (
                    <button
                      onClick={() => setCartDiscount(0)}
                      className="rounded-md border border-ink-300 bg-paper px-2 py-0.5 text-[11px] font-bold text-flash-700 hover:border-flash-500"
                    >
                      Clear
                    </button>
                  )}
                </div>
              )}
              <Row label="Total" value={fmt(total)} bold />
            </div>

            <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
              <button
                onClick={() => setPaying(true)}
                disabled={lines.length === 0 || total <= 0}
                className="rounded-xl bg-prime-700 px-4 py-3.5 text-base font-black text-paper transition hover:bg-prime-800 disabled:opacity-40"
              >
                Pay · {fmt(total)}
              </button>
              <button
                onClick={() => setParking(true)}
                disabled={lines.length === 0}
                className="rounded-xl border border-ink-300 bg-paper px-3 text-sm font-bold text-ink-900 transition hover:border-prime-500 hover:text-prime-700 disabled:opacity-40"
                title="Park / hold this cart for later"
              >
                Park
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile cart launcher — fixed bottom bar, only when cart has items */}
      {!mobileCartOpen && lines.length > 0 && (
        <button
          onClick={() => setMobileCartOpen(true)}
          className="fixed inset-x-3 bottom-3 z-30 flex items-center justify-between gap-3 rounded-2xl bg-prime-700 px-4 py-3 text-paper shadow-2xl ring-1 ring-prime-800 md:hidden"
        >
          <span className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-paper text-xs font-black text-prime-700">
              {itemCount}
            </span>
            <span className="text-sm font-semibold">
              {itemCount} item{itemCount === 1 ? '' : 's'}
            </span>
          </span>
          <span className="font-display text-base font-black tabular-nums">{fmt(total)}</span>
          <span className="text-sm font-bold">View →</span>
        </button>
      )}

      {paying && (
        <PaymentModal
          shiftId={shift.id}
          locationId={shift.location_id}
          total={total}
          subtotal={subtotal}
          cartDiscount={cartDiscount}
          customer={customer}
          lines={lines}
          onClose={() => setPaying(false)}
          onCommitted={(r) => {
            setReceipt(r)
            setPaying(false)
            clearCart()
            router.refresh()
          }}
        />
      )}

      {receipt && <ReceiptModal receipt={receipt} onClose={() => setReceipt(null)} />}

      {/* Park sale dialog */}
      {parking && (
        <div
          onClick={() => !isPendingPark && setParking(false)}
          className="fixed inset-0 z-50 grid place-items-center bg-ink-900/60 px-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-ink-300 bg-paper p-5 shadow-2xl"
          >
            <h2 className="font-display text-xl font-black tracking-tight">Park sale</h2>
            <p className="mt-1 text-xs text-ink-500">
              Hold this cart so you can serve the next customer. Recall it from the "Held" button.
            </p>
            <label className="mt-4 block">
              <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-500">
                Label
              </span>
              <input
                value={parkLabel}
                onChange={(e) => setParkLabel(e.target.value)}
                autoFocus
                placeholder={customer?.full_name ?? customer?.phone ?? 'Optional · e.g. Mr Lee'}
                className="w-full rounded-lg border border-ink-300 bg-paper px-3 py-2.5 text-sm focus:border-prime-500 focus:outline-none focus:ring-2 focus:ring-prime-200"
              />
            </label>
            <div className="mt-3 rounded-lg bg-paper-dim/60 p-3 text-xs text-ink-700">
              {lines.length} line{lines.length === 1 ? '' : 's'} · {itemCount} item
              {itemCount === 1 ? '' : 's'} · <span className="font-mono font-bold">{fmt(total)}</span>
            </div>
            {parkError && (
              <div className="mt-3 rounded-lg border border-flash-500/40 bg-flash-50 px-3 py-2 text-xs text-flash-700">
                {parkError}
              </div>
            )}
            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={commitPark}
                disabled={isPendingPark}
                className="flex-1 rounded-xl bg-prime-700 px-4 py-3 text-sm font-black text-paper hover:bg-prime-800 disabled:opacity-40"
              >
                {isPendingPark ? 'Parking…' : 'Hold sale'}
              </button>
              <button
                onClick={() => setParking(false)}
                disabled={isPendingPark}
                className="rounded-xl border border-ink-300 bg-paper px-4 py-3 text-sm font-bold text-ink-900 hover:border-ink-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <HeldSalesDrawer
        open={heldOpen}
        onClose={() => setHeldOpen(false)}
        locationId={shift.location_id}
        onRecall={recallHeld}
      />
    </main>
  )
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={bold ? 'font-display text-lg font-black' : 'text-ink-700'}>{label}</span>
      <span className={`font-mono tabular-nums ${bold ? 'font-display text-lg font-black' : ''}`}>{value}</span>
    </div>
  )
}

// MUR cash denominations a cashier is most likely to receive.
const CASH_QUICK: number[] = [25, 50, 100, 200, 500, 1000, 2000]

const TENDER_ICON: Record<TenderType, string> = {
  cash: '💵',
  card: '💳',
  mobile_money: '📱',
  voucher: '🎟️',
  bank_transfer: '🏦',
  store_credit: '⭐',
}

function tenderRefHint(t: TenderType): { placeholder: string; maxLength?: number; pattern?: string } {
  switch (t) {
    case 'card': return { placeholder: 'Last 4 digits', maxLength: 4, pattern: '\\d{4}' }
    case 'mobile_money': return { placeholder: 'Ref / phone' }
    case 'voucher': return { placeholder: 'Voucher code' }
    case 'bank_transfer': return { placeholder: 'Transaction ID' }
    case 'store_credit': return { placeholder: 'Account ref' }
    default: return { placeholder: 'Note (optional)' }
  }
}

function PaymentModal({
  shiftId,
  total,
  subtotal,
  cartDiscount,
  customer,
  lines,
  onClose,
  onCommitted,
}: {
  shiftId: string
  locationId: string
  total: number
  subtotal: number
  cartDiscount: number
  customer: CustomerOption | null
  lines: CartLine[]
  onClose: () => void
  onCommitted: (r: ReceiptInfo) => void
}) {
  const [tenders, setTenders] = useState<TenderEntry[]>([
    { uuid: crypto.randomUUID(), tender: 'cash', amount_mur: total, reference: '' },
  ])
  const [error, setError] = useState<string | null>(null)
  const [isPending, start] = useTransition()
  const amountRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const paid = tenders.reduce((s, t) => s + (Number(t.amount_mur) || 0), 0)
  const remaining = Math.max(0, total - paid)
  const change = Math.max(0, paid - total)
  const enough = paid + 0.0001 >= total
  const itemCount = lines.reduce((n, l) => n + l.qty, 0)

  function addTender(kind: TenderType) {
    const id = crypto.randomUUID()
    setTenders((prev) => [
      ...prev,
      { uuid: id, tender: kind, amount_mur: remaining, reference: '' },
    ])
    requestAnimationFrame(() => amountRefs.current[id]?.select())
  }

  function updateTender(uuid: string, patch: Partial<TenderEntry>) {
    setTenders((prev) => prev.map((t) => (t.uuid === uuid ? { ...t, ...patch } : t)))
  }

  function removeTender(uuid: string) {
    setTenders((prev) => prev.filter((t) => t.uuid !== uuid))
  }

  // Replace the active tender's method, keeping its amount.
  function changeTenderKind(uuid: string, kind: TenderType) {
    updateTender(uuid, { tender: kind, reference: '' })
  }

  // Add to (or set) a tender's amount — used by the cash quick-tender keypad.
  function bumpAmount(uuid: string, by: number) {
    setTenders((prev) =>
      prev.map((t) => (t.uuid === uuid ? { ...t, amount_mur: Number((t.amount_mur || 0) + by) } : t)),
    )
  }

  function setExact(uuid: string) {
    setTenders((prev) => {
      const others = prev.filter((t) => t.uuid !== uuid).reduce((s, t) => s + (Number(t.amount_mur) || 0), 0)
      const exact = Math.max(0, total - others)
      return prev.map((t) => (t.uuid === uuid ? { ...t, amount_mur: exact } : t))
    })
  }

  function commit() {
    if (!enough || isPending) return
    setError(null)
    const client_uuid = crypto.randomUUID()
    const payments = tenders
      .filter((t) => Number(t.amount_mur) > 0)
      .map((t) => ({
        tender: t.tender,
        amount_mur: Number(t.amount_mur),
        reference: t.reference.trim() || null,
      }))

    const payload: CommitSaleInput = {
      client_uuid,
      shift_id: shiftId,
      customer_id: customer?.id ?? null,
      cart_discount_mur: cartDiscount,
      lines: lines.map((l) => ({
        product_id: l.product_id,
        sku: l.sku,
        name: l.name,
        qty: l.qty,
        unit_price_mur: l.unit_price_mur,
        line_discount_mur: l.line_discount_mur,
      })),
      payments,
    }
    start(async () => {
      const result = await commitSale(payload)
      if (!result.ok) {
        setError(result.error)
        return
      }
      onCommitted({
        sale_id: result.sale_id,
        sale_number: result.sale_number,
        total: result.total_mur,
        paid,
        change,
        customer,
        tenders: payments.map((p) => ({ tender: p.tender, amount: p.amount_mur })),
      })
    })
  }

  // Esc to close, Cmd/Ctrl+Enter to confirm. Keep handlers stable via refs in deps.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !isPending) {
        e.preventDefault()
        onClose()
        return
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        commit()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPending, enough, tenders, total])

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-ink-900/70 px-3 py-4 backdrop-blur-sm"
      onClick={() => !isPending && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="take-payment-title"
    >
      <div
        className="flex max-h-[95vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-ink-300/60 bg-paper shadow-2xl ring-1 ring-ink-900/5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — sticky, with sale context */}
        <header className="flex items-start justify-between gap-3 border-b border-ink-200/70 bg-gradient-to-b from-paper to-paper-dim/40 px-5 py-4">
          <div className="min-w-0">
            <h2 id="take-payment-title" className="font-display text-xl font-black tracking-tight text-ink-900">
              Take payment
            </h2>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-ink-500">
              <span className="font-semibold text-ink-700">
                {itemCount} item{itemCount === 1 ? '' : 's'}
              </span>
              {customer && (
                <span className="inline-flex items-center gap-1 rounded-full bg-prime-100 px-2 py-0.5 font-semibold text-prime-700">
                  <span aria-hidden>👤</span>
                  {customer.full_name ?? customer.phone ?? 'Customer'}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => !isPending && onClose()}
            className="grid h-9 w-9 place-items-center rounded-full text-ink-500 transition hover:bg-ink-100 hover:text-ink-900"
            aria-label="Close"
            disabled={isPending}
          >
            ✕
          </button>
        </header>

        {/* Scrollable body */}
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {/* Total banner */}
          <div className="rounded-2xl bg-gradient-to-br from-prime-700 to-prime-800 px-5 py-4 text-paper shadow-md">
            <div className="flex items-baseline justify-between text-[11px] uppercase tracking-widest text-prime-200/90">
              <span>Total due</span>
              <span>MUR</span>
            </div>
            <div className="mt-0.5 font-display text-4xl font-black tabular-nums">{fmt(total)}</div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-prime-200/80">
              <span>Subtotal {fmt(subtotal)}</span>
              {cartDiscount > 0 && <span>Discount −{fmt(cartDiscount)}</span>}
            </div>
          </div>

          {/* Tender list */}
          <div className="space-y-3">
            {tenders.map((t, idx) => {
              const hint = tenderRefHint(t.tender)
              const isCash = t.tender === 'cash'
              return (
                <div
                  key={t.uuid}
                  className="rounded-2xl border border-ink-200 bg-paper p-3 shadow-sm transition focus-within:border-prime-500 focus-within:ring-2 focus-within:ring-prime-200"
                >
                  {/* Method chips: tap to switch this tender's kind */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {TENDERS.map((kind) => {
                      const active = kind === t.tender
                      return (
                        <button
                          key={kind}
                          type="button"
                          onClick={() => changeTenderKind(t.uuid, kind)}
                          className={
                            'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition ' +
                            (active
                              ? 'bg-prime-700 text-paper shadow-sm'
                              : 'border border-ink-200 bg-paper text-ink-700 hover:border-prime-500 hover:text-prime-700')
                          }
                          aria-pressed={active}
                        >
                          <span aria-hidden>{TENDER_ICON[kind]}</span>
                          <span>{TENDER_LABELS[kind]}</span>
                        </button>
                      )
                    })}
                    {tenders.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTender(t.uuid)}
                        className="ml-auto rounded-full px-2 py-1 text-[11px] font-semibold text-ink-500 hover:text-flash-700"
                        aria-label="Remove tender"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {/* Amount + reference */}
                  <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr]">
                    <label className="block">
                      <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-ink-500">
                        Amount
                      </span>
                      <div className="flex items-stretch overflow-hidden rounded-xl border border-ink-200 bg-paper focus-within:border-prime-500">
                        <span className="grid place-items-center bg-paper-dim/60 px-3 text-xs font-bold text-ink-500">
                          Rs
                        </span>
                        <input
                          ref={(el) => {
                            amountRefs.current[t.uuid] = el
                          }}
                          type="number"
                          inputMode="decimal"
                          min={0}
                          step="0.01"
                          value={t.amount_mur || ''}
                          onFocus={(e) => e.currentTarget.select()}
                          onChange={(e) =>
                            updateTender(t.uuid, { amount_mur: Number(e.target.value) || 0 })
                          }
                          autoFocus={idx === 0}
                          className="flex-1 bg-paper px-3 py-2 text-right font-mono text-base font-bold tabular-nums focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setExact(t.uuid)}
                          className="border-l border-ink-200 bg-paper-dim/60 px-3 text-[11px] font-bold text-prime-700 hover:bg-prime-50"
                          title="Fill remaining due"
                        >
                          Exact
                        </button>
                      </div>
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-ink-500">
                        Reference
                      </span>
                      <input
                        value={t.reference}
                        onChange={(e) => updateTender(t.uuid, { reference: e.target.value })}
                        placeholder={hint.placeholder}
                        maxLength={hint.maxLength}
                        pattern={hint.pattern}
                        inputMode={t.tender === 'card' ? 'numeric' : undefined}
                        className="w-full rounded-xl border border-ink-200 bg-paper px-3 py-2 text-sm focus:border-prime-500 focus:outline-none focus:ring-2 focus:ring-prime-200"
                      />
                    </label>
                  </div>

                  {/* Cash quick-tender keypad — common Mauritian denominations */}
                  {isCash && (
                    <div className="mt-3">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-ink-500">
                        Quick add
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {CASH_QUICK.map((d) => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => bumpAmount(t.uuid, d)}
                            className="rounded-lg border border-ink-200 bg-paper px-2.5 py-1 font-mono text-xs font-bold text-ink-900 transition hover:border-prime-500 hover:text-prime-700"
                          >
                            +{d}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => updateTender(t.uuid, { amount_mur: 0 })}
                          className="ml-auto rounded-lg px-2 py-1 text-[11px] font-semibold text-ink-500 hover:text-flash-700"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Add another tender (split payment) */}
          {remaining > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-ink-500">
                Split with another method
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {TENDERS.filter((k) => !tenders.some((t) => t.tender === k)).map((kind) => (
                  <button
                    key={kind}
                    type="button"
                    onClick={() => addTender(kind)}
                    className="inline-flex items-center gap-1 rounded-full border border-dashed border-ink-300 bg-paper px-3 py-1.5 text-[11px] font-bold text-ink-700 transition hover:border-prime-500 hover:bg-prime-50 hover:text-prime-700"
                  >
                    <span aria-hidden>{TENDER_ICON[kind]}</span>
                    <span>+ {TENDER_LABELS[kind]}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div role="alert" className="rounded-xl border border-flash-500/40 bg-flash-50 px-3 py-2 text-xs font-semibold text-flash-700">
              {error}
            </div>
          )}
        </div>

        {/* Sticky footer with status + actions */}
        <footer className="border-t border-ink-200/70 bg-paper px-5 py-4">
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Paid" value={fmt(paid)} tone={enough ? 'mint' : 'prime'} />
            {remaining > 0 ? (
              <Stat label="Remaining" value={fmt(remaining)} tone="flash" />
            ) : (
              <Stat label="Change" value={fmt(change)} tone="mint" highlight />
            )}
            <Stat label="Total" value={fmt(total)} />
          </div>

          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={commit}
              disabled={!enough || isPending}
              className={
                'flex-1 rounded-2xl px-4 py-3.5 text-base font-black text-paper transition disabled:opacity-40 ' +
                (enough
                  ? 'bg-prime-700 shadow-lg shadow-prime-700/20 hover:bg-prime-800'
                  : 'bg-ink-700')
              }
            >
              {isPending ? 'Committing…' : enough ? `Confirm · ${fmt(total)}` : `Need ${fmt(remaining)} more`}
            </button>
            <button
              onClick={onClose}
              disabled={isPending}
              className="rounded-2xl border border-ink-300 bg-paper px-4 py-3.5 text-sm font-bold text-ink-900 hover:border-ink-700 disabled:opacity-40"
            >
              Cancel
            </button>
          </div>
          <div className="mt-2 text-center text-[10px] font-semibold uppercase tracking-widest text-ink-500">
            Esc to cancel · ⌘/Ctrl + Enter to confirm
          </div>
        </footer>
      </div>
    </div>
  )
}

function Stat({
  label,
  value,
  tone,
  highlight,
}: {
  label: string
  value: string
  tone?: 'prime' | 'flash' | 'mint'
  highlight?: boolean
}) {
  const v =
    tone === 'prime' ? 'text-prime-700' :
    tone === 'flash' ? 'text-flash-700' :
    tone === 'mint'  ? 'text-mint-600' :
    'text-ink-900'
  const wrap = highlight
    ? 'rounded-xl bg-mint-100 px-2 py-1.5 ring-1 ring-mint-500/30'
    : ''
  return (
    <div className={wrap}>
      <div className="text-[10px] font-bold uppercase tracking-widest text-ink-500">{label}</div>
      <div className={`font-mono text-lg font-black tabular-nums ${v}`}>{value}</div>
    </div>
  )
}

function ReceiptModal({ receipt, onClose }: { receipt: ReceiptInfo; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink-900/60 px-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl border border-mint-500/30 bg-paper p-6 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid h-14 w-14 mx-auto place-items-center rounded-full bg-mint-100 text-3xl">✓</div>
        <h2 className="font-display mt-3 text-2xl font-black tracking-tight">Sale complete</h2>
        <div className="mt-1 font-mono text-xs text-ink-500">{receipt.sale_number}</div>

        {receipt.customer && (
          <div className="mt-3 text-sm">
            <span className="text-ink-500">Customer · </span>
            <span className="font-semibold">
              {receipt.customer.full_name ?? receipt.customer.phone ?? 'unnamed'}
            </span>
          </div>
        )}

        <div className="mt-4 space-y-1 rounded-xl bg-paper-dim/60 p-3 text-left text-sm">
          <Row label="Total" value={fmt(receipt.total)} />
          <div className="border-t border-ink-300/60 pt-1">
            {receipt.tenders.map((t, i) => (
              <Row key={i} label={TENDER_LABELS[t.tender]} value={fmt(t.amount)} />
            ))}
          </div>
          {receipt.change > 0 && <Row label="Change" value={fmt(receipt.change)} bold />}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <Link
            href={`/sales/${receipt.sale_id}`}
            className="rounded-xl border border-ink-300 bg-paper px-4 py-3 text-sm font-bold text-ink-900 transition hover:border-ink-700"
          >
            Receipt
          </Link>
          <button
            onClick={onClose}
            className="rounded-xl bg-prime-700 px-4 py-3 text-sm font-black text-paper transition hover:bg-prime-800"
          >
            New sale
          </button>
        </div>
      </div>
    </div>
  )
}
