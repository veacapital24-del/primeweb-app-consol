import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { getPages } from "@/lib/data";
import { stripHtml } from "@/lib/format";

type Params = Promise<{ slug: string }>;

// Slugs that have a dedicated route. The catch-all below skips them so we
// don't shadow richer, purpose-built implementations.
const RESERVED = new Set([
  "home-2",
  "shop",
  "blog",
  "contacts",
  "cart",
  "checkout",
  "my-account",
  "wishlist",
  "monthly-essentials",
  "faq",
  "shipping-policy",
  "refund-policy",
  "privacy-policy",
  "terms-and-conditions",
]);

// Which static WP pages render through this catch-all route.
function renderableSlugs() {
  return getPages()
    .map((p) => p.slug)
    .filter((slug) => !RESERVED.has(slug));
}

export function generateStaticParams() {
  return renderableSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getPages().find((p) => p.slug === slug);
  if (!page) return { title: "Not found" };
  return {
    title: stripHtml(page.title.rendered),
    description: stripHtml(page.excerpt.rendered).slice(0, 160) || undefined,
  };
}

export default async function StaticPage({ params }: { params: Params }) {
  const { slug } = await params;
  if (RESERVED.has(slug)) notFound();

  const page = getPages().find((p) => p.slug === slug);
  if (!page) notFound();

  const title = stripHtml(page.title.rendered);
  const hasContent = !!page.content?.rendered?.trim();

  return (
    <>
      <PageHeader
        title={title}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: title }]}
      />

      <div className="mx-auto max-w-3xl px-6 py-12">
        <article className="bg-white rounded-2xl border border-border p-8 md:p-12">
          {hasContent ? (
            <div
              className="prose prose-sm md:prose-base max-w-none text-foreground leading-relaxed
                         prose-headings:text-brand prose-headings:font-bold
                         prose-a:text-brand prose-a:no-underline hover:prose-a:underline
                         prose-strong:text-foreground"
              dangerouslySetInnerHTML={{ __html: page.content.rendered }}
            />
          ) : (
            <p className="text-foreground/60 text-sm">
              This page has no content yet.
            </p>
          )}
        </article>
      </div>
    </>
  );
}
