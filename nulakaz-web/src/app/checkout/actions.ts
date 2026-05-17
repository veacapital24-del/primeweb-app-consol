"use server";

import { catalogClient } from "@/lib/supabase/anon";

export type OrderLine = {
  slug: string;
  qty: number;
};

export type PlaceOrderInput = {
  fullName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  district: string;
  notes: string;
  deliveryDate: string;
  payment: "cash" | "card" | "mcb-juice";
  lines: OrderLine[];
  // 'web' for self-service checkout (default); 'whatsapp' when the user
  // chose the "Send via WhatsApp" alternative — same DB row shape, but
  // the console / orders feed colour-tags it so staff know to follow up
  // in the chat thread before fulfilling.
  channel?: "web" | "whatsapp";
};

export type PlaceOrderResult =
  | { ok: true; orderNumber: string; orderId: string }
  | { ok: false; error: string };

// Persists a storefront checkout to the shared `orders` + `order_items`
// tables that the admin console reads. Pricing is recomputed server-side
// from the products table — the client can't influence the line-item
// prices, only which slugs are in the cart and at what quantity.
//
// Address + payment + delivery date have no dedicated columns yet, so
// they go into `orders.notes` as a structured blob that's still readable
// from the console's order detail. Migrate to first-class columns when
// the next schema change lands.
export async function placeOrder(
  input: PlaceOrderInput,
): Promise<PlaceOrderResult> {
  const fullName = input.fullName.trim();
  const email = input.email.trim();
  const phone = input.phone.trim();
  const street = input.street.trim();
  const city = input.city.trim();
  const district = input.district.trim();

  if (!fullName) return { ok: false, error: "Full name is required." };
  if (!email || !email.includes("@"))
    return { ok: false, error: "A valid email is required." };
  if (!phone) return { ok: false, error: "Phone number is required." };
  if (!street) return { ok: false, error: "Street address is required." };
  if (!input.lines.length)
    return { ok: false, error: "Your trolley is empty." };

  const sb = catalogClient();

  // Resolve every slug → real product row in one query so the prices we
  // store are server-trusted. A missing slug aborts the whole order.
  const slugs = Array.from(new Set(input.lines.map((l) => l.slug)));
  const { data: products, error: lookupErr } = await sb
    .from("products")
    .select("id, slug, name, retail_price_mur, active")
    .in("slug", slugs);
  if (lookupErr) return { ok: false, error: lookupErr.message };

  const bySlug = new Map(
    (products ?? []).map((p) => [p.slug, p] as const),
  );

  type ItemInsert = {
    product_id: string;
    qty: number;
    unit_price_mur: number;
  };
  const itemInserts: ItemInsert[] = [];
  let subtotal = 0;
  for (const line of input.lines) {
    const p = bySlug.get(line.slug);
    if (!p)
      return {
        ok: false,
        error: `Product "${line.slug}" is no longer available — please refresh your trolley.`,
      };
    if (!p.active)
      return {
        ok: false,
        error: `${p.name} has been discontinued — remove it from your trolley to continue.`,
      };
    const qty = Math.max(1, Math.floor(line.qty));
    const unitPrice = Number(p.retail_price_mur);
    subtotal += unitPrice * qty;
    itemInserts.push({
      product_id: p.id,
      qty,
      unit_price_mur: unitPrice,
    });
  }

  // Build a single readable address blob for `orders.notes`. The console
  // surfaces this on the order detail; a future migration can promote
  // these fields to first-class columns + JSONB.
  const noteParts = [
    `Email: ${email}`,
    `Address: ${[street, city, district].filter(Boolean).join(", ")}`,
    input.notes ? `Notes: ${input.notes}` : null,
    input.deliveryDate ? `Delivery: ${input.deliveryDate}` : null,
    `Payment: ${input.payment}`,
  ].filter(Boolean) as string[];

  // ─── Insert order ────
  const channel = input.channel === "whatsapp" ? "whatsapp" : "web";
  const { data: order, error: orderErr } = await sb
    .from("orders")
    .insert({
      channel,
      subtotal_mur: subtotal,
      status: "pending",
      customer_name: fullName,
      // `whatsapp_phone` is the only phone column today — reused for any
      // contact phone until the schema gets a dedicated `phone` column.
      whatsapp_phone: phone,
      notes: noteParts.join(" · "),
    })
    .select("id, order_number")
    .single();

  if (orderErr || !order)
    return {
      ok: false,
      error: orderErr?.message ?? "Failed to create order.",
    };

  // ─── Insert items ────
  const itemsWithOrderId = itemInserts.map((it) => ({
    ...it,
    order_id: order.id,
  }));
  const { error: itemsErr } = await sb
    .from("order_items")
    .insert(itemsWithOrderId);

  if (itemsErr) {
    // Best-effort cleanup so we don't leave an orphaned `orders` row.
    await sb.from("orders").delete().eq("id", order.id);
    return { ok: false, error: itemsErr.message };
  }

  return { ok: true, orderNumber: order.order_number, orderId: order.id };
}
