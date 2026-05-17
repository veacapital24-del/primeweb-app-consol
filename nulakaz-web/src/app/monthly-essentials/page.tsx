import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  MonthlyEssentialsPlanner,
  type HydratedTier,
} from "@/components/essentials/MonthlyEssentialsPlanner";
import { BUNDLES, bucketFor } from "@/lib/bundles";
import { getProducts } from "@/lib/data";

export const metadata: Metadata = {
  title: "Monthly Box — Pre-order your household basics",
  description:
    "Choose a pre-built monthly box — Essentials, Family or Household+ — customise it, and pre-order in one tap. Next-day delivery in Mauritius.",
};

export default async function MonthlyEssentialsPage() {
  const allProducts = await getProducts();
  const bySlug = new Map(allProducts.map((p) => [p.slug, p] as const));

  // Index the whole catalog by bucket so the planner can offer swap / add
  // candidates within the same category.
  const catalogByBucket: Record<string, typeof allProducts> = {};
  for (const p of allProducts) {
    if (!p.is_in_stock) continue;
    const bucket = bucketFor({
      categoryNames: p.categories.map((c) => c.name),
      slug: p.slug,
    });
    (catalogByBucket[bucket] ??= []).push(p);
  }

  // Hydrate each tier's slug list into real products, drop missing slugs.
  const tiers: HydratedTier[] = BUNDLES.map((b) => {
    const lines = b.items
      .map((it) => {
        const product = bySlug.get(it.slug);
        if (!product) return null;
        const bucket = bucketFor({
          categoryNames: product.categories.map((c) => c.name),
          slug: product.slug,
        });
        return { product, qty: it.qty, bucket };
      })
      .filter((x): x is NonNullable<typeof x> => Boolean(x));
    return {
      key: b.key,
      name: b.name,
      tagline: b.tagline,
      household: b.household,
      targetRs: b.targetRs,
      accent: b.accent,
      accentSoft: b.accentSoft,
      iconPath: b.iconPath,
      preview: b.preview,
      lines,
    };
  });

  return (
    <>
      {/* Editorial breadcrumb strip — matches /cart and /product pattern */}
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
            Monthly Box
          </li>
        </ol>
      </nav>

      {/* Editorial header — same pattern as /cart */}
      <section className="mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24 py-8 md:py-10">
        <header className="max-w-3xl">
          <span className="inline-flex items-center gap-2 text-foreground-muted text-[11px] font-semibold uppercase tracking-[0.32em]">
            <span className="w-9 h-px bg-brand/40" />
            Pre-built · Customisable
          </span>
          <h1 className="mt-2 font-fraunces text-foreground text-[28px] xs:text-[32px] sm:text-[40px] md:text-[52px] leading-[0.95] tracking-tight font-semibold">
            Your month,{" "}
            <em className="italic font-light text-brand">handled</em>
            <span className="text-brand">.</span>
          </h1>
          <p className="mt-3 text-foreground/75 text-base leading-relaxed">
            Pick a pre-built box sized for your household, tweak what&rsquo;s
            inside, and pre-order the whole month in one tap.{" "}
            <span className="font-fraunces italic text-foreground/85">
              Skip the trip, skip the planning.
            </span>
          </p>

          {/* 3-step rail — modernised pill row */}
          <ol className="mt-6 flex flex-wrap items-center gap-2">
            <Step n={1} label="Choose your box" />
            <Sep />
            <Step n={2} label="Review & customise" />
            <Sep />
            <Step n={3} label="Pre-order" />
          </ol>

          {/* Trust strip — micro promises */}
          <ul className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-foreground/70">
            <Promise label="Next-day delivery" tint="#5e7f54" />
            <Promise label="Free over Rs 1,000" tint="#82445a" />
            <Promise label="No subscription · pay-per-box" tint="#3a6f93" />
          </ul>
        </header>
      </section>

      {/* Planner — wrapped in Suspense for useSearchParams */}
      <Suspense fallback={<PlannerSkeleton />}>
        <MonthlyEssentialsPlanner
          tiers={tiers}
          catalogByBucket={catalogByBucket}
        />
      </Suspense>

      {/* How it works — editorial cards, N°01–N°03 numerals */}
      <section className="mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24 mt-16 md:mt-20">
        <header className="mb-8 md:mb-10">
          <span className="inline-flex items-center gap-2 text-foreground-muted text-[11px] font-semibold uppercase tracking-[0.32em]">
            <span className="w-9 h-px bg-brand/40" />
            How it works
          </span>
          <h2 className="mt-2 font-fraunces text-foreground text-[26px] xs:text-[28px] sm:text-[32px] md:text-[44px] leading-[1.02] tracking-tight font-semibold">
            Three taps,{" "}
            <em className="italic font-light text-brand">a month sorted</em>
            <span className="text-brand">.</span>
          </h2>
        </header>

        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          <HowCard
            index={1}
            title="Pick your box"
            whisper="Sized for your household"
            body="Choose Essentials, Family, or Household+ depending on how many mouths you’re feeding."
            tintBg="#dde7c5"
            tintFg="#5e7f54"
            icon={
              <>
                <path d="m12.89 1.45 8 4A2 2 0 0 1 22 7.24v9.53a2 2 0 0 1-1.11 1.79l-8 4a2 2 0 0 1-1.79 0l-8-4A2 2 0 0 1 2 16.76V7.24a2 2 0 0 1 1.11-1.79l8-4a2 2 0 0 1 1.78 0z" />
                <polyline points="2.32 6.16 12 11 21.68 6.16" />
                <line x1="12" y1="22.76" x2="12" y2="11" />
              </>
            }
          />
          <HowCard
            index={2}
            title="Customise"
            whisper="Toggle, swap, top-up"
            body="Everything is pre-selected. Turn off what you don’t need — the total updates live as you tweak."
            tintBg="#e7d3da"
            tintFg="#82445a"
            icon={
              <>
                <line x1="4" y1="21" x2="4" y2="14" />
                <line x1="4" y1="10" x2="4" y2="3" />
                <line x1="12" y1="21" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12" y2="3" />
                <line x1="20" y1="21" x2="20" y2="16" />
                <line x1="20" y1="12" x2="20" y2="3" />
                <line x1="1" y1="14" x2="7" y2="14" />
                <line x1="9" y1="8" x2="15" y2="8" />
                <line x1="17" y1="16" x2="23" y2="16" />
              </>
            }
          />
          <HowCard
            index={3}
            title="Pre-order"
            whisper="Pick a delivery date"
            body="Choose your delivery day at checkout. We pack it fresh and drop it at your door — next-day, weekdays."
            tintBg="#cfdfeb"
            tintFg="#3a6f93"
            icon={
              <>
                <path d="M3 6.5h11v9.5H3z" />
                <path d="M14 9.5h4l3 3v3.5h-7" />
                <circle cx="7" cy="17" r="2" />
                <circle cx="17" cy="17" r="2" />
              </>
            }
          />
        </ol>
      </section>

      {/* FAQ — editorial header + modern accordion */}
      <section className="mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24 mt-16 md:mt-20 mb-16">
        <header className="flex flex-wrap items-end justify-between gap-4 mb-6 md:mb-8">
          <div>
            <span className="inline-flex items-center gap-2 text-foreground-muted text-[11px] font-semibold uppercase tracking-[0.32em]">
              <span className="w-9 h-px bg-brand/40" />
              Questions, answered
            </span>
            <h2 className="mt-2 font-fraunces text-foreground text-[26px] xs:text-[28px] sm:text-[32px] md:text-[44px] leading-[1.02] tracking-tight font-semibold">
              The fine{" "}
              <em className="italic font-light text-brand">print</em>
              <span className="text-brand">.</span>
            </h2>
          </div>
          <Link
            href="/contacts"
            className="font-fraunces italic text-sm text-brand hover:text-brand-dark transition-colors"
          >
            Still stuck? Talk to us &nbsp;→
          </Link>
        </header>

        <div className="max-w-4xl bg-white rounded-2xl ring-1 ring-border overflow-hidden divide-y divide-border">
          <FaqItem
            q="Is the monthly box a subscription?"
            a="No. Every box is a one-off pre-order. If you want the same box next month, just re-order it — your last selection is saved."
          />
          <FaqItem
            q="Can I change what's inside the box?"
            a="Yes — every item has a toggle. Turn off anything you don’t want and the total updates immediately. You can also add more products from the regular shop."
          />
          <FaqItem
            q="When is my box delivered?"
            a="You pick a delivery date at checkout. Standard lead time is next-day (Mon–Fri, 10am–6pm). If a product isn’t in stock, we’ll reach out before packing."
          />
          <FaqItem
            q="Do the three boxes always cost the same?"
            a="The prices on each tier card are aspirational targets for a typical month. The live total you see while customising is the actual price — it updates as you toggle items on or off."
          />
          <FaqItem
            q="What if something is out of stock?"
            a="You'll see a greyed-out item with a note. We’ll propose a close substitute before packing or refund the difference."
          />
        </div>

        {/* Closing caption strip — same rhythm used elsewhere */}
        <div className="mt-8 flex flex-wrap items-baseline justify-between gap-3 text-[11px] tracking-[0.32em] uppercase text-foreground-muted">
          <span className="font-semibold">
            Built for Mauritius · Restocked weekly
          </span>
          <span className="font-fraunces italic text-sm tracking-normal text-foreground/70">
            One box, a whole month
          </span>
        </div>
      </section>
    </>
  );
}

