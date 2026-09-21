-- Sigil init migration
-- All tables use UUID or natural primary keys, created_at/updated_at, and RLS.

-- Shared trigger

create or replace function public.set_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end $$;

-- 1. profiles: one row per signed-in user

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  github_id bigint unique not null,
  login text not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index profiles_login_lower_idx on public.profiles (lower(login));

grant select, insert, update, delete on public.profiles to authenticated;
grant all on public.profiles to service_role;

alter table public.profiles enable row level security;

create policy profiles_select on public.profiles for select using (id = auth.uid());
create policy profiles_insert on public.profiles for insert with check (id = auth.uid());
create policy profiles_update on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_delete on public.profiles for delete using (id = auth.uid());

-- 2. github_tokens: AES-GCM encrypted OAuth tokens. Ciphertext is never readable by clients.

create table public.github_tokens (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  ciphertext text not null,
  iv text not null,
  scopes text[] not null default '{}',
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.github_tokens enable row level security;

revoke all on public.github_tokens from anon, authenticated;

grant select (user_id, scopes, last_used_at, revoked_at, created_at) on public.github_tokens to authenticated;
grant delete on public.github_tokens to authenticated;
grant all on public.github_tokens to service_role;

create policy tokens_select on public.github_tokens for select using (user_id = auth.uid());
create policy tokens_delete on public.github_tokens for delete using (user_id = auth.uid());

-- INSERT and UPDATE have no policies on purpose: only the Worker (service role) writes tokens.

-- 3. snapshots: one compact JSON per GitHub login (public GitHub stats)

create table public.snapshots (
  login text primary key check (login = lower(login)),
  github_id bigint,
  data jsonb not null,
  source text not null check (source in ('public_pool','user_token')),
  fetched_at timestamptz not null default now(),
  next_refresh_at timestamptz not null,
  last_requested_at timestamptz not null default now(),
  fail_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index snapshots_refresh_idx on public.snapshots (next_refresh_at);

grant select on public.snapshots to authenticated;
grant all on public.snapshots to service_role;

alter table public.snapshots enable row level security;

create policy snapshots_select_own on public.snapshots for select
  using (login = (select lower(login) from public.profiles where id = auth.uid()));

-- Writes: service role only (no INSERT/UPDATE/DELETE policies).

-- 4. contribution_years: immutable-ish per-year daily counts (past years cached for 30 days)

create table public.contribution_years (
  login text not null check (login = lower(login)),
  year int not null,
  total int not null,
  days int[] not null,            -- days[0] = Jan 1; length 365/366, partial for current year
  fetched_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (login, year)
);

grant select on public.contribution_years to authenticated;
grant all on public.contribution_years to service_role;

alter table public.contribution_years enable row level security;

create policy cy_select_own on public.contribution_years for select
  using (login = (select lower(login) from public.profiles where id = auth.uid()));

-- 5. card_presets: saved packs from the studio

create table public.card_presets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  params jsonb not null,          -- { theme, overrides, cards: [{card, params}] }
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index card_presets_user_idx on public.card_presets (user_id, updated_at desc);

grant select, insert, update, delete on public.card_presets to authenticated;
grant all on public.card_presets to service_role;

alter table public.card_presets enable row level security;

create policy presets_select on public.card_presets for select using (user_id = auth.uid() or is_public);
create policy presets_insert on public.card_presets for insert with check (user_id = auth.uid());
create policy presets_update on public.card_presets for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy presets_delete on public.card_presets for delete using (user_id = auth.uid());

-- 6. theme_votes: one vote per user per community theme

create table public.theme_votes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  theme_id text not null check (theme_id ~ '^[a-z0-9-]{2,40}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, theme_id)
);

grant select, insert, update, delete on public.theme_votes to authenticated;
grant all on public.theme_votes to service_role;

alter table public.theme_votes enable row level security;

create policy votes_select on public.theme_votes for select using (user_id = auth.uid());
create policy votes_insert on public.theme_votes for insert with check (user_id = auth.uid());
create policy votes_update on public.theme_votes for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy votes_delete on public.theme_votes for delete using (user_id = auth.uid());

-- 7. optouts: logins that must never be served or stored

create table public.optouts (
  login text primary key check (login = lower(login)),
  user_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update, delete on public.optouts to authenticated;
grant all on public.optouts to service_role;

alter table public.optouts enable row level security;

create policy optouts_select on public.optouts for select using (user_id = auth.uid());
create policy optouts_insert on public.optouts for insert
  with check (user_id = auth.uid() and login = (select lower(login) from public.profiles where id = auth.uid()));
create policy optouts_update on public.optouts for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy optouts_delete on public.optouts for delete using (user_id = auth.uid());

-- updated_at triggers

do $$ declare t text; begin
  foreach t in array array['profiles','github_tokens','snapshots','contribution_years','card_presets','theme_votes','optouts']
  loop execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t); end loop;
end $$;

-- Signup: create profile + default preset

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare p uuid;
begin
  insert into public.profiles (id, github_id, login, avatar_url)
  values (new.id, (new.raw_user_meta_data->>'provider_id')::bigint,
          coalesce(new.raw_user_meta_data->>'user_name', new.raw_user_meta_data->>'preferred_username'),
          new.raw_user_meta_data->>'avatar_url')
  returning id into p;

  insert into public.card_presets (user_id, name, params) values (p, 'Default Pack',
    '{"theme":"obsidian","overrides":{},"cards":[{"card":"overview"},{"card":"streak"},{"card":"languages"},{"card":"heatmap"}]}'::jsonb);

  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- Cron helper: lease stale snapshots so two cron runs never claim the same rows

create or replace function public.claim_stale_snapshots(batch int default 20)
returns setof public.snapshots language sql security definer set search_path = public as $$
  update public.snapshots s set next_refresh_at = now() + interval '15 minutes'
  where s.login in (
    select login from public.snapshots
    where next_refresh_at <= now() and last_requested_at > now() - interval '30 days'
    order by last_requested_at desc limit batch for update skip locked)
  returning s.*;
$$;

revoke all on function public.claim_stale_snapshots(int) from public, anon, authenticated;
grant execute on function public.claim_stale_snapshots(int) to service_role;

-- Public vote totals without exposing who voted

create or replace function public.theme_vote_counts()
returns table(theme_id text, votes bigint) language sql security definer set search_path = public as $$
  select theme_id, count(*) from public.theme_votes group by theme_id;
$$;

grant execute on function public.theme_vote_counts() to anon, authenticated;