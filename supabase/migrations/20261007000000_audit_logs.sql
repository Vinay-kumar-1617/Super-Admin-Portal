-- Audit Logs module.
--
-- Immutable, append-only activity trail for the platform. Rows are written
-- exclusively through the SECURITY DEFINER helper public.write_audit_log so the
-- acting user cannot forge identity, scope or timestamp. Updates and deletes are
-- blocked for every role (including service roles) to keep the trail tamper
-- evident.
--
-- Visibility:
--   * super admins see every state
--   * auditors (national) see every state in read-only form
--   * state admins see only rows tagged with their own state scope
--   * city / zone admins see only rows tagged with their own city / zone scope

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  actor_id uuid references auth.users (id) on delete set null,
  actor_email text,
  actor_name text,
  actor_role text,
  actor_scope_type text,
  actor_scope_id uuid,
  action text not null check (action in (
    'auth', 'create', 'update', 'delete', 'status_change',
    'approval', 'financial', 'user_management', 'permission_change', 'export'
  )),
  action_label text not null,
  entity_type text,
  entity_id text,
  entity_label text,
  state_id uuid,
  city_id uuid,
  zone_id uuid,
  previous_values jsonb,
  new_values jsonb,
  outcome text not null default 'success' check (outcome in ('success', 'failure', 'denied', 'warning')),
  ip_address inet,
  user_agent text,
  metadata jsonb
);

create index if not exists audit_logs_created_at_idx on public.audit_logs (created_at desc);
create index if not exists audit_logs_state_created_idx on public.audit_logs (state_id, created_at desc);
create index if not exists audit_logs_actor_idx on public.audit_logs (actor_id, created_at desc);
create index if not exists audit_logs_action_idx on public.audit_logs (action, created_at desc);

-- Membership helpers. SECURITY DEFINER so policy checks can read profiles
-- without being blocked by the profiles RLS policies.

create or replace function public.is_platform_auditor()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role_key = 'auditor'
  );
$$;

revoke all on function public.is_platform_auditor() from public;
grant execute on function public.is_platform_auditor() to authenticated;

create or replace function public.audit_log_visible(p_state_id uuid, p_city_id uuid, p_zone_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    public.is_super_admin()
    or public.is_platform_auditor()
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.scope_type = 'state'
        and p.scope_id is not null
        and p.scope_id = p_state_id
    )
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.scope_type = 'city'
        and p.scope_id is not null
        and p.scope_id = p_city_id
    )
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.scope_type = 'zone'
        and p.scope_id is not null
        and p.scope_id = p_zone_id
    );
$$;

revoke all on function public.audit_log_visible(uuid, uuid, uuid) from public;
grant execute on function public.audit_log_visible(uuid, uuid, uuid) to authenticated;

alter table public.audit_logs enable row level security;

-- Read only within the caller's scope.
create policy "Audit logs are readable within scope"
on public.audit_logs
for select
to authenticated
using (public.audit_log_visible(state_id, city_id, zone_id));

-- No insert / update / delete policies are created. Writes happen only through
-- the SECURITY DEFINER function below, and the trigger blocks mutation outright.

drop trigger if exists audit_logs_block_mutation on public.audit_logs;
create or replace function public.audit_logs_block_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'audit_logs is append-only and cannot be modified or deleted';
end;
$$;

revoke all on function public.audit_logs_block_mutation() from public;

create trigger audit_logs_block_mutation
before update or delete on public.audit_logs
for each row execute procedure public.audit_logs_block_mutation();

-- The only supported write path. Identity and scope are taken from the signed in
-- profile, never from the caller supplied arguments, so logs cannot be spoofed.
create or replace function public.write_audit_log(
  p_action text,
  p_action_label text,
  p_entity_type text default null,
  p_entity_id text default null,
  p_entity_label text default null,
  p_outcome text default 'success',
  p_previous_values jsonb default null,
  p_new_values jsonb default null,
  p_state_id uuid default null,
  p_city_id uuid default null,
  p_zone_id uuid default null,
  p_ip_address text default null,
  p_user_agent text default null,
  p_metadata jsonb default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_profile public.profiles;
  v_state_id uuid;
  v_log_id uuid;
begin
  if v_uid is null then
    raise exception 'write_audit_log requires an authenticated caller';
  end if;

  select * into v_profile from public.profiles where id = v_uid;

  v_state_id := coalesce(
    p_state_id,
    case when v_profile.scope_type = 'state' then v_profile.scope_id end
  );

  insert into public.audit_logs (
    actor_id, actor_email, actor_name, actor_role, actor_scope_type, actor_scope_id,
    action, action_label, entity_type, entity_id, entity_label,
    state_id, city_id, zone_id,
    previous_values, new_values, outcome, ip_address, user_agent, metadata
  )
  values (
    v_uid, v_profile.email, v_profile.email, v_profile.role_key, v_profile.scope_type, v_profile.scope_id,
    p_action, p_action_label, p_entity_type, p_entity_id, p_entity_label,
    v_state_id,
    coalesce(p_city_id, case when v_profile.scope_type = 'city' then v_profile.scope_id end),
    coalesce(p_zone_id, case when v_profile.scope_type = 'zone' then v_profile.scope_id end),
    p_previous_values, p_new_values, p_outcome,
    nullif(p_ip_address, '')::inet, p_user_agent, p_metadata
  )
  returning id into v_log_id;

  return v_log_id;
end;
$$;

revoke all on function public.write_audit_log(text, text, text, text, text, text, jsonb, jsonb, uuid, uuid, uuid, text, text, jsonb) from public;
grant execute on function public.write_audit_log(text, text, text, text, text, text, jsonb, jsonb, uuid, uuid, uuid, text, text, jsonb) to authenticated;

-- Least privilege: authenticated users may only read. Inserts flow through the
-- function, and mutations are blocked by the trigger above.
revoke all on public.audit_logs from anon, authenticated;
grant select on public.audit_logs to authenticated;

-- Automatically record role / scope changes and new staff accounts. The trigger
-- runs SECURITY DEFINER so it can append even though the actor has no insert
-- privilege on audit_logs.
create or replace function public.audit_profile_changes()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    if new.role_key <> 'customer' then
      insert into public.audit_logs (
        actor_id, actor_email, actor_role, action, action_label,
        entity_type, entity_id, entity_label, new_values, outcome
      )
      values (
        auth.uid(), null, 'system', 'user_management', 'Created staff account',
        'profile', new.id::text, new.email, to_jsonb(new), 'success'
      );
    end if;
    return new;
  end if;

  if tg_op = 'UPDATE' and (
    old.role_key is distinct from new.role_key
    or old.scope_type is distinct from new.scope_type
    or old.scope_id is distinct from new.scope_id
  ) then
    insert into public.audit_logs (
      actor_id, actor_email, actor_role, action, action_label,
      entity_type, entity_id, entity_label, previous_values, new_values, outcome
    )
    values (
      auth.uid(), null, 'system', 'permission_change', 'Updated role or scope',
      'profile', new.id::text, new.email, to_jsonb(old), to_jsonb(new), 'success'
    );
  end if;

  return new;
end;
$$;

revoke all on function public.audit_profile_changes() from public;

drop trigger if exists audit_profiles_changes on public.profiles;
create trigger audit_profiles_changes
after insert or update on public.profiles
for each row execute procedure public.audit_profile_changes();
