import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { BRAND_TINTS } from "@/lib/brands";

export const metadata: Metadata = {
  title: "Contact us",
  description: `Get in touch with NuLakaz. Address: ${site.contact.address}.`,
};

const REACH_OUT = [
  {
    label: "Phone the shop",
    value: site.contact.phone,
    href: `tel:${site.contact.phone.replace(/\s/g, "")}`,
    helper: "Best for urgent delivery questions",
    tint: BRAND_TINTS.sage,
    iconPath: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z",
  },
  {
    label: "Customer support",
    value: site.contact.supportPhone,
    href: `tel:${site.contact.supportPhone.replace(/\s/g, "")}`,
    helper: "Order status, returns, refunds",
    tint: BRAND_TINTS.ocean,
    iconPath: "M3 7l9 6 9-6M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z",
  },
  {
    label: "Drop us a line",
    value: site.contact.email,
    href: `mailto:${site.contact.email}`,
    helper: "We reply within one working day",
    tint: BRAND_TINTS["dusty-pink"],
    iconPath: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2Zm0 4 8 5 8-5",
  },
] as const;

function isOpenNow() {
  // Mon-Fri, 10:00-18:00 Mauritius time (UTC+4). Render server-side.
  const nowUtc = new Date();
  const muHour = (nowUtc.getUTCHours() + 4) % 24;
  const muDay = (nowUtc.getUTCDay() + (nowUtc.getUTCHours() + 4 >= 24 ? 1 : 0)) % 7;
  const isWeekday = muDay >= 1 && muDay <= 5;
  return isWeekday && muHour >= 10 && muHour < 18;
}

