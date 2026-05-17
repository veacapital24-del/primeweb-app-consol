import Image from "next/image";
import Link from "next/link";
import type { WpPost } from "@/types/wp";
import { stripHtml } from "@/lib/format";

// Mapping of post slug -> featured image URL, captured from the live
// homepage carousel (all 6 posts dated 2023-10-03).
const BLOG_THUMBNAILS: Record<string, string> = {
  "family-friendly-cooking-quick-and-nutritious-meals-for-busy-weeknights":
    "https://nulakaz.com/wp-content/uploads/2023/10/tastydaily-0304533351-765x380.jpg",
  "going-green-tips-for-sustainable-shopping-and-eco-friendly-choices":
    "https://nulakaz.com/wp-content/uploads/2023/10/tastydaily-0304195045-765x380.jpg",
  "diy-charcuterie-boards-crafting-the-perfect-spread-with-our-deli-delights":
    "https://nulakaz.com/wp-content/uploads/2023/10/tastydaily-0304342517-765x380.jpg",
  "delicious-gluten-free-alternatives-a-guide-to-our-gluten-free-product-selection":
    "https://nulakaz.com/wp-content/uploads/2023/10/tastydaily-0304180933-765x380.jpg",
  "cooking-on-a-budget-affordable-meal-ideas-using-store-specials":
    "https://nulakaz.com/wp-content/uploads/2023/10/tastydaily-0304299666-765x380.jpg",
  "fresh-picks-of-the-week-seasonal-fruits-and-vegetables-for-a-healthier-you":
    "https://nulakaz.com/wp-content/uploads/2023/10/tastydaily-0304036055-765x380.jpg",
};

const testimonials = [
  {
    quote:
      "The grocery store website is easy to navigate, making shopping a breeze. It provides a diverse selection of products and ensures a smooth online shopping experience.",
    name: "Katrine Johns",
  },
  {
    quote:
      "Fast delivery and the produce always arrives fresh. Customer support has been responsive every time I've needed them.",
    name: "Marc Emerson",
  },
  {
    quote:
      "Finally a grocery store that carries halal options without compromising on quality. The lamb selection is outstanding.",
    name: "Mary London",
  },
];

export function BlogAndTestimonials({ posts }: { posts: WpPost[] }) {
  const featured = testimonials[0];
  return (
    <section className="bg-white mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24 py-8 sm:py-10 md:py-12 mt-6 rounded-2xl">
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 lg:gap-10">
        <div>
          <h2 className="text-brand text-2xl font-bold mb-6">Our Blog</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {posts.slice(0, 3).map((p) => {
              const thumb = BLOG_THUMBNAILS[p.slug];
              return (
                <Link
                  key={p.id}
                  href={`/blog/${p.slug}`}
                  className="block border border-border rounded-xl p-4 sm:p-5 hover:shadow-sm transition-shadow"
                >
                  <div className="relative aspect-video bg-brand-soft/40 rounded-lg mb-3 sm:mb-4 overflow-hidden">
                    {thumb && (
                      <Image
                        src={thumb}
                        alt={stripHtml(p.title.rendered)}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <span className="inline-block bg-brand-soft/60 text-brand text-[11px] font-bold px-3 py-1 rounded-full mb-3">
                    {new Date(p.date).toLocaleDateString("en-GB", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  <h3 className="text-brand font-bold text-sm leading-snug line-clamp-3 mb-2">
                    {stripHtml(p.title.rendered)}
                  </h3>
                  <p className="text-[13px] text-foreground/80 leading-relaxed line-clamp-2">
                    {stripHtml(p.excerpt.rendered)}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="lg:border-l lg:border-border lg:pl-10 flex flex-col justify-center text-center">
          <h2 className="text-brand text-2xl font-bold mb-6">Testimonials</h2>
          <p className="text-foreground text-base leading-relaxed italic mb-6">
            &ldquo;{featured.quote}&rdquo;
          </p>
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-soft/60" />
            <span className="text-brand font-bold text-sm">{featured.name}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
