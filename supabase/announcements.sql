-- Public CPM inbox, staff drafts/publication, private account read history.
-- The existing profiles.role staff predicate needs an immutable client role.
revoke insert, update, delete on public.profiles from public, anon, authenticated;
grant update (nick) on public.profiles to authenticated;

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) between 1 and 160),
  excerpt text not null default '' check (length(excerpt) <= 320),
  body text not null check (length(trim(body)) between 1 and 12000),
  destination text check (destination in ('jogos','tournaments','club','article','subscription','rules','saved')),
  destination_id text check (length(destination_id) <= 120),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  constraint announcement_destination_shape check (
    (destination is not null or destination_id is null)
    and (destination not in ('club','article') or destination_id is not null)
  )
);
create index if not exists announcements_published_at_idx on public.announcements (published_at desc, id desc) where published_at is not null;
alter table public.announcements enable row level security;
revoke all on public.announcements from public, anon, authenticated;
grant select on public.announcements to anon, authenticated;
grant insert, update, delete on public.announcements to authenticated;
create policy "public published announcements" on public.announcements for select to anon, authenticated
  using (published_at is not null and published_at <= now());
create policy "staff manage announcements" on public.announcements for all to authenticated
  using ((select role from public.profiles where id = (select auth.uid())) = 'staff')
  with check ((select role from public.profiles where id = (select auth.uid())) = 'staff');

create table if not exists public.announcement_reads (
  user_id uuid not null references auth.users(id) on delete cascade,
  announcement_id uuid not null references public.announcements(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (user_id, announcement_id)
);
create index if not exists announcement_reads_announcement_idx on public.announcement_reads (announcement_id);
alter table public.announcement_reads enable row level security;
revoke all on public.announcement_reads from public, anon, authenticated;
grant select, insert, update, delete on public.announcement_reads to authenticated;
create policy "own announcement reads" on public.announcement_reads for select to authenticated using ((select auth.uid()) = user_id);
create policy "own published announcement insert" on public.announcement_reads for insert to authenticated
  with check ((select auth.uid()) = user_id and exists (select 1 from public.announcements a where a.id = announcement_id and a.published_at is not null and a.published_at <= now()));
create policy "own published announcement update" on public.announcement_reads for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id and exists (select 1 from public.announcements a where a.id = announcement_id and a.published_at is not null and a.published_at <= now()));
create policy "own announcement read deletion" on public.announcement_reads for delete to authenticated using ((select auth.uid()) = user_id);

-- No seed announcements, push subscriptions, broadcasts or scheduler.
