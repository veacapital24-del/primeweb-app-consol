-- Admin v2: settings store + stock movements log

create table if not exists app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

insert into app_settings (key, value) values
  ('business', jsonb_build_object(
    'name', 'Primeweb',
    'phone', '23057000000',
    'address', 'Port Louis, Maurice',
    'tagline', 'Hard discount + B2B + social commerce',
    'vat_id', ''
  )),
  ('shipping', jsonb_build_object(
    'free_threshold_mur', 1500,
    'default_fee_mur', 100,
    'currency', 'MUR'
  )),
  ('whatsapp', jsonb_build_object(
    'enabled', true,
    'auto_reply', false,
    'business_hours', '9h-18h Lundi-Samedi',
    'verify_token', 'prime-mauritius-verify'
  ))
on conflict (key) do nothing;

create table if not exists stock_movements (
  id bigserial primary key,
  product_id uuid not null references products(id) on delete cascade,
  delta int not null,
  reason text,
  before_qty int,
  after_qty int,
  actor text,
  created_at timestamptz not null default now()
);

create index if not exists stock_movements_product_idx
  on stock_movements (product_id, created_at desc);

alter table app_settings    enable row level security;
alter table stock_movements enable row level security;

create policy "admin settings"  on app_settings    for all using (is_admin());
create policy "admin movements" on stock_movements for all using (is_admin());
