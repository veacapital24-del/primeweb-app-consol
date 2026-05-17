# nulakaz.com — Site Inventory

Snapshot taken 2026-04-16 via public WP REST API + live crawl (maintenance mode was temporarily off).

## Business snapshot

- **Brand:** NuLakaz ("Mo Lakaz" = "My Home" in Mauritian Creole) — online grocery
- **Logo asset:** `wp-content/uploads/2025/08/Mo-Lakaz-Logo-2025.webp` (id 3298)
- **Market:** Mauritius (phone +230, address 222 Royal Road Riche Terre)
- **Currency:** ₨ Mauritian Rupee (MUR)
- **Timezone:** GMT+4
- **Contact:** info@nulakaz.com · +230 5488 9652 · Mon-Fri 10:00-18:00
- **Delivery promise:** Next-day delivery, Mon-Fri 10am-6pm; free delivery over Rs 1000
- **Tagline:** "We provide a carefully curated selection of household staples, fresh produce, dry goods, snacks, and essential kitchen items sourced both locally and globally delivered straight to your door"

## Tech stack (original)

- WordPress + WooCommerce + Elementor
- Jetpack, LiteSpeed Cache, Contact Form 7, Google Site Kit
- Hostinger (host), Hostinger Easy Onboarding / AI Assistant plugins
- Theme assets use `tastydaily-*` filename prefix → likely based on a TastyDaily grocery theme

## Design tokens (observed)

| Token | Value |
|---|---|
| Page background | `#f8f2f4` (soft pink/mauve) |
| Button/CTA | `#32373c` (charcoal) |
| Text (primary) | WP default dark |
| Sale badge | red |
| Font (body) | system sans-serif (WP default) |
| Font (currency/meta) | Georgia serif (13px) |
| Button size | 1.125em |

> We'll refine/brand these during the Next.js rebuild. Capture actual computed CSS via DevTools before committing to tokens in `tailwind.config`.

## Navigation (primary header menu)

```
All Categories
├─ Milk
├─ Fresh Produce
│  └─ Fresh Fruit
│     ├─ Apple & Stone Fruits
│     ├─ Berries
│     └─ Tropical & Exotic
├─ Meat
├─ Seafood
├─ Baking
└─ Drinks
```

**Utility nav:** Home · Shop · Monthly Essentials · Brands · Order Tracking · Contacts
**Announcement bar:** "Delivery on next day, from Mon-Fri from 10am - 6pm"

## Homepage sections (in order)

1. Hero / global search — "What Are You Looking For?"
2. Featured categories grid (Others, Essentials, Fresh Produce, Meat, Seafood, Cheese, Milk)
3. Newsletter hero — "Don't Miss Out on Tasty Grocery Deals!" (Contact Form 7)
4. Popular products tab
5. Top Rated products tab
6. "Sweet Organic Drinks" banner
7. **Big Sales Today** — countdown timer + discounted products (-11% to -38%)
8. Our Blog — 6 featured posts
9. Testimonials (Katrine Johns, Marc Emerson, Mary London)
10. Trust strip — Free Delivery · Satisfaction Guarantee · Top-Notch Support · Secure Payments
11. 24/7 Support block — phone `+230 5778525`
12. Brand logos carousel — Pure Citrus, Earth Check, Crystal Cove, Good Life Organic, Vita Coco, James White

## Footer

- **Col 1 – Useful Links:** FAQ · Blogs · Shipping Policy · Refund Policy · Privacy Policy · Terms and Conditions
- **Col 2 – Company:** Logo · tagline · 4 social icons
- **Col 3 – Newsletter:** "Sign up to get 10% off your first order…" + 6 payment method icons
- **Bottom bar:** "© 2025 NuLaz Online Grocery All Rights Reserved"

## Pages (22 total, from `wp/v2/pages`)

| ID | Slug | Title |
|---|---|---|
| 608 | `home-2` | Home (mapped to `/`) |
| 2870 | `shop` | Shop (Woo template, empty content field) |
| 3268 | `monthly-essentials` | Monthly Essentials |
| 2977 | `top-rated` | Top Rated |
| 2963 | `popular` | Popular |
| 2949 | `on-sale` | On Sale |
| 2908 | `newest` | Newest |
| 2903 | `featured` | Featured |
| 2368 | `order-tracking` | Order Tracking |
| 2205 | `brands-2` | Brands |
| 2199 | `brands-1` | Brands |
| 1727 | `faq` | FAQ |
| 1704 | `contacts` | Contacts |
| 1657 | `privacy-policy` | Privacy Policy |
| 3242 | `shipping-policy` | Shipping Policy |
| 3235 | `refund-policy` | Refund Policy |
| 3233 | `terms-and-conditions` | Terms and Conditions |
| 1080 | `blog` | Blog |
| 477 | `wishlist` | Wishlist |
| 9 | `my-account` | My account |
| 8 | `checkout` | Checkout |
| 7 | `cart` | Cart |