function Step({ n, label }: { n: number; label: string }) {
  return (
    <li className="inline-flex items-center gap-2 bg-white ring-1 ring-border rounded-full h-9 pl-1 pr-4 text-[12.5px] font-semibold text-foreground">
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-brand text-white font-fraunces font-semibold text-[12px]">
        {n}
      </span>
      {label}
    </li>
  );
}

function Sep() {
  return (
    <li aria-hidden className="text-foreground-muted/60">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </li>
  );
}

function Promise({ label, tint }: { label: string; tint: string }) {
  return (
    <li className="inline-flex items-center gap-2">
      <span
        aria-hidden
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: tint }}
      />
      <span className="font-medium">{label}</span>
    </li>
  );
}

function HowCard({
  index,
  title,
  whisper,
  body,
  tintBg,
  tintFg,
  icon,
}: {
  index: number;
  title: string;
  whisper: string;
  body: string;
  tintBg: string;
  tintFg: string;
  icon: React.ReactNode;
}) {
  return (
    <li className="group relative bg-white rounded-2xl ring-1 ring-border p-6 md:p-7 hover:ring-brand/30 hover:-translate-y-1 hover:shadow-[0_18px_40px_-22px_rgba(92,51,66,0.4)] transition-all duration-500">
      <span className="absolute top-5 right-5 z-10 font-fraunces italic text-[12px] tracking-[0.22em] text-foreground-muted">
        <span className="text-foreground/45">N°</span>
        {String(index).padStart(2, "0")}
      </span>

      <span
        className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-5 transition-transform duration-500 group-hover:rotate-[-6deg] group-hover:scale-[1.05]"
        style={{
          backgroundColor: tintBg,
          border: `1px dashed ${tintFg}40`,
        }}
        aria-hidden
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke={tintFg}
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {icon}
        </svg>
      </span>

      <h3 className="font-fraunces font-semibold text-foreground text-[20px] leading-tight">
        {title}
      </h3>
      <p className="mt-1 font-fraunces italic text-foreground-muted text-[12.5px] tracking-wide">
        {whisper}
      </p>
      <p className="mt-3 text-[14px] text-foreground/75 leading-relaxed">
        {body}
      </p>
    </li>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex items-center justify-between cursor-pointer list-none px-5 sm:px-6 py-4.5 hover:bg-brand-soft/15 transition-colors">
        <span className="pr-4 font-fraunces font-semibold text-foreground text-[15.5px]">
          {q}
        </span>
        <span
          aria-hidden
          className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full bg-brand-soft/40 text-brand transition-all duration-300 group-open:bg-brand group-open:text-white group-open:rotate-180"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </summary>
      <div className="px-5 sm:px-6 pb-5 -mt-1 text-[14px] text-foreground/75 leading-relaxed">
        {a}
      </div>
    </details>
  );
}

function PlannerSkeleton() {
  return (
    <section className="mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-border h-[380px] animate-pulse"
          />
        ))}
      </div>
    </section>
  );
}
