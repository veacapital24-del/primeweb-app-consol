import Link from "next/link";
import { notFound } from "next/navigation";
import { getPages } from "@/lib/data";
import { stripHtml } from "@/lib/format";
import { BRAND_TINTS, type BrandTint } from "@/lib/brands";
import { POLICY_CONTENT } from "@/lib/policies-content";

export type PolicyKey =
  | "faq"
  | "shipping-policy"
  | "refund-policy"
  | "privacy-policy"
  | "terms-and-conditions";

// Left-sidebar tabbed shell for the policy & help pages. Same UX pattern as
// /my-account — keeps all 5 policies reachable from one nav without reloading
// the mental context. Each page.tsx under /app passes its active key; content
// is pulled from the WP page matching that slug.
const NAV: Array<{
  key: PolicyKey;
  label: string;
  short: string;
  tint: BrandTint;
}> = [
  { key: "faq", label: "FAQ", short: "Common questions", tint: "sage" },
  {
    key: "shipping-policy",
    label: "Shipping policy",
    short: "Delivery & cut-offs",
    tint: "ocean",
  },
  {
    key: "refund-policy",
    label: "Refund policy",
    short: "Returns & refunds",
    tint: "mustard",
  },
  {
    key: "privacy-policy",
    label: "Privacy policy",
    short: "Data & cookies",
    tint: "dusty-pink",
  },
  {
    key: "terms-and-conditions",
    label: "Terms & conditions",
    short: "The agreement",
    tint: "stone",
  },
];

const HEADLINES: Record<
  PolicyKey,
  { eyebrow: string; lead: string; accent: string; subtitle: string }
> = {
  faq: {
    eyebrow: "Help & policies",
    lead: "Frequently",
    accent: "asked",
    subtitle:
      "The questions our customers ask most — about ordering, delivery windows, returns, and the small print.",
  },
  "shipping-policy": {
    eyebrow: "Help & policies",
    lead: "Shipping",
    accent: "policy",
    subtitle:
      "How we deliver across Mauritius — cut-offs, fees, free-delivery thresholds, and what to expect on the day.",
  },
  "refund-policy": {
    eyebrow: "Help & policies",
    lead: "Refund",
    accent: "policy",
    subtitle:
      "If something arrives short, damaged, or simply not right — here’s how we put it back in order.",
  },
  "privacy-policy": {
    eyebrow: "Help & policies",
    lead: "Privacy",
    accent: "policy",
    subtitle:
      "What we collect, why we keep it, and how to ask us to forget — written without legalese where we can.",
  },
  "terms-and-conditions": {
    eyebrow: "Help & policies",
    lead: "Terms &",
    accent: "conditions",
    subtitle:
      "The agreement that sits behind every order — clear, fair, and the same for every customer.",
  },
};

// Static "last revised" — we don't store this on the WP page object, so a
// hand-maintained map keeps it accurate without surfacing a synthetic date.
const REVISED_AT: Record<PolicyKey, string> = {
  faq: "2026-04-12",
  "shipping-policy": "2026-04-12",
  "refund-policy": "2026-03-22",
  "privacy-policy": "2026-02-08",
  "terms-and-conditions": "2026-02-08",
};

