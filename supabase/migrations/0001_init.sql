-- Cut Tracker — initial schema
-- Run this in the Supabase SQL Editor (or via `supabase db push` once the CLI is linked).

-- ─────────────────────────────────────────────
-- preferences
-- ─────────────────────────────────────────────
create table if not exists preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  weight_unit text not null default 'kg' check (weight_unit in ('kg', 'lbs')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table preferences enable row level security;

create policy "Users can only access own preferences"
on preferences
for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- ─────────────────────────────────────────────
-- cuts
-- ─────────────────────────────────────────────
create table if not exists cuts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  start_date date not null,
  end_date date,
  starting_weight numeric,
  target_weight numeric,
  calorie_target integer,
  protein_target integer,
  rules text,
  planned_end_date date,
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'COMPLETED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table cuts enable row level security;

create policy "Users can only access own cuts"
on cuts
for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Only one ACTIVE cut per user at a time.
create unique index if not exists one_active_cut_per_user
on cuts (user_id)
where (status = 'ACTIVE');

-- ─────────────────────────────────────────────
-- daily_entries
-- ─────────────────────────────────────────────
create table if not exists daily_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  cut_id uuid not null references cuts (id) on delete cascade,
  date date not null,
  status text not null check (status in ('GREEN', 'RED')),
  weight numeric,
  calories integer,
  protein integer,
  training boolean,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, cut_id, date)
);

alter table daily_entries enable row level security;

create policy "Users can only access own daily entries"
on daily_entries
for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- ─────────────────────────────────────────────
-- updated_at triggers
-- ─────────────────────────────────────────────
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at before update on preferences
for each row execute function set_updated_at();

create trigger set_updated_at before update on cuts
for each row execute function set_updated_at();

create trigger set_updated_at before update on daily_entries
for each row execute function set_updated_at();
