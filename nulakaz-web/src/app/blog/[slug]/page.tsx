import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPosts } from "@/lib/data";
import { BLOG_THUMBNAILS, pickPostMeta, splitTitleAccent } from "@/lib/blog";
import { BRAND_TINTS } from "@/lib/brands";
import { stripHtml } from "@/lib/format";
import type { WpPost } from "@/types/wp";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPosts().find((p) => p.slug === slug);
  if (!post) return { title: "Article" };
  return {
    title: stripHtml(post.title.rendered),
    description: stripHtml(post.excerpt.rendered).slice(0, 160),
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const all = getPosts();
  const post = all.find((p) => p.slug === slug);
  if (!post) notFound();

  const idx = all.findIndex((p) => p.slug === slug);
  const prev = idx > 0 ? all[idx - 1] : null;
  const next = idx < all.length - 1 ? all[idx + 1] : null;
  const related = all.filter((p) => p.id !== post.id).slice(0, 3);

  const thumb = BLOG_THUMBNAILS[post.slug];
  const title = stripHtml(post.title.rendered);
  const { lead, accent } = splitTitleAccent(title);
  const meta = pickPostMeta(post.slug, idx);
  const tint = BRAND_TINTS[meta.tint];

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
            <Link
              href="/blog"
              className="hover:text-brand transition-colors"
            >
              Notebook
            </Link>
          </li>
          <li aria-hidden className="text-foreground-muted/40 select-none">
            /
          </li>
          <li
            className="font-fraunces italic normal-case tracking-normal text-[14px] text-brand truncate max-w-[60vw]"
            title={title}
          >
            {title}
          </li>
        </ol>
      </nav>

      {/* Editorial header */}
      <section className="mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24 py-8 md:py-12">
        <header className="max-w-3xl">
          {/* Topic eyebrow */}
          <span
            className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.32em]"
            style={{ color: tint.fg }}
          >
            <span
              aria-hidden
              className="w-9 h-px"
              style={{ backgroundColor: tint.fg }}
            />
            {meta.topic}
          </span>

          <h1 className="mt-2 font-fraunces text-foreground text-[32px] md:text-[48px] lg:text-[56px] leading-[1.02] tracking-tight font-semibold">
            {lead && <>{lead} </>}
            <em className="italic font-light text-brand">{accent}</em>
            <span className="text-brand">.</span>
          </h1>

          <p className="mt-4 text-foreground/75 text-[16px] md:text-[17px] leading-relaxed font-fraunces italic max-w-2xl">
            {stripHtml(post.excerpt.rendered)}
          </p>

          {/* Byline + meta */}
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-foreground/75">
            <span className="inline-flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-brand text-white font-fraunces italic text-[13px]">
                N
              </span>
              <span className="font-medium">
                The{" "}
                <span className="font-fraunces italic">NuLakaz</span> editors
              </span>
            </span>
            <span className="text-foreground-muted/40">·</span>
            <span className="inline-flex items-center gap-2">
              <span
                aria-hidden
                className="w-1.5 h-1.5 rounded-full bg-[#5e7f54]"
              />
              {formatDate(post.date)}
            </span>
            <span className="text-foreground-muted/40">·</span>
            <span className="inline-flex items-center gap-2">
              <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-[#82445a]" />
              {meta.minutes} min read
            </span>
          </div>
        </header>
      </section>

      {/* Hero image */}
      {thumb && (
        <section className="mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24 mb-10 md:mb-14">
          <figure className="relative rounded-[24px] overflow-hidden ring-1 ring-border bg-brand-soft/40">
            {/* Tint accent stripe */}
            <span
              aria-hidden
              className="absolute top-0 left-0 right-0 h-0.5 z-10"
              style={{ backgroundColor: tint.fg }}
            />
            <div className="relative aspect-[16/9] md:aspect-[21/9]">
              <Image
                src={thumb}
                alt={title}
                fill
                sizes="(max-width: 1024px) 100vw, 1280px"
                className="object-cover"
              />
              {/* Topic stamp overlay */}
              <span
                aria-hidden
                className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 ring-1 ring-brand/15 backdrop-blur px-3 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.28em]"
                style={{ color: tint.fg }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: tint.fg }}
                />
                {meta.topic}
              </span>
            </div>
            <figcaption className="px-5 md:px-7 py-3.5 flex items-center justify-between text-[11px] uppercase tracking-[0.22em] font-semibold text-foreground-muted bg-white">
              <span>From the kitchen · {formatDate(post.date)}</span>
              <span className="font-fraunces italic normal-case tracking-normal text-[12px] text-foreground/60">
                Featured photograph
              </span>
            </figcaption>
          </figure>
        </section>
      )}

      {/* Article + sidebar */}
      <section className="mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-10 lg:gap-14">
          {/* Article */}
          <article className="max-w-2xl">
            {/* Lead numeral + section line */}
            <div className="flex items-center gap-3 mb-5">
              <span className="font-fraunces italic text-[12px] tracking-[0.22em] text-foreground-muted">
                <span className="text-foreground/40">N°</span>
                {String(idx + 1).padStart(2, "0")}
              </span>
              <span className="w-6 h-px bg-brand/40" />
              <span className="text-[11px] uppercase tracking-[0.32em] font-semibold text-foreground-muted">
                The story
              </span>
            </div>

            <div
              className="blog-prose prose prose-sm md:prose-base max-w-none text-foreground leading-relaxed
                         prose-headings:font-fraunces prose-headings:text-foreground prose-headings:font-semibold
                         prose-h2:text-[22px] md:prose-h2:text-[26px] prose-h2:mt-10 prose-h2:mb-3
                         prose-h3:text-[18px] prose-h3:mt-7
                         prose-p:text-[15.5px] md:prose-p:text-[16px] prose-p:leading-[1.75]
                         prose-a:text-brand prose-a:no-underline hover:prose-a:underline
                         prose-strong:text-foreground
                         prose-li:marker:text-brand"
              dangerouslySetInnerHTML={{ __html: post.content.rendered }}
            />

            {/* End-of-article rule + signature */}
            <div className="mt-12 pt-6 border-t border-border/60 flex items-center justify-between flex-wrap gap-3">
              <span className="font-fraunces italic text-foreground/60 text-[14px]">
                — The NuLakaz editors
              </span>
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.22em] font-semibold text-foreground-muted hover:text-brand transition-colors"
              >
                <span aria-hidden>←</span>
                Back to the notebook
              </Link>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 self-start space-y-4">
            {/* Quick read card */}
            <div className="bg-white rounded-[20px] ring-1 ring-border overflow-hidden">
              <span
                aria-hidden
                className="block h-0.5 w-full"
                style={{ backgroundColor: tint.fg }}
              />
              <div className="p-5">
                <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.32em] font-semibold text-foreground-muted">
                  <span className="font-fraunces italic text-[12px]">
                    <span className="text-foreground/40">N°</span>
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="w-5 h-px bg-brand/40" />
                  In short
                </span>
                <dl className="mt-4 space-y-3 text-[13.5px]">
                  <Row label="Topic" tint={tint.fg} value={meta.topic} />
                  <Row
                    label="Read time"
                    tint="#82445a"
                    value={`${meta.minutes} min`}
                  />
                  <Row
                    label="Published"
                    tint="#3a6f93"
                    value={formatDate(post.date)}
                  />
                </dl>
              </div>
            </div>

            {/* Share row — server-rendered native share links (no client JS) */}
            <div className="bg-white rounded-[20px] ring-1 ring-border p-5">
              <span className="text-[11px] uppercase tracking-[0.32em] font-semibold text-foreground-muted">
                Share
              </span>
              <div className="mt-3 flex items-center gap-2">
                <ShareLink
                  href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`I thought you'd like this — https://nulakaz.com/blog/${post.slug}`)}`}
                  label="Email"
                  iconPath="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2Zm0 4 8 5 8-5"
                />
                <ShareLink
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} — https://nulakaz.com/blog/${post.slug}`)}`}
                  label="WhatsApp"
                  external
                  iconPath="M20.5 3.5A11 11 0 0 0 3.5 17.6L2 22l4.6-1.45A11 11 0 1 0 20.5 3.5ZM12 20a8 8 0 0 1-4-1.1l-.3-.16-2.7.85.86-2.65-.18-.32A8 8 0 1 1 12 20Zm4.4-5.9c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12s-.62.78-.76.94-.28.18-.52.06a6.6 6.6 0 0 1-1.94-1.2 7.3 7.3 0 0 1-1.34-1.66c-.14-.24 0-.36.1-.48.1-.1.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16 0-.3-.04-.42l-.74-1.78c-.2-.48-.4-.42-.54-.42h-.46a.9.9 0 0 0-.66.3 2.7 2.7 0 0 0-.84 2c0 1.18.86 2.32.98 2.48.12.16 1.7 2.6 4.1 3.64a13 13 0 0 0 1.36.5 3.3 3.3 0 0 0 1.5.1 2.5 2.5 0 0 0 1.62-1.14 2 2 0 0 0 .14-1.14c-.06-.1-.22-.16-.46-.28Z"
                />
                <ShareLink
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${title} — https://nulakaz.com/blog/${post.slug}`)}`}
                  label="X / Twitter"
                  external
                  iconPath="M18.244 2H21l-6.52 7.45L22 22h-6.78l-4.74-6.21L4.8 22H2.04l6.97-7.97L2 2h6.92l4.28 5.66L18.24 2Zm-2.38 18h1.86L7.2 4H5.24l10.62 16Z"
                />
              </div>
            </div>

            {/* Shop CTA */}
            <div className="rounded-[20px] bg-brand-soft/30 ring-1 ring-brand/10 p-5">
              <span className="font-fraunces font-semibold text-foreground text-[15px]">
                Cooking from this story?
              </span>
              <p className="mt-1 text-[13px] text-foreground/70 leading-snug">
                Most ingredients are in stock today, with next-day delivery
                across Mauritius.
              </p>
              <Link
                href="/shop"
                className="mt-3 inline-flex items-center gap-1.5 font-fraunces italic text-brand hover:gap-2 transition-[gap]"
              >
                Browse the shelves <span aria-hidden>→</span>
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* Prev / next */}
      {(prev || next) && (
        <section className="mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24 mt-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {prev ? (
              <PrevNextCard post={prev} direction="prev" />
            ) : (
              <span />
            )}
            {next ? (
              <PrevNextCard post={next} direction="next" />
            ) : (
              <span />
            )}
          </div>
        </section>
      )}

      {/* Related */}
      {related.length > 0 && (
        <section className="mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24 mt-14">
          <div className="flex items-end justify-between mb-5">
            <span className="inline-flex items-center gap-2 text-foreground-muted text-[11px] font-semibold uppercase tracking-[0.32em]">
              <span className="w-9 h-px bg-brand/40" />
              Keep reading
            </span>
            <Link
              href="/blog"
              className="font-fraunces italic text-[13px] text-brand hover:text-brand-dark transition-colors"
            >
              All stories →
            </Link>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {related.map((p, i) => (
              <RelatedCard key={p.id} post={p} index={i + 1} />
            ))}
          </ul>
        </section>
      )}

      {/* Closing caption strip */}
      <section className="mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24 mt-14 mb-16">
        <div className="flex flex-wrap items-baseline justify-between gap-3 text-[11px] tracking-[0.32em] uppercase text-foreground-muted">
          <span className="font-semibold">
            Edited in Mauritius · Updated {formatDate(post.modified || post.date)}
          </span>
          <Link
            href="/contacts"
            className="font-fraunces italic text-sm tracking-normal text-brand hover:text-brand-dark transition-colors normal-case"
          >
            Suggest a topic &nbsp;→
          </Link>
        </div>
      </section>
    </>
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
      <dt className="inline-flex items-center gap-2 min-w-[80px] text-[10.5px] uppercase tracking-[0.22em] font-semibold text-foreground-muted">
        <span
          aria-hidden
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: tint }}
        />
        {label}
      </dt>
      <dd className="text-foreground/80 font-medium">{value}</dd>
    </div>
  );
}

function ShareLink({
  href,
  label,
  iconPath,
  external,
}: {
  href: string;
  label: string;
  iconPath: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      aria-label={`Share by ${label}`}
      title={`Share by ${label}`}
      {...(external
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
      className="inline-flex items-center justify-center w-10 h-10 rounded-xl ring-1 ring-border text-foreground/70 hover:ring-brand/30 hover:text-brand hover:-translate-y-0.5 transition-all"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={iconPath} />
      </svg>
    </a>
  );
}

function PrevNextCard({
  post,
  direction,
}: {
  post: WpPost;
  direction: "prev" | "next";
}) {
  const meta = pickPostMeta(post.slug);
  const t = BRAND_TINTS[meta.tint];
  const arrow = direction === "prev" ? "←" : "→";
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`group flex items-center gap-4 rounded-[18px] bg-white ring-1 ring-border p-4 hover:ring-brand/30 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_-22px_rgba(92,51,66,0.4)] transition-all ${direction === "next" ? "sm:text-right sm:flex-row-reverse" : ""}`}
    >
      <span
        aria-hidden
        className="inline-flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
        style={{ backgroundColor: `${t.fg}14`, color: t.fg }}
      >
        <span className="font-fraunces italic text-[18px]">{arrow}</span>
      </span>
      <span className="min-w-0">
        <span className="block text-[10.5px] uppercase tracking-[0.22em] font-semibold text-foreground-muted">
          {direction === "prev" ? "Previous story" : "Next story"}
        </span>
        <span className="block mt-0.5 font-fraunces text-foreground text-[15px] leading-snug font-semibold line-clamp-2 group-hover:text-brand transition-colors">
          {stripHtml(post.title.rendered)}
        </span>
      </span>
    </Link>
  );
}

function RelatedCard({ post, index }: { post: WpPost; index: number }) {
  const thumb = BLOG_THUMBNAILS[post.slug];
  const meta = pickPostMeta(post.slug, index);
  const t = BRAND_TINTS[meta.tint];
  const numeral = String(index).padStart(2, "0");
  return (
    <li>
      <Link
        href={`/blog/${post.slug}`}
        className="group flex flex-col h-full bg-white rounded-[20px] ring-1 ring-border overflow-hidden hover:ring-brand/30 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-25px_rgba(92,51,66,0.4)] transition-all duration-300"
      >
        <span
          aria-hidden
          className="block h-0.5 w-full"
          style={{ backgroundColor: t.fg }}
        />
        <div className="relative aspect-[16/10] bg-brand-soft/40 overflow-hidden">
          {thumb && (
            <Image
              src={thumb}
              alt={stripHtml(post.title.rendered)}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
            />
          )}
          <span
            aria-hidden
            className="absolute top-2.5 left-3 font-fraunces italic text-[10.5px] tracking-[0.22em] text-white/95 mix-blend-difference"
          >
            <span className="text-white/60">N°</span>
            {numeral}
          </span>
        </div>
        <div className="flex flex-col flex-1 p-5">
          <span
            className="inline-flex items-center gap-1.5 self-start rounded-full px-2 py-0.5 text-[10.5px] uppercase tracking-[0.22em] font-semibold"
            style={{ backgroundColor: `${t.fg}14`, color: t.fg }}
          >
            <span
              aria-hidden
              className="w-1 h-1 rounded-full"
              style={{ backgroundColor: t.fg }}
            />
            {meta.topic}
          </span>
          <h3 className="mt-2.5 font-fraunces text-foreground text-[17px] leading-snug font-semibold line-clamp-2 group-hover:text-brand transition-colors">
            {stripHtml(post.title.rendered)}
          </h3>
          <p className="mt-1.5 text-[12.5px] text-foreground-muted">
            {meta.minutes} min · {formatDate(post.date)}
          </p>
        </div>
      </Link>
    </li>
  );
}
