"use client";

import { useEffect, useState } from "react";

// "Big Sales Today" countdown. Target = midnight local time today.
// Pure visual flourish — no actual sale backing it yet.
//
// Renders three labeled "ticket" cells (HRS / MIN / SEC) with Fraunces
// numerals and a hairline "live" pulse. Each second-change adds a brief
// scale tick on the seconds cell so the panel doesn't feel inert.

export function Countdown() {
  const [delta, setDelta] = useState<[number, number, number] | null>(null);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      const diff = Math.max(0, end.getTime() - now.getTime());
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1000);
      setDelta([h, m, s]);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const [h, m, s] = delta ?? [-1, -1, -1];
  const ready = delta !== null;

  return (
    <div className="inline-flex items-center gap-2 sm:gap-3">
      <Cell value={h} label="hrs" tick={false} ready={ready} />
      <Sep />
      <Cell value={m} label="min" tick={false} ready={ready} />
      <Sep />
      <Cell value={s} label="sec" tick ready={ready} />
    </div>
  );
}

function Cell({
  value,
  label,
  tick,
  ready,
}: {
  value: number;
  label: string;
  tick?: boolean;
  ready: boolean;
}) {
  const display = ready
    ? Math.max(0, value).toString().padStart(2, "0")
    : "--";

  return (
    <span className="inline-flex flex-col items-center">
      <span
        key={tick ? value : undefined}
        className={[
          "inline-flex items-center justify-center min-w-[58px] sm:min-w-[64px] px-3 py-2.5 rounded-2xl",
          "bg-foreground text-white font-fraunces font-semibold tabular-nums",
          "text-[28px] sm:text-[32px] leading-none tracking-tight",
          "shadow-[inset_0_-3px_0_rgba(255,255,255,0.06),0_8px_22px_-12px_rgba(92,51,66,0.55)]",
          tick && ready ? "tick-pulse" : "",
        ].join(" ")}
      >
        {display}
      </span>
      <span className="mt-1.5 font-fraunces italic text-foreground-muted text-[10px] tracking-[0.28em] uppercase">
        {label}
      </span>
      {/* Subtle keyframes — scoped to this component */}
      {tick && (
        <style>{`
          @keyframes nulakaz-tick-pulse {
            0%   { transform: scale(1);    }
            18%  { transform: scale(1.04); }
            55%  { transform: scale(1);    }
            100% { transform: scale(1);    }
          }
          .tick-pulse {
            animation: nulakaz-tick-pulse 700ms cubic-bezier(.22,1,.36,1);
          }
        `}</style>
      )}
    </span>
  );
}

function Sep() {
  return (
    <span
      aria-hidden
      className="inline-flex flex-col gap-1 -mt-3 self-center text-brand"
    >
      <span className="block w-1 h-1 rounded-full bg-current" />
      <span className="block w-1 h-1 rounded-full bg-current" />
    </span>
  );
}
