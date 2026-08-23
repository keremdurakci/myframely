-- MyFramely — Personalized Plate Finder schema.
-- Service-role only for writes; state_configs and plate_availability are
-- readable by anon so the client can show cached results fast.

create extension if not exists "pgcrypto";

create table if not exists state_configs (
  id uuid primary key default gen_random_uuid(),
  state_code text unique not null,
  state_name text not null,
  availability_mode text not null check (availability_mode in ('LIVE','PENDING','OFFICIAL_ONLY','DISABLED')),
  live_check_enabled boolean not null default false,
  monitoring_enabled boolean not null default false,
  official_checker_url text not null,
  cache_ttl_minutes int not null default 1440,
  rules_json jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'stripe',
  provider_payment_id text unique not null,
  amount int not null,
  currency text not null default 'usd',
  customer_email text not null,
  status text not null check (status in ('PENDING','SUCCEEDED','FAILED')),
  created_at timestamptz not null default now()
);

create table if not exists frame_orders (
  id uuid primary key default gen_random_uuid(),
  product_slug text not null,
  product_title text not null,
  customer_email text not null,
  shipping_name text not null,
  shipping_address jsonb not null,
  shipping_destination text not null check (shipping_destination in ('CA','INTL')),
  amount int not null,
  currency text not null default 'usd',
  status text not null check (status in ('PAID','SHIPPED','CANCELED')) default 'PAID',
  payment_id uuid references payments(id),
  created_at timestamptz not null default now()
);

create table if not exists plate_availability (
  id bigserial primary key,
  state_code text not null references state_configs(state_code),
  plate text not null,
  normalized_plate text not null,
  status text not null check (status in ('AVAILABLE','TAKEN','UNKNOWN','ERROR')),
  checked_at timestamptz not null default now(),
  source text not null,
  adapter_version text,
  unique (state_code, normalized_plate)
);

create table if not exists plate_status_history (
  id bigserial primary key,
  state_code text not null,
  normalized_plate text not null,
  previous_status text,
  new_status text not null,
  changed_at timestamptz not null default now()
);
create index if not exists plate_status_history_lookup_idx
  on plate_status_history (state_code, normalized_plate, changed_at desc);

create table if not exists plate_watches (
  id uuid primary key default gen_random_uuid(),
  customer_email text not null,
  state_code text not null references state_configs(state_code),
  normalized_plate text not null,
  started_at timestamptz not null default now(),
  expires_at timestamptz not null,
  status text not null check (status in ('ACTIVE','FOUND_AVAILABLE','EXPIRED','CANCELED')),
  payment_id uuid references payments(id),
  last_checked_at timestamptz,
  next_check_at timestamptz not null,
  alert_sent_at timestamptz
);
create index if not exists plate_watches_next_check_idx
  on plate_watches (next_check_at) where status = 'ACTIVE';
create index if not exists plate_watches_state_plate_idx
  on plate_watches (state_code, normalized_plate) where status = 'ACTIVE';

create table if not exists adapter_health (
  state_code text primary key references state_configs(state_code),
  status text not null default 'HEALTHY' check (status in ('HEALTHY','DEGRADED','DOWN')),
  last_success_at timestamptz,
  last_error_at timestamptz,
  consecutive_errors int not null default 0,
  last_http_status int,
  last_error_type text
);

create table if not exists watch_daily_checks (
  id bigserial primary key,
  watch_id uuid not null references plate_watches(id) on delete cascade,
  state_code text not null,
  normalized_plate text not null,
  check_date date not null,
  availability_result text not null,
  source_check_id bigint references plate_availability(id),
  checked_at timestamptz not null default now(),
  unique (watch_id, check_date)
);

-- Curated "popular plate ideas" checked periodically (see
-- app/api/cron/check-popular-plates) against each live state, so the
-- Popular Plates page can show real, currently-available results without
-- live-checking on every page view. One row per word+state; refreshed in
-- place, not appended, so a word that goes from AVAILABLE to TAKEN updates
-- rather than leaving a stale duplicate.
create table if not exists popular_plates (
  id bigserial primary key,
  word text not null,
  category text not null,
  state_code text not null references state_configs(state_code),
  status text not null check (status in ('AVAILABLE','TAKEN','UNKNOWN','ERROR')),
  checked_at timestamptz not null default now(),
  unique (word, state_code)
);
create index if not exists popular_plates_state_status_idx
  on popular_plates (state_code, status);

-- Daily rollup of getAvailabilityBatch's cache-vs-fresh-check decisions —
-- the actual source for the admin dashboard's cache hit ratio, rather than
-- a number computed from nothing. One row per calendar day, incremented in
-- place as requests come in.
create table if not exists availability_check_stats (
  check_date date primary key default current_date,
  cache_hits bigint not null default 0,
  fresh_checks bigint not null default 0
);

-- RLS: service_role bypasses RLS by default, but GRANTs are still required
-- (Postgres checks table-level GRANTs before RLS policies) — same pattern
-- as medshort-ca/supabase/schema.sql.
alter table state_configs enable row level security;
alter table plate_availability enable row level security;
alter table plate_status_history enable row level security;
alter table plate_watches enable row level security;
alter table payments enable row level security;
alter table frame_orders enable row level security;
alter table adapter_health enable row level security;
alter table watch_daily_checks enable row level security;
alter table availability_check_stats enable row level security;
alter table popular_plates enable row level security;

create policy state_configs_select_all on state_configs for select using (true);
create policy plate_availability_select_all on plate_availability for select using (true);
create policy popular_plates_select_all on popular_plates for select using (true);

grant select on state_configs to anon, authenticated;
grant select on plate_availability to anon, authenticated;
grant select on popular_plates to anon, authenticated;

-- Everything else (writes, and every operation on the remaining tables) is
-- service_role only — no policies needed beyond RLS being enabled, since
-- service_role bypasses RLS but anon/authenticated get no policy match at
-- all on tables where none is defined.
