import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";

export default function NotFound() {
  return (
    <>
      <PageHeader
        title="Page not found"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "404" }]}
      />
      <div className="mx-auto max-w-xl px-6 py-20 text-center">
        <p className="text-6xl font-extrabold text-brand mb-4">404</p>
        <p className="text-foreground/80 mb-8">
          The page you&rsquo;re looking for doesn&rsquo;t exist or has moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="bg-brand text-white rounded-full h-11 px-6 inline-flex items-center font-semibold hover:bg-brand-dark transition-colors"
          >
            Go home
          </Link>
          <Link
            href="/shop"
            className="border border-brand text-brand rounded-full h-11 px-6 inline-flex items-center font-semibold hover:bg-brand hover:text-white transition-colors"
          >
            Browse the shop
          </Link>
        </div>
      </div>
    </>
  );
}
