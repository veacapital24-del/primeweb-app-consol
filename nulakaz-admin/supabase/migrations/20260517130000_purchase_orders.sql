-- Purchase Orders module: suppliers, purchase_orders, purchase_order_lines

-- ── Suppliers ──────────────────────────────────────────────────────────────────
create table public.suppliers (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  contact_name text,
  email       text,
  phone       text,
  address     text,
  notes       text,
  active      boolean     not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── Purchase orders ────────────────────────────────────────────────────────────
create type public.po_status as enum ('draft', 'sent', 'partial', 'received', 'cancelled');

create table public.purchase_orders (
  id             uuid          primary key default gen_random_uuid(),
  po_number      text          not null unique,
  supplier_id    uuid          references public.suppliers(id) on delete set null,
  location_id    uuid          references public.locations(id) on delete set null,
  status         public.po_status not null default 'draft',
  expected_date  date,
  notes          text,
  total_cost_mur numeric(12,2) not null default 0,
  created_at     timestamptz   not null default now(),
  updated_at     timestamptz   not null default now()
);

-- ── Purchase order lines ───────────────────────────────────────────────────────
create table public.purchase_order_lines (
  id             uuid          primary key default gen_random_uuid(),
  po_id          uuid          not null references public.purchase_orders(id) on delete cascade,
  product_id     uuid          not null references public.products(id) on delete restrict,
  qty_ordered    int           not null check (qty_ordered > 0),
  qty_received   int           not null default 0 check (qty_received >= 0),
  unit_cost_mur  numeric(12,2) not null default 0,
  created_at     timestamptz   not null default now(),
  unique (po_id, product_id)
);

-- ── Auto-generate PO numbers (PO-2026-0001) ────────────────────────────────────
create sequence if not exists public.po_seq start 1;

create or replace function public.next_po_number()
returns text language sql volatile as $$
  select 'PO-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.po_seq')::text, 4, '0')
$$;

-- ── RLS (admin console uses service_role which bypasses, but add for safety) ───
alter table public.suppliers            enable row level security;
alter table public.purchase_orders      enable row level security;
alter table public.purchase_order_lines enable row level security;

create policy "admin full" on public.suppliers
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin full" on public.purchase_orders
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin full" on public.purchase_order_lines
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
