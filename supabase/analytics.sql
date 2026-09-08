-- One row per visitor session. The application should never store the visitor's IP address.
create table if not exists public.site_visit_sessions (
  id uuid primary key default gen_random_uuid(),
  visitor_id text not null,
  session_id text not null unique,
  path text not null default '/',
  country_code text,
  device_type text,
  browser text,
  operating_system text,
  started_at timestamptz not null default timezone('utc', now()),
  last_seen_at timestamptz not null default timezone('utc', now()),
  duration_seconds integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists site_visit_sessions_started_at_idx
  on public.site_visit_sessions (started_at desc);

create index if not exists site_visit_sessions_country_code_idx
  on public.site_visit_sessions (country_code);

create index if not exists site_visit_sessions_device_type_idx
  on public.site_visit_sessions (device_type);

revoke all on public.site_visit_sessions from public, anon, authenticated;
grant select, insert, update on public.site_visit_sessions to service_role;
