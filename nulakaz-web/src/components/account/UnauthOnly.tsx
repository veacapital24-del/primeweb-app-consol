"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SESSION_KEY } from "@/lib/demo-auth";

// Wraps the logged-out /my-account view. On mount we check localStorage for
// an existing demo session and bounce to /my-account/dashboard if one is
// found — otherwise we render the login + register forms.
//
// While the check is running, the wrapper renders a soft loading skeleton
// so the login UI never flashes in front of a user who is already signed
// in. Replace this with cookie-based session detection (and a server-side
// redirect) once real auth is wired.
export function UnauthOnly({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "guest">("checking");

  useEffect(() => {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (raw) {
      try {
        // Sanity-check: any parse-able JSON is treated as a valid session.
        // The dashboard does the same shape check on its side.
        JSON.parse(raw);
        router.replace("/my-account/dashboard");
        return;
      } catch {
        window.localStorage.removeItem(SESSION_KEY);
      }
    }
    setStatus("guest");
  }, [router]);

  if (status === "checking") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
        <div className="flex flex-col items-center gap-4">
          <span
            aria-hidden
            className="w-9 h-9 rounded-full border-2 border-brand/20 border-t-brand animate-spin"
          />
          <p className="font-fraunces italic text-foreground/70 text-[15px]">
            Checking your session…
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
