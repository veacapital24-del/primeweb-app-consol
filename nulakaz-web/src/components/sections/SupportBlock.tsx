import Link from "next/link";
import { site } from "@/lib/site";

// Slim contact bar — phone · WhatsApp · hours. No big headline, no
// photographic backdrop. Compact full-width row that complements the trust
// strip without crowding the page.

const phoneHref = `tel:${site.contact.supportPhone.replace(/\s/g, "")}`;
const whatsAppHref = `https://wa.me/${site.contact.phone.replace(/[^0-9]/g, "")}`;

export function SupportBlock() {
  return (
    <section className="mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24 mt-4">
      <div className="rounded-2xl bg-brand-soft/45 ring-1 ring-brand/15 px-5 py-4 md:px-7 md:py-5 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-2 items-center">
        {/* Phone */}
        <Link
          href={phoneHref}
          className="flex items-center gap-3 text-foreground hover:text-brand transition-colors group/contact"
        >
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white text-brand ring-1 ring-brand/20 group-hover/contact:bg-brand group-hover/contact:text-white transition-colors">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M22 16.92V21a1 1 0 0 1-1.09 1A19 19 0 0 1 3 4.09 1 1 0 0 1 4 3h4a1 1 0 0 1 1 .75l1 4a1 1 0 0 1-.27.93l-2 2a16 16 0 0 0 6 6l2-2a1 1 0 0 1 .93-.27l4 1a1 1 0 0 1 .75 1Z" />
            </svg>
          </span>
          <span className="flex flex-col leading-tight min-w-0">
            <span className="text-[10.5px] font-semibold tracking-[0.18em] uppercase text-foreground-muted">
              Call us
            </span>
            <span className="font-semibold text-[15px] truncate">
              {site.contact.supportPhone}
            </span>
          </span>
        </Link>

        {/* WhatsApp */}
        <a
          href={whatsAppHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 text-foreground hover:text-brand transition-colors group/contact sm:border-l sm:border-brand/15 sm:pl-5"
        >
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white text-[#3a6f93] ring-1 ring-brand/20 group-hover/contact:bg-brand group-hover/contact:text-white transition-colors">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.077 4.487.71.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.122.555 4.115 1.527 5.85L0 24l6.32-1.66A11.954 11.954 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
            </svg>
          </span>
          <span className="flex flex-col leading-tight min-w-0">
            <span className="text-[10.5px] font-semibold tracking-[0.18em] uppercase text-foreground-muted">
              Chat
            </span>
            <span className="font-semibold text-[15px] truncate">
              WhatsApp us
            </span>
          </span>
        </a>

        {/* Hours */}
        <div className="flex items-center gap-3 text-foreground sm:border-l sm:border-brand/15 sm:pl-5">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white text-brand ring-1 ring-brand/20">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <circle cx="12" cy="12" r="9" />
              <polyline points="12 7 12 12 16 14" />
            </svg>
          </span>
          <span className="flex flex-col leading-tight min-w-0">
            <span className="text-[10.5px] font-semibold tracking-[0.18em] uppercase text-foreground-muted">
              Open
            </span>
            <span className="font-semibold text-[15px] truncate">
              {site.contact.hours}
            </span>
          </span>
        </div>
      </div>
    </section>
  );
}
