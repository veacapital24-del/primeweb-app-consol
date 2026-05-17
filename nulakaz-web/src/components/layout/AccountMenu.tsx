"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SESSION_KEY, type DemoSession } from "@/lib/demo-auth";

// Account icon in the header. Click opens a small dropdown:
//   • signed-in → Dashboard / Orders / Addresses / Account details / Log out
//   • signed-out → Sign in / Create account
export function AccountMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<DemoSession | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sync = () => {
      try {
        const raw = window.localStorage.getItem(SESSION_KEY);
        setSession(raw ? (JSON.parse(raw) as DemoSession) : null);
      } catch {
        setSession(null);
      }
    };
    sync();
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node))
        setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function handleLogout() {
    window.localStorage.removeItem(SESSION_KEY);
    setSession(null);
    setOpen(false);
    router.push("/my-account");
  }

  return (
    <div ref={rootRef} className="relative">
      {/* Matches the Header icon-button cluster language: white pill on a
          brand-soft cluster background, brand-tinted ring at idle, becomes
          full brand burgundy on hover or when the menu is open. */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className={[
          "group/icon relative inline-flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-md ring-1 transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
          open
            ? "bg-brand text-white ring-brand"
            : "bg-white text-brand ring-brand/10 hover:bg-brand hover:text-white hover:ring-brand",
        ].join(" ")}
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
          className="transition-transform duration-200 group-hover/icon:scale-110"
          aria-hidden
        >
          <path d="M20 21a8 8 0 1 0-16 0" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        {/* Tiny "signed-in" pulse dot — sage green, mirrors the same
            "live indicator" pattern used in the support block. */}
        {session && (
          <span aria-hidden className="absolute top-1.5 right-1.5 flex w-2 h-2">
            <span className="absolute inset-0 rounded-full bg-[#5e7f54] animate-ping opacity-60" />
            <span className="relative w-2 h-2 rounded-full bg-[#5e7f54] ring-2 ring-white" />
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute z-40 right-0 mt-2 w-64 bg-white rounded-2xl border border-border shadow-xl overflow-hidden"
        >
          {session ? (
            <>
              <div className="px-4 py-3 border-b border-border bg-brand-soft/30">
                <p className="text-[11px] uppercase tracking-wide font-bold text-brand">
                  Signed in as
                </p>
                <p className="text-sm font-semibold text-foreground truncate">
                  {session.displayName}
                </p>
                <p className="text-[12px] text-foreground/70 truncate">
                  {session.email}
                </p>
              </div>
              <ul className="py-1">
                <MenuLink
                  href="/my-account/dashboard"
                  onClick={() => setOpen(false)}
                  label="Dashboard"
                  icon={
                    <>
                      <rect x="3" y="3" width="7" height="9" rx="1" />
                      <rect x="14" y="3" width="7" height="5" rx="1" />
                      <rect x="14" y="12" width="7" height="9" rx="1" />
                      <rect x="3" y="16" width="7" height="5" rx="1" />
                    </>
                  }
                />
                <MenuLink
                  href="/my-account/orders"
                  onClick={() => setOpen(false)}
                  label="Orders"
                  icon={
                    <>
                      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <path d="M16 10a4 4 0 0 1-8 0" />
                    </>
                  }
                />
                <MenuLink
                  href="/my-account/addresses"
                  onClick={() => setOpen(false)}
                  label="Addresses"
                  icon={
                    <>
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </>
                  }
                />
                <MenuLink
                  href="/my-account/account-details"
                  onClick={() => setOpen(false)}
                  label="Account details"
                  icon={
                    <>
                      <path d="M20 21a8 8 0 1 0-16 0" />
                      <circle cx="12" cy="7" r="4" />
                    </>
                  }
                />
                <li className="border-t border-border my-1" />
                <li>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-foreground/80 hover:bg-background hover:text-[#c43f3f] transition-colors"
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
                      aria-hidden
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Log out
                  </button>
                </li>
              </ul>
            </>
          ) : (
            <div className="p-4">
              <p className="text-sm font-semibold text-foreground mb-1">
                Welcome to NuLakaz
              </p>
              <p className="text-[12px] text-foreground/70 mb-4">
                Sign in to track orders and reorder your monthly box.
              </p>
              <Link
                href="/my-account"
                onClick={() => setOpen(false)}
                className="block w-full bg-brand text-white rounded-full h-10 px-4 font-semibold text-sm hover:bg-brand-dark transition-colors flex items-center justify-center"
              >
                Sign in
              </Link>
              <Link
                href="/my-account"
                onClick={() => setOpen(false)}
                className="block w-full mt-2 border border-brand text-brand rounded-full h-10 px-4 font-semibold text-sm hover:bg-brand hover:text-white transition-colors flex items-center justify-center"
              >
                Create account
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MenuLink({
  href,
  label,
  icon,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <li>
      <Link
        href={href}
        onClick={onClick}
        className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-foreground/80 hover:bg-background hover:text-brand transition-colors"
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
          aria-hidden
        >
          {icon}
        </svg>
        {label}
      </Link>
    </li>
  );
}
