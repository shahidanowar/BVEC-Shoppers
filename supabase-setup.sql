-- ============================================
-- BVEC Shoppers — Supabase Database Setup
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================

-- 1. Profiles table
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  whatsapp_number text,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Public profiles" on profiles
  for select using (true);

create policy "Users update own profile" on profiles
  for update using (auth.uid() = id);

create policy "Users insert own profile" on profiles
  for insert with check (auth.uid() = id);


-- 2. Products table
create table if not exists products (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  description text,
  price numeric not null,
  category text,
  images text[] default '{}',
  created_at timestamptz default now()
);

alter table products enable row level security;

create policy "Anyone can view products" on products
  for select using (true);

create policy "Users insert own products" on products
  for insert with check (auth.uid() = user_id);

create policy "Users update own products" on products
  for update using (auth.uid() = user_id);

create policy "Users delete own products" on products
  for delete using (auth.uid() = user_id);


-- 3. Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists to avoid errors on re-run
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
