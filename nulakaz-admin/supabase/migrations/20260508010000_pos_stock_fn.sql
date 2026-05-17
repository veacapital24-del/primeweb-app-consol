-- Atomic per-location stock delta.
-- Inserts a row if (product, location) doesn't exist yet, otherwise increments.
-- Used by sales (delta < 0), receiving / adjustments (delta > 0), returns, etc.
-- Returns the new on_hand value.

create or replace function apply_stock_delta(
  p_product_id uuid,
  p_location_id uuid,
  p_delta int
) returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_on_hand int;
begin
  insert into location_stock (product_id, location_id, on_hand)
  values (p_product_id, p_location_id, p_delta)
  on conflict (product_id, location_id)
  do update set
    on_hand    = location_stock.on_hand + excluded.on_hand,
    updated_at = now()
  returning on_hand into v_on_hand;
  return v_on_hand;
end;
$$;

-- Tighten execute: anon should never call this directly.
revoke execute on function apply_stock_delta(uuid, uuid, int) from public;
grant  execute on function apply_stock_delta(uuid, uuid, int) to authenticated, service_role;
