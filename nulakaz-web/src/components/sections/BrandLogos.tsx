import Image from "next/image";
import Link from "next/link";
import { BRANDS } from "@/lib/brands";

// Homepage brand strip — desaturated by default, full-colour on hover.
// Pulls from the shared lib/brands.ts so the logos here always match the
// dedicated /brands showcase page.
export function BrandLogos() {
  return (
    <section className="mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24 mt-8 mb-12">
      <div className="bg-white rounded-2xl py-10 px-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 items-center justify-items-center">
          {BRANDS.map((b) => (
            <Link
              key={b.slug}
              href="/brands"
              aria-label={`${b.name} — see all partner brands`}
              className="relative h-12 w-32 grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all"
            >
              <Image
                src={b.logo}
                alt={b.name}
                fill
                sizes="128px"
                className="object-contain"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
