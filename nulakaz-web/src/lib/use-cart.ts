"use client";

import { useEffect, useState } from "react";
import { CART_EVENT, getCart, type CartItem } from "./cart-store";

// Reactive read of the cart. Subscribes to the CART_EVENT so any change
// (add/remove/update from anywhere in the app) re-renders consumers.
// Also listens to `storage` events so cross-tab mutations sync.
export function useCart(): CartItem[] {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(getCart());
    const sync = () => setItems(getCart());
    window.addEventListener(CART_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CART_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return items;
}

export function useCartCount(): number {
  const items = useCart();
  return items.reduce((sum, it) => sum + it.qty, 0);
}
