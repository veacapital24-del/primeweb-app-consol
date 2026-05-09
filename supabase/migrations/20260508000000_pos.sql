-- POS module: multi-location, online & offline-aware schema.
-- Adds in-store selling alongside the existing online `orders` flow.
-- Online sales (orders / order_items) stay untouched; in-store selling
-- lives in its own tables (sales / sale_lines) for clean reporting.

-- ─────────────────────────────────────────────────────────────────────────────
-- Enums
-- ─────────────────────────────────────────────────────────────────────────────

do $$ begin
  create type pos_role              as enum ('cashier', 'manager');
exception when duplicate_object then null; end $$;

do $$ begin
  create type location_kind         as enum ('store', 'warehouse', 'kiosk', 'popup');
exception when duplicate_object then null; end $$;

do $$ begin
  create type shift_status          as enum ('open', 'closed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type sale_status           as enum ('draft', 'completed', 'voided', 'refunded', 'partial_refund');
exception when duplicate_object then null; end $$;

do $$ begin
  create type tender_type           as enum ('cash', 'card', 'mobile_money', 'store_credit', 'voucher', 'bank_transfer');
exception when duplicate_object then null; end $$;

do $$ begin
  create type cash_movement_kind    as enum ('open_float', 'close_count', 'cash_in', 'cash_out', 'paid_in', 'paid_out', 'drop');
exception when duplicate_object then null; end $$;

do $$ begin
  create type stock_movement_reason as enum ('sale', 'return', 'transfer_in', 'transfer_out', 'adjustment', 'count', 'damage', 'receipt');
exception when duplicate_object then null; end $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Locations & staff
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists locations (
  id          uuid primary key default gen_random_uuid(),
  code        text unique not null,
  name        text not null,
  kind        location_kind not null default 'store',
  address     text,
  phone       text,
  timezone    text not null default 'Indian/Mauritius',
  currency    text not null default 'MUR',
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists staff_locations (
  user_id     uuid not null references profiles(id) on delete cascade,
  location_id uuid not null references locations(id) on delete cascade,
  role        pos_role not null default 'cashier',
  created_at  timestamptz not null default now(),
  primary key (user_id, location_id)
);

create index if not exists staff_locations_user_idx on staff_locations(user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Registers (terminals)
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists registers (
  id          uuid primary key default gen_random_uuid(),
  location_id uuid not null references locations(id) on delete cascade,
  code        text not null,
  name        text not null,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  unique (location_id, code)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Shifts (cashier sessions)
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists shifts (
  id                  uuid primary key default gen_random_uuid(),
  register_id         uuid not null references registers(id),
  location_id         uuid not null references locations(id),
  cashier_id          uuid not null references profiles(id),
  opened_at           timestamptz not null default now(),
  closed_at           timestamptz,
  opening_float_mur   numeric(10,2) not null default 0,
  closing_count_mur   numeric(10,2),
  expected_cash_mur   numeric(10,2),
  variance_mur        numeric(10,2),
  status              shift_status not null default 'open',
  notes               text
);

-- one open shift per register at a time
create unique index if not exists shifts_one_open_per_register
  on shifts (register_id) where status = 'open';

create index if not exists shifts_cashier_idx on shifts (cashier_id, opened_at desc);

-- ─────────────────────────────────────────────────────────────────────────────
-- Sales (in-store transactions)
-- ─────────────────────────────────────────────────────────────────────────────

create sequence if not exists sale_number_seq;

create table if not exists sales (
  id            uuid primary key default gen_random_uuid(),
  sale_number   text unique not null
                  default ('S' || to_char(now(), 'YYMMDD') || lpad(nextval('sale_number_seq')::text, 6, '0')),
  shift_id      uuid not null references shifts(id),
  register_id   uuid not null references registers(id),
  location_id   uuid not null references locations(id),
  cashier_id    uuid not null references profiles(id),
  customer_id   uuid references profiles(id) on delete set null,
  subtotal_mur  numeric(10,2) not null default 0,
  discount_mur  numeric(10,2) not null default 0,
  tax_mur       numeric(10,2) not null default 0,
  total_mur     numeric(10,2) not null default 0,
  status        sale_status not null default 'draft',
  notes         text,
  -- Offline-first idempotency: device generates client_uuid before network is
  -- available; server dedupes on (location_id, client_uuid) when sync replays.
  client_uuid   uuid not null,
  synced_at     timestamptz,
  created_at    timestamptz not null default now(),
  completed_at  timestamptz,
  unique (location_id, client_uuid)
);

create index if not exists sales_location_created_idx on sales (location_id, created_at desc);
create index if not exists sales_shift_idx            on sales (shift_id);
create index if not exists sales_open_idx             on sales (status) where status = 'draft';

create table if not exists sale_lines (
  id                 bigserial primary key,
  sale_id            uuid not null references sales(id) on delete cascade,
  product_id         uuid not null references products(id),
  sku                text not null,           -- captured at sale time
  name               text not null,           -- captured at sale time
  qty                numeric(10,3) not null check (qty <> 0),  -- decimals for weight items, negatives for returns
  unit_price_mur     numeric(10,2) not null,
  unit_cost_mur      numeric(10,2),           -- for margin reporting
  line_discount_mur  numeric(10,2) not null default 0,
  line_tax_mur       numeric(10,2) not null default 0,
  line_total_mur     numeric(10,2) not null
);

create index if not exists sale_lines_sale_idx on sale_lines (sale_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Payments (split tenders per sale)
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists payments (
  id          bigserial primary key,
  sale_id     uuid not null references sales(id) on delete cascade,
  tender      tender_type not null,
  amount_mur  numeric(10,2) not null,
  reference   text,                            -- last-4, MoMo ref, voucher code…
  created_at  timestamptz not null default now()
);

create index if not exists payments_sale_idx on payments (sale_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Cash drawer movements
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists cash_movements (
  id          bigserial primary key,
  shift_id    uuid not null references shifts(id) on delete cascade,
  kind        cash_movement_kind not null,
  amount_mur  numeric(10,2) not null,
  reason      text,
  created_at  timestamptz not null default now()
);

create index if not exists cash_movements_shift_idx on cash_movements (shift_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Per-location stock
-- The existing `inventory` table stays as the global/online warehouse view.
-- `location_stock` lets each store track its own on_hand for POS.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists location_stock (
  product_id          uuid not null references products(id) on delete cascade,
  location_id         uuid not null references locations(id) on delete cascade,
  on_hand             int not null default 0,
  reserved            int not null default 0,
  low_stock_threshold int not null default 5,
  updated_at          timestamptz not null default now(),
  primary key (product_id, location_id)
);

create index if not exists location_stock_location_idx on location_stock (location_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Stock movements: extend the existing global table with location scope
-- (admin_v2 introduced stock_movements without locations; POS writes are
-- always location-scoped.)
-- ─────────────────────────────────────────────────────────────────────────────

alter table stock_movements
  add column if not exists location_id  uuid references locations(id),
  add column if not exists reason_code  stock_movement_reason,
  add column if not exists reference_id uuid;

create index if not exists stock_movements_location_idx
  on stock_movements (location_id, created_at desc);

-- ─────────────────────────────────────────────────────────────────────────────
-- Helpers
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function has_location_access(p_location_id uuid)
returns boolean
language sql
stable
as $$
  select is_admin() or exists (
    select 1 from staff_locations
    where user_id = auth.uid() and location_id = p_location_id
  );
$$;

create or replace function pos_role_at(p_location_id uuid)
returns pos_role
language sql
stable
as $$
  select role from staff_locations
  where user_id = auth.uid() and location_id = p_location_id;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Realtime (live register & stock screens)
-- ─────────────────────────────────────────────────────────────────────────────

alter publication supabase_realtime add table sales;
alter publication supabase_realtime add table location_stock;

-- ─────────────────────────────────────────────────────────────────────────────
-- Row-level security
-- ─────────────────────────────────────────────────────────────────────────────

alter table locations       enable row level security;
alter table staff_locations enable row level security;
alter table registers       enable row level security;
alter table shifts          enable row level security;
alter table sales           enable row level security;
alter table sale_lines      enable row level security;
alter table payments        enable row level security;
alter table cash_movements  enable row level security;
alter table location_stock  enable row level security;

-- Locations
create policy "staff read locations"     on locations
  for select using (
    is_admin() or exists (
      select 1 from staff_locations sl
      where sl.user_id = auth.uid() and sl.location_id = locations.id
    )
  );
create policy "admin manages locations"  on locations       for all using (is_admin());

-- Staff_locations
create policy "see own assignments"      on staff_locations
  for select using (user_id = auth.uid() or is_admin());
create policy "admin manages staff"      on staff_locations for all using (is_admin());

-- Registers
create policy "staff read registers"     on registers
  for select using (has_location_access(location_id));
create policy "admin manages registers"  on registers       for all using (is_admin());

-- Shifts
create policy "shift visibility"         on shifts
  for select using (cashier_id = auth.uid() or has_location_access(location_id));
create policy "cashier opens shift"      on shifts
  for insert with check (cashier_id = auth.uid() and has_location_access(location_id));
create policy "cashier closes own shift" on shifts
  for update using (cashier_id = auth.uid() and status = 'open')
            with check (cashier_id = auth.uid());
create policy "admin manages shifts"     on shifts          for all using (is_admin());

-- Sales
create policy "sales visibility"         on sales
  for select using (has_location_access(location_id));
create policy "cashier creates sale"     on sales
  for insert with check (cashier_id = auth.uid() and has_location_access(location_id));
create policy "cashier updates own sale" on sales
  for update using (cashier_id = auth.uid() and status in ('draft', 'completed'))
            with check (cashier_id = auth.uid());
create policy "admin manages sales"      on sales           for all using (is_admin());

-- Sale lines (inherit access from parent sale)
create policy "sale_lines visibility"    on sale_lines
  for select using (
    exists (select 1 from sales s where s.id = sale_lines.sale_id and has_location_access(s.location_id))
  );
create policy "sale_lines insert"        on sale_lines
  for insert with check (
    exists (
      select 1 from sales s
      where s.id = sale_lines.sale_id
        and s.cashier_id = auth.uid()
        and has_location_access(s.location_id)
    )
  );
create policy "admin manages sale_lines" on sale_lines      for all using (is_admin());

-- Payments
create policy "payments visibility"      on payments
  for select using (
    exists (select 1 from sales s where s.id = payments.sale_id and has_location_access(s.location_id))
  );
create policy "payments insert"          on payments
  for insert with check (
    exists (
      select 1 from sales s
      where s.id = payments.sale_id
        and s.cashier_id = auth.uid()
        and has_location_access(s.location_id)
    )
  );
create policy "admin manages payments"   on payments        for all using (is_admin());

-- Cash movements
create policy "cash visibility"          on cash_movements
  for select using (
    exists (select 1 from shifts sh where sh.id = cash_movements.shift_id and has_location_access(sh.location_id))
  );
create policy "cash insert"              on cash_movements
  for insert with check (
    exists (
      select 1 from shifts sh
      where sh.id = cash_movements.shift_id
        and sh.cashier_id = auth.uid()
        and has_location_access(sh.location_id)
    )
  );
create policy "admin manages cash"       on cash_movements  for all using (is_admin());

-- Location stock
create policy "stock read at location"   on location_stock
  for select using (has_location_access(location_id));
create policy "admin manages stock"      on location_stock  for all using (is_admin());
