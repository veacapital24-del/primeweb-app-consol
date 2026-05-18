-- Prime Bankend initial schema
-- Mauritius retailer + wholesaler platform

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────────────────────
-- Roles & profiles
-- ─────────────────────────────────────────────────────────────────────────────

do $$ begin
  create type user_role as enum ('customer', 'retailer', 'wholesaler', 'admin');
exception when duplicate_object then null; end $$;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  shop_name text,
  role user_role not null default 'customer',
  whatsapp_opt_in boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, full_name, phone)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.phone);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- Catalog
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  sku text unique not null,
  slug text unique not null,
  name text not null,
  description text,
  image_url text,
  retail_price_mur numeric(10,2) not null,
  wholesale_price_mur numeric(10,2),
  wholesale_min_qty int not null default 1,
  is_hard_discount boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_hard_discount_idx
  on products (is_hard_discount) where active and is_hard_discount;

-- Inventory in its own table for tight realtime payloads
create table if not exists inventory (
  product_id uuid primary key references products(id) on delete cascade,
  on_hand int not null default 0,
  reserved int not null default 0,
  low_stock_threshold int not null default 5,
  updated_at timestamptz not null default now()
);

create or replace view product_stock
  with (security_invoker = true) as
  select
    p.id,
    p.sku,
    p.slug,
    p.name,
    p.image_url,
    p.retail_price_mur,
    p.wholesale_price_mur,
    p.wholesale_min_qty,
    p.is_hard_discount,
    coalesce(i.on_hand, 0) - coalesce(i.reserved, 0) as available,
    coalesce(i.low_stock_threshold, 5) as low_stock_threshold
  from products p
  left join inventory i on i.product_id = p.id
  where p.active;

-- Atomic reservation (used by order placement)
create or replace function reserve_stock(p_product_id uuid, p_qty int)
returns boolean
language plpgsql
as $$
declare
  v_available int;
begin
  update inventory
    set reserved = reserved + p_qty,
        updated_at = now()
  where product_id = p_product_id
    and (on_hand - reserved) >= p_qty
  returning (on_hand - reserved) into v_available;

  return found;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Reels (social commerce)
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists reels (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  platform text not null check (platform in ('instagram', 'tiktok', 'facebook')),
  external_url text,
  thumbnail_url text,
  video_url text,
  caption text,
  posted_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists reel_products (
  reel_id uuid not null references reels(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  position int not null default 0,
  primary key (reel_id, product_id)
);

create table if not exists reel_events (
  id bigserial primary key,
  reel_id uuid references reels(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  event_type text not null check (event_type in ('view', 'add_to_cart', 'order', 'whatsapp_click')),
  session_id text,
  created_at timestamptz not null default now()
);

create index if not exists reel_events_reel_idx on reel_events (reel_id, created_at desc);

-- ─────────────────────────────────────────────────────────────────────────────
-- Orders
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null default ('PR' || to_char(now(), 'YYMMDD') || lpad(floor(random() * 10000)::text, 4, '0')),
  customer_id uuid references profiles(id) on delete set null,
  channel text not null check (channel in ('web', 'whatsapp', 'reel')),
  reel_id uuid references reels(id) on delete set null,
  is_wholesale boolean not null default false,
  subtotal_mur numeric(10,2) not null default 0,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'fulfilled', 'cancelled')),
  whatsapp_phone text,
  whatsapp_thread_id text,
  customer_name text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists order_items (
  id bigserial primary key,
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id),
  qty int not null check (qty > 0),
  unit_price_mur numeric(10,2) not null
);

create index if not exists order_items_order_idx on order_items(order_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- WhatsApp messaging
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists whatsapp_messages (
  id bigserial primary key,
  direction text not null check (direction in ('in', 'out')),
  phone text not null,
  body text,
  payload jsonb,
  order_id uuid references orders(id) on delete set null,
  status text not null default 'pending'
    check (status in ('pending', 'sent', 'delivered', 'read', 'failed')),
  provider_message_id text,
  created_at timestamptz not null default now()
);

create index if not exists whatsapp_messages_phone_idx
  on whatsapp_messages (phone, created_at desc);

-- ─────────────────────────────────────────────────────────────────────────────
-- Realtime
-- ─────────────────────────────────────────────────────────────────────────────

alter publication supabase_realtime add table inventory;
alter publication supabase_realtime add table products;

-- ─────────────────────────────────────────────────────────────────────────────
-- Row-level security
-- ─────────────────────────────────────────────────────────────────────────────

alter table profiles            enable row level security;
alter table products            enable row level security;
alter table inventory           enable row level security;
alter table reels               enable row level security;
alter table reel_products       enable row level security;
alter table reel_events         enable row level security;
alter table orders              enable row level security;
alter table order_items         enable row level security;
alter table whatsapp_messages   enable row level security;

-- Public catalog
create policy "products are public"     on products       for select using (active);
create policy "inventory is public"     on inventory      for select using (true);
create policy "reels are public"        on reels          for select using (active);
create policy "reel_products public"    on reel_products  for select using (true);

-- Reel analytics: anyone can insert a view event, no read for anon
create policy "anyone logs reel events" on reel_events    for insert with check (true);

-- Profiles: users see and update only their own
create policy "own profile select" on profiles for select using (auth.uid() = id);
create policy "own profile update" on profiles for update using (auth.uid() = id);

-- Orders: anonymous checkout allowed; authenticated users see their own
create policy "create order"       on orders for insert with check (true);
create policy "see own order"      on orders for select using (
  customer_id is null or customer_id = auth.uid()
);

create policy "create order items" on order_items for insert with check (true);
create policy "see own order items" on order_items for select using (
  exists (
    select 1 from orders o
    where o.id = order_items.order_id
      and (o.customer_id is null or o.customer_id = auth.uid())
  )
);

-- whatsapp_messages: server-only (service role bypasses RLS, anon has no access)

-- Admin override (service role bypasses RLS by default, but admins via JWT need this)
create or replace function is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

create policy "admin all profiles"          on profiles          for all using (is_admin());
create policy "admin all products"          on products          for all using (is_admin());
create policy "admin all inventory"         on inventory         for all using (is_admin());
create policy "admin all reels"             on reels             for all using (is_admin());
create policy "admin all reel_products"     on reel_products     for all using (is_admin());
create policy "admin all orders"            on orders            for all using (is_admin());
create policy "admin all order_items"       on order_items       for all using (is_admin());
create policy "admin all whatsapp"          on whatsapp_messages for all using (is_admin());
