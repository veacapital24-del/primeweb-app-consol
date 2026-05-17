-- Fix "stack depth limit exceeded" on POS register/shift queries.
-- is_admin() read profiles; profiles RLS called is_admin() again → infinite recursion.
-- Run: supabase db push (or apply in Supabase SQL editor)

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.has_location_access(p_location_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin() or exists (
    select 1 from public.staff_locations
    where user_id = auth.uid() and location_id = p_location_id
  );
$$;

create or replace function public.pos_role_at(p_location_id uuid)
returns public.pos_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.staff_locations
  where user_id = auth.uid() and location_id = p_location_id;
$$;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.has_location_access(uuid) to authenticated;
grant execute on function public.pos_role_at(uuid) to authenticated;
