"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SESSION_KEY, type DemoSession } from "@/lib/demo-auth";

// Demo registration. Mirrors LoginForm: validate the inputs, drop a
// DemoSession into localStorage, and redirect to /my-account/dashboard so
// the rest of the logged-in surface lights up. Replace with Supabase
// (auth.signUp) when wiring real accounts — keep this component's API
// surface stable so the page can swap implementations without churn.
export function RegisterForm() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!firstName.trim() || !lastName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!terms) {
      setError("Please accept the terms and privacy policy.");
      return;
    }

    setPending(true);

    const session: DemoSession = {
      email: email.trim().toLowerCase(),
      displayName: `${firstName.trim()} ${lastName.trim()}`.trim(),
      loggedInAt: Date.now(),
    };
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    router.push("/my-account/dashboard");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="First name">
          <InputWithIcon
            icon={
              <>
                <circle cx="12" cy="8" r="4" />
                <path d="M3 21c0-4.4 4-7 9-7s9 2.6 9 7" />
              </>
            }
          >
            <input
              id="register-first"
              name="first_name"
              autoComplete="given-name"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={inputCls}
            />
          </InputWithIcon>
        </Field>
        <Field label="Last name">
          <InputWithIcon
            icon={
              <>
                <circle cx="12" cy="8" r="4" />
                <path d="M3 21c0-4.4 4-7 9-7s9 2.6 9 7" />
              </>
            }
          >
            <input
              id="register-last"
              name="last_name"
              autoComplete="family-name"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={inputCls}
            />
          </InputWithIcon>
        </Field>
      </div>

      <Field label="Email">
        <InputWithIcon
          icon={
            <>
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2Z" />
              <polyline points="22,6 12,13 2,6" />
            </>
          }
        >
          <input
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={inputCls}
          />
        </InputWithIcon>
      </Field>

      <Field label="Password" hint="Minimum 8 characters.">
        <InputWithIcon
          icon={
            <>
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </>
          }
        >
          <input
            id="register-password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={inputCls}
          />
        </InputWithIcon>
      </Field>

      <label className="flex items-start gap-2 text-[13px] text-foreground/80 cursor-pointer select-none pt-1">
        <input
          type="checkbox"
          name="terms"
          checked={terms}
          onChange={(e) => setTerms(e.target.checked)}
          className="w-4 h-4 accent-brand mt-0.5 shrink-0"
        />
        <span>
          I agree to the{" "}
          <Link
            href="/terms-and-conditions"
            className="text-brand hover:underline"
          >
            terms &amp; conditions
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy-policy"
            className="text-brand hover:underline"
          >
            privacy policy
          </Link>
          .
        </span>
      </label>

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

      <button
        type="submit"
        disabled={pending}
        className="group inline-flex w-full items-center justify-center gap-2 bg-brand text-white rounded-full h-12 text-[13.5px] font-semibold tracking-wide hover:bg-brand-dark transition-colors active:scale-[0.99] shadow-[0_10px_24px_-12px_rgba(183,90,116,0.55)] disabled:opacity-60"
      >
        <span>{pending ? "Creating account…" : "Create account"}</span>
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
    </form>
  );
}

const inputCls =
  "w-full bg-background border border-border rounded-full h-11 pl-10 pr-4 text-sm placeholder:text-foreground-muted/60 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 transition-shadow";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[10.5px] uppercase tracking-[0.22em] font-semibold text-foreground-muted mb-1.5">
        {label}
      </span>
      {children}
      {hint && (
        <p className="mt-1.5 text-[11.5px] text-foreground-muted">{hint}</p>
      )}
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
