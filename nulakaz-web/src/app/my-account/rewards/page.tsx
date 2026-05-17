import type { Metadata } from "next";
import Link from "next/link";
import { AccountShell } from "@/components/account/AccountShell";

export const metadata: Metadata = {
  title: "Rewards — My account",
  description:
    "Loyalty tier, points balance, perks and recent activity for your NuLakaz account.",
};

// Demo data — wire to real loyalty rows when the backend is in.
const POINTS = {
  available: 245,
  expiring: 30,
  expiringMonth: "May",
  lifetime: 1250,
};

const TIERS = [
  { key: "bronze", name: "Bronze", min: 0,    fg: "#a85a44", bg: "#f1d9d4" },
  { key: "silver", name: "Silver", min: 100,  fg: "#a98937", bg: "#f5e7c4" },
  { key: "gold",   name: "Gold",   min: 500,  fg: "#82445a", bg: "#e7d3da" },
  { key: "noir",   name: "Noir",   min: 1500, fg: "#3f3a30", bg: "#e6dfd6" },
] as const;

// Rewarded perks.
const PERKS = [
  {
    title: "Free delivery on Rs 1,000+",
    body: "All members. Across the island, weekdays.",
    tier: "Always",
    tint: { bg: "#dde7c5", fg: "#5e7f54" },
    icon: (
      <>
        <path d="M3 10h13l3 3v4h-3" />
        <path d="M3 17V5h13" />
        <circle cx="7" cy="17" r="2" />
        <circle cx="18" cy="17" r="2" />
      </>
    ),
  },
  {
    title: "Birthday treat: Rs 200 off",
    body: "Auto-applied to your first order in your birth month.",
    tier: "Silver+",
    tint: { bg: "#e7d3da", fg: "#82445a" },
    icon: (
      <>
        <path d="M20 21v-7a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v7" />
        <path d="M12 4v6" />
        <path d="M9 4a3 3 0 0 1 6 0c0 .8-.5 1.5-1.5 1.5C12 5.5 12 4 12 4s0 1.5-1.5 1.5C9.5 5.5 9 4.8 9 4Z" />
        <path d="M3 21h18" />
      </>
    ),
  },
  {
    title: "Early access · 24h preview",
    body: "Shop new produce drops a day before they go public.",
    tier: "Silver+",
    tint: { bg: "#cfdfeb", fg: "#3a6f93" },
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <polyline points="12 7 12 12 16 14" />
      </>
    ),
  },
  {
    title: "Free delivery, no minimum",
    body: "Every order, any size. Yours when you reach Gold.",
    tier: "Gold+",
    tint: { bg: "#f5e7c4", fg: "#a98937" },
    icon: (
      <>
        <path d="M12 15l-3.09 1.62 .59-3.43-2.5-2.44 3.45-.5L12 7l1.55 3.25 3.45 .5-2.5 2.44 .59 3.43z" />
        <path d="M5 21h14" />
      </>
    ),
  },
];

// Recent points history.
const ACTIVITY = [
  { date: "2026-04-18", label: "Order #1048",       delta: 30,  type: "earn" as const },
  { date: "2026-04-10", label: "Order #1039",       delta: 15,  type: "earn" as const },
  { date: "2026-03-28", label: "Order #1021",       delta: 10,  type: "earn" as const },
  { date: "2026-03-15", label: "Birthday bonus",    delta: 50,  type: "bonus" as const },
  { date: "2026-03-08", label: "Order #1005 → Free delivery", delta: -100, type: "redeem" as const },
  { date: "2026-02-20", label: "Order #998",        delta: 20,  type: "earn" as const },
];

