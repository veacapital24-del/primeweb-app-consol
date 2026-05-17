"use client";

import Image from "next/image";
import { useState } from "react";
import type { WcImage } from "@/types/wp";

// Detail-page gallery — full-bleed photo (object-cover) framed in a soft
// brand-tinted rounded card, with a horizontal thumbnail strip below.
// Active thumbnail is highlighted with a brand ring + slight inset shadow.
export function ProductGallery({
  images,
  alt,
}: {
  images: WcImage[];
  alt: string;
}) {
  const [active, setActive] = useState(0);
  const main = images[active] ?? images[0];

  if (!main) {
    return (
      <div className="aspect-square rounded-[26px] bg-brand-soft/40 ring-1 ring-border flex items-center justify-center text-foreground/40 text-sm">
        No image
      </div>
    );
  }

  return (
    <div>
      {/* Main frame — full-bleed photo, soft tinted backdrop, generous radius */}
      <div className="relative aspect-square rounded-[26px] bg-brand-soft/30 ring-1 ring-border overflow-hidden shadow-[0_18px_45px_-30px_rgba(92,51,66,0.45)]">
        <Image
          src={main.src}
          alt={main.alt || alt}
          fill
          preload
          sizes="(max-width: 768px) 100vw, 600px"
          className="object-cover transition-transform duration-700 ease-out hover:scale-[1.03]"
        />
      </div>

      {images.length > 1 && (
        <div className="flex gap-2.5 mt-4">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              aria-pressed={i === active}
              className={[
                "relative w-20 h-20 rounded-2xl overflow-hidden transition-all duration-200",
                i === active
                  ? "ring-2 ring-brand shadow-[inset_0_0_0_2px_rgba(255,255,255,0.6)]"
                  : "ring-1 ring-border hover:ring-brand/50 hover:-translate-y-0.5",
              ].join(" ")}
            >
              <Image
                src={img.thumbnail || img.src}
                alt={img.alt || alt}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
