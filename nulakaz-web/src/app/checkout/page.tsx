import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutView } from "@/components/shop/CheckoutView";
import { getProducts } from "@/lib/data";

export const metadata: Metadata = {
  title: "Checkout",
  description:
    "Confirm delivery details and place your order — we’ll pack it fresh and bring it to your door.",
};

export default async function CheckoutPage() {
  // Server-fetch the catalogue so the client view can hydrate cart slugs to
  // full product data with prices and images.
  const products = await getProducts();

  return (
    <>
      {/* Editorial breadcrumb strip — same pattern as /cart and /product */}
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
            <Link href="/cart" className="hover:text-brand transition-colors">
              Cart
            </Link>
          </li>
          <li aria-hidden className="text-foreground-muted/40 select-none">
            /
          </li>
          <li className="font-fraunces italic normal-case tracking-normal text-[14px] text-brand">
            Checkout
          </li>
        </ol>
      </nav>

      <div className="mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24 py-8 md:py-10">
        <CheckoutView products={products} />
      </div>
    </>
  );
}