export default function ContactsPage() {
  const open = isOpenNow();
  const sage = BRAND_TINTS.sage;
  const stone = BRAND_TINTS.stone;

  return (
    <>
      {/* Editorial breadcrumb strip */}
      <nav aria-label="Breadcrumb" className="bg-white border-b border-border">
        <ol className="mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24 py-4 flex flex-wrap items-center gap-2 text-[11.5px] uppercase tracking-[0.22em] text-foreground-muted font-semibold">
          <li>
            <Link href="/" className="hover:text-brand transition-colors">
              Home
            </Link>
          </li>
          <li aria-hidden className="text-foreground-muted/40 select-none">
            /
          </li>
          <li className="font-fraunces italic normal-case tracking-normal text-[14px] text-brand">
            Say hello
          </li>
        </ol>
      </nav>

      {/* Editorial header */}
      <section className="mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24 py-8 md:py-10">
        <header className="max-w-3xl">
          <span className="inline-flex items-center gap-2 text-foreground-muted text-[11px] font-semibold uppercase tracking-[0.32em]">
            <span className="w-9 h-px bg-brand/40" />
            Reach the team
          </span>
          <h1 className="mt-2 font-fraunces text-foreground text-[36px] md:text-[52px] leading-[0.95] tracking-tight font-semibold">
            Get in{" "}
            <em className="italic font-light text-brand">touch</em>
            <span className="text-brand">.</span>
          </h1>
          <p className="mt-3 text-foreground/75 text-base leading-relaxed">
            Questions about an order, a missing item, a brand you&rsquo;d like
            us to stock — we read every message.{" "}
            <span className="font-fraunces italic text-foreground/85">
              Most replies inside one working day.
            </span>
          </p>

          {/* Open / closed live status */}
          <div className="mt-5 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11.5px] font-semibold uppercase tracking-[0.22em]"
            style={{
              backgroundColor: open ? `${sage.fg}14` : `${stone.fg}14`,
              color: open ? sage.fg : stone.fg,
            }}
          >
            <span
              aria-hidden
              className={`w-2 h-2 rounded-full ${open ? "animate-pulse" : ""}`}
              style={{ backgroundColor: open ? sage.fg : stone.fg }}
            />
            {open ? "We’re open right now" : "Closed — back at 10:00"}
            <span className="text-foreground-muted/60 font-normal normal-case tracking-normal">
              · {site.contact.hours}
            </span>
          </div>
        </header>
      </section>

      {/* Body grid */}
      <section className="mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24 pb-14 md:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-6 lg:gap-10 items-start">
          {/* Left: reach + find */}
          <div className="flex flex-col gap-6">
            {/* N°01 — Reach us */}
            <article className="bg-white rounded-[24px] ring-1 ring-border p-6 md:p-8">
              <Eyebrow numeral="01" label="Reach us directly" />
              <h2 className="mt-2 font-fraunces text-foreground text-[24px] md:text-[28px] leading-tight font-semibold">
                Three ways to{" "}
                <em className="italic font-light text-brand">talk</em>
                <span className="text-brand">.</span>
              </h2>
              <ul className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {REACH_OUT.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="group flex flex-col h-full bg-white rounded-[18px] ring-1 ring-border p-4 hover:ring-brand/30 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_-22px_rgba(92,51,66,0.4)] transition-all duration-300"
                    >
                      <span
                        aria-hidden
                        className="inline-flex items-center justify-center w-10 h-10 rounded-xl"
                        style={{
                          backgroundColor: `${item.tint.fg}14`,
                          color: item.tint.fg,
                        }}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.85"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d={item.iconPath} />
                        </svg>
                      </span>
                      <span className="mt-3 text-[10.5px] uppercase tracking-[0.22em] font-semibold text-foreground-muted">
                        {item.label}
                      </span>
                      <span
                        className="mt-1 font-fraunces font-semibold text-[16px] leading-snug"
                        style={{ color: item.tint.fg }}
                      >
                        {item.value}
                      </span>
                      <span className="mt-1 text-[12px] text-foreground/65 leading-snug">
                        {item.helper}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </article>

            {/* N°02 — Find us */}
            <article className="bg-white rounded-[24px] ring-1 ring-border overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_1.1fr]">
                <div className="p-6 md:p-8">
                  <Eyebrow numeral="02" label="Find the shop" />
                  <h2 className="mt-2 font-fraunces text-foreground text-[24px] md:text-[28px] leading-tight font-semibold">
                    Riche{" "}
                    <em className="italic font-light text-brand">Terre</em>
                    <span className="text-brand">.</span>
                  </h2>
                  <p className="mt-3 text-[14px] text-foreground/75 leading-relaxed">
                    {site.contact.address}
                  </p>
                  <dl className="mt-5 space-y-3 text-[13px]">
                    <Row
                      label="Hours"
                      value={site.contact.hours}
                      tint={BRAND_TINTS.mustard.fg}
                    />
                    <Row
                      label="Saturday"
                      value="By appointment only"
                      tint={BRAND_TINTS.terracotta.fg}
                    />
                  </dl>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=222+Royal+Road+Riche+Terre+Mauritius"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex items-center gap-2 font-fraunces italic text-[14px] text-brand hover:gap-3 transition-[gap]"
                  >
                    Open in Maps <span aria-hidden>→</span>
                  </a>
                </div>
                {/* Decorative location plinth — no real map render to keep
                    the page server-only. The grid pattern reads as "place"
                    without the cost of a third-party tile load. */}
                <div
                  className="relative min-h-[220px] sm:min-h-full bg-brand-soft/30 overflow-hidden"
                  aria-hidden
                >
                  <span
                    className="absolute inset-0"
                    style={{
                      backgroundImage:
                        "linear-gradient(rgba(183,90,116,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(183,90,116,0.08) 1px, transparent 1px)",
                      backgroundSize: "28px 28px",
                    }}
                  />
                  <span
                    className="absolute inset-x-0 top-1/2 h-px"
                    style={{ backgroundColor: "rgba(183,90,116,0.18)" }}
                  />
                  <span
                    className="absolute inset-y-0 left-1/2 w-px"
                    style={{ backgroundColor: "rgba(183,90,116,0.18)" }}
                  />
                  {/* Pin */}
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
                    <span className="block w-10 h-10 rounded-full bg-brand text-white shadow-lg ring-4 ring-white flex items-center justify-center">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 22s7-7.58 7-13a7 7 0 1 0-14 0c0 5.42 7 13 7 13Z" />
                        <circle cx="12" cy="9" r="2.5" />
                      </svg>
                    </span>
                  </span>
                  {/* Pin shadow */}
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 w-6 h-1.5 rounded-full bg-foreground/15 blur-sm" />
                  {/* Stamped sticker */}
                  <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur ring-1 ring-brand/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-brand">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                    Mauritius
                  </span>
                </div>
              </div>
            </article>
          </div>

          {/* Right: form (sticky on desktop) */}
          <aside className="lg:sticky lg:top-24 self-start">
            <article className="bg-white rounded-[24px] ring-1 ring-border p-6 md:p-8">
              <Eyebrow numeral="03" label="Send a message" />
              <h2 className="mt-2 font-fraunces text-foreground text-[24px] md:text-[28px] leading-tight font-semibold">
                Write to{" "}
                <em className="italic font-light text-brand">us</em>
                <span className="text-brand">.</span>
              </h2>
              <p className="mt-2 text-[13.5px] text-foreground/70">
                Fill in the form below and we&rsquo;ll come back the same day,
                or next morning at the latest.
              </p>

              <form
                action="/api/contact"
                method="post"
                className="mt-6 space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Your name" name="name" required />
                  <Field
                    label="Your email"
                    name="email"
                    type="email"
                    required
                  />
                </div>
                <Field label="Subject" name="subject" />
                <div>
                  <label
                    htmlFor="message"
                    className="flex items-center justify-between text-[11px] uppercase tracking-[0.22em] font-semibold text-foreground-muted mb-1.5"
                  >
                    <span>Your message</span>
                    <span className="text-foreground-muted/60 normal-case tracking-normal text-[11px]">
                      Markdown ok
                    </span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    placeholder="Tell us what you need…"
                    className="w-full bg-background border border-border rounded-2xl px-4 py-3 text-[14px] leading-relaxed placeholder:text-foreground-muted/50 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 transition-shadow resize-y"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                  <p className="text-[12px] text-foreground/60 inline-flex items-center gap-1.5">
                    <span
                      aria-hidden
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: sage.fg }}
                    />
                    By sending you agree to our{" "}
                    <Link
                      href="/privacy-policy"
                      className="text-brand hover:underline"
                    >
                      privacy policy
                    </Link>
                    .
                  </p>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 bg-brand text-white rounded-full h-11 px-6 text-[13px] font-semibold tracking-wide hover:bg-brand-dark transition-colors"
                  >
                    Send message
                    <span aria-hidden>→</span>
                  </button>
                </div>
              </form>
            </article>

            {/* Cross-link to FAQ */}
            <div className="mt-4 rounded-[20px] bg-brand-soft/30 ring-1 ring-brand/10 p-5 text-[13px] text-foreground/80 leading-relaxed">
              <p className="font-fraunces font-semibold text-foreground">
                Quick answer first?
              </p>
              <p className="mt-1">
                Most questions about delivery, returns and stock live on the
                FAQ.
              </p>
              <Link
                href="/faq"
                className="mt-2 inline-flex items-center gap-1.5 font-fraunces italic text-brand hover:gap-2 transition-[gap]"
              >
                Browse the FAQ <span aria-hidden>→</span>
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* Closing caption strip */}
      <section className="mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24 mb-16">
        <div className="flex flex-wrap items-baseline justify-between gap-3 text-[11px] tracking-[0.32em] uppercase text-foreground-muted">
          <span className="font-semibold">
            Replies inside one working day · Mon–Fri
          </span>
          <Link
            href="/order-tracking"
            className="font-fraunces italic text-sm tracking-normal text-brand hover:text-brand-dark transition-colors normal-case"
          >
            Track an order &nbsp;→
          </Link>
        </div>
      </section>
    </>
  );
}

