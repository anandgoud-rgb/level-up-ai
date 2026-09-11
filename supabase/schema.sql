-- LevelUp AI — run this once in the Supabase SQL Editor.
-- Safe to re-run: every statement is idempotent.
--
-- The student's details travel with the signup call as user metadata, and the
-- trigger at the bottom writes the profile row server-side. This is what lets
-- signup work while email confirmation is on: at that moment the student has
-- no session yet, so the browser cannot write the row itself.

create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text not null,
  email        text not null,
  phone        text not null,
  college      text not null,
  program      text not null check (program in ('Science', 'Commerce', 'Arts')),
  passing_year int  not null check (passing_year between 2020 and 2030),
  created_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- A student can read and edit their own row, and nobody else's.
drop policy if exists "read own profile" on public.profiles;
create policy "read own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "update own profile" on public.profiles;
create policy "update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- No insert policy: rows are only ever created by the trigger below, which
-- runs as the definer and therefore bypasses row level security.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id, full_name, email, phone, college, program, passing_year
  )
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), 'Unnamed student'),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    coalesce(nullif(new.raw_user_meta_data ->> 'college', ''), 'Not given'),
    coalesce(nullif(new.raw_user_meta_data ->> 'program', ''), 'Science'),
    coalesce((nullif(new.raw_user_meta_data ->> 'passing_year', ''))::int, 2020)
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Mission progress. Unlike profiles, there is a session by the time a student
-- writes here, so ordinary RLS policies work — no trigger needed.

create table if not exists public.mission_progress (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  level_id     text not null,
  mission_id   text not null,
  status       text not null default 'in_progress'
               check (status in ('in_progress', 'done')),
  artifact     jsonb,
  xp_awarded   int  not null default 0,
  completed_at timestamptz,
  updated_at   timestamptz not null default now(),
  unique (user_id, mission_id)
);

alter table public.mission_progress enable row level security;

drop policy if exists "own progress read" on public.mission_progress;
create policy "own progress read" on public.mission_progress
  for select using (auth.uid() = user_id);

drop policy if exists "own progress write" on public.mission_progress;
create policy "own progress write" on public.mission_progress
  for insert with check (auth.uid() = user_id);

drop policy if exists "own progress update" on public.mission_progress;
create policy "own progress update" on public.mission_progress
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists mission_progress_user_level
  on public.mission_progress (user_id, level_id);

-- Level 1 ("Build Your Own"). One row per student — one build, as specified.
-- `answers` accumulates across missions; a mission can add a new key without a
-- migration. There is a session by the time a student writes here, same as
-- mission_progress, so ordinary RLS policies work.

create table if not exists public.builds (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  challenge_id text not null,
  answers      jsonb not null default '{}'::jsonb,
  locked_at    timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.builds enable row level security;

drop policy if exists "own build read" on public.builds;
create policy "own build read" on public.builds
  for select using (auth.uid() = user_id);

drop policy if exists "own build write" on public.builds;
create policy "own build write" on public.builds
  for insert with check (auth.uid() = user_id);

drop policy if exists "own build update" on public.builds;
create policy "own build update" on public.builds
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
