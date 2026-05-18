"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { getOAuthRedirectUrl, type OAuthProvider } from "@/lib/auth/oauth";

type SignInMethod = OAuthProvider | "phone";

export function SocialAuthButtons({ className = "" }: { className?: string }) {
  const [pending, setPending] = useState<SignInMethod | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function signInWith(method: SignInMethod) {
    if (method === "phone") {
      // Phone sign-in — coming soon
      return;
    }
    setError(null);
    setPending(method);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: method,
        options: {
          redirectTo: getOAuthRedirectUrl("/my-account/dashboard"),
          ...(method === "google"
            ? { queryParams: { access_type: "offline", prompt: "consent" } }
            : {}),
        },
      });

      if (oauthError) {
        setError(oauthError.message);
        setPending(null);
      }
    } catch {
      setError("Could not start social sign-in. Please try again.");
      setPending(null);
    }
  }

  return (
    <div className={className}>
      {error && (
        <p
          role="alert"
          className="mb-3 rounded-2xl border border-[#a85a44]/30 bg-[#f1d9d4]/60 px-3 py-2.5 text-[12.5px] font-semibold text-[#7a3026]"
        >
          {error}
        </p>
      )}
      <div className="grid grid-cols-3 gap-3">
        <SocialButton
          method="google"
          pending={pending === "google"}
          disabled={pending !== null}
          onClick={() => signInWith("google")}
        />
        <SocialButton
          method="facebook"
          pending={pending === "facebook"}
          disabled={pending !== null}
          onClick={() => signInWith("facebook")}
        />
        <SocialButton
          method="phone"
          pending={false}
          disabled={pending !== null}
          onClick={() => signInWith("phone")}
          comingSoon
        />
      </div>
    </div>
  );
}

export function AuthDivider({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 my-6 text-[11px] uppercase tracking-[0.28em] font-semibold text-foreground-muted">
      <span className="flex-1 h-px bg-border" />
      {children}
      <span className="flex-1 h-px bg-border" />
    </div>
  );
}

function SocialButton({
  method,
  pending,
  disabled,
  onClick,
  comingSoon,
}: {
  method: SignInMethod;
  pending: boolean;
  disabled: boolean;
  onClick: () => void;
  comingSoon?: boolean;
}) {
  const label = method === "google" ? "Google" : method === "facebook" ? "Facebook" : "Phone";
  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className="inline-flex w-full items-center justify-center gap-2 h-11 rounded-full border border-border bg-white text-[13px] font-semibold text-foreground hover:border-brand hover:text-brand hover:-translate-y-0.5 hover:shadow-[0_8px_20px_-12px_rgba(92,51,66,0.35)] transition-all disabled:opacity-60 disabled:hover:translate-y-0"
      >
        {pending ? (
          <span
            aria-hidden
            className="h-4 w-4 animate-spin rounded-full border-2 border-brand/25 border-t-brand"
          />
        ) : method === "google" ? (
          <GoogleIcon />
        ) : method === "facebook" ? (
          <FacebookIcon />
        ) : (
          <PhoneIcon />
        )}
        {pending ? "Redirecting…" : label}
      </button>
      {comingSoon && (
        <span className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-brand/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-brand">
          Soon
        </span>
      )}
    </div>
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

function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  );
}
