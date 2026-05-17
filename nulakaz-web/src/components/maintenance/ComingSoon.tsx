"use client";

import Image from "next/image";
import { useState } from "react";
import { site } from "@/lib/site";

export function ComingSoon() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "ok">("idle");

  function handleSubscribe(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim() || status === "submitting") return;
    setStatus("submitting");
    setTimeout(() => {
      setStatus("ok");
      setEmail("");
    }, 600);
  }

  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden bg-[#f6efe4] text-[#3b1f2b] selection:bg-[#b75a74] selection:text-white">
      {/* Texture + atmosphere ────────────────────────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-multiply"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #3b1f2b 1px, transparent 0)",
          backgroundSize: "4px 4px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-40 h-[28rem] w-[28rem] rounded-full bg-[#b75a74]/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -right-40 h-[34rem] w-[34rem] rounded-full bg-[#8eac6b]/20 blur-3xl"
      />

      {/* Top bar — wordmark + edition stamp ─────────────────────────── */}
      <header className="relative z-10 flex items-center justify-between px-6 py-6 md:px-12 md:py-8">
        <Image
          src="/logo/nulakaz-wordmark.webp"
          alt={site.name}
          width={160}
          height={50}
          priority
          className="h-auto w-28 md:w-36"
        />
        <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#3b1f2b]/60">
          <span className="hidden h-px w-10 bg-[#3b1f2b]/30 md:block" />
          <span>N°01 · Édition 2026</span>
        </div>
      </header>

      {/* Hero ───────────────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 pb-16 pt-6 md:px-12">
        <div className="grid gap-12 md:grid-cols-12 md:items-end">
          {/* Left: editorial copy */}
          <div className="md:col-span-7">
            <div className="flex items-center gap-3">
              <span className="h-px w-12 bg-[#b75a74]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#b75a74]">
                Coming Soon · Mo Lakaz
              </span>
            </div>

            <h1
              className="mt-8 font-serif text-[clamp(3rem,9vw,8.25rem)] font-light leading-[0.92] tracking-[-0.02em]"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              We're <em className="font-light italic text-[#b75a74]">restocking</em>
              <br />
              the <span className="font-normal">island</span>
              <span className="text-[#b75a74]">.</span>
            </h1>

            <p className="mt-8 max-w-xl text-base leading-relaxed text-[#3b1f2b]/75 md:text-lg">
              The new {site.name} storefront is being polished — fresh produce, handpicked
              imports, and a delivery experience worth the wait. Drop your email and we'll
              tell you the moment the doors open again.
            </p>

            {/* Subscribe */}
            <form
              onSubmit={handleSubscribe}
              className="mt-10 flex w-full max-w-md flex-col gap-3 sm:flex-row sm:items-stretch"
            >
              <label className="sr-only" htmlFor="coming-soon-email">
                Email address
              </label>
              <input
                id="coming-soon-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@nulakaz.com"
                className="h-12 flex-1 rounded-full border border-[#3b1f2b]/15 bg-white/70 px-5 text-sm text-[#3b1f2b] placeholder:text-[#3b1f2b]/40 backdrop-blur transition focus:border-[#b75a74] focus:outline-none focus:ring-2 focus:ring-[#b75a74]/20"
              />
              <button
                type="submit"
                disabled={status === "submitting"}
                className="group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-full bg-[#b75a74] px-7 text-sm font-bold uppercase tracking-[0.2em] text-white shadow-[0_8px_24px_-8px_rgba(183,90,116,0.6)] transition-all hover:bg-[#723c4f] active:scale-[0.97] disabled:opacity-70"
              >
                <span className="relative z-10">
                  {status === "submitting" ? "…" : status === "ok" ? "Listed" : "Notify me"}
                </span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  className="relative z-10 transition-transform group-hover:translate-x-1"
                >
                  <path
                    d="M2 7h10M8 3l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </form>
            {status === "ok" && (
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#8eac6b]">
                ✓ You're on the list — merci.
              </p>
            )}

            {/* Subtle reassurance line in place of the old contact rail */}
            <p className="mt-10 inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.4em] text-[#3b1f2b]/50">
              <span className="h-px w-8 bg-[#3b1f2b]/30" />
              No spam · One email when we're back
            </p>
          </div>

          {/* Right: ledger card */}
          <aside className="md:col-span-5">
            <div className="relative rounded-[2rem] border border-[#3b1f2b]/10 bg-white/80 p-7 shadow-[0_30px_60px_-30px_rgba(59,31,43,0.35)] backdrop-blur md:p-8">
              <div className="absolute -top-4 left-7 inline-flex items-center gap-2 rounded-full bg-[#3b1f2b] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-[#f6efe4]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#8eac6b]" />
                Live status
              </div>

              <h2
                className="mt-2 font-serif text-2xl font-light leading-tight md:text-[1.75rem]"
                style={{ fontFamily: "var(--font-fraunces)" }}
              >
                The maintenance{" "}
                <em className="italic text-[#b75a74]">ledger</em>
                <span className="text-[#b75a74]">.</span>
              </h2>

              <ul className="mt-6 divide-y divide-[#3b1f2b]/10">
                {[
                  { label: "Storefront", value: "Restocking", accent: "#b75a74" },
                  { label: "Delivery hours", value: site.contact.hours },
                  { label: "Return", value: "Very soon" },
                ].map((row) => (
                  <li
                    key={row.label}
                    className="flex items-baseline justify-between gap-4 py-3 text-sm"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#3b1f2b]/55">
                      {row.label}
                    </span>
                    <span
                      className="font-semibold"
                      style={{ color: row.accent ?? "#3b1f2b" }}
                    >
                      {row.value}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex items-center gap-3 rounded-2xl bg-[#f6efe4] px-4 py-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#8eac6b]/25">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b1f2b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                </span>
                <p className="text-xs leading-relaxed text-[#3b1f2b]/70">
                  Working morning, noon &amp; night to relaunch a storefront worthy of
                  Mauritian kitchens.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Footer ─────────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-[#3b1f2b]/10 bg-[#f6efe4]/60 px-6 py-6 backdrop-blur md:px-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 text-center text-[10px] font-semibold uppercase tracking-[0.3em] text-[#3b1f2b]/55 md:flex-row md:text-left">
          <span>{site.name} · Mauritius</span>
          <span>
            © {new Date().getFullYear()} {site.legalName}. Tous droits réservés.
          </span>
        </div>
      </footer>
    </main>
  );
}
