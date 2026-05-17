import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/account/LoginForm";
import { RegisterForm } from "@/components/account/RegisterForm";
import { UnauthOnly } from "@/components/account/UnauthOnly";

export const metadata: Metadata = {
  title: "My account",
  description:
    "Sign in to your NuLakaz account or register for faster checkout, order history, and delivery tracking.",
};

// Logged-out view: Login + Register, side by side on lg+. No auth backend
// wired yet — forms submit to /api/auth/* placeholders.
//
// Wrapped in <UnauthOnly> so visiting this URL while already signed in
// bounces straight to /my-account/dashboard instead of asking for
// credentials again.
export default function MyAccountPage() {
  return (
    <UnauthOnly>
      {/* Editorial breadcrumb strip — matches /cart, /brands, /contacts. */}
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
            Account access
          </li>
        </ol>
      </nav>

      {/* Editorial header */}
      <section className="mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24 py-8 md:py-10">
        <header className="max-w-3xl">
          <span className="inline-flex items-center gap-2 text-foreground-muted text-[11px] font-semibold uppercase tracking-[0.32em]">
            <span className="w-9 h-px bg-brand/40" />
            Account access
          </span>
          <h1 className="mt-2 font-fraunces text-foreground text-[28px] xs:text-[32px] sm:text-[40px] md:text-[52px] leading-[0.95] tracking-tight font-semibold">
            Welcome{" "}
            <em className="italic font-light text-brand">back</em>
            <span className="text-brand">.</span>
          </h1>
          <p className="mt-3 text-foreground/75 text-base leading-relaxed">
            Sign in to track orders, save addresses, and keep your wishlist
            in sync across devices.{" "}
            <span className="font-fraunces italic text-foreground/85">
              First time? Create an account in under a minute.
            </span>
          </p>
        </header>
      </section>

      {/* Cards */}
      <section className="mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24 pb-10 md:pb-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-7">
          {/* Sign in */}
          <article className="bg-white rounded-[24px] ring-1 ring-border p-6 sm:p-8">
            <Eyebrow numeral="01" label="Sign in" />
            <h2 className="mt-2 font-fraunces text-foreground text-[24px] md:text-[28px] leading-tight font-semibold">
              Members&rsquo;{" "}
              <em className="italic font-light text-brand">door</em>
              <span className="text-brand">.</span>
            </h2>
            <p className="mt-2 text-[13.5px] text-foreground/70">
              Use the email you placed your last order with — we&rsquo;ll
              find your trolley right where you left it.
            </p>

            <div className="mt-6">
              <LoginForm />
            </div>

            <Divider>or continue with</Divider>

            <div className="grid grid-cols-2 gap-3">
              <SocialButton provider="google" />
              <SocialButton provider="facebook" />
            </div>
          </article>

          {/* Register */}
          <article className="bg-white rounded-[24px] ring-1 ring-border p-6 sm:p-8">
            <Eyebrow numeral="02" label="New here" />
            <h2 className="mt-2 font-fraunces text-foreground text-[24px] md:text-[28px] leading-tight font-semibold">
              Join the{" "}
              <em className="italic font-light text-brand">shelf</em>
              <span className="text-brand">.</span>
            </h2>
            <p className="mt-2 text-[13.5px] text-foreground/70">
              Faster checkout, addresses kept on file, and a wishlist that
              follows you between phone and laptop.
            </p>

            <div className="mt-6">
              <RegisterForm />
            </div>
          </article>
        </div>

        {/* Perks strip — modernised with tinted icon discs (sage / ocean /
            dusty-pink) so it picks up the same accent palette used on
            /contacts and /brands. */}
        <ul className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <Perk
            tint={{ bg: "#dde7c5", fg: "#5e7f54" }}
            title="Faster checkout"
            body="Save your address and pay in two taps."
            iconPath={
              <>
                <polyline points="9 17 4 12 9 7" />
                <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
              </>
            }
          />
          <Perk
            tint={{ bg: "#cfdfeb", fg: "#3a6f93" }}
            title="Order history"
            body="Reorder your weekly groceries in seconds."
            iconPath={
              <>
                <circle cx="12" cy="12" r="9" />
                <polyline points="12 7 12 12 16 14" />
              </>
            }
          />
          <Perk
            tint={{ bg: "#e7d3da", fg: "#82445a" }}
            title="Wishlist sync"
            body="Access your favourites on any device."
            iconPath={
              <>
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </>
            }
          />
        </ul>
      </section>

      {/* Closing caption strip */}
      <section className="mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24 mb-16">
        <div className="flex flex-wrap items-baseline justify-between gap-3 text-[11px] tracking-[0.32em] uppercase text-foreground-muted">
          <span className="font-semibold">
            Encrypted at the till · Cards never stored on our servers
          </span>
          <Link
            href="/contacts"
            className="font-fraunces italic text-sm tracking-normal text-brand hover:text-brand-dark transition-colors normal-case"
          >
            Need help signing in &nbsp;→
          </Link>
        </div>
      </section>
    </UnauthOnly>
  );
}

function Eyebrow({ numeral, label }: { numeral: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-fraunces italic text-[12px] tracking-[0.22em] text-foreground-muted">
        <span className="text-foreground/40">N°</span>
        {numeral}
      </span>
      <span className="w-6 h-px bg-brand/40" />
      <span className="text-[11px] uppercase tracking-[0.32em] font-semibold text-foreground-muted">
        {label}
      </span>
    </div>
  );
}

function Divider({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 my-6 text-[11px] uppercase tracking-[0.28em] font-semibold text-foreground-muted">
      <span className="flex-1 h-px bg-border" />
      {children}
      <span className="flex-1 h-px bg-border" />
    </div>
  );
}

function SocialButton({ provider }: { provider: "google" | "facebook" }) {
  const label = provider === "google" ? "Google" : "Facebook";
  return (
    <button
      type="button"
      className="inline-flex items-center justify-center gap-2 h-11 rounded-full border border-border bg-white text-[13px] font-semibold text-foreground hover:border-brand hover:text-brand hover:-translate-y-0.5 hover:shadow-[0_8px_20px_-12px_rgba(92,51,66,0.35)] transition-all"
    >
      {provider === "google" ? <GoogleIcon /> : <FacebookIcon />}
      {label}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C33.9 6.1 29.2 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C33.9 6.1 29.2 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.1 0 9.8-2 13.3-5.2l-6.1-5c-2 1.4-4.5 2.2-7.2 2.2-5.2 0-9.6-3.3-11.2-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.3-4.1 5.8l6.1 5c-.4.4 6.7-4.9 6.7-14.8 0-1.3-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#1877F2"
        d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7A10 10 0 0 0 22 12z"
      />
    </svg>
  );
}

function Perk({
  title,
  body,
  iconPath,
  tint,
}: {
  title: string;
  body: string;
  iconPath: React.ReactNode;
  tint: { bg: string; fg: string };
}) {
  return (
    <li className="bg-white rounded-2xl ring-1 ring-border p-5 flex gap-4 items-start hover:ring-brand/30 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_-22px_rgba(92,51,66,0.4)] transition-all">
      <span
        aria-hidden
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: tint.bg, color: tint.fg }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.85"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          {iconPath}
        </svg>
      </span>
      <div className="min-w-0">
        <p className="font-fraunces font-semibold text-foreground text-[15px]">
          {title}
        </p>
        <p className="mt-0.5 text-[13px] text-foreground/70 leading-snug">
          {body}
        </p>
      </div>
    </li>
  );
}
