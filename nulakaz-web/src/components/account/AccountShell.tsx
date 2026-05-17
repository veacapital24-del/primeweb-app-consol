import Link from "next/link";
import type { ReactNode } from "react";
import { LogoutButton } from "@/components/account/LogoutButton";
import { RequireAuth } from "@/components/account/RequireAuth";

export type AccountSection =
  | "dashboard"
  | "orders"
  | "rewards"
  | "addresses"
  | "account-details";

const NAV: Array<{
  key: AccountSection;
  label: string;
  href: string;
  icon: ReactNode;
}> = [
  {
    key: "dashboard",
    label: "Dashboard",
    href: "/my-account/dashboard",
    icon: (
      <>
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
      </>
    ),
  },
  {
    key: "orders",
    label: "Orders",
    href: "/my-account/orders",
    icon: (
      <>
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </>
    ),
  },
  {
    key: "rewards",
    label: "Rewards",
    href: "/my-account/rewards",
    icon: (
      <>
        <path d="M12 15l-3.09 1.62 .59-3.43-2.5-2.44 3.45-.5L12 7l1.55 3.25 3.45 .5-2.5 2.44 .59 3.43z" />
        <path d="M5 21h14" />
      </>
    ),
  },
  {
    key: "addresses",
    label: "Addresses",
    href: "/my-account/addresses",
    icon: (
      <>
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
        <circle cx="12" cy="10" r="3" />
      </>
    ),
  },
  {
    key: "account-details",
    label: "Account details",
    href: "/my-account/account-details",
    icon: (
      <>
        <path d="M20 21a8 8 0 1 0-16 0" />
        <circle cx="12" cy="7" r="4" />
      </>
    ),
  },
];

export function AccountShell({
  active,
  title,
  eyebrow,
  subtitle,
  children,
}: {
  active: AccountSection;
  // Either a plain string or a JSX node. Pages can pass JSX to add the
  // editorial Fraunces italic accent (e.g. `<>Welcome <em>back</em>.</>`).
  title: ReactNode;
  // Editorial eyebrow rendered above the title. Defaults to the active
  // section label so the shell stays useful when a page doesn't override.
  eyebrow?: string;
  subtitle?: ReactNode;
  children: ReactNode;
}) {
  const activeNav = NAV.find((n) => n.key === active);
  const activeLabel = activeNav?.label ?? "Account";
  const eyebrowText = eyebrow ?? activeLabel;

  return (
    <>
      {/* Editorial breadcrumb strip — same pattern used on /cart, /brands,
          /contacts. Replaces the legacy PageHeader so the account surface
          shares the storefront's visual rhythm. */}
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
            <Link
              href="/my-account"
              className="hover:text-brand transition-colors"
            >
              My account
            </Link>
          </li>
          <li aria-hidden className="text-foreground-muted/40 select-none">
            /
          </li>
          <li className="font-fraunces italic normal-case tracking-normal text-[14px] text-brand">
            {activeLabel}
          </li>
        </ol>
      </nav>

      <div className="mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24 py-8 md:py-10">
        <div className="flex flex-col md:flex-row gap-6">
          <aside className="w-full md:w-56 lg:w-64 shrink-0">
            <nav className="bg-white rounded-2xl border border-border p-2 md:sticky md:top-24">
              <ul className="space-y-0.5">
                {NAV.map((item) => {
                  const isActive = item.key === active;
                  return (
                    <li key={item.key}>
                      <Link
                        href={item.href}
                        aria-current={isActive ? "page" : undefined}
                        className={[
                          "relative flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-brand-soft/60 text-brand"
                            : "text-foreground/80 hover:bg-background hover:text-brand",
                        ].join(" ")}
                      >
                        {isActive && (
                          <span
                            aria-hidden
                            className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-brand"
                          />
                        )}
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
                          {item.icon}
                        </svg>
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
                <li className="pt-1 mt-1 border-t border-border">
                  <LogoutButton className="w-full text-left flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-background hover:text-brand transition-colors" />
                </li>
              </ul>
            </nav>
          </aside>

          <div className="flex-1 min-w-0">
            {/* Every protected account page needs a session — bouncing to
                /my-account if there isn't one. The header + body only
                render once the session check passes, so the dashboard
                never flashes for a logged-out visitor. */}
            <RequireAuth>
              {/* Editorial header — reusable across every account page. */}
              <header className="mb-6 md:mb-8">
                <span className="inline-flex items-center gap-2 text-foreground-muted text-[11px] font-semibold uppercase tracking-[0.32em]">
                  <span className="w-9 h-px bg-brand/40" />
                  {eyebrowText}
                </span>
                <h1 className="mt-2 font-fraunces text-foreground text-[28px] xs:text-[32px] sm:text-[40px] md:text-[48px] leading-[0.98] tracking-tight font-semibold">
                  {title}
                </h1>
                {subtitle && (
                  <p className="mt-3 text-foreground/75 text-[15px] leading-relaxed max-w-2xl">
                    {subtitle}
                  </p>
                )}
              </header>

              {children}
            </RequireAuth>
          </div>
        </div>
      </div>
    </>
  );
}
