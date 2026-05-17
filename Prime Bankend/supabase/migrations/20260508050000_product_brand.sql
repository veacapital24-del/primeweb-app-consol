-- Brand attribution for storefront products. The 6 partner brands defined
-- in nulakaz-web/src/lib/brands.ts get a slug column on `products` so the
-- detail page can show "By <brand>" + brand origin / tagline / link.

alter table products
  add column if not exists brand_slug text;

create index if not exists products_brand_slug_idx
  on products (brand_slug) where active and brand_slug is not null;

-- Curated brand assignments — only products whose nature actually matches a
-- partner brand's voice. The remaining products stay brand-less (NULL),
-- which the UI handles by hiding the brand block.

-- Good Life Organic — fresh produce + fruit (organic family-farm vibe)
update products set brand_slug = 'good-life-organic'
  where slug in (
    'tomatoes-1kg',
    'onions-1kg',
    'carrots-1kg',
    'lettuce-head',
    'bananas-1kg',
    'mangoes-1kg',
    'pineapple-each'
  );

-- Earth Check — sustainable pantry basics
update products set brand_slug = 'earth-check'
  where slug in (
    'white-flour-1kg',
    'brown-sugar-500g',
    'red-lentils-500g'
  );

-- Crystal Cove — coastal-inspired seafood
update products set brand_slug = 'crystal-cove'
  where slug in (
    'fresh-salmon-fillet-500g',
    'prawns-frozen-500g',
    'white-fish-fillet-500g'
  );

-- Vita Coco — drinks & water
update products set brand_slug = 'vita-coco'
  where slug in (
    'mineral-water-1-5l',
    'coca-cola-1-5l'
  );

-- James White — cold-pressed juices / tea range
update products set brand_slug = 'james-white'
  where slug = 'green-tea-bags-25';

-- Pure Citrus — speciality teas & citrus-noted items
update products set brand_slug = 'pure-citrus'
  where slug = 'bois-cheri-vanilla-100g';
