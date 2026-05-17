-- Move brands + storefront categories from hard-coded TS / JSON files into
-- their own tables, so the admin console can manage them at runtime.
--
-- Both tables use the slug as the primary key — the storefront and POS
-- already reference brands and categories by slug (products.category_slug,
-- products.brand_slug), and slugs are stable identifiers users actually see
-- in URLs. A surrogate id would only add noise.
--
-- Writes are funnelled through the admin console using the service-role
-- key, which bypasses RLS, so we only need public-read policies for the
-- storefront's anon client.

-- ─── categories ─────────────────────────────────────────────────────────────

create table if not exists categories (
  slug          text primary key,
  name          text not null,
  parent_slug   text references categories(slug) on delete set null,
  sort_order    int  not null default 0,
  active        boolean not null default true,
  image_url     text,
  description   text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists categories_parent_idx
  on categories(parent_slug) where parent_slug is not null;
create index if not exists categories_sort_idx
  on categories(sort_order, name);

alter table categories enable row level security;

-- Public read of active rows (storefront's anon client).
drop policy if exists "categories public read" on categories;
create policy "categories public read"
  on categories for select
  using (active);

-- Auto-update updated_at on changes
create or replace function categories_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists categories_set_updated_at on categories;
create trigger categories_set_updated_at
  before update on categories
  for each row execute function categories_set_updated_at();

-- Seed the 7 top-level categories the storefront already references.
insert into categories (slug, name, sort_order) values
  ('fresh-produce', 'Fresh Produce', 10),
  ('meat',          'Meat',          20),
  ('fish-seafood',  'Seafood',       30),
  ('cheese',        'Cheese',        40),
  ('milk',          'Milk',          50),
  ('essentials',    'Essentials',    60),
  ('others',        'Others',        70)
on conflict (slug) do nothing;

-- ─── brands ─────────────────────────────────────────────────────────────────

-- Predefined brand tints — same set the storefront uses (BRAND_TINTS in
-- nulakaz-web/src/lib/brands.ts). Stored as a constrained text column so
-- the storefront's tint lookup never receives an unknown value.
create table if not exists brands (
  slug            text primary key,
  name            text not null,
  logo_url        text,
  origin          text,
  tagline         text,
  body            text,
  category_slug   text references categories(slug) on delete set null,
  category_label  text,
  tint            text not null default 'sage'
                  check (tint in ('sage', 'ocean', 'mustard',
                                  'dusty-pink', 'terracotta', 'stone')),
  sort_order      int  not null default 0,
  active          boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists brands_active_idx
  on brands(active, sort_order, name);

alter table brands enable row level security;

drop policy if exists "brands public read" on brands;
create policy "brands public read"
  on brands for select
  using (active);

create or replace function brands_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists brands_set_updated_at on brands;
create trigger brands_set_updated_at
  before update on brands
  for each row execute function brands_set_updated_at();

-- Seed the 6 partner brands from the storefront's lib/brands.ts so the
-- existing products.brand_slug values continue to resolve.
insert into brands (slug, name, logo_url, origin, tagline, body,
                    category_slug, category_label, tint, sort_order) values
  (
    'good-life-organic', 'Good Life Organic',
    'https://nulakaz.com/wp-content/uploads/2023/09/Good-Life-Organic-Logo.png',
    'Mauritius · Family farms',
    'Family-grown, certified organic.',
    'Tomatoes, onions and leafy greens picked the same morning they ship — from a small co-operative of farms in the north of the island.',
    'fresh-produce', 'Fresh Produce', 'sage', 10
  ),
  (
    'earth-check', 'Earth Check',
    'https://nulakaz.com/wp-content/uploads/2023/09/Earth-Check-Logo.png',
    'South Africa · Sustainable',
    'Pantry basics with a conscience.',
    'Flour, sugar, lentils and rice from suppliers committed to regenerative farming and recyclable packaging.',
    'essentials', 'Essentials', 'mustard', 20
  ),
  (
    'crystal-cove', 'Crystal Cove',
    'https://nulakaz.com/wp-content/uploads/2023/09/Crystal-Cove-Logo.png',
    'Indian Ocean · Coastal',
    'Coastal-inspired seafood.',
    'Sustainably sourced fillets from boats that operate in the western Indian Ocean.',
    'fish-seafood', 'Seafood', 'ocean', 30
  ),
  (
    'vita-coco', 'Vita Coco',
    'https://nulakaz.com/wp-content/uploads/2023/09/Vita-Coco-Logo.png',
    'Sri Lanka · Imported',
    'Hydration that travels well.',
    'Bottled and canned drinks we ship in directly so the pricing stays honest.',
    'others', 'Drinks', 'dusty-pink', 40
  ),
  (
    'james-white', 'James White',
    'https://nulakaz.com/wp-content/uploads/2023/09/James-White-Logo.png',
    'United Kingdom · Cold-pressed',
    'Cold-pressed juices & teas.',
    'A small UK importer we picked for the green tea range — properly steeped, not powdered.',
    'others', 'Teas & juices', 'terracotta', 50
  ),
  (
    'pure-citrus', 'Pure Citrus',
    'https://nulakaz.com/wp-content/uploads/2023/09/Pure-Citrus-Logo.png',
    'Mauritius · Speciality',
    'Speciality teas & citrus notes.',
    'Bois Chéri vanilla and other Mauritian specialities curated for the shelf.',
    'others', 'Speciality', 'stone', 60
  )
on conflict (slug) do nothing;
