// Client-side cart persisted to localStorage. No backend — when the user
// clicks "Add to cart", we write here and fire a CustomEvent so listeners
// (header badge, cart page) update live.
//
// All functions are SSR-safe: they no-op when window is undefined.

"use client";

export type CartItem = {
  id: number;
  slug: string;
  qty: number;
  addedAt: number;
};

export const CART_KEY = "nulakaz-cart";
export const CART_EVENT = "nulakaz-cart-changed";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function emit() {
  if (!isBrowser()) return;
  window.dispatchEvent(new CustomEvent(CART_EVENT));
}

export function getCart(): CartItem[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(CART_KEY, JSON.stringify(items));
  emit();
}

export function getCartCount(): number {
  return getCart().reduce((sum, it) => sum + it.qty, 0);
}

export function addItem(input: { id: number; slug: string; qty?: number }) {
  const qty = input.qty ?? 1;
  const items = getCart();
  const existing = items.find((i) => i.id === input.id);
  if (existing) {
    existing.qty += qty;
  } else {
    items.push({
      id: input.id,
      slug: input.slug,
      qty,
      addedAt: Date.now(),
    });
  }
  writeCart(items);
}

export function updateQty(id: number, qty: number) {
  if (qty <= 0) return removeItem(id);
  const items = getCart().map((i) => (i.id === id ? { ...i, qty } : i));
  writeCart(items);
}

export function removeItem(id: number) {
  writeCart(getCart().filter((i) => i.id !== id));
}

export function clearCart() {
  writeCart([]);
}
