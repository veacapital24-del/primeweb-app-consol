import type { Metadata } from "next";
import Link from "next/link";
import { CartView } from "@/components/shop/CartView";
import { getProducts } from "@/lib/data";

export const metadata: Metadata = {
  title: "Cart",
  description:
    "Review the items in your shopping cart before proceeding to checkout.",
};

export default async function CartPage() {
  // Hand the full product catalogue to the client so it can hydrate whatever
  // ids live in localStorage. Cart state itself is client-only.
  const products = await getProducts();

  return (
    <>
      {/* Editorial breadcrumb strip — matches /product/[slug] pattern */}
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
            <Link href="/shop" className="hover:text-brand transition-colors">
              Shop
            </Link>
          </li>
          <li aria-hidden className="text-foreground-muted/40 select-none">
            /
          </li>
          <li className="font-fraunces italic normal-case tracking-normal text-[14px] text-brand">
            Your trolley
          </li>
        </ol>
      </nav>

      <div className="mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24 py-8 md:py-10">
        <CartView products={products} />
      </div>
    </>
  );
}
