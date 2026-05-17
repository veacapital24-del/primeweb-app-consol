import { site } from "./site";

// Convert WC Store API price strings (integer in minor units as string, e.g. "1000")
// into a human "₨10.00" display string.
export function formatPrice(
  amount: string | number,
  minorUnit: number = site.currency.decimals,
): string {
  const n = typeof amount === "string" ? Number(amount) : amount;
  if (!Number.isFinite(n)) return `${site.currency.symbol}0.00`;
  const value = n / Math.pow(10, minorUnit);
  return `${site.currency.symbol}${value.toFixed(2)}`;
}

export function formatPriceRange(
  min: string,
  max: string,
  minorUnit: number = site.currency.decimals,
): string {
  if (min === max) return formatPrice(min, minorUnit);
  return `${formatPrice(min, minorUnit)} – ${formatPrice(max, minorUnit)}`;
}

// Strip raw HTML out of a WC description/short_description — the Store API returns
// escaped HTML (e.g. "&lt;p&gt;…&lt;/p&gt;") or raw HTML depending on field.
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
