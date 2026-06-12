-- Migrations for The Oracle Pic 4

-- Profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  subscription_tier text default 'free',
  subscription_status text default 'inactive',
  predictions_limit int default 2,
  predictions_used int default 0,
  grids_limit int default 2,
  grids_used int default 0,
  subscription_expires_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

-- Helper that returns true when the current authenticated user has the 'admin' tier.
-- SECURITY DEFINER lets the function bypass RLS when reading public.profiles,
-- which avoids the typical "infinite recursion in policy" error.
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and subscription_tier = 'admin'
  );
$$ language sql stable security definer set search_path = public;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles" on public.profiles
  for select using (public.is_admin());

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Prevent unauthorized tier updates via trigger.
-- The `service_role` (used by our server-side admin client, e.g. the PayPal capture route)
-- is allowed to bypass these checks - otherwise paid upgrades would be silently reverted.
create or replace function public.protect_profile_tier()
returns trigger as $$
declare
  jwt_role text := coalesce(auth.role(), '');
  caller_is_admin boolean := public.is_admin();
begin
  -- Server-side admin client (service_role) is trusted and bypasses these checks.
  if (jwt_role = 'service_role') then
    return new;
  end if;

  -- Only allow tier change if the caller is an admin or if the tier remains the same
  if (old.subscription_tier is distinct from new.subscription_tier) and not caller_is_admin then
    new.subscription_tier := old.subscription_tier;
  end if;

  if (old.predictions_limit is distinct from new.predictions_limit) and not caller_is_admin then
    new.predictions_limit := old.predictions_limit;
  end if;

  if (old.grids_limit is distinct from new.grids_limit) and not caller_is_admin then
    new.grids_limit := old.grids_limit;
  end if;

  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_profile_update_protect_tier
  before update on public.profiles
  for each row execute procedure public.protect_profile_tier();

-- Winning numbers table
create table if not exists public.winning_numbers (
  id uuid default gen_random_uuid() primary key,
  number text not null,
  location text not null,
  recorded_by uuid references auth.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.winning_numbers enable row level security;

drop policy if exists "Winning numbers are viewable by everyone" on public.winning_numbers;
create policy "Winning numbers are viewable by everyone" on public.winning_numbers
  for select using (true);

drop policy if exists "Only admins can record winning numbers" on public.winning_numbers;
create policy "Only admins can record winning numbers" on public.winning_numbers
  for insert with check (public.is_admin());

-- Grid marking: latest snapshot per user + page (restore marks on return)
create table if not exists public.grid_mark_snapshots (
  user_id uuid references auth.users(id) on delete cascade not null,
  page_tier text not null check (page_tier in ('basic', 'premium', 'yearly')),
  marked_cells jsonb not null default '{}'::jsonb,
  inputs jsonb default '[]'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, page_tier)
);

alter table public.grid_mark_snapshots enable row level security;

drop policy if exists "Users manage own grid mark snapshots" on public.grid_mark_snapshots;
create policy "Users manage own grid mark snapshots" on public.grid_mark_snapshots
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Grid marking memory bank (each marked cell saved for AI pattern learning)
create table if not exists public.grid_mark_memory (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  page_tier text not null check (page_tier in ('basic', 'premium', 'yearly')),
  grid_id text not null,
  cell_index int not null,
  color_name text not null,
  digit text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists grid_mark_memory_created_at_idx on public.grid_mark_memory (created_at desc);

alter table public.grid_mark_memory enable row level security;

drop policy if exists "Grid mark memory viewable by authenticated users" on public.grid_mark_memory;
create policy "Grid mark memory viewable by authenticated users" on public.grid_mark_memory
  for select using (auth.role() = 'authenticated');

drop policy if exists "Users insert own grid mark memory" on public.grid_mark_memory;
create policy "Users insert own grid mark memory" on public.grid_mark_memory
  for insert with check (auth.uid() = user_id);

-- Predictions table (to store user prediction history)
create table if not exists public.predictions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  predictions jsonb not null,
  location text,
  input_numbers text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.predictions enable row level security;

drop policy if exists "Users can view own predictions" on public.predictions;
create policy "Users can view own predictions" on public.predictions
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own predictions" on public.predictions;
create policy "Users can insert own predictions" on public.predictions
  for insert with check (auth.uid() = user_id);

-- Functions & Triggers
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Helper function to increment prediction usage
create or replace function public.increment_predictions_used()
returns void as $$
begin
  update public.profiles
  set predictions_used = predictions_used + 1,
      updated_at = timezone('utc'::text, now())
  where id = auth.uid();
end;
$$ language plpgsql security definer;

-- Payments table
create table if not exists public.payments (
  id uuid default gen_random_uuid() primary key,
  order_id text unique not null,
  user_id uuid references auth.users(id),
  email text,
  amount numeric,
  currency text,
  tier text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.payments enable row level security;

drop policy if exists "Admins can view all payments" on public.payments;
create policy "Admins can view all payments" on public.payments
  for select using (public.is_admin());

drop policy if exists "Users can view own payments" on public.payments;
create policy "Users can view own payments" on public.payments
  for select using (auth.uid() = user_id);
