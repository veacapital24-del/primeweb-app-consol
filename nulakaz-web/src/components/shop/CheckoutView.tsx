"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { clearCart } from "@/lib/cart-store";
import { useCart } from "@/lib/use-cart";
import { formatPrice } from "@/lib/format";
import { site } from "@/lib/site";
import { SESSION_KEY, type DemoSession } from "@/lib/demo-auth";
import { ADDRESS_EVENT, getDeliveryAddress } from "@/lib/address-store";
import { placeOrder } from "@/app/checkout/actions";
import type { WcProduct } from "@/types/wp";

// Checkout — left column: delivery + payment form, right column: sticky
// order summary. Editorial header matches /cart. No real backend yet:
// "Place order" runs a 600 ms simulated submit, generates a friendly order
// number, clears the cart, and shows a confirmation panel inline.

type Step = "review" | "placing" | "placed";

type PaymentMethod = "cash" | "card" | "mcb-juice";

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  district: string;
  notes: string;
  deliveryDate: string;
  payment: PaymentMethod;
};

const DEFAULT_FORM: FormState = {
  fullName: "",
  email: "",
  phone: "",
  street: "",
  city: "",
  district: "",
  notes: "",
  deliveryDate: "",
  payment: "cash",
};

function nextWeekday(d: Date): Date {
  const next = new Date(d);
  next.setDate(d.getDate() + 1);
  // Skip Saturday (6) and Sunday (0) — delivery is Mon–Fri only.
  if (next.getDay() === 6) next.setDate(next.getDate() + 2);
  if (next.getDay() === 0) next.setDate(next.getDate() + 1);
  return next;
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function CheckoutView({ products }: { products: WcProduct[] }) {
  const cart = useCart();
  const byId = useMemo(
    () => new Map(products.map((p) => [p.id, p] as const)),
    [products],
  );

  const items = cart
    .map((c) => {
      const p = byId.get(c.id);
      return p ? { product: p, qty: c.qty } : null;
    })
    .filter((x): x is { product: WcProduct; qty: number } => Boolean(x));

  const minorUnit = items[0]?.product.prices.currency_minor_unit ?? 2;
  const div = Math.pow(10, minorUnit);

  const subtotalMinor = items.reduce((sum, { product, qty }) => {
    const unit = product.on_sale
      ? Number(product.prices.sale_price)
      : Number(product.prices.price);
    return sum + unit * qty;
  }, 0);
  const freeOverMinor = site.delivery.freeOver * div;
  const shippingMinor =
    subtotalMinor === 0
      ? 0
      : subtotalMinor >= freeOverMinor
        ? 0
        : 150 * div;
  const totalMinor = subtotalMinor + shippingMinor;
  const totalQty = items.reduce((s, { qty }) => s + qty, 0);

  const [step, setStep] = useState<Step>("review");
  const [form, setForm] = useState<FormState>(() => ({
    ...DEFAULT_FORM,
    deliveryDate:
      typeof window === "undefined" ? "" : isoDate(nextWeekday(new Date())),
  }));
  const [orderNumber, setOrderNumber] = useState<string>("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  // The form ref lets the WhatsApp button (type="button") trigger native
  // HTML5 validation, and lets the error banner scroll into view when an
  // async submit fails server-side.
  const formRef = useRef<HTMLFormElement>(null);

  // Pre-fill the form from the demo session (name + email) and any saved
  // delivery address (phone + street + city + district + notes). We only
  // hydrate fields that are still empty, so the user's edits during the
  // session aren't clobbered if the address gets updated mid-checkout.
  useEffect(() => {
    const hydrate = () => {
      let displayName = "";
      let sessionEmail = "";
      try {
        const raw = window.localStorage.getItem(SESSION_KEY);
        if (raw) {
          const sess = JSON.parse(raw) as Partial<DemoSession>;
          displayName = sess.displayName ?? "";
          sessionEmail = sess.email ?? "";
        }
      } catch {
        // Corrupt session — leave defaults.
      }

      const addr = getDeliveryAddress();

      setForm((f) => ({
        ...f,
        fullName: f.fullName || addr?.fullName || displayName,
        email: f.email || sessionEmail,
        phone: f.phone || addr?.phone || "",
        street: f.street || addr?.street || "",
        city: f.city || addr?.village || "",
        district: f.district || addr?.district || "",
        notes: f.notes || addr?.notes || "",
      }));
    };

    hydrate();
    // Re-hydrate if the saved address changes in another tab / on the
    // /my-account/addresses screen while checkout is open.
    window.addEventListener(ADDRESS_EVENT, hydrate);
    return () => window.removeEventListener(ADDRESS_EVENT, hydrate);
  }, []);

  function update<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function buildWhatsAppUrl(orderNumber: string): string {
    const summary = items
      .map(({ product, qty }) => {
        const unit = product.on_sale
          ? Number(product.prices.sale_price)
          : Number(product.prices.price);
        const lineMinor = unit * qty;
        return `• ${qty}× ${product.name} — ${formatPrice(lineMinor.toString(), minorUnit)}`;
      })
      .join("\n");
    const total = formatPrice(totalMinor.toString(), minorUnit);
    const lines: string[] = [
      `Hi NuLakaz, I'd like to confirm order ${orderNumber}.`,
      "",
      summary,
      "",
      `Total: ${total}`,
    ];
    if (form.deliveryDate) lines.push(`Delivery: ${form.deliveryDate}`);
    if (form.street)
      lines.push(
        `Address: ${[form.street, form.city, form.district].filter(Boolean).join(", ")}`,
      );
    if (form.payment) lines.push(`Payment preference: ${form.payment}`);
    const phoneDigits = site.contact.phone.replace(/[^0-9]/g, "");
    return `https://wa.me/${phoneDigits}?text=${encodeURIComponent(lines.join("\n"))}`;
  }

  async function submitTo(
    channel: "web" | "whatsapp",
    // For the WhatsApp path, the click handler pre-opens an `about:blank`
    // tab inside the user gesture frame so the browser's popup blocker
    // doesn't kill it after the awaited server action. We then redirect
    // that tab once the order saves (or close it if the action fails).
    waTab?: Window | null,
  ) {
    if (items.length === 0) {
      if (waTab && !waTab.closed) waTab.close();
      return;
    }
    setSubmitError(null);
    setStep("placing");

    // Persist the storefront order to Supabase via a server action. Pricing
    // is recomputed server-side from the products table — we only send the
    // slug + qty per line so the client can't influence line prices.
    const result = await placeOrder({
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      street: form.street,
      city: form.city,
      district: form.district,
      notes: form.notes,
      deliveryDate: form.deliveryDate,
      payment: form.payment,
      channel,
      lines: items.map(({ product, qty }) => ({
        slug: product.slug,
        qty,
      })),
    });

    if (!result.ok) {
      setSubmitError(result.error);
      setStep("review");
      if (waTab && !waTab.closed) waTab.close();
      // Surface the banner if it scrolled below the fold.
      if (typeof window !== "undefined") {
        window.requestAnimationFrame(() =>
          formRef.current
            ?.querySelector('[role="alert"]')
            ?.scrollIntoView({ behavior: "smooth", block: "center" }),
        );
      }
      return;
    }

    if (channel === "whatsapp") {
      const url = buildWhatsAppUrl(result.orderNumber);
      if (waTab && !waTab.closed) {
        // Redirect the pre-opened tab — this works after the await because
        // we already own the window handle.
        waTab.location.href = url;
      } else {
        // Fallback if the pre-open failed (or the user closed it). Some
        // browsers may still block this; we keep going so the user sees
        // the confirmation panel either way.
        window.open(url, "_blank", "noopener,noreferrer");
      }
    }

    setOrderNumber(result.orderNumber);
    clearCart();
    setStep("placed");
    // Scroll to top so the confirmation panel is in view.
    if (typeof window !== "undefined")
      window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void submitTo("web");
  }

  function handleWhatsApp() {
    // The WhatsApp button is type="button", so HTML5 `required` doesn't
    // auto-fire on click. Run validation manually first.
    if (formRef.current && !formRef.current.checkValidity()) {
      formRef.current.reportValidity();
      return;
    }
    // Pre-open the chat tab synchronously inside this user gesture so the
    // popup blocker doesn't kill it after the server action awaits. We
    // navigate it to wa.me once the order saves.
    const waTab =
      typeof window !== "undefined"
        ? window.open("about:blank", "_blank")
        : null;
    void submitTo("whatsapp", waTab);
  }

  // ─── Confirmation state ──────────────────────────────────────────────────
  if (step === "placed") {
    return <Confirmation orderNumber={orderNumber} email={form.email} />;
  }

  // ─── Empty cart ──────────────────────────────────────────────────────────
  if (items.length === 0 && step === "review") {
    return <EmptyCart />;
  }

  return (
    <>
      {/* Editorial header — matches /cart */}
      <header className="mb-8 md:mb-10">
        <span className="inline-flex items-center gap-2 text-foreground-muted text-[11px] font-semibold uppercase tracking-[0.32em]">
          <span className="w-9 h-px bg-brand/40" />
          Checkout
        </span>
        <h1 className="mt-2 font-fraunces text-foreground text-[28px] xs:text-[32px] sm:text-[40px] md:text-[52px] leading-[0.95] tracking-tight font-semibold">
          Almost{" "}
          <em className="italic font-light text-brand">home</em>
          <span className="text-brand">.</span>
        </h1>
        <p className="mt-2 text-sm text-foreground/70">
          Confirm where to drop the box and we&rsquo;ll bring it on your chosen
          date.{" "}
          <span className="font-semibold text-foreground tabular-nums">
            {totalQty}
          </span>{" "}
          {totalQty === 1 ? "item" : "items"} ·{" "}
          <span className="font-fraunces font-semibold text-foreground tabular-nums">
            {formatPrice(totalMinor.toString(), minorUnit)}
          </span>
        </p>
      </header>

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-[1fr_320px] lg:grid-cols-[1fr_400px] gap-4 md:gap-6 lg:gap-8"
      >
        {/* Form column */}
        <div className="space-y-4">
          <Section
            number="01"
            title="Contact"
            whisper="So we can reach you about the order"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field
                id="fullName"
                label="Full name"
                value={form.fullName}
                onChange={(v) => update("fullName", v)}
                required
                autoComplete="name"
              />
              <Field
                id="phone"
                label="Phone"
                placeholder="+230 5xxx xxxx"
                value={form.phone}
                onChange={(v) => update("phone", v)}
                required
                type="tel"
                autoComplete="tel"
              />
              <div className="md:col-span-2">
                <Field
                  id="email"
                  label="Email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(v) => update("email", v)}
                  required
                  type="email"
                  autoComplete="email"
                />
              </div>
            </div>
          </Section>

          <Section
            number="02"
            title="Delivery address"
            whisper="Anywhere in Mauritius — we drive Mon to Fri"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <Field
                  id="street"
                  label="Street + house no."
                  value={form.street}
                  onChange={(v) => update("street", v)}
                  required
                  autoComplete="street-address"
                />
              </div>
              <Field
                id="city"
                label="City / village"
                value={form.city}
                onChange={(v) => update("city", v)}
                required
                autoComplete="address-level2"
              />
              <Field
                id="district"
                label="District"
                placeholder="e.g. Pamplemousses"
                value={form.district}
                onChange={(v) => update("district", v)}
                required
                autoComplete="address-level1"
              />
              <div className="md:col-span-2">
                <Field
                  id="notes"
                  label="Delivery notes (optional)"
                  placeholder="Gate code, landmark, leave with neighbour…"
                  value={form.notes}
                  onChange={(v) => update("notes", v)}
                />
              </div>
              <div className="md:col-span-2">
                <Field
                  id="deliveryDate"
                  label="Preferred delivery date"
                  value={form.deliveryDate}
                  onChange={(v) => update("deliveryDate", v)}
                  type="date"
                  required
                />
              </div>
            </div>
          </Section>

          <Section
            number="03"
            title="Payment"
            whisper="Pay how you like — card, cash, or MCB Juice"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
              <PaymentChoice
                id="cash"
                label="Cash on delivery"
                hint="Pay the rider"
                tint="#5e7f54"
                tintBg="#dde7c5"
                checked={form.payment === "cash"}
                onChoose={() => update("payment", "cash")}
                icon={
                  <>
                    <rect x="3" y="6" width="18" height="12" rx="2" />
                    <circle cx="12" cy="12" r="3" />
                    <line x1="6" y1="9" x2="6.01" y2="9" />
                  </>
                }
              />
              <PaymentChoice
                id="card"
                label="Card"
                hint="Visa / MasterCard"
                tint="#82445a"
                tintBg="#e7d3da"
                checked={form.payment === "card"}
                onChoose={() => update("payment", "card")}
                icon={
                  <>
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                  </>
                }
              />
              <PaymentChoice
                id="mcb-juice"
                label="MCB Juice"
                hint="Quick QR pay"
                tint="#3a6f93"
                tintBg="#cfdfeb"
                checked={form.payment === "mcb-juice"}
                onChoose={() => update("payment", "mcb-juice")}
                icon={
                  <>
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                    <line x1="14" y1="14" x2="21" y2="14" />
                    <line x1="14" y1="18" x2="21" y2="18" />
                    <line x1="14" y1="21" x2="21" y2="21" />
                  </>
                }
              />
            </div>
          </Section>

          {/* Server-side error banner — visible at the bottom of the form
              column on every breakpoint so the user sees it without
              hunting near the sticky sidebar. */}
          {submitError && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-2xl border border-[#a85a44]/30 bg-[#f1d9d4]/60 px-4 py-3 text-[13px] text-[#7a3026]"
            >
              <span
                aria-hidden
                className="mt-1 block w-1.5 h-1.5 shrink-0 rounded-full bg-[#a85a44]"
              />
              <span>
                <span className="font-semibold">
                  We couldn&rsquo;t place this order.
                </span>{" "}
                {submitError}
              </span>
            </div>
          )}

          {/* Submit (mobile only — sidebar has the desktop / tablet CTA) */}
          <div className="md:hidden flex flex-col gap-2.5">
            <button
              type="submit"
              disabled={step === "placing"}
              className="w-full inline-flex items-center justify-center gap-2 bg-brand text-white rounded-full h-12 font-semibold tracking-wide hover:bg-brand-dark transition-colors disabled:opacity-60 disabled:cursor-progress active:scale-[0.99] shadow-[0_10px_24px_-12px_rgba(183,90,116,0.6)]"
            >
              {step === "placing" ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Placing your order…
                </>
              ) : (
                <>
                  Place order &nbsp;·&nbsp; {formatPrice(totalMinor.toString(), minorUnit)}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="13 5 20 12 13 19" />
                  </svg>
                </>
              )}
            </button>

            {/* "Or finish on WhatsApp" — saves the order with channel
                'whatsapp' and pops the shop's chat with a pre-filled
                message so the customer can confirm in one tap. */}
            <button
              type="button"
              onClick={handleWhatsApp}
              disabled={step === "placing"}
              className="w-full inline-flex items-center justify-center gap-2 bg-white border border-[#5e7f54]/35 text-[#3f6828] rounded-full h-11 text-[13px] font-semibold tracking-wide hover:bg-[#dde7c5]/40 hover:border-[#5e7f54]/55 transition-colors disabled:opacity-60 active:scale-[0.99]"
            >
              <WhatsAppIcon />
              Confirm via WhatsApp instead
            </button>
            <p className="text-[11px] text-foreground-muted text-center">
              Same order, but you finish with the shop on chat.
            </p>
          </div>
        </div>

        {/* Order summary column */}
        <aside className="lg:sticky lg:top-24 h-fit space-y-4">
          <div className="bg-white rounded-2xl ring-1 ring-border overflow-hidden">
            <header className="px-5 pt-5 pb-3 border-b border-dashed border-foreground/15">
              <span className="block text-[11px] font-semibold uppercase tracking-[0.32em] text-foreground-muted">
                Your order
              </span>
              <h2 className="font-fraunces text-foreground text-[20px] leading-tight font-semibold mt-1">
                <span className="tabular-nums">{totalQty}</span>{" "}
                <em className="italic font-light text-brand">
                  {totalQty === 1 ? "item" : "items"}
                </em>
              </h2>
            </header>

            {/* Compact line items list */}
            <ul className="px-5 py-3 space-y-3 max-h-[320px] overflow-y-auto">
              {items.map(({ product: p, qty }) => {
                const unit = p.on_sale
                  ? Number(p.prices.sale_price)
                  : Number(p.prices.price);
                const lineMinor = unit * qty;
                const img = p.images?.[0];
                return (
                  <li key={p.id} className="flex items-start gap-3">
                    <div className="relative w-12 h-12 shrink-0 rounded-xl bg-brand-soft/30 ring-1 ring-border overflow-hidden">
                      {img && (
                        <Image
                          src={img.src}
                          alt={img.alt || p.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      )}
                      <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 inline-flex items-center justify-center rounded-full bg-brand text-white text-[9.5px] font-bold tabular-nums leading-none ring-2 ring-white">
                        {qty}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-fraunces text-foreground text-[13px] leading-snug font-semibold line-clamp-2">
                        {p.name}
                      </p>
                      <p className="text-[11px] text-foreground-muted">
                        <span className="font-fraunces italic">
                          {formatPrice(unit, minorUnit)}
                        </span>{" "}
                        each
                      </p>
                    </div>
                    <span className="font-fraunces font-semibold text-foreground text-[13px] tabular-nums shrink-0">
                      {formatPrice(lineMinor, minorUnit)}
                    </span>
                  </li>
                );
              })}
            </ul>

            <div className="border-t border-dashed border-foreground/15 px-5 py-4 space-y-2 text-[13px]">
              <Row
                label="Subtotal"
                value={formatPrice(subtotalMinor, minorUnit)}
              />
              <Row
                label="Delivery"
                value={
                  shippingMinor === 0
                    ? "Free"
                    : formatPrice(shippingMinor, minorUnit)
                }
                tint={shippingMinor === 0 ? "#5e7f54" : undefined}
              />
            </div>

            <div className="bg-brand-soft/30 px-5 py-4 flex items-baseline justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground-muted">
                Total
              </span>
              <span className="font-fraunces font-semibold text-foreground text-[24px] tabular-nums">
                {formatPrice(totalMinor.toString(), minorUnit)}
              </span>
            </div>
          </div>

          {/* Desktop / tablet submit — engages at md+ to match the sidebar
              column. Mobile uses the in-form button above. */}
          <div className="hidden md:flex flex-col gap-2.5">
            <button
              type="submit"
              disabled={step === "placing"}
              className="w-full inline-flex items-center justify-center gap-2 bg-brand text-white rounded-full h-12 font-semibold tracking-wide hover:bg-brand-dark transition-colors disabled:opacity-60 disabled:cursor-progress active:scale-[0.99] shadow-[0_10px_24px_-12px_rgba(183,90,116,0.6)]"
            >
              {step === "placing" ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Placing your order…
                </>
              ) : (
                <>
                  Place order
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="13 5 20 12 13 19" />
                  </svg>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleWhatsApp}
              disabled={step === "placing"}
              className="w-full inline-flex items-center justify-center gap-2 bg-white border border-[#5e7f54]/35 text-[#3f6828] rounded-full h-11 text-[13px] font-semibold tracking-wide hover:bg-[#dde7c5]/40 hover:border-[#5e7f54]/55 transition-colors disabled:opacity-60 active:scale-[0.99]"
            >
              <WhatsAppIcon />
              Confirm via WhatsApp instead
            </button>
            <p className="text-[11px] text-foreground-muted text-center">
              Same order — finish on chat with the shop.
            </p>
          </div>

          {/* Mini trust strip */}
          <ul className="grid grid-cols-3 gap-2 text-[11.5px] text-foreground/70">
            <TrustCue
              label="Next-day"
              tint="#dde7c5"
              tintFg="#5e7f54"
              icon={
                <>
                  <path d="M3 6.5h11v9.5H3z" />
                  <path d="M14 9.5h4l3 3v3.5h-7" />
                  <circle cx="7" cy="17" r="2" />
                  <circle cx="17" cy="17" r="2" />
                </>
              }
            />
            <TrustCue
              label="Secure"
              tint="#f5e7c4"
              tintFg="#a98937"
              icon={
                <>
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </>
              }
            />
            <TrustCue
              label="Returns"
              tint="#e7d3da"
              tintFg="#82445a"
              icon={
                <>
                  <path d="M3 12a9 9 0 0 1 15.5-6.3L21 8" />
                  <polyline points="21 3 21 8 16 8" />
                  <path d="M21 12a9 9 0 0 1-15.5 6.3L3 16" />
                  <polyline points="3 21 3 16 8 16" />
                </>
              }
            />
          </ul>

          <p className="text-[11px] text-foreground-muted text-center leading-relaxed">
            By placing this order you agree to our{" "}
            <Link href="/terms-and-conditions" className="text-brand hover:underline">
              terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy-policy" className="text-brand hover:underline">
              privacy policy
            </Link>
            .
          </p>
        </aside>
      </form>
    </>
  );
}

function Section({
  number,
  title,
  whisper,
  children,
}: {
  number: string;
  title: string;
  whisper: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-2xl ring-1 ring-border p-5 sm:p-6">
      <header className="flex items-baseline gap-3 mb-4">
        <span className="font-fraunces italic text-foreground-muted text-[12px] tracking-[0.22em] shrink-0">
          <span className="text-foreground/45">N°</span>
          {number}
        </span>
        <div className="min-w-0">
          <h2 className="font-fraunces font-semibold text-foreground text-[18px] leading-tight">
            {title}
          </h2>
          <p className="font-fraunces italic text-foreground-muted text-[12px] leading-snug">
            {whisper}
          </p>
        </div>
      </header>
      {children}
    </section>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground-muted mb-1.5">
        {label}
        {required && <span className="text-brand ml-1">*</span>}
      </span>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full bg-background rounded-xl ring-1 ring-border px-4 h-11 text-[14px] text-foreground placeholder:text-foreground-muted/60 outline-none focus:ring-brand/45 focus:bg-white focus:ring-2 transition-all"
      />
    </label>
  );
}

function PaymentChoice({
  id,
  label,
  hint,
  tint,
  tintBg,
  checked,
  onChoose,
  icon,
}: {
  id: string;
  label: string;
  hint: string;
  tint: string;
  tintBg: string;
  checked: boolean;
  onChoose: () => void;
  icon: React.ReactNode;
}) {
  return (
    <label
      htmlFor={`payment-${id}`}
      className={[
        "relative cursor-pointer flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-200",
        checked
          ? "bg-brand-soft/40 ring-2 ring-brand"
          : "bg-white ring-1 ring-border hover:ring-brand/30",
      ].join(" ")}
    >
      <input
        id={`payment-${id}`}
        type="radio"
        name="payment"
        value={id}
        checked={checked}
        onChange={onChoose}
        className="sr-only"
      />
      <span
        className="inline-flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
        style={{ backgroundColor: tintBg }}
        aria-hidden
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke={tint}
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {icon}
        </svg>
      </span>
      <span className="flex-1 min-w-0">
        <span className="block font-fraunces font-semibold text-foreground text-[14px] leading-tight">
          {label}
        </span>
        <span className="block font-fraunces italic text-foreground-muted text-[11.5px]">
          {hint}
        </span>
      </span>
      <span
        aria-hidden
        className={[
          "shrink-0 w-5 h-5 rounded-full ring-2 transition-all",
          checked
            ? "bg-brand ring-brand"
            : "bg-white ring-border",
        ].join(" ")}
      >
        {checked && (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="text-white" aria-hidden>
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </span>
    </label>
  );
}

function Row({
  label,
  value,
  tint,
}: {
  label: string;
  value: string;
  tint?: string;
}) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-foreground/70">{label}</span>
      <span
        className="font-fraunces font-semibold text-foreground tabular-nums"
        style={tint ? { color: tint } : undefined}
      >
        {value}
      </span>
    </div>
  );
}

function WhatsAppIcon() {
  // Solid WhatsApp glyph in currentColor — picks up the sage tint of the
  // surrounding button. Single path keeps the bundle small.
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M20.5 3.5A11 11 0 0 0 3.5 17.6L2 22l4.6-1.45A11 11 0 1 0 20.5 3.5ZM12 20a8 8 0 0 1-4-1.1l-.3-.16-2.7.85.86-2.65-.18-.32A8 8 0 1 1 12 20Zm4.4-5.9c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12s-.62.78-.76.94-.28.18-.52.06a6.6 6.6 0 0 1-1.94-1.2 7.3 7.3 0 0 1-1.34-1.66c-.14-.24 0-.36.1-.48.1-.1.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16 0-.3-.04-.42l-.74-1.78c-.2-.48-.4-.42-.54-.42h-.46a.9.9 0 0 0-.66.3 2.7 2.7 0 0 0-.84 2c0 1.18.86 2.32.98 2.48.12.16 1.7 2.6 4.1 3.64a13 13 0 0 0 1.36.5 3.3 3.3 0 0 0 1.5.1 2.5 2.5 0 0 0 1.62-1.14 2 2 0 0 0 .14-1.14c-.06-.1-.22-.16-.46-.28Z" />
    </svg>
  );
}

function TrustCue({
  label,
  tint,
  tintFg,
  icon,
}: {
  label: string;
  tint: string;
  tintFg: string;
  icon: React.ReactNode;
}) {
  return (
    <li className="flex flex-col items-center gap-1.5 text-center">
      <span
        className="inline-flex items-center justify-center w-9 h-9 rounded-xl"
        style={{ backgroundColor: tint }}
        aria-hidden
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={tintFg} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          {icon}
        </svg>
      </span>
      <span className="font-medium text-foreground/80 leading-tight">
        {label}
      </span>
    </li>
  );
}

function Confirmation({
  orderNumber,
  email,
}: {
  orderNumber: string;
  email: string;
}) {
  return (
    <>
      <header className="mb-8 md:mb-10">
        <span className="inline-flex items-center gap-2 text-foreground-muted text-[11px] font-semibold uppercase tracking-[0.32em]">
          <span className="w-9 h-px bg-brand/40" />
          Order placed
        </span>
        <h1 className="mt-2 font-fraunces text-foreground text-[36px] md:text-[52px] leading-[0.95] tracking-tight font-semibold">
          You&rsquo;re{" "}
          <em className="italic font-light text-brand">sorted</em>
          <span className="text-brand">.</span>
        </h1>
        <p className="mt-2 text-sm text-foreground/70">
          We&rsquo;ll WhatsApp you when the rider is on the way.
        </p>
      </header>

      <div className="bg-white rounded-2xl ring-1 ring-border p-7 md:p-9 max-w-2xl">
        <div className="flex items-start gap-4">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#dde7c5] text-[#5e7f54] shrink-0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
          <div className="min-w-0">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-foreground-muted">
              Order number
            </p>
            <p className="font-fraunces text-foreground text-[28px] font-semibold leading-tight tabular-nums">
              {orderNumber}
            </p>
            {email && (
              <p className="mt-2 text-[13px] text-foreground/75">
                A confirmation is on its way to{" "}
                <span className="font-fraunces italic text-foreground">
                  {email}
                </span>
                .
              </p>
            )}
          </div>
        </div>

        <hr className="my-6 border-dashed border-foreground/15" />

        <ul className="space-y-3 text-[14px] text-foreground/80">
          <NextStep
            n="1"
            label="We pack it fresh"
            body="Our team picks the order from the shelf the morning of delivery."
          />
          <NextStep
            n="2"
            label="WhatsApp on the way"
            body="You&rsquo;ll get a message when the rider leaves the warehouse."
          />
          <NextStep
            n="3"
            label="Doorstep drop"
            body="Pay if cash on delivery, or relax if you&rsquo;ve already paid."
          />
        </ul>

        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-brand text-white rounded-full h-11 px-6 text-sm font-semibold tracking-wide hover:bg-brand-dark transition-colors"
          >
            Keep shopping
          </Link>
          <Link
            href="/my-account/orders"
            className="inline-flex items-center gap-2 bg-white text-brand ring-1 ring-brand/30 rounded-full h-11 px-6 text-sm font-semibold tracking-wide hover:bg-brand hover:text-white transition-colors"
          >
            Track this order
          </Link>
        </div>
      </div>
    </>
  );
}

function NextStep({
  n,
  label,
  body,
}: {
  n: string;
  label: string;
  body: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="inline-flex items-center justify-center w-7 h-7 shrink-0 rounded-full bg-brand-soft/60 text-brand font-fraunces font-semibold text-[12.5px]">
        {n}
      </span>
      <div className="min-w-0">
        <p className="font-fraunces font-semibold text-foreground text-[14.5px]">
          {label}
        </p>
        <p className="text-[13px] text-foreground/70 leading-snug">{body}</p>
      </div>
    </li>
  );
}

function EmptyCart() {
  return (
    <>
      <header className="mb-8 md:mb-10">
        <span className="inline-flex items-center gap-2 text-foreground-muted text-[11px] font-semibold uppercase tracking-[0.32em]">
          <span className="w-9 h-px bg-brand/40" />
          Checkout
        </span>
        <h1 className="mt-2 font-fraunces text-foreground text-[36px] md:text-[52px] leading-[0.95] tracking-tight font-semibold">
          Nothing to{" "}
          <em className="italic font-light text-brand">check out</em>
          <span className="text-brand">.</span>
        </h1>
        <p className="mt-2 text-sm text-foreground/70">
          Your trolley is empty — add a few items first.
        </p>
      </header>

      <div className="bg-white rounded-2xl ring-1 ring-border p-12 text-center max-w-2xl">
        <span className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-soft/60 text-brand mb-5">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="9" cy="20" r="1.2" />
            <circle cx="19" cy="20" r="1.2" />
            <path d="M2 3h3l2.4 11.5a2 2 0 0 0 2 1.5h7.6a2 2 0 0 0 2-1.5L21 7H6" />
          </svg>
        </span>
        <h2 className="font-fraunces text-foreground text-2xl font-semibold mb-1">
          Empty trolley.
        </h2>
        <p className="text-sm text-foreground/70 mb-6 max-w-sm mx-auto">
          Browse the shelves, fill your trolley, then come back to lock in
          delivery.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-brand text-white rounded-full h-11 px-6 text-sm font-semibold tracking-wide hover:bg-brand-dark transition-colors"
          >
            Browse the shop
          </Link>
          <Link
            href="/monthly-essentials"
            className="inline-flex items-center gap-2 bg-white text-brand ring-1 ring-brand/30 rounded-full h-11 px-6 text-sm font-semibold tracking-wide hover:bg-brand hover:text-white transition-colors"
          >
            Try a Monthly Box
          </Link>
        </div>
      </div>
    </>
  );
}
