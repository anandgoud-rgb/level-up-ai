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
