-- Public search: never returns drafts, contact details, or administrative fields.
-- Additive migration; source records and existing policies remain intact.
create extension if not exists unaccent with schema extensions;
create extension if not exists pg_trgm with schema extensions;

create or replace function public.cpm_search_normalize(value text)
returns text language sql immutable parallel safe security invoker
set search_path = ''
as $$
  select pg_catalog.regexp_replace(pg_catalog.lower(extensions.unaccent('extensions.unaccent'::regdictionary, pg_catalog.btrim(coalesce(value, '')))), '\s+', ' ', 'g');
$$;

create index if not exists cpm_search_club_name on public.clubs using gin (public.cpm_search_normalize(nome) extensions.gin_trgm_ops);
create index if not exists cpm_search_club_tag on public.clubs using gin (public.cpm_search_normalize(tag) extensions.gin_trgm_ops);
create index if not exists cpm_search_player_nick on public.players using gin (public.cpm_search_normalize(nick) extensions.gin_trgm_ops);
create index if not exists cpm_search_player_id on public.players using gin (public.cpm_search_normalize(game_id) extensions.gin_trgm_ops);
create index if not exists cpm_search_news_title on public.news using gin (public.cpm_search_normalize(title) extensions.gin_trgm_ops) where published = true;

create or replace function public.cpm_search(search_kind text, search_query text default '', page_size integer default 5, page_offset integer default 0)
returns table (kind text, id text, title text, subtitle text, club_id text, game_id text, image text, tag text, date_str text, total_count bigint)
language plpgsql stable security invoker
set search_path = ''
set pg_trgm.word_similarity_threshold = '0.65'
as $$
declare
  q text := public.cpm_search_normalize(pg_catalog.left(search_query, 120));
  terms text[];
  pattern text;
  take integer := greatest(1, least(coalesce(page_size, 5), 50));
  skip integer := greatest(0, least(coalesce(page_offset, 0), 10000));
begin
  if search_kind not in ('Club', 'Player', 'News') or search_kind is null then
    raise exception 'Invalid search category' using errcode = '22023';
  end if;
  q := pg_catalog.regexp_replace(q, '^#', '');
  if q = '' and search_kind <> 'Club' then return; end if;
  terms := pg_catalog.regexp_split_to_array(q, '\s+');
  -- LIKE special characters are literal user input, never filter syntax.
  pattern := '%' || pg_catalog.replace(pg_catalog.replace(pg_catalog.replace(q, chr(92), chr(92)||chr(92)), '%', chr(92)||'%'), '_', chr(92)||'_') || '%';
  return query
  with source as (
    select 'Club'::text k, c.id::text entity_id, c.nome label, c.tag secondary,
      c.id::text cid, null::text gid, c.logo_url img, c.tag entity_tag, null::text as entity_date,
      public.cpm_search_normalize(c.nome) a, public.cpm_search_normalize(c.tag) b,
      c.created_at created
    from public.clubs c where search_kind = 'Club'
    union all
    select 'Player', p.id::text, p.nick, c.nome, p.club_id::text, p.game_id,
      c.logo_url, c.tag, null::text,
      public.cpm_search_normalize(p.nick), public.cpm_search_normalize(p.game_id), p.created_at
    from public.players p join public.clubs c on c.id = p.club_id where search_kind = 'Player'
    union all
    select 'News', n.id::text, n.title, n.tag, null::text, null::text, n.img, n.tag, n.date_str,
      public.cpm_search_normalize(n.title), ''::text, n.created_at
    from public.news n where search_kind = 'News' and n.published = true
  ), matched as (
    select s.*,
      case when a = q or (b <> '' and b = q) then 1000
        when pg_catalog.starts_with(a, q) or (b <> '' and pg_catalog.starts_with(b, q)) then 700
        when a like pattern escape E'\\' or (b <> '' and b like pattern escape E'\\') then 500
        when not exists (select 1 from pg_catalog.unnest(terms) t where pg_catalog.strpos(a || ' ' || b, t) = 0) then 400
        else 100 end + greatest(extensions.word_similarity(q, a), extensions.word_similarity(q, b)) as relevance
    from source s
    where q = '' or a like pattern escape E'\\' or b like pattern escape E'\\'
      or not exists (select 1 from pg_catalog.unnest(terms) t where pg_catalog.strpos(a || ' ' || b, t) = 0)
      or (pg_catalog.length(q) >= 3 and (q operator(extensions.<%) a or (b <> '' and q operator(extensions.<%) b)))
  )
  select m.k, m.entity_id, m.label, m.secondary, m.cid, m.gid, m.img, m.entity_tag, m.entity_date, count(*) over ()
  from matched m
  order by m.relevance desc, case when search_kind = 'News' then m.created end desc,
    m.a, m.entity_id
  limit take offset skip;
end;
$$;

revoke all on function public.cpm_search(text,text,integer,integer) from public;
grant execute on function public.cpm_search(text,text,integer,integer) to anon, authenticated;
revoke all on function public.cpm_search_normalize(text) from public;
grant execute on function public.cpm_search_normalize(text) to anon, authenticated;
-- If the unaccent dictionary is ever changed, reindex the five expression indexes.
