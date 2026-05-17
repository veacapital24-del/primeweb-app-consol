import type { Metadata } from "next";
import Link from "next/link";
import { AccountShell } from "@/components/account/AccountShell";
import { DEMO_ADMIN } from "@/lib/demo-auth";

export const metadata: Metadata = {
  title: "Dashboard — My account",
};

const recentOrders = [
  {
    id: "#1048",
    date: "2026-04-18",
    status: "Processing",
    statusTone: "amber" as const,
    total: "Rs 2,480",
    items: 7,
  },
  {
    id: "#1039",
    date: "2026-04-10",
    status: "Delivered",
    statusTone: "green" as const,
    total: "Rs 1,120",
    items: 4,
  },
  {
    id: "#1021",
    date: "2026-03-28",
    status: "Delivered",
    statusTone: "green" as const,
    total: "Rs 890",
    items: 3,
  },
];

// Editorial stat tints — same palette family as /contacts and /brands.
const STAT_PALETTE = {
  sage:   { bg: "#dde7c5", fg: "#5e7f54" },
  ocean:  { bg: "#cfdfeb", fg: "#3a6f93" },
  mauve:  { bg: "#e7d3da", fg: "#82445a" },
  mustard:{ bg: "#f5e7c4", fg: "#a98937" },
} as const;

const firstName = DEMO_ADMIN.displayName.split(" ")[0] ?? DEMO_ADMIN.displayName;

