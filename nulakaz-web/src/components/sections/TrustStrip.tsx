// Compact 4-up trust strip. Modern, minimal — small geometric icon, short
// title, one-line body. No editorial flourish, no big section header.

type Promise = {
  title: string;
  body: string;
  // tinted icon disc — keeps a touch of color identity without the
  // headline-heavy editorial layout we had before.
  tintBg: string;
  tintFg: string;
  icon: React.ReactNode;
};

const PROMISES: Promise[] = [
  {
    title: "Free delivery",
    body: "On every order above Rs 1,000.",
    tintBg: "#e7eed4",
    tintFg: "#5e7f54",
    icon: (
      <>
        <path d="M3 6.5h11v9.5H3z" />
        <path d="M14 9.5h4l3 3v3.5h-7" />
        <circle cx="7" cy="17" r="2" />
        <circle cx="17" cy="17" r="2" />
      </>
    ),
  },
  {
    title: "Easy returns",
    body: "30-day satisfaction or your money back.",
    tintBg: "#f1dde3",
    tintFg: "#82445a",
    icon: (
      <>
        <path d="M3 12a9 9 0 0 1 15.5-6.3L21 8" />
        <polyline points="21 3 21 8 16 8" />
        <path d="M21 12a9 9 0 0 1-15.5 6.3L3 16" />
        <polyline points="3 21 3 16 8 16" />
      </>
    ),
  },
  {
    title: "Real support",
    body: "Reach a real person on WhatsApp or call.",
    tintBg: "#dbe7f0",
    tintFg: "#3a6f93",
    icon: (
      <>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <line x1="8" y1="9.5" x2="16" y2="9.5" />
        <line x1="8" y1="13" x2="13" y2="13" />
      </>
    ),
  },
  {
    title: "Secure checkout",
    body: "All major cards · encrypted at the till.",
    tintBg: "#f5e7c4",
    tintFg: "#a98937",
    icon: (
      <>
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </>
    ),
  },
];

export function TrustStrip() {
  return (
    <section className="mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24 mt-14">
      <ul className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {PROMISES.map((p) => (
          <li
            key={p.title}
            className="flex items-start gap-4 bg-white rounded-2xl ring-1 ring-border p-5 hover:ring-brand/30 transition-all duration-300"
          >
            <span
              className="shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-xl"
              style={{ backgroundColor: p.tintBg }}
              aria-hidden
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke={p.tintFg}
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {p.icon}
              </svg>
            </span>
            <div className="min-w-0">
              <h3 className="text-foreground font-semibold text-[15px] leading-tight">
                {p.title}
              </h3>
              <p className="mt-1 text-[13px] text-foreground/70 leading-snug">
                {p.body}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
