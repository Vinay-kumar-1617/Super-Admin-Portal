create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  role_key text not null default 'customer' check (role_key in (
    'super-admin', 'state-admin', 'city-admin', 'zone-admin',
    'operations-manager', 'compliance-admin', 'finance-admin', 'support-admin',
    'dispatcher', 'auditor', 'fleet-manager', 'support-agent',
    'dispute-handler', 'kyc-verifier', 'moderator', 'platform-admin',
    'operator', 'owner', 'customer'
  )),
  scope_type text not null default 'national' check (scope_type in ('national', 'state', 'city', 'zone')),
  scope_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.profiles (id, email)
select id, email
from auth.users
where email is not null
on conflict (id) do nothing;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role_key = 'super-admin'
  );
$$;

revoke all on function public.is_super_admin() from public;
grant execute on function public.is_super_admin() to authenticated;

grant select, update on public.profiles to authenticated;

alter table public.profiles enable row level security;

create policy "Users read their own profile or super admins read all"
on public.profiles
for select
to authenticated
using (id = auth.uid() or public.is_super_admin());

create policy "Only super admins update profiles"
on public.profiles
for update
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

revoke all on function public.handle_new_auth_user() from public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert or update of email on auth.users
for each row execute procedure public.handle_new_auth_user();

create or replace function public.set_profile_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute procedure public.set_profile_updated_at();
