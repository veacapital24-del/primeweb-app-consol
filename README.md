# Primeweb — Hard discount + B2B + social commerce (Mauritius)

A two-app monorepo for a Mauritian retailer + wholesaler platform.

```
PrimeWeb/
├── Prime Apps/         # Customer-facing storefront  (Next.js, port 3000)
└── Prime Bankend/      # Admin console + Supabase    (Next.js, port 3001)
```

## The three signature features

| # | Feature                | Where                                                  | Why it works in Mauritius |
|---|------------------------|--------------------------------------------------------|---------------------------|
| 1 | **Flash Inventory**    | `Prime Apps/src/components/FlashStockBadge.tsx`        | Customers won't travel if they think it's sold out — live counts via Supabase Realtime force the urgency to convert. |
| 2 | **WhatsApp Wholesale** | `Prime Apps/src/components/WhatsAppOrderButton.tsx`    | Tabagies already run on WhatsApp. Toggle "Gros", tap once, the cart arrives in the operator's WhatsApp inbox pre-formatted. |
| 3 | **Reel-to-Cart**       | `Prime Apps/src/app/reel/[slug]/page.tsx`              | Existing 10k+ followers click the bio link → land on a page with exactly the products from the reel + a one-tap WhatsApp order. |

---

## 1. Set up Supabase locally

```bash
# Install the Supabase CLI once
brew install supabase/tap/supabase

cd "Prime Bankend"
supabase start                   # boots Postgres, Studio, Realtime, Auth
supabase db reset                # applies migrations + seed
```

After `supabase start` finishes, copy the printed `anon key` and `service_role key` into the two `.env.local` files (see step 2).

Studio runs at <http://127.0.0.1:54323>.

## 2. Configure environment

```bash
cp "Prime Apps/.env.local.example"     "Prime Apps/.env.local"
cp "Prime Bankend/.env.local.example"  "Prime Bankend/.env.local"
```

Fill in `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` in **both** files from the values printed by `supabase start`.

`NEXT_PUBLIC_WHATSAPP_BUSINESS_PHONE` is the number that receives the orders (E.164 without the `+`, e.g. `23057000000` for Mauritius).

## 3. Run the apps

In two terminals:

```bash
cd "Prime Apps"     && npm install && npm run dev   # http://localhost:3000
cd "Prime Bankend"  && npm install && npm run dev   # http://localhost:3001
```

## 4. Try the demo flows

- **Flash Inventory**: open the storefront and the admin side-by-side. In the admin go to *Inventory*, decrement a product. Watch the storefront badge update to "Only N left" within ~1 second.
- **WhatsApp Wholesale**: on the storefront, switch the header toggle to *Gros / Tabagie*, type a shop name, add items, hit *Order on WhatsApp* — your phone opens WhatsApp with the cart pre-written in French.
- **Reel-to-Cart**: open `http://localhost:3000/reel/rice-haul-may`. The page mirrors the reel and offers a single bulk-order button. Each tap is logged in the admin under *Reels* (view / add_to_cart / whatsapp_click / order).

---

## WhatsApp: deep-link vs Cloud API

The MVP ships with **wa.me deep-links** — no Meta account needed. Tap the order button and WhatsApp opens with the cart message pre-filled.

To switch to the **Cloud API** path (auto-confirmations, delivery receipts):

1. Get a `WHATSAPP_PHONE_NUMBER_ID` and `WHATSAPP_ACCESS_TOKEN` from Meta.
2. Set them in `Prime Bankend/.env.local` and as Supabase secrets:
   ```bash
   cd "Prime Bankend"
   supabase secrets set WHATSAPP_PHONE_NUMBER_ID=... WHATSAPP_ACCESS_TOKEN=... WHATSAPP_VERIFY_TOKEN=prime-mauritius-verify
   supabase functions deploy whatsapp-webhook --no-verify-jwt
   supabase functions deploy whatsapp-send
   ```
3. Point Meta's webhook to `https://<project>.functions.supabase.co/whatsapp-webhook` with the same verify token.

Outbound sends: `POST` to the `whatsapp-send` function with `{ phone, body, order_id? }`.

---

## Files map

```
Prime Bankend/
├── supabase/
│   ├── config.toml
│   ├── migrations/20260507000000_initial.sql      # schema + RLS + realtime publication
│   ├── seed.sql                                   # 10 products, 3 reels, low-stock triggers
│   └── functions/
│       ├── whatsapp-webhook/index.ts              # Meta inbound + status callbacks
│       └── whatsapp-send/index.ts                 # Outbound; falls back to "queued" if no token
└── src/app/
    ├── page.tsx                                   # dashboard
    ├── inventory/                                 # adjust stock → triggers Realtime to storefront
    ├── products/                                  # read-only catalog view
    ├── reels/                                     # reel performance + bio-link copy/paste
    ├── whatsapp/                                  # inbox + outbox
    └── orders/                                    # all channels (web/whatsapp/reel)

Prime Apps/
└── src/
    ├── app/
    │   ├── page.tsx                               # home: hero + hard-discount feed + flash ticker
    │   ├── flash/                                 # all flash-stock items
    │   ├── wholesale/                             # B2B catalogue (auto-flips mode)
    │   ├── reel/[slug]/                           # ★ reel-to-cart landing
    │   ├── p/[slug]/                              # product detail
    │   ├── cart/                                  # cart + WhatsApp checkout
    │   └── api/
    │       ├── track/                             # logs reel funnel events
    │       └── order/                             # persists order rows from the WhatsApp click
    ├── components/
    │   ├── FlashStockBadge.tsx                    # ★ realtime live-stock pill
    │   ├── FlashTicker.tsx                        # marquee of low-stock items
    │   ├── ProductCard.tsx                        # retail/wholesale-aware
    │   ├── WhatsAppOrderButton.tsx                # ★ deep-link composer
    │   ├── ModeToggle.tsx                         # ★ retail ⇄ wholesale switch in header
    │   └── ReelTracker.tsx                        # fires 'view' on mount
    └── lib/
        ├── cart.ts                                # localStorage cart + mode + shop name
        ├── whatsapp.ts                            # message builder + wa.me link
        └── supabase.ts                            # browser/server/admin clients
```

---

## Cheat sheet

| Action                        | Command                                                        |
|-------------------------------|----------------------------------------------------------------|
| Reset DB (re-runs seed)       | `cd "Prime Bankend" && supabase db reset`                      |
| Open Supabase Studio          | <http://127.0.0.1:54323>                                       |
| Storefront                    | <http://localhost:3000>                                        |
| Admin                         | <http://localhost:3001>                                        |
| Sample reel landing           | <http://localhost:3000/reel/rice-haul-may>                     |
| Sample reel landing (B2B)     | <http://localhost:3000/reel/tabagie-restock>                   |