function Eyebrow({ numeral, label }: { numeral: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-fraunces italic text-[12px] tracking-[0.22em] text-foreground-muted">
        <span className="text-foreground/40">N°</span>
        {numeral}
      </span>
      <span className="w-6 h-px bg-brand/40" />
      <span className="text-[11px] uppercase tracking-[0.32em] font-semibold text-foreground-muted">
        {label}
      </span>
    </div>
  );
}

function Row({
  label,
  value,
  tint,
}: {
  label: string;
  value: string;
  tint: string;
}) {
  return (
    <div className="flex items-baseline gap-3">
      <dt className="inline-flex items-center gap-2 min-w-[70px] text-[10.5px] uppercase tracking-[0.22em] font-semibold text-foreground-muted">
        <span
          aria-hidden
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: tint }}
        />
        {label}
      </dt>
      <dd className="text-foreground/80">{value}</dd>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="flex items-center justify-between text-[11px] uppercase tracking-[0.22em] font-semibold text-foreground-muted mb-1.5"
      >
        <span>{label}</span>
        {required && (
          <span className="text-brand-2 normal-case tracking-normal">
            Required
          </span>
        )}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="w-full bg-background border border-border rounded-full h-11 px-4 text-[14px] focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 transition-shadow"
      />
    </div>
  );
}