export default function DashboardPage() {
  return (
    <AccountShell
      active="dashboard"
      eyebrow="Welcome back"
      title={
        <>
          Hello,{" "}
          <em className="italic font-light text-brand">{firstName}</em>
          <span className="text-brand">.</span>
        </>
      }
      subtitle={
        <>
          You have{" "}
          <span className="font-fraunces italic text-foreground">12 orders</span>{" "}
          on file and{" "}
          <span className="font-fraunces italic text-foreground">1 on its way</span>
          . Member since{" "}
          {new Date(DEMO_ADMIN.memberSince).toLocaleDateString(undefined, {
            month: "long",
            year: "numeric",
          })}
          .
        </>
      }
    >
      {/* ─── Stat tiles ─────────────────────────────────────────────── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <Stat
          label="Total orders"
          value="12"
          hint="3 this month"
          palette="sage"
          icon={
            <>
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </>
          }
        />
        <Stat
          label="In transit"
          value="1"
          hint="ETA 25 Apr"
          palette="ocean"
          icon={
            <>
              <path d="M3 10h13l3 3v4h-3" />
              <path d="M3 17V5h13" />
              <circle cx="7" cy="17" r="2" />
              <circle cx="18" cy="17" r="2" />
            </>
          }
        />
        <Stat
          label="Wishlist"
          value="8"
          hint="2 on sale today"
          palette="mauve"
          icon={
            <>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </>
          }
        />
        <Stat
          label="Reward points"
          value="245"
          hint="Silver tier"
          palette="mustard"
          icon={
            <>
              <path d="M12 15l-3.09 1.62 .59-3.43-2.5-2.44 3.45-.5L12 7l1.55 3.25 3.45 .5-2.5 2.44 .59 3.43z" />
              <path d="M5 21h14" />
            </>
          }
        />
      </section>

      {/* ─── Rewards strip — quick-glance progress + CTA ─────────────── */}
      <section className="mb-6 rounded-[24px] overflow-hidden ring-1 ring-border bg-white">
        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr]">
          <div className="p-5 sm:p-6 relative">
            <span
              aria-hidden
              className="absolute top-0 left-0 right-0 h-0.5 bg-[#a98937]"
            />
            <Eyebrow numeral="01" label="Loyalty · Silver" tint="#a98937" />
            <h2 className="mt-2 font-fraunces text-foreground text-[22px] md:text-[26px] leading-tight font-semibold">
              Just{" "}
              <em className="italic font-light text-brand">255 points</em> to
              gold
              <span className="text-brand">.</span>
            </h2>
            <p className="mt-2 text-[13.5px] text-foreground/70">
              Earn 1 point per Rs 10 spent. Gold members get free delivery on
              every order, no minimum.
            </p>

            {/* Progress bar */}
            <div className="mt-5">
              <div className="flex items-baseline justify-between text-[11px] uppercase tracking-[0.22em] font-semibold text-foreground-muted mb-1.5">
                <span>Silver</span>
                <span className="font-fraunces italic normal-case tracking-normal text-foreground/80 text-[13px]">
                  245 / 500 pts
                </span>
                <span>Gold</span>
              </div>
              <div className="h-1.5 bg-brand-soft/50 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#a98937]"
                  style={{ width: "49%" }}
                />
              </div>
            </div>

            <Link
              href="/my-account/rewards"
              className="mt-5 inline-flex items-center gap-1.5 font-fraunces italic text-[14px] text-brand hover:gap-2.5 transition-[gap]"
            >
              Open rewards <span aria-hidden>→</span>
            </Link>
          </div>

          {/* Right pane — stamped circular Silver seal on a tinted plinth */}
          <div
            className="relative hidden md:flex items-center justify-center p-6 overflow-hidden"
            style={{ backgroundColor: "#f5e7c4" }}
          >
            <span
              aria-hidden
              className="absolute inset-0 opacity-[0.18] mix-blend-overlay pointer-events-none"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='5'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.4 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
              }}
            />
            <span
              aria-hidden
              className="relative flex flex-col items-center justify-center w-28 h-28 rounded-full bg-white text-foreground -rotate-[6deg] shadow-[0_10px_24px_-10px_rgba(122,97,40,0.5)] border-[3px] border-dashed border-[#a98937]/40"
            >
              <span className="font-fraunces italic text-[10px] tracking-[0.18em] uppercase text-foreground-muted">
                Tier
              </span>
              <span className="font-fraunces font-semibold text-2xl -mt-0.5 text-[#a98937]">
                Silver
              </span>
              <span className="font-fraunces italic text-[10px] tracking-[0.16em] text-foreground/60 mt-0.5">
                245 pts
              </span>
            </span>
          </div>
        </div>
      </section>

      {/* ─── Recent orders ──────────────────────────────────────────── */}
      <section className="bg-white rounded-[24px] ring-1 ring-border overflow-hidden mb-6">
        <header className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border">
          <div>
            <span className="block text-[10.5px] uppercase tracking-[0.32em] font-semibold text-foreground-muted">
              Recent orders
            </span>
            <h3 className="mt-0.5 font-fraunces text-foreground text-[18px] leading-tight font-semibold">
              The last few{" "}
              <em className="italic font-light text-brand">trolleys</em>
            </h3>
          </div>
          <Link
            href="/my-account/orders"
            className="font-fraunces italic text-[13px] text-brand hover:text-brand-dark transition-colors"
          >
            View all →
          </Link>
        </header>

        {/* Desktop: table; Mobile: cards */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-foreground-muted bg-background/60">
              <tr>
                <Th>Order</Th>
                <Th>Date</Th>
                <Th>Status</Th>
                <Th>Total</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o, i) => (
                <tr key={o.id} className="border-t border-border">
                  <Td>
                    <span className="inline-flex items-center gap-2">
                      <span className="font-fraunces italic text-[11px] tracking-[0.22em] text-foreground-muted">
                        <span className="text-foreground/40">N°</span>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="font-semibold text-foreground tabular-nums">
                        {o.id}
                      </span>
                    </span>
                  </Td>
                  <Td className="text-foreground/70">{o.date}</Td>
                  <Td>
                    <StatusPill tone={o.statusTone}>{o.status}</StatusPill>
                  </Td>
                  <Td>
                    <span className="font-fraunces font-semibold text-foreground tabular-nums">
                      {o.total}
                    </span>{" "}
                    <span className="text-foreground-muted text-[12px]">
                      · {o.items} items
                    </span>
                  </Td>
                  <Td className="text-right">
                    <Link
                      href={`/my-account/orders`}
                      className="font-fraunces italic text-[13px] text-brand hover:text-brand-dark"
                    >
                      View →
                    </Link>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul className="md:hidden divide-y divide-border">
          {recentOrders.map((o, i) => (
            <li key={o.id} className="px-4 sm:px-5 py-4">
              <div className="flex items-center justify-between mb-1">
                <span className="inline-flex items-center gap-2">
                  <span className="font-fraunces italic text-[11px] tracking-[0.22em] text-foreground-muted">
                    <span className="text-foreground/40">N°</span>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-semibold tabular-nums">{o.id}</span>
                </span>
                <StatusPill tone={o.statusTone}>{o.status}</StatusPill>
              </div>
              <p className="text-[13px] text-foreground/70">
                {o.date} · {o.items} items
              </p>
              <div className="flex items-center justify-between mt-1">
                <span className="font-fraunces font-semibold text-foreground tabular-nums">
                  {o.total}
                </span>
                <Link
                  href="/my-account/orders"
                  className="font-fraunces italic text-[13px] text-brand"
                >
                  View →
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* ─── Default shipping + Account details ─────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <article className="bg-white rounded-[24px] ring-1 ring-border p-5 sm:p-6">
          <div className="flex items-center justify-between mb-3">
            <Eyebrow numeral="02" label="Default shipping" />
            <Link
              href="/my-account/addresses"
              className="font-fraunces italic text-[13px] text-brand hover:text-brand-dark"
            >
              Edit →
            </Link>
          </div>
          <h3 className="font-fraunces text-foreground text-[18px] font-semibold leading-tight mb-2">
            Riche Terre door
            <span className="text-brand">.</span>
          </h3>
          <address className="not-italic text-[13.5px] text-foreground/80 leading-relaxed">
            {DEMO_ADMIN.displayName}
            <br />
            222 Royal Road
            <br />
            Riche Terre, Mauritius
            <br />
            <span className="text-foreground-muted">+230 5488 9652</span>
          </address>
        </article>

        <article className="bg-white rounded-[24px] ring-1 ring-border p-5 sm:p-6">
          <div className="flex items-center justify-between mb-3">
            <Eyebrow numeral="03" label="Account details" />
            <Link
              href="/my-account/account-details"
              className="font-fraunces italic text-[13px] text-brand hover:text-brand-dark"
            >
              Edit →
            </Link>
          </div>
          <h3 className="font-fraunces text-foreground text-[18px] font-semibold leading-tight mb-3">
            The{" "}
            <em className="italic font-light text-brand">basics</em>
            <span className="text-brand">.</span>
          </h3>
          <dl className="text-[13.5px] space-y-2">
            <Row label="Name" value={DEMO_ADMIN.displayName} tint="#82445a" />
            <Row label="Email" value={DEMO_ADMIN.email} tint="#3a6f93" />
            <Row label="Role" value="Administrator" tint="#a98937" italic />
          </dl>
        </article>
      </section>
    </AccountShell>
  );
}

// ─────────────────────────── Sub-components ───────────────────────────

function Stat({
  label,
  value,
  hint,
  icon,
  palette,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: React.ReactNode;
  palette: keyof typeof STAT_PALETTE;
}) {
  const t = STAT_PALETTE[palette];
  return (
    <div className="bg-white rounded-2xl ring-1 ring-border p-4 sm:p-5 hover:ring-brand/30 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_-22px_rgba(92,51,66,0.4)] transition-all">
      <div className="flex items-start justify-between gap-3">
        <span
          aria-hidden
          className="inline-flex items-center justify-center w-9 h-9 rounded-xl"
          style={{ backgroundColor: t.bg, color: t.fg }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.85"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {icon}
          </svg>
        </span>
        <span className="text-[10px] uppercase tracking-[0.22em] font-semibold text-foreground-muted text-right">
          {label}
        </span>
      </div>
      <p
        className="mt-3 font-fraunces font-semibold text-[28px] sm:text-[32px] leading-none tabular-nums"
        style={{ color: t.fg }}
      >
        {value}
      </p>
      {hint && (
        <p className="mt-1 text-[11.5px] text-foreground/60 leading-tight">
          {hint}
        </p>
      )}
    </div>
  );
}

function Eyebrow({
  numeral,
  label,
  tint,
}: {
  numeral: string;
  label: string;
  tint?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-fraunces italic text-[12px] tracking-[0.22em] text-foreground-muted">
        <span className="text-foreground/40">N°</span>
        {numeral}
      </span>
      <span
        className="w-6 h-px"
        style={{ backgroundColor: tint ? `${tint}66` : "rgba(183,90,116,0.4)" }}
      />
      <span
        className="text-[10.5px] uppercase tracking-[0.32em] font-semibold"
        style={{ color: tint ?? "var(--foreground-muted)" }}
      >
        {label}
      </span>
    </div>
  );
}

function Row({
  label,
  value,
  tint,
  italic,
}: {
  label: string;
  value: string;
  tint: string;
  italic?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-3">
      <dt className="inline-flex items-center gap-2 min-w-[64px] text-[10.5px] uppercase tracking-[0.22em] font-semibold text-foreground-muted">
        <span
          aria-hidden
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: tint }}
        />
        {label}
      </dt>
      <dd
        className={`text-foreground/85 ${italic ? "font-fraunces italic" : ""} break-all`}
      >
        {value}
      </dd>
    </div>
  );
}

function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`text-[10.5px] uppercase tracking-[0.22em] font-bold px-5 sm:px-6 py-3 ${className}`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={`px-5 sm:px-6 py-3.5 align-middle ${className}`}>
      {children}
    </td>
  );
}

function StatusPill({
  tone,
  children,
}: {
  tone: "green" | "amber" | "red" | "grey";
  children: React.ReactNode;
}) {
  const palette: Record<typeof tone, { bg: string; fg: string }> = {
    green: { bg: "#dde7c5", fg: "#3f6828" },
    amber: { bg: "#f5e7c4", fg: "#7a6128" },
    red:   { bg: "#f1d9d4", fg: "#7a3026" },
    grey:  { bg: "#ecdee3", fg: "#82445a" },
  };
  const c = palette[tone];
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.22em] rounded-full px-2.5 py-0.5"
      style={{ backgroundColor: c.bg, color: c.fg }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: c.fg }}
      />
      {children}
    </span>
  );
}
