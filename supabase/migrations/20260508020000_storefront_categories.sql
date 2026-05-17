-- Storefront mapping fields for the Nulakaz frontend.
-- The catalog list itself still lives in Nulakaz's seed JSON for now;
-- this column lets each Prime product opt into one of those category slugs
-- so /shop, /category/[slug] and product breadcrumbs work end-to-end without
-- touching the UI's WcProduct shape.

alter table products
  add column if not exists category_slug text,
  add column if not exists tags text[] not null default '{}';

create index if not exists products_category_slug_idx
  on products (category_slug) where active and category_slug is not null;
