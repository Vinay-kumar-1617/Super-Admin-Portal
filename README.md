# Fieldwork

Fieldwork is a TypeScript operations console for heavy equipment rentals, with Supabase Auth and PostgreSQL as the shared identity and data platform.

## Structure

- `frontend/` is the Vite + React browser app and the only active workspace.
- `packages/shared/` contains role, scope, profile, and Supabase database types shared across the workspace.
- `supabase/migrations/` contains the PostgreSQL schema and row-level security policies.
- `backend/` is retained as legacy source only; it is no longer in the active npm workspaces or development scripts.

## Supabase Setup

1. Create a Supabase project.
2. Apply `supabase/migrations/20261006000000_profiles.sql` in the Supabase SQL Editor or with the Supabase CLI.
3. Copy `frontend/.env.example` to `frontend/.env`.
4. Set the app's Supabase project URL and publishable key. Never put a service-role key in the app.
5. Create staff users in Supabase Auth. A profile is created with the default `customer` role. Assign staff roles and scopes from the Supabase SQL Editor or a trusted admin function.

To grant the first super-admin role after creating that Auth user, run this in the Supabase SQL Editor:

```sql
update public.profiles
set role_key = 'super-admin', scope_type = 'national', scope_id = null
where email = 'admin@your-company.com';
```

Profiles are readable by their owner and super admins. Only super admins can update role and scope fields through the database API. New profiles do not accept role assignments from client-provided auth metadata.

The existing dashboard KPI and operational panels still use illustrative sample data; the profile/auth connection is live once project environment values and accounts are configured.

## Run Locally

Requires Node.js 22.13 or newer.

```sh
npm install
npm run dev
```

The browser app runs at `http://localhost:5173`.

## Checks

```sh
npm run build
npm run lint
npm test
```
