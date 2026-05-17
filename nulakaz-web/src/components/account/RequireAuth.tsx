"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SESSION_KEY } from "@/lib/demo-auth";

// Inverse of UnauthOnly. Lives inside AccountShell so every protected
// account page (dashboard, orders, rewards, addresses, account-details)
// automatically requires a session — no per-page boilerplate. While the
// localStorage check is running we render a soft loader instead of the
// page contents so the dashboard never flashes for a signed-out user.
//
// Replace this guard with a server-side cookie check + redirect once real
// auth is wired (storefront-side Supabase session).
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "authed">("checking");

  useEffect(() => {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) {
      router.replace("/my-account");
      return;
    }
    try {
      JSON.parse(raw);
      setStatus("authed");
    } catch {
      window.localStorage.removeItem(SESSION_KEY);
      router.replace("/my-account");
    }
  }, [router]);

  if (status === "checking") {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span
            aria-hidden
            className="w-9 h-9 rounded-full border-2 border-brand/20 border-t-brand animate-spin"
          />
          <p className="font-fraunces italic text-foreground/70 text-[15px]">
            Loading your account…
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
