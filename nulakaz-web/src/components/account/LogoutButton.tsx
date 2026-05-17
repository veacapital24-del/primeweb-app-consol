"use client";

import { useRouter } from "next/navigation";
import { SESSION_KEY } from "@/lib/demo-auth";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  function handleLogout() {
    window.localStorage.removeItem(SESSION_KEY);
    router.push("/my-account");
  }
  return (
    <button
      type="button"
      onClick={handleLogout}
      className={
        className ??
        "w-full text-left px-4 py-2.5 rounded-xl text-foreground/80 hover:bg-background hover:text-brand font-medium text-sm transition-colors"
      }
    >
      <span className="inline-flex items-center gap-2">
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
      </span>
    </button>
  );
}
