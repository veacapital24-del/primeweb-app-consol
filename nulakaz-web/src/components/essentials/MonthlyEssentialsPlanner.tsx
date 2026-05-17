"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { WcProduct } from "@/types/wp";
import { addItem } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import {
  BUCKET_ORDER,
  type BundleTier,
  type BundleTierKey,
} from "@/lib/bundles";

const PLANS_STORAGE_KEY = "nulakaz-essentials-plans";

export interface HydratedTier extends Omit<BundleTier, "items"> {
  lines: Array<{ product: WcProduct; qty: number; bucket: string }>;
}

// One editable line inside a tier's plan.
type LineState = {
  productId: number;
  qty: number;
  included: boolean;
};

export function MonthlyEssentialsPlanner({
  tiers,
  catalogByBucket,
}: {
  tiers: HydratedTier[];
  catalogByBucket: Record<string, WcProduct[]>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tierFromUrl = searchParams.get("tier") as BundleTierKey | null;
  const validTier = tiers.find((t) => t.key === tierFromUrl)?.key;
  const [activeKey, setActiveKey] = useState<BundleTierKey>(
    validTier ?? "family",
  );

  // Product lookup (id → product) across the entire catalog.
  const productById = useMemo(() => {
    const map = new Map<number, WcProduct>();
    for (const list of Object.values(catalogByBucket))
      for (const p of list) map.set(p.id, p);
    return map;
  }, [catalogByBucket]);

  // Per-tier default plan — used for initial state and "Reset to defaults".
  const defaultPlans = useMemo(() => {
    const o = {} as Record<BundleTierKey, LineState[]>;
    for (const t of tiers) {
      o[t.key] = t.lines.map((l) => ({
        productId: l.product.id,
        qty: l.qty,
        included: true,
      }));
    }
    return o;
  }, [tiers]);

  // Per-tier editable plan. Defaults are rendered on SSR; after mount we
  // overwrite from localStorage if the user has customized before.
  const [plans, setPlans] = useState<Record<BundleTierKey, LineState[]>>(
    defaultPlans,
  );
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage after mount (SSR-safe).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(PLANS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<
          Record<BundleTierKey, LineState[]>
        >;
        setPlans((prev) => ({
          essentials: Array.isArray(parsed.essentials)
            ? parsed.essentials
            : prev.essentials,
          family: Array.isArray(parsed.family)
            ? parsed.family
            : prev.family,
          household: Array.isArray(parsed.household)
            ? parsed.household
            : prev.household,
        }));
      }
    } catch {
      // ignore malformed stored state
    }
    setHydrated(true);
  }, []);

  // Persist on change, but only after the initial hydration so we don't
  // clobber saved state with the SSR defaults.
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(plans));
    } catch {
      // storage quota / disabled — silently drop
    }
  }, [plans, hydrated]);

  // Which inline picker (swap / add) is open, if any.
  const [picker, setPicker] = useState<
    | {
        mode: "swap";
        bucket: string;
        replaceProductId: number;
      }
    | { mode: "add"; bucket: string }
    | null
  >(null);

  const [justAdded, setJustAdded] = useState(false);

  const tier = tiers.find((t) => t.key === activeKey)!;
  const plan = plans[activeKey];

  // Derived: hydrated line list for the active tier, grouped by bucket.
  const { grouped, totalMinor, includedCount, totalCount, minorUnit } =
    useMemo(() => {
      const lines = plan
        .map((l) => {
          const p = productById.get(l.productId);
          if (!p) return null;
          const bucket = productBucket(p, catalogByBucket);
          return { product: p, qty: l.qty, included: l.included, bucket };
        })
        .filter((x): x is NonNullable<typeof x> => Boolean(x));

      let total = 0;
      let included = 0;
      let count = 0;
      let mu = 2;
      const map = new Map<string, typeof lines>();
      for (const line of lines) {
        count += line.qty;
        mu = line.product.prices.currency_minor_unit;
        if (line.included) {
          const unit = Number(
            line.product.on_sale
              ? line.product.prices.sale_price
              : line.product.prices.price,
          );
          total += unit * line.qty;
          included += line.qty;
        }
        const arr = map.get(line.bucket) ?? [];
        arr.push(line);
        map.set(line.bucket, arr);
      }

      // Order: known buckets in canonical order, then any others.
      const orderedKeys = [
        ...BUCKET_ORDER.filter((b) => map.has(b)),
        ...[...map.keys()].filter(
          (b) => !BUCKET_ORDER.includes(b as (typeof BUCKET_ORDER)[number]),
        ),
      ];
      return {
        grouped: orderedKeys.map((b) => ({ bucket: b, lines: map.get(b)! })),
        totalMinor: total,
        includedCount: included,
        totalCount: count,
        minorUnit: mu,
      };
    }, [plan, productById, catalogByBucket]);

  function selectTier(key: BundleTierKey) {
    setActiveKey(key);
    setPicker(null);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tier", key);
    router.replace(`?${params.toString()}#plan`, { scroll: false });
    if (typeof document !== "undefined") {
      document
        .getElementById("plan")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function updatePlan(next: LineState[]) {
    setPlans((prev) => ({ ...prev, [activeKey]: next }));
  }

  function toggleItem(productId: number) {
    updatePlan(
      plan.map((l) =>
        l.productId === productId ? { ...l, included: !l.included } : l,
      ),
    );
  }
  function setQty(productId: number, qty: number) {
    updatePlan(
      plan.map((l) =>
        l.productId === productId ? { ...l, qty: Math.max(1, qty) } : l,
      ),
    );
  }
  function removeLine(productId: number) {
    updatePlan(plan.filter((l) => l.productId !== productId));
  }
  function swapLine(oldId: number, newId: number) {
    const existing = plan.find((l) => l.productId === oldId);
    const qty = existing?.qty ?? 1;
    const included = existing?.included ?? true;
    // If newId already in plan, merge qty and drop old.
    const alreadyInPlan = plan.find((l) => l.productId === newId);
    if (alreadyInPlan) {
      updatePlan(
        plan
          .filter((l) => l.productId !== oldId)
          .map((l) =>
            l.productId === newId ? { ...l, qty: l.qty + qty, included } : l,
          ),
      );
      return;
    }
    updatePlan(
      plan.map((l) =>
        l.productId === oldId
          ? { productId: newId, qty, included: true }
          : l,
      ),
    );
  }
  function addLine(productId: number) {
    if (plan.some((l) => l.productId === productId)) {
      // Already present — just ensure it's included.
      updatePlan(
        plan.map((l) =>
          l.productId === productId ? { ...l, included: true } : l,
        ),
      );
      return;
    }
    updatePlan([...plan, { productId, qty: 1, included: true }]);
  }

  function resetActiveTier() {
    setPlans((prev) => ({ ...prev, [activeKey]: defaultPlans[activeKey] }));
    setPicker(null);
  }

  // Whether the active tier's plan differs from its default (used to show /
  // hide the Reset button).
  const isCustomized = useMemo(() => {
    const a = plan;
    const b = defaultPlans[activeKey];
    if (a.length !== b.length) return true;
    // Order-agnostic comparison by productId.
    const byId = new Map(b.map((l) => [l.productId, l] as const));
    for (const line of a) {
      const ref = byId.get(line.productId);
      if (!ref) return true;
      if (ref.qty !== line.qty || line.included !== true) return true;
    }
    return false;
  }, [plan, defaultPlans, activeKey]);

  function handleAddAll() {
    for (const l of plan) {
      if (!l.included) continue;
      const p = productById.get(l.productId);
      if (!p) continue;
      addItem({ id: p.id, slug: p.slug, qty: l.qty });
    }
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1800);
  }

  return (
    <>
      {/* Tier selector */}
      <section className="mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tiers.map((t) => (
            <TierCard
              key={t.key}
              tier={t}
              active={t.key === activeKey}
              onSelect={() => selectTier(t.key)}
            />
          ))}
        </div>
      </section>

      {/* Sticky summary + detail */}
      <section
        id="plan"
        className="mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24 mt-10 scroll-mt-6"
      >
        <SummaryBar
          tier={tier}
          includedCount={includedCount}
          totalCount={totalCount}
          totalMinor={totalMinor}
          minorUnit={minorUnit}
          justAdded={justAdded}
          onAddAll={handleAddAll}
          onReset={isCustomized ? resetActiveTier : undefined}
          sticky
        />

        {/* Grouped items */}
        <div className="space-y-6 mt-4">
          {grouped.map(({ bucket, lines }) => {
            const bucketCatalog = catalogByBucket[bucket] ?? [];
            const pickerForThisBucket =
              picker && picker.bucket === bucket ? picker : null;
            return (
              <div
                key={bucket}
                className="bg-white rounded-2xl border border-border overflow-hidden"
              >
                <div className="flex items-center justify-between px-5 sm:px-6 py-3 border-b border-border">
                  <h3 className="font-bold text-foreground text-sm uppercase tracking-wide">
                    {bucket}
                  </h3>
                  <span className="text-[12px] text-foreground-muted">
                    {lines.length}{" "}
                    {lines.length === 1 ? "product" : "products"}
                  </span>
                </div>
                <ul className="divide-y divide-border">
                  {lines.map(({ product: p, qty, included }) => {
                    const unit = Number(
                      p.on_sale ? p.prices.sale_price : p.prices.price,
                    );
                    const lineMinor = unit * qty;
                    const img = p.images?.[0];
                    const swapOpen =
                      pickerForThisBucket?.mode === "swap" &&
                      pickerForThisBucket.replaceProductId === p.id;
                    return (
                      <li
                        key={p.id}
                        className={`transition-opacity ${included ? "" : "opacity-50"}`}
                      >
                        <div className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3">
                          <Link
                            href={`/product/${p.slug}`}
                            className="relative w-12 h-12 sm:w-14 sm:h-14 shrink-0 bg-background rounded-lg overflow-hidden"
                            aria-label={p.name}
                          >
                            {img && (
                              <Image
                                src={img.src}
                                alt={img.alt || p.name}
                                fill
                                sizes="56px"
                                className="object-contain"
                              />
                            )}
                          </Link>
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/product/${p.slug}`}
                              className="font-semibold text-foreground hover:text-brand text-sm line-clamp-2 block"
                            >
                              {p.name}
                            </Link>
                            <p className="text-[12px] text-foreground-muted mt-0.5 font-meta">
                              {formatPrice(unit, minorUnit)}
                            </p>
                          </div>
                          <QtySmall
                            qty={qty}
                            onChange={(n) => setQty(p.id, n)}
                          />
                          <span
                            className={`font-meta font-bold text-sm whitespace-nowrap w-20 text-right ${
                              included ? "text-foreground" : "line-through"
                            }`}
                          >
                            {formatPrice(lineMinor, minorUnit)}
                          </span>
                          <IconBtn
                            title="Swap product"
                            active={swapOpen}
                            onClick={() =>
                              setPicker(
                                swapOpen
                                  ? null
                                  : {
                                      mode: "swap",
                                      bucket,
                                      replaceProductId: p.id,
                                    },
                              )
                            }
                          >
                            <polyline points="17 1 21 5 17 9" />
                            <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                            <polyline points="7 23 3 19 7 15" />
                            <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                          </IconBtn>
                          <IconBtn
                            title="Remove from plan"
                            onClick={() => removeLine(p.id)}
                            danger
                          >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </IconBtn>
                          <ToggleSwitch
                            checked={included}
                            onChange={() => toggleItem(p.id)}
                            label={`Include ${p.name}`}
                          />
                        </div>

                        {swapOpen && (
                          <ProductPicker
                            title={`Swap “${p.name}” for…`}
                            catalog={bucketCatalog}
                            excludeIds={new Set(plan.map((l) => l.productId))}
                            onPick={(newId) => {
                              swapLine(p.id, newId);
                              setPicker(null);
                            }}
                            onClose={() => setPicker(null)}
                          />
                        )}
                      </li>
                    );
                  })}
                </ul>

                {/* Bucket footer: + Add product */}
                <div className="px-4 sm:px-6 py-3 border-t border-border bg-background/40">
                  {pickerForThisBucket?.mode === "add" ? (
                    <ProductPicker
                      title={`Add another ${bucket.toLowerCase()} product`}
                      catalog={bucketCatalog}
                      excludeIds={new Set(plan.map((l) => l.productId))}
                      onPick={(id) => {
                        addLine(id);
                        setPicker(null);
                      }}
                      onClose={() => setPicker(null)}
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPicker({ mode: "add", bucket })}
                      className="w-full text-left inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand-dark"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        aria-hidden
                      >
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      Add another {bucket.toLowerCase()} product
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom total bar — mirrors the sticky one */}
        <div className="mt-6">
          <SummaryBar
            tier={tier}
            includedCount={includedCount}
            totalCount={totalCount}
            totalMinor={totalMinor}
            minorUnit={minorUnit}
            justAdded={justAdded}
            onAddAll={handleAddAll}
            onReset={isCustomized ? resetActiveTier : undefined}
          />
        </div>
      </section>
    </>
  );
}

function productBucket(
  p: WcProduct,
  catalogByBucket: Record<string, WcProduct[]>,
): string {
  for (const [b, list] of Object.entries(catalogByBucket)) {
    if (list.some((x) => x.id === p.id)) return b;
  }
  return "Fresh Produce";
}

function SummaryBar({
  tier,
  includedCount,
  totalCount,
  totalMinor,
  minorUnit,
  justAdded,
  onAddAll,
  onReset,
  sticky,
}: {
  tier: HydratedTier;
  includedCount: number;
  totalCount: number;
  totalMinor: number;
  minorUnit: number;
  justAdded: boolean;
  onAddAll: () => void;
  onReset?: () => void;
  sticky?: boolean;
}) {
  return (
    <div className={sticky ? "sticky top-2 z-20" : ""}>
      <div className="bg-white rounded-2xl border border-border shadow-sm px-4 sm:px-5 py-3 flex items-center gap-3 flex-wrap">
        <div className={`w-2 h-8 rounded-full ${tier.accent}`} />
        <div className="flex-1 min-w-[180px]">
          <p className="text-[11px] uppercase tracking-wide font-bold text-foreground-muted flex items-center gap-2 flex-wrap">
            {tier.name} · {tier.household}
            {onReset && (
              <span className="inline-flex items-center gap-1 text-[10px] bg-amber-400/20 text-amber-700 rounded-full px-2 py-0.5 normal-case tracking-normal font-semibold">
                <span className="w-1 h-1 rounded-full bg-amber-600" />
                Customized · saved
              </span>
            )}
          </p>
          <p className="text-sm">
            <span className="font-semibold text-foreground">
              {includedCount}
            </span>{" "}
            <span className="text-foreground-muted">of {totalCount} items</span>{" "}
            <span className="text-foreground-muted">·</span>{" "}
            <span className="font-meta font-bold text-brand-2">
              {formatPrice(totalMinor, minorUnit)}
            </span>{" "}
            <span className="text-foreground-muted text-[12px]">
              (target ~Rs {tier.targetRs.toLocaleString()})
            </span>
          </p>
        </div>
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="text-[12px] font-semibold text-foreground-muted hover:text-brand underline underline-offset-2 shrink-0"
          >
            Reset to default
          </button>
        )}
        <button
          type="button"
          onClick={onAddAll}
          disabled={includedCount === 0}
          className={[
            "rounded-full h-11 px-5 font-semibold text-sm transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed",
            justAdded
              ? "bg-[#5a8a3d] text-white"
              : "bg-brand text-white hover:bg-brand-dark",
          ].join(" ")}
        >
          {justAdded
            ? `Added ${includedCount} items ✓`
            : `Add all to cart`}
        </button>
      </div>
    </div>
  );
}

function TierCard({
  tier,
  active,
  onSelect,
}: {
  tier: HydratedTier;
  active: boolean;
  onSelect: () => void;
}) {
  const isFamily = tier.key === "family";

  // Per-tier visual palette — replaces the basic accent classes with a
  // gradient + accent-fg pair so each card carries a distinct mood while
  // sharing the same editorial language.
  const palette: Record<
    string,
    { gradient: string; tintFg: string; tintBg: string; ring: string }
  > = {
    essentials: {
      gradient:
        "linear-gradient(160deg, #eef3dd 0%, #cbd9a8 60%, #8eac6b 100%)",
      tintFg: "#5e7f54",
      tintBg: "#dde7c5",
      ring: "rgba(94,127,84,0.35)",
    },
    family: {
      gradient:
        "linear-gradient(160deg, #f4e6ec 0%, #e2c2cf 55%, #b75a74 100%)",
      tintFg: "#82445a",
      tintBg: "#e7d3da",
      ring: "rgba(130,68,90,0.35)",
    },
    household: {
      gradient:
        "linear-gradient(160deg, #fff3d4 0%, #f0d99a 55%, #d8b765 100%)",
      tintFg: "#a98937",
      tintBg: "#f5e7c4",
      ring: "rgba(169,137,55,0.35)",
    },
  };
  const p = palette[tier.key as string] ?? palette.essentials;

  // Index used for the editorial N° marker.
  const indexLabel: Record<string, string> = {
    essentials: "01",
    family: "02",
    household: "03",
  };
  const numeral = indexLabel[tier.key as string] ?? "01";

  const tierUpper = tier.name.toUpperCase();

  return (
    <article
      className={[
        "group relative bg-white rounded-[28px] overflow-hidden transition-all duration-500",
        "ring-1 hover:-translate-y-1 hover:shadow-[0_24px_55px_-30px_rgba(92,51,66,0.45)]",
        active
          ? "ring-2 ring-brand shadow-[0_24px_55px_-30px_rgba(183,90,116,0.6)]"
          : "ring-border hover:ring-brand/30",
      ].join(" ")}
    >
      {/* Thin per-tier accent stripe at the very top of the card — same
          subtle accent rhythm /shop uses for category chips. No gradient. */}
      <span
        aria-hidden
        className="block h-1 w-full"
        style={{ backgroundColor: p.tintFg }}
      />

      {/* Header band — clean white, matches /shop ShopToolbar voice. */}
      <div className="relative px-6 sm:px-7 pt-6 pb-5 border-b border-dashed border-foreground/15">
        {/* Top rail: N° marker + optional MOST POPULAR sticker */}
        <div className="flex items-start justify-between gap-3">
          <span className="font-fraunces italic text-foreground-muted text-[12px] tracking-[0.22em]">
            <span className="text-foreground/45">N°</span>
            {numeral}
          </span>

          {isFamily && (
            <span
              aria-hidden
              className="inline-flex items-center gap-1.5 bg-brand-soft/60 text-brand text-[10px] font-bold uppercase tracking-[0.18em] rounded-full px-2.5 py-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-brand" />
              Most popular
            </span>
          )}
        </div>

        {/* Tier icon disc + eyebrow — sits on the white header */}
        <div className="mt-4 flex items-center gap-3">
          <span
            className="inline-flex items-center justify-center w-11 h-11 rounded-xl shrink-0 transition-transform duration-500 group-hover:rotate-[-6deg] group-hover:scale-[1.05]"
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
              <path d={tier.iconPath} />
            </svg>
          </span>
          <div className="min-w-0">
            <p
              className="text-[10.5px] font-semibold uppercase tracking-[0.22em]"
              style={{ color: p.tintFg }}
            >
              {tierUpper}
            </p>
            <p className="text-[11.5px] text-foreground-muted mt-0.5">
              {tier.household}
            </p>
          </div>
        </div>
      </div>

      {/* Body — eyebrow already lives in the header band, so we open
          straight into the tagline. */}
      <div className="px-6 sm:px-7 pt-5 pb-7">
        <h2 className="font-fraunces text-foreground text-[22px] leading-[1.15] font-semibold">
          {tier.tagline.endsWith(".") ? tier.tagline.slice(0, -1) : tier.tagline}
          <span className="text-brand">.</span>
        </h2>

        {/* Price block */}
        <div className="mt-5 flex items-baseline gap-2 flex-wrap">
          <span className="font-fraunces italic text-foreground-muted text-[13px]">
            target monthly box ·
          </span>
          <span className="font-fraunces font-semibold text-foreground text-[28px] leading-none tabular-nums">
            ~Rs {tier.targetRs.toLocaleString()}
          </span>
        </div>

        {/* Includes */}
        <div className="mt-5 pt-5 border-t border-dashed border-foreground/15">
          <div className="flex items-baseline justify-between gap-2 mb-2.5">
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-foreground-muted">
              Inside
            </span>
            <span className="font-fraunces italic text-foreground-muted text-[12px]">
              <span className="tabular-nums">{tier.lines.length}</span> items
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {tier.preview.map((item) => (
              <span
                key={item}
                className="text-[12px] font-medium rounded-full px-2.5 py-1"
                style={{ backgroundColor: p.tintBg, color: p.tintFg }}
              >
                {item}
              </span>
            ))}
            {tier.lines.length > tier.preview.length && (
              <span className="text-[12px] rounded-full px-2.5 py-1 bg-background text-foreground-muted font-fraunces italic">
                +{tier.lines.length - tier.preview.length} more
              </span>
            )}
          </div>
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={onSelect}
          aria-pressed={active}
          className={[
            "mt-6 w-full inline-flex items-center justify-center gap-2 rounded-full h-12 font-semibold text-[13.5px] tracking-wide transition-all duration-200 active:scale-[0.99]",
            active
              ? "bg-[#5e7f54] text-white shadow-[0_10px_24px_-12px_rgba(94,127,84,0.55)] cursor-default"
              : "bg-brand text-white hover:bg-brand-dark shadow-[0_10px_24px_-12px_rgba(183,90,116,0.6)]",
          ].join(" ")}
        >
          {active ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Selected — customise below
            </>
          ) : (
            <>
              Choose this box
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="13 5 20 12 13 19" />
              </svg>
            </>
          )}
        </button>
      </div>
    </article>
  );
}

function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={[
        "relative inline-flex items-center h-6 w-11 rounded-full transition-colors shrink-0",
        checked ? "bg-brand" : "bg-border",
      ].join(" ")}
    >
      <span
        className={[
          "inline-block w-4 h-4 rounded-full bg-white shadow transform transition-transform",
          checked ? "translate-x-6" : "translate-x-1",
        ].join(" ")}
      />
    </button>
  );
}

function QtySmall({
  qty,
  onChange,
}: {
  qty: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="inline-flex items-center bg-white border border-border rounded-full h-8">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, qty - 1))}
        className="w-7 h-8 flex items-center justify-center text-brand hover:bg-brand-soft/40 rounded-l-full"
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className="w-6 text-center text-brand font-bold text-sm tabular-nums">
        {qty}
      </span>
      <button
        type="button"
        onClick={() => onChange(qty + 1)}
        className="w-7 h-8 flex items-center justify-center text-brand hover:bg-brand-soft/40 rounded-r-full"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}

function IconBtn({
  title,
  onClick,
  active,
  danger,
  children,
}: {
  title: string;
  onClick: () => void;
  active?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className={[
        "inline-flex items-center justify-center w-8 h-8 rounded-full border transition-colors shrink-0",
        active
          ? "bg-brand text-white border-brand"
          : danger
            ? "border-border text-foreground-muted hover:text-[#c43f3f] hover:border-[#c43f3f]"
            : "border-border text-foreground-muted hover:text-brand hover:border-brand",
      ].join(" ")}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        {children}
      </svg>
    </button>
  );
}

function ProductPicker({
  title,
  catalog,
  excludeIds,
  onPick,
  onClose,
}: {
  title: string;
  catalog: WcProduct[];
  excludeIds: Set<number>;
  onPick: (id: number) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const available = catalog.filter((p) => !excludeIds.has(p.id));
  const filtered = query.trim()
    ? available.filter((p) =>
        p.name.toLowerCase().includes(query.trim().toLowerCase()),
      )
    : available;

  return (
    <div className="bg-brand-soft/25 border-t border-border px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-bold text-brand">{title}</p>
        <button
          type="button"
          onClick={onClose}
          className="text-[12px] text-foreground-muted hover:text-brand font-semibold"
        >
          Cancel
        </button>
      </div>

      <div className="mb-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products…"
          className="w-full bg-white border border-border rounded-full h-9 px-4 text-sm focus:outline-none focus:border-brand"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-foreground-muted py-4 text-center">
          {available.length === 0
            ? "No more products available in this category."
            : "No products match your search."}
        </p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[280px] overflow-y-auto">
          {filtered.map((p) => {
            const img = p.images?.[0];
            const unit = Number(
              p.on_sale ? p.prices.sale_price : p.prices.price,
            );
            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => onPick(p.id)}
                  className="w-full flex items-center gap-3 bg-white border border-border rounded-xl p-2.5 hover:border-brand hover:shadow-sm transition-all text-left"
                >
                  <div className="relative w-10 h-10 shrink-0 bg-background rounded-lg overflow-hidden">
                    {img && (
                      <Image
                        src={img.src}
                        alt={img.alt || p.name}
                        fill
                        sizes="40px"
                        className="object-contain"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground line-clamp-1">
                      {p.name}
                    </p>
                    <p className="text-[12px] font-meta text-brand-2">
                      {formatPrice(unit, p.prices.currency_minor_unit)}
                    </p>
                  </div>
                  <span className="text-brand text-lg font-bold leading-none shrink-0">
                    +
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
