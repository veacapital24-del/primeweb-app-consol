"use client";

import { useEffect, useState } from "react";
import { site } from "@/lib/site";

// Top burgundy strip.
//   • left  : tap-to-call phone + email (email hidden on mobile)
//   • center: rotating value-props (delivery promise, free over Rs, leadtime)
//   • right : language toggle (EN / FR) — UI-only for now, persisted to
//             localStorage so the choice survives reloads
const LANG_KEY = "nulakaz-lang";
const ROTATE_MS = 4500;

const MESSAGES = [
  {
    icon: (
      <>
        <rect x="1" y="3" width="15" height="13" rx="1" />
        <path d="M16 8h4l3 3v5h-7V8zM5.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm13 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />
      </>
    ),
    text: `${site.delivery.leadTime} · ${site.delivery.window}`,
  },
  {
    icon: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </>
    ),
    text: `Free delivery on orders over ${site.currency.symbol} ${site.delivery.freeOver.toLocaleString()}`,
  },
  {
    icon: (
      <>
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </>
    ),
    text: "Fresh local produce · handpicked imports · packed the morning of delivery",
  },
];

export function AnnouncementBar() {
  const [idx, setIdx] = useState(0);
  const [lang, setLang] = useState<"EN" | "FR">("EN");

  // Rotate the middle message
  useEffect(() => {
    const id = window.setInterval(() => {
      setIdx((i) => (i + 1) % MESSAGES.length);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, []);

  // Load persisted language preference
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(LANG_KEY);
      if (raw === "EN" || raw === "FR") setLang(raw);
    } catch {
      // ignore
    }
  }, []);

  function setLanguage(next: "EN" | "FR") {
    setLang(next);
    try {
      window.localStorage.setItem(LANG_KEY, next);
    } catch {
      // ignore
    }
  }

  const msg = MESSAGES[idx];

  return (
    <div className="bg-brand text-white text-[13px] relative">
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24 h-9 flex items-center gap-3">
        {/* Left — contact */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href={`tel:${site.contact.phone.replace(/\s/g, "")}`}
            className="inline-flex items-center gap-1.5 font-medium hover:text-white/80 transition-colors"
            aria-label={`Call ${site.contact.phone}`}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span className="hidden xs:inline">{site.contact.phone}</span>
          </a>
          <span className="hidden md:inline-block w-px h-3.5 bg-white/30" />
          <a
            href={`mailto:${site.contact.email}`}
            className="hidden md:inline-flex items-center gap-1.5 font-medium hover:text-white/80 transition-colors"
            aria-label={`Email ${site.contact.email}`}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            {site.contact.email}
          </a>
        </div>

        {/* Center — rotating value-prop */}
        <div
          className="flex-1 min-w-0 flex items-center justify-center gap-1.5 overflow-hidden"
          aria-live="polite"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0 opacity-90"
            aria-hidden
          >
            {msg.icon}
          </svg>
          <span
            key={idx}
            className="font-medium truncate animate-[fadeIn_400ms_ease-out]"
          >
            {msg.text}
          </span>
        </div>

        {/* Right — language toggle */}
        <div className="flex items-center shrink-0 bg-white/10 rounded-full h-6 p-0.5 text-[11px] font-bold tracking-wide">
          {(["EN", "FR"] as const).map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => setLanguage(code)}
              aria-pressed={lang === code}
              aria-label={`Switch to ${code === "EN" ? "English" : "French"}`}
              className={[
                "h-5 px-2 rounded-full transition-colors",
                lang === code
                  ? "bg-white text-brand"
                  : "text-white/80 hover:text-white",
              ].join(" ")}
            >
              {code}
            </button>
          ))}
        </div>
      </div>

      {/* Per-component keyframes (scoped via inline style tag since the app
          uses Tailwind v4 without a tailwind.config.js for custom anim). */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(2px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