## Product categories (11, from `wc/store/v1/products/categories`)

| ID | Name | Slug | Parent | Count |
|---|---|---|---|---|
| 61 | Fresh Produce | `fresh-produce` | 0 | 17 |
| 70 | Fresh Fruit | `fresh-fruit` | 61 | 8 |
| 117 | Apple & Stone Fruits | `apple-stone-fruits` | 70 | 2 |
| 116 | Berries | `berries` | 70 | 3 |
| 115 | Tropical & Exotic | `tropical-exotic` | 70 | 3 |
| 76 | Meat | `meat` | 0 | 6 |
| 81 | Seafood | `fish-seafood` | 0 | 6 |
| 94 | Cheese | `cheese` | 0 | 2 |
| 32 | Milk | `milk` | 0 | 1 |
| 135 | Essentials | `essentials` | 0 | 1 |
| 16 | Others | `others` | 0 | 14 |

## Products

- **Total:** ~47 (paginate `wc/store/v1/products` to confirm)
- **Price range:** ₨ 8.00 – ₨ 450.00
- **Variable products** (with price ranges): Mint, Basil, Oyster Mushroom, Kiwi, Green Apples, Grapes, Scottish Lamb Selection Box
- **Sale items:** BenOrganic Apple Juice, Ciabatta, Fresh Live Lobster, King Prawns Peeled in Brine, Oak Smoked Salmon, Green Apples
- **Out of stock (as of crawl):** BenOrganic Apple Juice, Ciabatta, Oak Smoked Salmon

## Blog posts (6 total)

All dated 2023-10-03:

- Family-Friendly Cooking: Quick and Nutritious Meals for Busy Weeknights
- Going Green: Tips for Sustainable Shopping and Eco-Friendly Choices
- DIY Charcuterie Boards: Crafting the Perfect Spread with Our Deli Delights
- Delicious Gluten-Free Alternatives: A Guide to Our Gluten-Free Product Selection
- Cooking on a Budget: Affordable Meal Ideas Using Store Specials
- Fresh Picks of the Week: Seasonal Fruits and Vegetables for a Healthier You

## Product page layout (observed on /product/spring-onions-1-bunch/)

- Breadcrumbs: Home → Shop → Fresh Produce → product
- Left: image gallery (large + thumbnails)
- Right: title · SKU · category/tags · brand (Good Life Organic) · price · qty selector · Add to cart / Add to Wishlist / Buy now
- Below: description tab
- Related products carousel

## Shop page layout

- Left sidebar: Categories tree · Price slider · Color · Size · Weight · Country · Units
- Grid: 15 products per page ("Showing 1–15 of 47")
- Sort dropdown: default/popularity/latest/price asc-desc
- Sale badges, "Sold: X / Available: X" stock indicators

## REST API endpoints used

- `GET /wp-json/` — namespace discovery
- `GET /wp-json/wp/v2/pages?per_page=100` — all pages
- `GET /wp-json/wp/v2/pages/{id}` — page content (content.rendered HTML)
- `GET /wp-json/wp/v2/posts` — blog posts
- `GET /wp-json/wp/v2/media?per_page=100` — media library
- `GET /wp-json/wc/store/v1/products?per_page=100` — Woo Store API (public, no auth)
- `GET /wp-json/wc/store/v1/products/categories?per_page=100` — product taxonomies

> `wc/v3/*` requires consumer key/secret. `wc/store/v1/*` is public and enough for the static rebuild.

## Known gaps to fill before coding

- [ ] Actual fonts (inspect live site CSS once maintenance is off again)
- [ ] Logo SVG (download from media id 3298)
- [ ] Elementor-rendered homepage HTML is heavy; we will **not** port markup directly — we rebuild sections from scratch using the data
- [ ] Product brand taxonomy (e.g. Good Life Organic) — not returned by Store API; may need WP REST with `wc/v3` auth or scrape
- [ ] Testimonials & "brand partners" — hardcoded in theme, extract from live HTML
- [ ] Payment method icons — swap for real payment logos we actually accept
