"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { site } from "@/lib/site";

type Cat = (typeof site.nav.categories)[number];

// "Categories" button in the header. Click opens a two-pane mega menu:
// left pane lists top-level categories, right pane shows the children of
// whichever one is highlighted. Click outside or Esc to close.
export function CategoriesMenu() {
  const [open, setOpen] = useState(false);
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

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

  // Default highlight = first top-level category with children.
  useEffect(() => {
    if (open && !hoveredSlug) {
      const firstWithChildren = site.nav.categories.find(
        (c) => "children" in c && c.children && c.children.length > 0,
      );
      setHoveredSlug(
        firstWithChildren?.slug ?? site.nav.categories[0]?.slug ?? null,
      );
    }
  }, [open, hoveredSlug]);

  const hovered = site.nav.categories.find(
    (c) => c.slug === hoveredSlug,
  ) as Cat | undefined;
  const hoveredChildren =
    hovered && "children" in hovered ? hovered.children : undefined;

  return (
    <div
      ref={rootRef}
      className="md:relative order-4 md:order-none shrink-0"
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open categories menu"
        className={[
          "inline-flex items-center gap-2 md:gap-3 rounded-lg h-10 md:h-11 px-3 md:px-5 font-semibold transition-colors shrink-0",
          open
            ? "bg-brand-dark text-white"
            : "bg-brand text-white hover:bg-brand-dark",
        ].join(" ")}
      >
        <svg
          width="18"
          height="14"
          viewBox="0 0 18 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden
          className={`transition-transform ${open ? "rotate-90" : ""}`}
        >
          <path d="M1 1h16M1 7h16M1 13h16" />
        </svg>
        <span className="hidden md:inline">Categories</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute z-40 top-full mt-2 inset-x-4 md:inset-x-auto md:left-0 md:w-[min(92vw,640px)] bg-white rounded-2xl border border-border shadow-xl overflow-hidden"
        >
          <div className="grid grid-cols-1 sm:grid-cols-[220px_1fr]">
            {/* Left pane — top-level list */}
            <ul className="bg-background/60 py-2 max-h-[60vh] overflow-y-auto">
              <li>
                <Link
                  href="/shop"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between px-4 py-2.5 text-sm font-bold text-brand hover:bg-brand-soft/60"
                >
                  All products
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    aria-hidden
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>
              </li>
              {site.nav.categories.map((c) => {
                const hasChildren =
                  "children" in c && c.children && c.children.length > 0;
                const isActive = c.slug === hoveredSlug;
                return (
                  <li key={c.slug}>
                    <button
                      type="button"
                      onMouseEnter={() => setHoveredSlug(c.slug)}
                      onFocus={() => setHoveredSlug(c.slug)}
                      onClick={() => {
                        if (!hasChildren) setOpen(false);
                        setHoveredSlug(c.slug);
                      }}
                      className={[
                        "w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors",
                        isActive
                          ? "bg-brand-soft/60 text-brand font-semibold"
                          : "text-foreground/80 hover:bg-brand-soft/40 hover:text-brand",
                      ].join(" ")}
                    >
                      <Link
                        href={`/category/${c.slug}`}
                        onClick={() => setOpen(false)}
                        className="flex-1"
                      >
                        {c.label}
                      </Link>
                      {hasChildren && (
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          aria-hidden
                        >
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* Right pane — children of hovered category */}
            <div className="p-5 max-h-[60vh] overflow-y-auto">
              {hovered ? (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[11px] uppercase tracking-wide font-bold text-foreground-muted">
                      {hovered.label}
                    </h3>
                    <Link
                      href={`/category/${hovered.slug}`}
                      onClick={() => setOpen(false)}
                      className="text-[12px] font-semibold text-brand hover:underline"
                    >
                      Shop {hovered.label.toLowerCase()} →
                    </Link>
                  </div>

                  {hoveredChildren && hoveredChildren.length > 0 ? (
                    <ul className="space-y-2">
                      {hoveredChildren.map((sub) => (
                        <li key={sub.slug}>
                          <Link
                            href={`/category/${sub.slug}`}
                            onClick={() => setOpen(false)}
                            className="text-sm font-semibold text-foreground/85 hover:text-brand block"
                          >
                            {sub.label}
                          </Link>
                          {"children" in sub &&
                            sub.children &&
                            sub.children.length > 0 && (
                              <ul className="mt-1.5 ml-2 space-y-1 border-l border-border pl-3">
                                {sub.children.map((ss) => (
                                  <li key={ss.slug}>
                                    <Link
                                      href={`/category/${ss.slug}`}
                                      onClick={() => setOpen(false)}
                                      className="text-[13px] text-foreground/70 hover:text-brand block py-0.5"
                                    >
                                      {ss.label}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-foreground-muted">
                      No sub-categories — tap{" "}
                      <span className="font-semibold">
                        Shop {hovered.label.toLowerCase()} →
                      </span>{" "}
                      to browse all products.
                    </p>
                  )}
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
