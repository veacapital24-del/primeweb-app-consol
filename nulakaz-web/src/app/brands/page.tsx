import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BRANDS, BRAND_TINTS, type Brand } from "@/lib/brands";

export const metadata: Metadata = {
  title: "Brands",
  description:
    "The brand partners on the NuLakaz shelves — pantry, drinks, fresh produce. Curated for Mauritius.",
};

export default function BrandsPage() {
  return (
    <>
      {/* Editorial breadcrumb strip — same pattern as /cart, /checkout, /product */}
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
            Brands
          </li>
        </ol>
      </nav>

      {/* Editorial header */}
      <section className="mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24 py-8 md:py-10">
        <header className="max-w-3xl">
          <span className="inline-flex items-center gap-2 text-foreground-muted text-[11px] font-semibold uppercase tracking-[0.32em]">
            <span className="w-9 h-px bg-brand/40" />
            On our shelves
          </span>
          <h1 className="mt-2 font-fraunces text-foreground text-[28px] xs:text-[32px] sm:text-[40px] md:text-[52px] leading-[0.95] tracking-tight font-semibold">
            The makers we{" "}
            <em className="italic font-light text-brand">trust</em>
            <span className="text-brand">.</span>
          </h1>
          <p className="mt-3 text-foreground/75 text-base leading-relaxed">
            A short, deliberate roster of grocery partners — local family
            farms, certified-organic producers, and a few imports we&rsquo;ve
            sourced ourselves.{" "}
            <span className="font-fraunces italic text-foreground/85">
              No private labels, no fillers.
            </span>
          </p>

          {/* Mini summary chips */}
          <ul className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-foreground/75">
            <SummaryChip
              label={`${BRANDS.length} partner brands`}
              tint="#5e7f54"
            />
            <SummaryChip label="3 continents" tint="#82445a" />
            <SummaryChip
              label="Restocked weekly · all imported flat-rate"
              tint="#3a6f93"
            />
          </ul>
        </header>
      </section>

      {/* Brand grid — tight 4-up, no gradient backdrop, single tagline */}
      <section className="mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24">
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {BRANDS.map((b, i) => (
            <BrandCard key={b.slug} brand={b} index={i} />
          ))}
        </ul>
      </section>

      {/* Closing caption strip */}
      <section className="mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24 mt-10 mb-16">
        <div className="flex flex-wrap items-baseline justify-between gap-3 text-[11px] tracking-[0.32em] uppercase text-foreground-muted">
          <span className="font-semibold">
            Sourced for Mauritius · Vetted on the shelf
          </span>
          <Link
            href="/contacts"
            className="font-fraunces italic text-sm tracking-normal text-brand hover:text-brand-dark transition-colors normal-case"
          >
            Suggest a brand &nbsp;→
          </Link>
        </div>
      </section>
    </>
  );
}

function BrandCard({ brand, index }: { brand: Brand; index: number }) {
  const t = BRAND_TINTS[brand.tint];
  const numeral = String(index + 1).padStart(2, "0");
  const href = brand.categorySlug ? `/category/${brand.categorySlug}` : "/shop";

  return (
    <li id={brand.slug} className="scroll-mt-24">
      <Link
        href={href}
        aria-label={`${brand.name} — ${brand.tagline}`}
        className="group relative block bg-white rounded-[20px] overflow-hidden ring-1 ring-border hover:ring-brand/30 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-25px_rgba(92,51,66,0.4)] transition-all duration-300"
      >
        {/* Top accent stripe — single solid colour, no gradient. */}
        <span
          aria-hidden
          className="block h-0.5 w-full"
          style={{ backgroundColor: t.fg }}
        />

        {/* Logo plinth — pure white, no tinted backdrop. */}
        <div className="relative h-24 flex items-center justify-center bg-white">
          {/* Editorial numeral */}
          <span
            aria-hidden
            className="absolute top-2.5 left-3 font-fraunces italic text-[10.5px] tracking-[0.22em] text-foreground-muted"
          >
            <span className="text-foreground/40">N°</span>
            {numeral}
          </span>

          {/* Logo */}
          <span className="relative w-28 h-12 transition-transform duration-500 ease-out group-hover:scale-[1.05]">
            <Image
              src={brand.logo}
              alt={brand.name}
              fill
              sizes="112px"
              className="object-contain"
            />
          </span>
        </div>

        {/* Soft hairline separator between logo and info */}
        <span aria-hidden className="block h-px bg-border/60" />

        {/* Body — tight, single-line tagline only. */}
        <div className="p-4">
          <h2 className="font-fraunces font-semibold text-foreground text-[15px] leading-tight line-clamp-1">
            {brand.name}
          </h2>
          <p className="mt-0.5 text-[11px] text-foreground-muted line-clamp-1">
            {brand.origin}
          </p>
          <p
            className="mt-2 font-fraunces italic text-[12.5px] leading-snug line-clamp-2"
            style={{ color: t.fg }}
          >
            {brand.tagline}
          </p>
        </div>
      </Link>
    </li>
  );
}

function SummaryChip({ label, tint }: { label: string; tint: string }) {
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
