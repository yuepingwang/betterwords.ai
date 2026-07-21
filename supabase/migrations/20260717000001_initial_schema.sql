-- ------------------------------------------------------------------
-- BetterWords initial schema (see ACCOUNTS-PLAN.md, Option 2).
--
-- Shape: profiles (1:1 with auth.users) → threads (one per
-- recipient/situation) → messages (sent letters, draft versions, and
-- pasted replies, in order). context_entries is the append-only log of
-- things the app learns about a user/thread over time.
--
-- Every level carries a `context jsonb` column so new kinds of context
-- can be captured without a migration; stabilized fields get promoted
-- to real columns later.
-- ------------------------------------------------------------------

-- ---- profiles ----------------------------------------------------
-- One row per auth user, created automatically on signup (trigger at
-- the bottom). plan_tier is groundwork for paid tiers; clients cannot
-- write it (column-level grants below) — a future Stripe webhook will.
create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text,
  plan_tier  text not null default 'free',
  context    jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---- threads -----------------------------------------------------
create table public.threads (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  scenario_id     text,
  recipient_label text,
  subject         text,
  context         jsonb not null default '{}'::jsonb,  -- clarify answers, goal, tone…
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index threads_user_recent on public.threads (user_id, updated_at desc);

-- ---- messages ----------------------------------------------------
-- kind: 'draft_version' = a saved revision before sending
--       'sent'          = the letter the user copied out to send
--       'reply'         = what the recipient wrote back (pasted in)
--       'followup'      = a later message in the same thread
create table public.messages (
  id         uuid primary key default gen_random_uuid(),
  thread_id  uuid not null references public.threads (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  kind       text not null check (kind in ('draft_version', 'sent', 'reply', 'followup')),
  body       text not null,
  context    jsonb not null default '{}'::jsonb,  -- tone/length settings, strategy, subject…
  created_at timestamptz not null default now()
);

create index messages_thread_order on public.messages (thread_id, created_at);

-- ---- context_entries ---------------------------------------------
-- Append-only observations ("user softens openings", "this recipient
-- responds badly to directness"). thread_id null = user-level.
create table public.context_entries (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  thread_id  uuid references public.threads (id) on delete cascade,
  kind       text not null,
  content    jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index context_entries_user on public.context_entries (user_id, created_at desc);
create index context_entries_thread on public.context_entries (thread_id) where thread_id is not null;

-- ---- updated_at maintenance --------------------------------------
create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger threads_touch before update on public.threads
  for each row execute function public.set_updated_at();

-- ---- auto-create a profile on signup -----------------------------
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---- row-level security ------------------------------------------
-- Owner-only on every table; enforced by the database itself, so no
-- client bug can leak one user's words to another.
alter table public.profiles        enable row level security;
alter table public.threads         enable row level security;
alter table public.messages        enable row level security;
alter table public.context_entries enable row level security;

create policy "own profile read"   on public.profiles for select using (id = auth.uid());
create policy "own profile update" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

create policy "own threads" on public.threads
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own messages" on public.messages
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own context" on public.context_entries
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Clients may only edit their profile's context/email — never plan_tier
-- (that column is written by service-role code, e.g. a Stripe webhook).
revoke update on public.profiles from authenticated;
grant  update (email, context) on public.profiles to authenticated;
