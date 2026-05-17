// Delivery address persisted to localStorage. No backend yet — when
// Supabase lands, swap the storage layer (components won't change).

"use client";

export type DeliveryAddress = {
  fullName: string;
  phone: string;
  street: string;
  village: string;
  district: string;
  country: string;
  landmark: string;
  notes: string;
  lat: number | null;
  lng: number | null;
  savedAt: number;
};

export const ADDRESS_KEY = "nulakaz-delivery-address";
export const ADDRESS_EVENT = "nulakaz-address-changed";

// Roughly the geographical center of Mauritius — used to center the map
// when no address is saved yet.
export const MU_CENTER = { lat: -20.3484, lng: 57.5522 };

export const EMPTY_ADDRESS: DeliveryAddress = {
  fullName: "",
  phone: "",
  street: "",
  village: "",
  district: "",
  country: "Mauritius",
  landmark: "",
  notes: "",
  lat: null,
  lng: null,
  savedAt: 0,
};

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function emit() {
  if (!isBrowser()) return;
  window.dispatchEvent(new CustomEvent(ADDRESS_EVENT));
}

export function getDeliveryAddress(): DeliveryAddress | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(ADDRESS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return { ...EMPTY_ADDRESS, ...(parsed as Partial<DeliveryAddress>) };
  } catch {
    return null;
  }
}

export function saveDeliveryAddress(addr: DeliveryAddress) {
  if (!isBrowser()) return;
  const next = { ...addr, savedAt: Date.now() };
  window.localStorage.setItem(ADDRESS_KEY, JSON.stringify(next));
  emit();
}

export function clearDeliveryAddress() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(ADDRESS_KEY);
  emit();
}
