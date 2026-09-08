create extension if not exists pgcrypto;

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  image_url text not null,
  slideshow_image_url text not null default '',
  location_name text not null,
  country_name text not null default '',
  taken_on date,
  lat double precision not null,
  lng double precision not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists photos_created_at_idx
  on public.photos (created_at desc);
