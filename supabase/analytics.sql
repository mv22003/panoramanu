create extension if not exists pgcrypto;

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

create index if not exists site_visit_sessions_last_seen_at_idx
  on public.site_visit_sessions (last_seen_at desc);

create index if not exists site_visit_sessions_country_code_idx
  on public.site_visit_sessions (country_code);

create index if not exists site_visit_sessions_device_type_idx
  on public.site_visit_sessions (device_type);

create or replace view public.site_visits_daily as
with daily_sessions as (
  select
    started_at::date as date,
    visitor_id,
    coalesce(nullif(device_type, ''), 'Unknown') as device_type,
    coalesce(nullif(country_code, ''), 'Unknown') as country_code,
    duration_seconds
  from public.site_visit_sessions
),
daily_summary as (
  select
    date,
    count(*)::integer as visits,
    count(distinct visitor_id)::integer as unique_visitors,
    round(avg(duration_seconds))::integer as average_duration_seconds
  from daily_sessions
  group by date
),
device_counts as (
  select date, device_type, count(*)::integer as visits
  from daily_sessions
  group by date, device_type
),
country_counts as (
  select date, country_code, count(*)::integer as visits
  from daily_sessions
  group by date, country_code
),
device_breakdown as (
  select
    date,
    jsonb_agg(
      jsonb_build_object('device_type', device_type, 'visits', visits)
      order by visits desc, device_type asc
    ) as device_breakdown
  from device_counts
  group by date
),
country_breakdown as (
  select
    date,
    jsonb_agg(
      jsonb_build_object('country_code', country_code, 'visits', visits)
      order by visits desc, country_code asc
    ) as country_breakdown
  from country_counts
  group by date
)
select
  summary.date,
  summary.visits,
  summary.unique_visitors,
  summary.average_duration_seconds,
  coalesce(device_breakdown.device_breakdown, '[]'::jsonb) as device_breakdown,
  coalesce(country_breakdown.country_breakdown, '[]'::jsonb) as country_breakdown
from daily_summary summary
left join device_breakdown on device_breakdown.date = summary.date
left join country_breakdown on country_breakdown.date = summary.date
order by summary.date desc;

revoke all on public.site_visit_sessions from public, anon, authenticated;
grant select, insert, update on public.site_visit_sessions to service_role;
grant select on public.site_visits_daily to service_role;