function formatRevised(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function PoliciesShell({ active }: { active: PolicyKey }) {
  const pages = getPages();
  const page = pages.find((p) => p.slug === active);
  if (!page) notFound();

  const title = stripHtml(page.title.rendered);
  // Prefer curated copy over the WP-imported pages.json — the original
  // import shipped mismatched / placeholder bodies (FAQ was Lorem ipsum;
  // shipping/refund/privacy/terms shared an identical marketing blurb).
  const curated = POLICY_CONTENT[active]?.trim();
  const renderedHtml = curated ?? page.content?.rendered ?? "";
  const hasContent = !!renderedHtml.trim();
  const head = HEADLINES[active];
  const activeIndex = NAV.findIndex((n) => n.key === active);
  const prevNav = activeIndex > 0 ? NAV[activeIndex - 1] : null;
  const nextNav = activeIndex < NAV.length - 1 ? NAV[activeIndex + 1] : null;
  const activeTint = BRAND_TINTS[NAV[activeIndex].tint];

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
          <li>
            <span className="text-foreground-muted">Help &amp; policies</span>
          </li>
          <li aria-hidden className="text-foreground-muted/40 select-none">
            /
          </li>
          <li className="font-fraunces italic normal-case tracking-normal text-[14px] text-brand">
            {title}
          </li>
        </ol>
      </nav>

      {/* Editorial header */}
      <section className="mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24 py-8 md:py-10">
        <header className="max-w-3xl">
          <span className="inline-flex items-center gap-2 text-foreground-muted text-[11px] font-semibold uppercase tracking-[0.32em]">
            <span className="w-9 h-px bg-brand/40" />
            {head.eyebrow}
          </span>
          <h1 className="mt-2 font-fraunces text-foreground text-[36px] md:text-[52px] leading-[0.95] tracking-tight font-semibold">
            {head.lead}{" "}
            <em className="italic font-light text-brand">{head.accent}</em>
            <span className="text-brand">.</span>
          </h1>
          <p className="mt-3 text-foreground/75 text-base leading-relaxed">
            {head.subtitle}
          </p>

          {/* Meta strip — last revised + section count */}
          <ul className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-foreground/75">
            <li className="inline-flex items-center gap-2">
              <span
                aria-hidden
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: activeTint.fg }}
              />
              <span className="font-medium">
                Last revised {formatRevised(REVISED_AT[active])}
              </span>
            </li>
            <li className="inline-flex items-center gap-2">
              <span
                aria-hidden
                className="w-1.5 h-1.5 rounded-full bg-[#82445a]"
              />
              <span className="font-medium">
                Section {String(activeIndex + 1).padStart(2, "0")} of{" "}
                {String(NAV.length).padStart(2, "0")}
              </span>
            </li>
          </ul>
        </header>
      </section>

      {/* Body */}
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24 pb-12 md:pb-16">
        <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
          {/* Numbered tab rail */}
          <aside className="w-full md:w-72 shrink-0">
            <nav className="bg-white rounded-[20px] ring-1 ring-border p-2 md:sticky md:top-24">
              <div className="flex items-center gap-2 px-3 pt-2 pb-2">
                <span className="font-fraunces italic text-[11px] tracking-[0.22em] text-foreground-muted">
                  <span className="text-foreground/40">N°</span>00
                </span>
                <span className="w-5 h-px bg-brand/40" />
                <span className="text-[10.5px] uppercase tracking-[0.32em] font-semibold text-foreground-muted">
                  Help & policies
                </span>
              </div>
              <ul className="mt-1 space-y-0.5">
                {NAV.map((item, i) => {
                  const isActive = item.key === active;
                  const t = BRAND_TINTS[item.tint];
                  const numeral = String(i + 1).padStart(2, "0");
                  return (
                    <li key={item.key}>
                      <Link
                        href={`/${item.key}`}
                        aria-current={isActive ? "page" : undefined}
                        className={[
                          "relative flex items-start gap-3 rounded-2xl px-3 py-3 text-sm transition-colors",
                          isActive
                            ? "bg-background"
                            : "hover:bg-background/70",
                        ].join(" ")}
                        style={
                          isActive
                            ? { boxShadow: `inset 3px 0 0 ${t.fg}` }
                            : undefined
                        }
                      >
                        <span
                          aria-hidden
                          className="font-fraunces italic text-[11px] tracking-[0.22em] mt-0.5"
                          style={{
                            color: isActive ? t.fg : "var(--foreground-muted)",
                          }}
                        >
                          <span className="opacity-60">N°</span>
                          {numeral}
                        </span>
                        <span className="flex-1 min-w-0">
                          <span
                            className={[
                              "block font-semibold leading-snug truncate",
                              isActive
                                ? ""
                                : "text-foreground/85 group-hover:text-brand",
                            ].join(" ")}
                            style={isActive ? { color: t.fg } : undefined}
                          >
                            {item.label}
                          </span>
                          <span className="block text-[11.5px] text-foreground-muted leading-snug truncate">
                            {item.short}
                          </span>
                        </span>
                        <span
                          aria-hidden
                          className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                          style={{
                            backgroundColor: isActive ? t.fg : "transparent",
                            outline: isActive
                              ? "none"
                              : `1px solid ${t.fg}40`,
                          }}
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Help card — slimmer, italic Fraunces stamp */}
            <div className="hidden md:block mt-4 rounded-[20px] bg-brand-soft/30 ring-1 ring-brand/10 p-5 text-[13px] text-foreground/80 leading-relaxed">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-brand">
                <span className="w-1 h-1 rounded-full bg-brand" />
                Need a hand?
              </span>
              <p className="mt-3 font-fraunces italic text-[15px] text-foreground/85 leading-snug">
                If the answer isn&rsquo;t on this page, write to us — we keep
                replies short and human.
              </p>
              <Link
                href="/contacts"
                className="mt-3 inline-flex items-center gap-1.5 font-fraunces italic text-brand hover:gap-2 transition-[gap]"
              >
                Contact us <span aria-hidden>→</span>
              </Link>
            </div>
          </aside>

          {/* Content pane */}
          <div className="flex-1 min-w-0">
            <article className="relative bg-white rounded-[24px] ring-1 ring-border overflow-hidden">
              {/* Top accent stripe matching the active policy's tint */}
              <span
                aria-hidden
                className="block h-0.5 w-full"
                style={{ backgroundColor: activeTint.fg }}
              />

              {/* Inner head — section numeral + revision date */}
              <div className="px-6 sm:px-8 md:px-10 pt-7 md:pt-9 pb-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] font-semibold text-foreground-muted">
                    <span className="font-fraunces italic text-[13px] tracking-[0.22em]">
                      <span className="text-foreground/40">N°</span>
                      {String(activeIndex + 1).padStart(2, "0")}
                    </span>
                    <span className="w-5 h-px bg-brand/40" />
                    <span>{NAV[activeIndex].short}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] uppercase tracking-[0.22em] font-semibold"
                    style={{
                      backgroundColor: `${activeTint.fg}14`,
                      color: activeTint.fg,
                    }}
                  >
                    <span
                      aria-hidden
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: activeTint.fg }}
                    />
                    Revised {formatRevised(REVISED_AT[active])}
                  </span>
                </div>
                <h2 className="mt-3 font-fraunces text-foreground text-[22px] md:text-[26px] leading-tight font-semibold">
                  {title}
                </h2>
              </div>

              <span aria-hidden className="block h-px bg-border/60 mx-6 sm:mx-8 md:mx-10" />

              <div className="px-6 sm:px-8 md:px-10 py-7 md:py-9">
                {hasContent ? (
                  <div
                    className="policy-prose prose prose-sm md:prose-base max-w-none text-foreground leading-relaxed
                               prose-headings:font-fraunces prose-headings:text-foreground prose-headings:font-semibold
                               prose-h2:text-[20px] prose-h3:text-[17px] prose-h2:mt-8 prose-h2:mb-3
                               prose-a:text-brand prose-a:no-underline hover:prose-a:underline
                               prose-strong:text-foreground
                               prose-li:marker:text-brand"
                    dangerouslySetInnerHTML={{ __html: renderedHtml }}
                  />
                ) : (
                  <p className="text-foreground/60 text-sm">
                    This policy is being finalized — check back soon.
                  </p>
                )}
              </div>
            </article>

            {/* Cross-policy footer nav */}
            {(prevNav || nextNav) && (
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {prevNav ? (
                  <Link
                    href={`/${prevNav.key}`}
                    className="group flex items-center gap-3 rounded-[16px] bg-white ring-1 ring-border px-4 py-3.5 hover:ring-brand/30 transition-all"
                  >
                    <span
                      aria-hidden
                      className="text-[11px] uppercase tracking-[0.22em] font-semibold text-foreground-muted group-hover:-translate-x-0.5 transition-transform"
                    >
                      ← Previous
                    </span>
                    <span className="ml-auto text-right">
                      <span className="block font-fraunces italic text-[14px] text-brand">
                        {prevNav.label}
                      </span>
                      <span className="block text-[11px] text-foreground-muted">
                        {prevNav.short}
                      </span>
                    </span>
                  </Link>
                ) : (
                  <span />
                )}
                {nextNav ? (
                  <Link
                    href={`/${nextNav.key}`}
                    className="group flex items-center gap-3 rounded-[16px] bg-white ring-1 ring-border px-4 py-3.5 hover:ring-brand/30 transition-all"
                  >
                    <span className="text-left">
                      <span className="block font-fraunces italic text-[14px] text-brand">
                        {nextNav.label}
                      </span>
                      <span className="block text-[11px] text-foreground-muted">
                        {nextNav.short}
                      </span>
                    </span>
                    <span
                      aria-hidden
                      className="ml-auto text-[11px] uppercase tracking-[0.22em] font-semibold text-foreground-muted group-hover:translate-x-0.5 transition-transform"
                    >
                      Next →
                    </span>
                  </Link>
                ) : (
                  <span />
                )}
              </div>
            )}

            {/* Mobile-only help card */}
            <div className="md:hidden mt-4 rounded-[20px] bg-brand-soft/30 ring-1 ring-brand/10 p-5 text-[13px] text-foreground/80 leading-relaxed">
              <p className="font-fraunces italic text-[15px] text-foreground/85">
                Still stuck? Write to us — replies are short and human.
              </p>
              <Link
                href="/contacts"
                className="mt-2 inline-flex items-center gap-1.5 font-fraunces italic text-brand"
              >
                Contact us <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Closing caption strip */}
      <section className="mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24 mb-16">
        <div className="flex flex-wrap items-baseline justify-between gap-3 text-[11px] tracking-[0.32em] uppercase text-foreground-muted">
          <span className="font-semibold">
            Plain-language policies · No hidden small print
          </span>
          <Link
            href="/contacts"
            className="font-fraunces italic text-sm tracking-normal text-brand hover:text-brand-dark transition-colors normal-case"
          >
            Ask a question &nbsp;→
          </Link>
        </div>
      </section>
    </>
  );
}
