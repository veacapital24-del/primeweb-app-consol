import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";

// Footer layout:
//   • Newsletter band (rose-soft, full width)
//   • 4-col main grid: About · Shop · Company · Get the app
//   • Bottom bar: copyright · payment icons
export function Footer() {
  return (
    <footer className="bg-brand text-white">
      {/* Newsletter band — kept light so it contrasts against the dark footer below */}
      <div className="bg-brand-soft/40 text-foreground border-t border-border">
        <div className="mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24 py-8 md:py-10 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-center">
          <div>
            <h2 className="text-brand font-bold text-xl md:text-2xl mb-1">
              Stay in the loop — get 10% off your first order
            </h2>
            <p className="text-sm text-foreground/70 max-w-xl">
              {site.footer.newsletterPitch}
            </p>
          </div>
          <form className="flex items-center bg-white rounded-full pl-4 pr-1 h-12 border border-border min-w-0 w-full md:w-[440px]">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-brand mr-2 shrink-0"
              aria-hidden
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 min-w-0 bg-transparent outline-none text-sm placeholder:text-brand/50"
              required
            />
            <button
              type="submit"
              className="bg-brand text-white rounded-full h-10 px-4 sm:px-5 text-sm font-semibold hover:bg-brand-dark transition-colors shrink-0"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Main grid */}
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24 py-12 md:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.1fr] gap-10 lg:gap-8">
          {/* About — same mark + Fraunces 'NuLakaz' lockup as the header,
              but the mark is knocked out to white so it reads on the brand
              burgundy footer. */}
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <Image
                src="/logo/nulakaz-mark.webp"
                alt=""
                // Native asset is 352×487 (≈0.72:1).
                width={36}
                height={50}
                className="h-10 w-auto object-contain brightness-0 invert"
              />
              <span className="flex flex-col leading-none">
                <span className="font-fraunces font-semibold text-white text-[22px] tracking-tight">
                  Nu<em className="not-italic font-light">Lakaz</em>
                </span>
                <span className="mt-1 font-fraunces italic text-white/65 text-[10.5px] tracking-[0.2em] uppercase">
                  Mo Lakaz · Mauritius
                </span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-white/80 mb-5 max-w-sm">
              {site.tagline}
            </p>

            <ul className="space-y-2 text-sm mb-5">
              <li className="flex items-start gap-2">
                <InfoIcon>
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
                  <circle cx="12" cy="10" r="3" />
                </InfoIcon>
                <span className="text-white/80">
                  {site.contact.address}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <InfoIcon>
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </InfoIcon>
                <a
                  href={`tel:${site.contact.phone.replace(/\s/g, "")}`}
                  className="text-white font-semibold hover:underline"
                >
                  {site.contact.phone}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <InfoIcon>
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </InfoIcon>
                <a
                  href={`mailto:${site.contact.email}`}
                  className="text-white font-semibold hover:underline"
                >
                  {site.contact.email}
                </a>
              </li>
            </ul>

            <div className="flex items-center gap-2">
              <SocialIcon label="Facebook">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </SocialIcon>
              <SocialIcon label="Instagram">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01" />
              </SocialIcon>
              <SocialIcon label="WhatsApp">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </SocialIcon>
              <SocialIcon label="YouTube">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                <path d="m9.75 15.02 5.75-3.27-5.75-3.27v6.54z" />
              </SocialIcon>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-[11px] uppercase tracking-wide font-bold text-white mb-4">
              Shop
            </h3>
            <ul className="space-y-2.5 text-sm">
              {site.footer.shopLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-[11px] uppercase tracking-wide font-bold text-white mb-4">
              Company
            </h3>
            <ul className="space-y-2.5 text-sm">
              {site.footer.companyLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Get the app */}
          <div>
            <h3 className="text-[11px] uppercase tracking-wide font-bold text-white mb-4">
              Get the app
            </h3>
            <p className="text-sm text-white/80 mb-4 leading-relaxed">
              Order faster from your phone, track deliveries, and reorder your
              monthly box in one tap.
            </p>
            <div className="flex flex-col gap-2.5">
              <AppBadge
                href={site.footer.appStoreUrl}
                label="App Store"
                subLabel="Download on the"
                icon={<AppleIcon />}
              />
              <AppBadge
                href={site.footer.playStoreUrl}
                label="Google Play"
                subLabel="Get it on"
                icon={<PlayIcon />}
              />
            </div>

            <div className="mt-5 flex items-center gap-2 text-[12px] text-white/70">
              <StarRow /> 4.8 · 1.2k reviews
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/15">
        <div className="mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-white/75">{site.footer.copyright}</p>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span className="text-[11px] uppercase tracking-wide font-bold text-white/60 mr-1">
              We accept
            </span>
            {[
              "https://nulakaz.com/wp-content/uploads/2023/09/tastydaily-2647063364.png",
              "https://nulakaz.com/wp-content/uploads/2023/09/tastydaily-2647277186.png",
              "https://nulakaz.com/wp-content/uploads/2023/09/tastydaily-2648618743.png",
              "https://nulakaz.com/wp-content/uploads/2023/09/tastydaily-2648803124.png",
              "https://nulakaz.com/wp-content/uploads/2023/09/tastydaily-2648296211.png",
              "https://nulakaz.com/wp-content/uploads/2023/09/tastydaily-2648938713.png",
            ].map((src, i) => (
              <Image
                key={src}
                src={src}
                alt={`Payment method ${i + 1}`}
                width={60}
                height={36}
                className="h-6 w-auto object-contain"
              />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function InfoIcon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-white/70 shrink-0 mt-[3px]"
      aria-hidden
    >
      {children}
    </svg>
  );
}

function SocialIcon({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href="#"
      aria-label={label}
      className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white hover:text-brand hover:border-white transition-colors"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {children}
      </svg>
    </a>
  );
}

function AppBadge({
  href,
  label,
  subLabel,
  icon,
}: {
  href: string;
  label: string;
  subLabel: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={`${subLabel} ${label}`}
      className="inline-flex items-center gap-3 bg-foreground text-white rounded-xl px-3.5 py-2.5 hover:bg-brand-dark transition-colors"
    >
      <span className="shrink-0">{icon}</span>
      <span className="flex flex-col leading-none">
        <span className="text-[10px] uppercase tracking-wide opacity-80 mb-1">
          {subLabel}
        </span>
        <span className="text-sm font-bold">{label}</span>
      </span>
    </a>
  );
}

function AppleIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M3.2 2.7c-.3.3-.5.8-.5 1.4v15.8c0 .6.2 1.1.5 1.4l.1.1L12 12v-.2L3.3 2.6l-.1.1z"
        fill="#00C3FF"
      />
      <path
        d="m15.3 15.3-3.3-3.3v-.2l3.3-3.3.1.1 3.9 2.2c1.1.6 1.1 1.7 0 2.3l-4 2.2z"
        fill="#FFD600"
      />
      <path
        d="M15.4 15.2 12 11.8 3.2 20.6c.4.4 1 .5 1.7.1l10.5-6"
        fill="#FF3D00"
      />
      <path
        d="M15.4 8.4 4.9 2.4c-.7-.4-1.3-.3-1.7.1L12 11.3l3.4-3.4z"
        fill="#00E676"
      />
    </svg>
  );
}

function StarRow() {
  return (
    <span className="inline-flex items-center text-amber-400">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </span>
  );
}
