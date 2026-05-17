"use client";

import { useState } from "react";

// −/+ quantity control used on the product detail page.
// Client-only because it holds local count state.
export function QuantityStepper({ initial = 1 }: { initial?: number }) {
  const [qty, setQty] = useState(initial);
  return (
    <div className="inline-flex items-center bg-white border border-border rounded-full">
      <button
        type="button"
        onClick={() => setQty((q) => Math.max(1, q - 1))}
        className="w-10 h-10 flex items-center justify-center text-brand hover:bg-brand-soft/40 rounded-l-full"
        aria-label="Decrease quantity"
      >
        −
      </button>
      <input
        type="number"
        min={1}
        value={qty}
        onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
        className="w-12 text-center bg-transparent text-brand font-bold outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button
        type="button"
        onClick={() => setQty((q) => q + 1)}
        className="w-10 h-10 flex items-center justify-center text-brand hover:bg-brand-soft/40 rounded-r-full"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