export default function RewardsPage() {
  // Compute current tier + progression to the next one.
  const current = [...TIERS]
    .reverse()
    .find((t) => POINTS.available >= t.min) ?? TIERS[0];
  const nextIdx = TIERS.findIndex((t) => t.key === current.key) + 1;
  const next = TIERS[nextIdx] ?? null;
  const toNext = next ? next.min - POINTS.available : 0;
  const progress = next
    ? Math.min(
        100,
        Math.round(
          ((POINTS.available - current.min) / (next.min - current.min)) * 100,
        ),
      )
    : 100;

  return (
    <AccountShell
      active="rewards"
      eyebrow="Loyalty"
      title={
        <>
          Your{" "}
          <em className="italic font-light text-brand">rewards</em>
          <span className="text-brand">.</span>
        </>
      }
      subtitle={
        <>
          Earn 1 point for every Rs 10 spent. Climb tiers, unlock perks,
          and redeem points against future orders.{" "}
          <span className="font-fraunces italic text-foreground/85">
            No fees, no expiry on the active tier.
          </span>
        </>
      }
    >
      {/* ─── Tier progression hero ─────────────────────────────────── */}
      <section className="mb-6 rounded-[24px] overflow-hidden ring-1 ring-border bg-white">
        <span
          aria-hidden
          className="block h-0.5 w-full"
          style={{ backgroundColor: current.fg }}
        />
        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr]">
          <div className="p-5 sm:p-7">
            <div className="flex flex-wrap items-center gap-3">
              <span
                aria-hidden
                className="inline-flex items-center justify-center w-12 h-12 rounded-2xl"
                style={{ backgroundColor: current.bg, color: current.fg }}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 15l-3.09 1.62 .59-3.43-2.5-2.44 3.45-.5L12 7l1.55 3.25 3.45 .5-2.5 2.44 .59 3.43z" />
                  <path d="M5 21h14" />
                </svg>
              </span>
              <div>
                <span className="block text-[10.5px] uppercase tracking-[0.32em] font-semibold text-foreground-muted">
                  Current tier
                </span>
                <h2 className="font-fraunces font-semibold text-foreground text-[26px] md:text-[32px] leading-tight">
                  {current.name}
                  <span className="text-brand">.</span>
                </h2>
              </div>
            </div>

            <p className="mt-4 text-[14px] text-foreground/75 leading-relaxed">
              {next ? (
                <>
                  You&rsquo;re{" "}
                  <span className="font-fraunces italic font-semibold text-foreground">
                    {toNext} points
                  </span>{" "}
                  away from{" "}
                  <em className="font-fraunces italic" style={{ color: next.fg }}>
                    {next.name}
                  </em>
                  . That&rsquo;s roughly Rs {(toNext * 10).toLocaleString()} of
                  groceries — about{" "}
                  <span className="font-fraunces italic">
                    {Math.ceil(toNext / 30)} more orders
                  </span>{" "}
                  at your average basket.
                </>
              ) : (
                <>
                  You&rsquo;re at the top tier — every perk in the table below
                  is yours, every day.
                </>
              )}
            </p>

            {/* Tier ladder */}
            {next && (
              <div className="mt-6">
                <div className="flex items-baseline justify-between text-[11px] uppercase tracking-[0.22em] font-semibold text-foreground-muted mb-2">
                  <span style={{ color: current.fg }}>{current.name}</span>
                  <span className="font-fraunces italic normal-case tracking-normal text-foreground/80 text-[13px]">
                    {POINTS.available} / {next.min} pts
                  </span>
                  <span style={{ color: next.fg }}>{next.name}</span>
                </div>
                <div className="h-2 bg-brand-soft/50 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${progress}%`,
                      backgroundColor: current.fg,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Tier dot row */}
            <ul className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11.5px] uppercase tracking-[0.22em] font-semibold">
              {TIERS.map((t) => {
                const isCurrent = t.key === current.key;
                const reached = POINTS.available >= t.min;
                return (
                  <li
                    key={t.key}
                    className={`inline-flex items-center gap-2 ${
                      reached ? "" : "opacity-40"
                    }`}
                    style={{ color: reached ? t.fg : "var(--foreground-muted)" }}
                  >
                    <span
                      aria-hidden
                      className={`w-2 h-2 rounded-full ${
                        isCurrent ? "ring-2 ring-offset-2 ring-offset-paper" : ""
                      }`}
                      style={{
                        backgroundColor: t.fg,
                        boxShadow: isCurrent
                          ? `0 0 0 4px ${t.bg}`
                          : undefined,
                      }}
                    />
                    {t.name}
                    <span className="font-fraunces italic normal-case tracking-normal text-[12px] text-foreground-muted">
                      {t.min}+
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Points pane */}
          <div
            className="relative grid grid-cols-3 md:grid-cols-1 divide-x md:divide-x-0 md:divide-y divide-border bg-paper-dim md:bg-paper-dim"
            style={{ backgroundColor: "#faf5f6" }}
          >
            <PointsTile
              label="Available"
              value={POINTS.available.toLocaleString()}
              hint="Spend any time"
              tint="#82445a"
            />
            <PointsTile
              label={`Expires ${POINTS.expiringMonth}`}
              value={POINTS.expiring.toString()}
              hint={`Use before end of ${POINTS.expiringMonth}`}
              tint="#a85a44"
            />
            <PointsTile
              label="Lifetime"
              value={POINTS.lifetime.toLocaleString()}
              hint="All-time earned"
              tint="#5e7f54"
            />
          </div>
        </div>
      </section>

      {/* ─── Perks ──────────────────────────────────────────────────── */}
      <section className="mb-6">
        <header className="flex items-end justify-between mb-4">
          <div>
            <span className="block text-[10.5px] uppercase tracking-[0.32em] font-semibold text-foreground-muted">
              What you can do with your points
            </span>
            <h3 className="mt-0.5 font-fraunces text-foreground text-[22px] md:text-[26px] leading-tight font-semibold">
              Member{" "}
              <em className="italic font-light text-brand">perks</em>
            </h3>
          </div>
        </header>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {PERKS.map((p) => (
            <li
              key={p.title}
              className="flex items-start gap-4 bg-white rounded-2xl ring-1 ring-border p-5 hover:ring-brand/30 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_-22px_rgba(92,51,66,0.4)] transition-all"
            >
              <span
                aria-hidden
                className="inline-flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
                style={{ backgroundColor: p.tint.bg, color: p.tint.fg }}
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
                >
                  {p.icon}
                </svg>
              </span>
              <div className="min-w-0">
                <p className="font-fraunces font-semibold text-foreground text-[15px] leading-tight">
                  {p.title}
                </p>
                <p className="mt-1 text-[12.5px] text-foreground/70 leading-snug">
                  {p.body}
                </p>
                <span
                  className="mt-2 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em] font-semibold rounded-full px-2 py-0.5"
                  style={{
                    backgroundColor: `${p.tint.fg}14`,
                    color: p.tint.fg,
                  }}
                >
                  <span
                    aria-hidden
                    className="w-1 h-1 rounded-full"
                    style={{ backgroundColor: p.tint.fg }}
                  />
                  {p.tier}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* ─── Activity feed ──────────────────────────────────────────── */}
      <section className="mb-6 bg-white rounded-[24px] ring-1 ring-border overflow-hidden">
        <header className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border">
          <div>
            <span className="block text-[10.5px] uppercase tracking-[0.32em] font-semibold text-foreground-muted">
              Activity
            </span>
            <h3 className="mt-0.5 font-fraunces text-foreground text-[18px] leading-tight font-semibold">
              Recent{" "}
              <em className="italic font-light text-brand">earnings</em>
            </h3>
          </div>
          <span className="font-fraunces italic text-[13px] text-foreground/60">
            Last {ACTIVITY.length} entries
          </span>
        </header>
        <ul className="divide-y divide-border">
          {ACTIVITY.map((a, i) => (
            <li
              key={i}
              className="px-5 sm:px-6 py-3.5 flex items-center gap-4"
            >
              <span className="font-fraunces italic text-[11px] tracking-[0.22em] text-foreground-muted shrink-0 hidden sm:inline-block w-12">
                <span className="text-foreground/40">N°</span>
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-[14px] truncate">
                  {a.label}
                </p>
                <p className="text-[12px] text-foreground-muted">{a.date}</p>
              </div>
              <span
                className="font-fraunces italic font-semibold text-[15px] tabular-nums shrink-0"
                style={{
                  color:
                    a.type === "redeem"
                      ? "#a85a44"
                      : a.type === "bonus"
                        ? "#a98937"
                        : "#5e7f54",
                }}
              >
                {a.delta > 0 ? `+${a.delta}` : a.delta} pts
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* ─── How to earn ─────────────────────────────────────────────── */}
      <section className="rounded-[24px] bg-brand-soft/30 ring-1 ring-brand/10 p-6 sm:p-7">
        <span className="inline-flex items-center gap-2 text-foreground-muted text-[11px] font-semibold uppercase tracking-[0.32em]">
          <span className="w-9 h-px bg-brand/40" />
          How to earn
        </span>
        <h3 className="mt-2 font-fraunces text-foreground text-[22px] md:text-[26px] leading-tight font-semibold">
          Three ways to{" "}
          <em className="italic font-light text-brand">stack</em>
          <span className="text-brand">.</span>
        </h3>
        <ol className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <EarnCard
            numeral="01"
            title="Order regularly"
            body="1 pt per Rs 10 spent · auto-credited at delivery."
            tint={{ bg: "#dde7c5", fg: "#5e7f54" }}
          />
          <EarnCard
            numeral="02"
            title="Refer a friend"
            body="50 pts when they place their first order over Rs 500."
            tint={{ bg: "#cfdfeb", fg: "#3a6f93" }}
          />
          <EarnCard
            numeral="03"
            title="Birthday bonus"
            body="50 pts in your birth month — even if you don't order."
            tint={{ bg: "#e7d3da", fg: "#82445a" }}
          />
        </ol>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-[11px] tracking-[0.32em] uppercase text-foreground-muted">
          <span className="font-semibold">
            Points are honoured at the till · No expiry on the active tier
          </span>
          <Link
            href="/contacts"
            className="font-fraunces italic text-sm tracking-normal text-brand hover:text-brand-dark transition-colors normal-case"
          >
            Question about points &nbsp;→
          </Link>
        </div>
      </section>
    </AccountShell>
  );
}

function PointsTile({
  label,
  value,
  hint,
  tint,
}: {
  label: string;
  value: string;
  hint: string;
  tint: string;
}) {
  return (
    <div className="p-5 sm:p-6 flex flex-col items-center md:items-start text-center md:text-left">
      <span className="text-[10px] uppercase tracking-[0.22em] font-semibold text-foreground-muted">
        {label}
      </span>
      <p
        className="mt-2 font-fraunces font-semibold text-[28px] sm:text-[32px] md:text-[36px] leading-none tabular-nums"
        style={{ color: tint }}
      >
        {value}
      </p>
      <p className="mt-1 text-[11.5px] text-foreground/60 leading-tight">
        {hint}
      </p>
    </div>
  );
}

function EarnCard({
  numeral,
  title,
  body,
  tint,
}: {
  numeral: string;
  title: string;
  body: string;
  tint: { bg: string; fg: string };
}) {
  return (
    <li className="bg-white rounded-2xl ring-1 ring-border p-4 sm:p-5">
      <div className="flex items-center gap-3 mb-3">
        <span
          aria-hidden
          className="inline-flex items-center justify-center w-9 h-9 rounded-xl font-fraunces italic font-semibold text-[13px]"
          style={{ backgroundColor: tint.bg, color: tint.fg }}
        >
          {numeral}
        </span>
        <span className="font-fraunces font-semibold text-foreground text-[15px] leading-tight">
          {title}
        </span>
      </div>
      <p className="text-[13px] text-foreground/70 leading-snug">{body}</p>
    </li>
  );
}
