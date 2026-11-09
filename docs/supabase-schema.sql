-- VYRON Supabase schema
-- Run in Supabase SQL Editor

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- User library: liked tracks (store external IDs + snapshot)
create table if not exists public.liked_tracks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  track_id text not null,          -- deezer / local id
  title text not null,
  artist text,
  album text,
  cover_url text,
  duration int,
  preview_url text,
  source text default 'deezer',
  created_at timestamptz default now(),
  unique(user_id, track_id)
);

-- Playlists
create table if not exists public.playlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  cover_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.playlist_tracks (
  id uuid primary key default gen_random_uuid(),
  playlist_id uuid not null references public.playlists(id) on delete cascade,
  track_id text not null,
  title text not null,
  artist text,
  album text,
  cover_url text,
  duration int,
  preview_url text,
  source text,
  position int default 0,
  added_at timestamptz default now()
);

-- Followed artists (for release tracking)
create table if not exists public.followed_artists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  artist_id text not null,         -- deezer id
  name text not null,
  image_url text,
  last_checked_at timestamptz,
  last_release_id text,
  last_release_date date,
  created_at timestamptz default now(),
  unique(user_id, artist_id)
);

-- Detected new releases
create table if not exists public.new_releases (
  id uuid primary key default gen_random_uuid(),
  artist_id text not null,
  artist_name text,
  release_id text not null,
  title text not null,
  cover_url text,
  release_date date,
  release_type text,               -- album / single / ep
  notified boolean default false,
  created_at timestamptz default now(),
  unique(artist_id, release_id)
);

-- RLS
alter table public.profiles enable row level security;
alter table public.liked_tracks enable row level security;
alter table public.playlists enable row level security;
alter table public.playlist_tracks enable row level security;
alter table public.followed_artists enable row level security;
alter table public.new_releases enable row level security;

create policy "Users manage own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "Users manage own likes" on public.liked_tracks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own playlists" on public.playlists
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage playlist tracks" on public.playlist_tracks
  for all using (
    exists (select 1 from public.playlists p where p.id = playlist_id and p.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.playlists p where p.id = playlist_id and p.user_id = auth.uid())
  );

create policy "Users manage own follows" on public.followed_artists
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users read new releases of followed" on public.new_releases
  for select using (
    exists (
      select 1 from public.followed_artists f
      where f.artist_id = new_releases.artist_id and f.user_id = auth.uid()
    )
  );

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name)
  values (new.id, new.email, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
