"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DEMO_ADMIN, SESSION_KEY, type DemoSession } from "@/lib/demo-auth";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);

    // Demo auth only — replace with Supabase / real backend.
    const ok =
      email.trim().toLowerCase() === DEMO_ADMIN.email &&
      password === DEMO_ADMIN.password;

    if (!ok) {
      setError("Invalid email or password.");
      setPending(false);
      return;
    }

    const session: DemoSession = {
      email: DEMO_ADMIN.email,
      displayName: DEMO_ADMIN.displayName,
      loggedInAt: Date.now(),
    };
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    router.push("/my-account/dashboard");
  }

  function fillDemo() {
    setEmail(DEMO_ADMIN.email);
    setPassword(DEMO_ADMIN.password);
    setError(null);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Field label="Email or username">
        <InputWithIcon
          icon={
            <>
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2Z" />
              <polyline points="22,6 12,13 2,6" />
            </>
          }
        >
          <input
            id="login-email"
            name="username"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={inputCls}
          />
        </InputWithIcon>
      </Field>

      <Field label="Password">
        <InputWithIcon
          icon={
            <>
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </>
          }
        >
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={inputCls}
          />
        </InputWithIcon>
      </Field>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-2xl border border-[#a85a44]/30 bg-[#f1d9d4]/60 px-3 py-2.5 text-[12.5px] text-[#7a3026]"
        >
          <span
            aria-hidden
            className="mt-1 block w-1.5 h-1.5 shrink-0 rounded-full bg-[#a85a44]"
          />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      <div className="flex items-center justify-between text-[13px] pt-1">
        <label className="inline-flex items-center gap-2 cursor-pointer select-none text-foreground/80">
          <input
            type="checkbox"
            name="remember"
            className="w-4 h-4 accent-brand"
          />
          Remember me
        </label>
        <Link
          href="/my-account/lost-password"
          className="font-fraunces italic text-brand hover:text-brand-dark transition-colors"
        >
          Forgot password?
        </Link>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="group inline-flex w-full items-center justify-center gap-2 bg-brand text-white rounded-full h-12 text-[13.5px] font-semibold tracking-wide hover:bg-brand-dark transition-colors active:scale-[0.99] shadow-[0_10px_24px_-12px_rgba(183,90,116,0.55)] disabled:opacity-60"
      >
        <span>{pending ? "Signing in…" : "Sign in"}</span>
        {!pending && (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="transition-transform group-hover:translate-x-0.5"
            aria-hidden
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="13 5 20 12 13 19" />
          </svg>
        )}
      </button>

      {/* Demo credentials — slim editorial hint while real auth is wired. */}
      <details className="group rounded-2xl bg-brand-soft/30 ring-1 ring-brand/10 px-4 py-3 text-[12.5px] text-foreground/85 [&_summary::-webkit-details-marker]:hidden">
        <summary className="flex items-center justify-between cursor-pointer list-none">
          <span className="inline-flex items-center gap-2">
            <span
              aria-hidden
              className="w-1.5 h-1.5 rounded-full bg-brand"
            />
            <span className="font-semibold tracking-wide uppercase text-[10.5px] text-brand">
              Demo access
            </span>
            <span className="font-fraunces italic text-foreground/70 normal-case tracking-normal">
              for previewing
            </span>
          </span>
          <span
            aria-hidden
            className="text-foreground-muted transition-transform group-open:rotate-180"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </summary>
        <div className="mt-3 pt-3 border-t border-dashed border-brand/15">
          <p className="font-mono text-[11.5px] break-all text-foreground/70">
            {DEMO_ADMIN.email} · {DEMO_ADMIN.password}
          </p>
          <button
            type="button"
            onClick={fillDemo}
            className="mt-2 font-fraunces italic text-[13px] text-brand hover:text-brand-dark transition-colors"
          >
            Fill demo credentials &nbsp;→
          </button>
        </div>
      </details>
    </form>
  );
}

const inputCls =
  "w-full bg-background border border-border rounded-full h-11 pl-10 pr-4 text-sm placeholder:text-foreground-muted/60 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 transition-shadow";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[10.5px] uppercase tracking-[0.22em] font-semibold text-foreground-muted mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}

function InputWithIcon({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <span
        aria-hidden
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted"
      >
        <svg
          width="15"
          height="15"
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
      {children}
    </div>
  );
}
