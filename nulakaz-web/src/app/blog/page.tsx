import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getPosts } from "@/lib/data";
import { BLOG_THUMBNAILS, pickPostMeta } from "@/lib/blog";
import { BRAND_TINTS } from "@/lib/brands";
import { stripHtml } from "@/lib/format";
import type { WpPost } from "@/types/wp";

export const metadata: Metadata = {
  title: "Blog",
  description: "Recipes, sustainability tips, and stories from NuLakaz.",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogIndexPage() {
  const posts = getPosts();
  const [lead, ...rest] = posts;

  return (
    <>
      {/* Editorial breadcrumb strip — same pattern as /cart, /brands, /product */}
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
            Notebook
          </li>
        </ol>
      </nav>

      {/* Editorial header */}
      <section className="mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24 py-8 md:py-10">
        <header className="max-w-3xl">
          <span className="inline-flex items-center gap-2 text-foreground-muted text-[11px] font-semibold uppercase tracking-[0.32em]">
            <span className="w-9 h-px bg-brand/40" />
            From the kitchen
          </span>
          <h1 className="mt-2 font-fraunces text-foreground text-[36px] md:text-[52px] leading-[0.95] tracking-tight font-semibold">
            Notes &{" "}
            <em className="italic font-light text-brand">stories</em>
            <span className="text-brand">.</span>
          </h1>
          <p className="mt-3 text-foreground/75 text-base leading-relaxed">
            Seasonal recipes, sourcing notes from our partner farms, and the
            occasional opinion on what belongs on a Mauritian table.{" "}
            <span className="font-fraunces italic text-foreground/85">
              Read at your own pace.
            </span>
          </p>

          {/* Mini summary chips — same pattern as /brands */}
          <ul className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-foreground/75">
            <SummaryChip
              label={`${posts.length} ${posts.length === 1 ? "entry" : "entries"}`}
              tint="#5e7f54"
            />
            <SummaryChip label="Updated weekly" tint="#82445a" />
            <SummaryChip label="Recipes · sourcing · seasonal" tint="#3a6f93" />
          </ul>
        </header>
      </section>

      {/* Featured lead post */}
      {lead && (
        <section className="mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24 mb-10 md:mb-14">
          <FeaturedCard post={lead} />
        </section>
      )}

      {/* Grid of remaining posts */}
      {rest.length > 0 && (
        <section className="mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24">
          <div className="flex items-end justify-between mb-5">
            <span className="inline-flex items-center gap-2 text-foreground-muted text-[11px] font-semibold uppercase tracking-[0.32em]">
              <span className="w-9 h-px bg-brand/40" />
              More to read
            </span>
            <span className="font-fraunces italic text-[13px] text-foreground/60 hidden sm:inline">
              {rest.length} {rest.length === 1 ? "story" : "stories"}
            </span>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {rest.map((p, i) => (
              <PostCard key={p.id} post={p} index={i + 2} />
            ))}
          </ul>
        </section>
      )}

      {/* Closing caption strip */}
      <section className="mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24 mt-14 mb-16">
        <div className="rounded-[24px] bg-brand-soft/30 ring-1 ring-brand/10 px-6 py-7 md:px-10 md:py-9 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 text-foreground-muted text-[11px] font-semibold uppercase tracking-[0.32em]">
              <span className="w-9 h-px bg-brand/40" />
              Inbox
            </span>
            <h2 className="mt-2 font-fraunces text-foreground text-[24px] md:text-[28px] leading-tight font-semibold">
              Recipes, in your{" "}
              <em className="italic font-light text-brand">inbox</em>
              <span className="text-brand">.</span>
            </h2>
            <p className="mt-1.5 text-sm text-foreground/70">
              One short letter every other Friday. Seasonal picks, what&rsquo;s
              landed on the shelves, the occasional discount.
            </p>
          </div>
          <Link
            href="/#newsletter"
            className="inline-flex items-center gap-2 self-start md:self-auto bg-brand text-white rounded-full h-11 px-6 text-sm font-semibold tracking-wide hover:bg-brand-dark transition-colors"
          >
            Subscribe
            <span aria-hidden>→</span>
          </Link>
        </div>
      </section>
    </>
  );
}

function FeaturedCard({ post }: { post: WpPost }) {
  const thumb = BLOG_THUMBNAILS[post.slug];
  const { topic, tint, minutes } = pickPostMeta(post.slug, 0);
  const t = BRAND_TINTS[tint];

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block bg-white rounded-[24px] ring-1 ring-border overflow-hidden hover:ring-brand/30 hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-30px_rgba(92,51,66,0.35)] transition-all duration-300"
    >
      <div className="grid grid-cols-1 md:grid-cols-[1.15fr_1fr]">
        <div className="relative aspect-[16/10] md:aspect-auto md:min-h-[420px] bg-brand-soft/40 overflow-hidden">
          {thumb && (
            <Image
              src={thumb}
              alt={stripHtml(post.title.rendered)}
              fill
              sizes="(max-width: 768px) 100vw, 55vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            />
          )}
          {/* Featured stamp */}
          <span
            aria-hidden
            className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 ring-1 ring-brand/15 backdrop-blur px-3 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.28em] text-brand"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-brand" />
            Featured
          </span>
        </div>

        <div className="relative flex flex-col p-7 md:p-10">
          {/* Top accent stripe — single colour, no gradient */}
          <span
            aria-hidden
            className="absolute top-0 left-0 md:left-auto md:right-0 h-0.5 md:h-full md:w-0.5 w-full"
            style={{ backgroundColor: t.fg }}
          />

          <span
            aria-hidden
            className="font-fraunces italic text-[12px] tracking-[0.22em] text-foreground-muted"
          >
            <span className="text-foreground/40">N°</span>01
          </span>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.22em] font-semibold">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1"
              style={{ backgroundColor: `${t.fg}14`, color: t.fg }}
            >
              <span
                aria-hidden
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: t.fg }}
              />
              {topic}
            </span>
            <span className="text-foreground-muted/40">·</span>
            <span className="text-foreground-muted">{minutes} min read</span>
          </div>

          <h2 className="mt-4 font-fraunces text-foreground text-[28px] md:text-[34px] leading-[1.05] tracking-tight font-semibold group-hover:text-brand transition-colors">
            {stripHtml(post.title.rendered)}
          </h2>

          <p className="mt-3 text-foreground/75 text-[15px] leading-relaxed line-clamp-4">
            {stripHtml(post.excerpt.rendered)}
          </p>

          <div className="mt-auto pt-6 flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-[0.24em] font-semibold text-foreground-muted">
              {formatDate(post.date)}
            </span>
            <span className="font-fraunces italic text-[14px] text-brand inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-[gap]">
              Read the story
              <span aria-hidden>→</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function PostCard({ post, index }: { post: WpPost; index: number }) {
  const thumb = BLOG_THUMBNAILS[post.slug];
  const { topic, tint, minutes } = pickPostMeta(post.slug, index);
  const t = BRAND_TINTS[tint];
  const numeral = String(index).padStart(2, "0");

  return (
    <li>
      <Link
        href={`/blog/${post.slug}`}
        className="group flex flex-col h-full bg-white rounded-[20px] ring-1 ring-border overflow-hidden hover:ring-brand/30 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-25px_rgba(92,51,66,0.4)] transition-all duration-300"
      >
        {/* Top accent stripe */}
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
          <div className="flex flex-wrap items-center gap-2 text-[10.5px] uppercase tracking-[0.22em] font-semibold">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5"
              style={{ backgroundColor: `${t.fg}14`, color: t.fg }}
            >
              <span
                aria-hidden
                className="w-1 h-1 rounded-full"
                style={{ backgroundColor: t.fg }}
              />
              {topic}
            </span>
            <span className="text-foreground-muted/40">·</span>
            <span className="text-foreground-muted">{minutes} min</span>
          </div>

          <h2 className="mt-2.5 font-fraunces text-foreground text-[18px] leading-snug font-semibold line-clamp-2 group-hover:text-brand transition-colors">
            {stripHtml(post.title.rendered)}
          </h2>

          <p className="mt-2 text-[13.5px] text-foreground/70 leading-relaxed line-clamp-3">
            {stripHtml(post.excerpt.rendered)}
          </p>

          <div className="mt-auto pt-4 flex items-center justify-between text-[11px] uppercase tracking-[0.22em] font-semibold">
            <span className="text-foreground-muted">
              {formatDate(post.date)}
            </span>
            <span className="font-fraunces italic normal-case tracking-normal text-[13px] text-brand inline-flex items-center gap-1 group-hover:gap-1.5 transition-[gap]">
              Read
              <span aria-hidden>→</span>
            </span>
          </div>
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
