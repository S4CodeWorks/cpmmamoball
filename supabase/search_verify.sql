-- Transactional verification: the unpublished fixture is always rolled back.
begin;
insert into public.news (id,title,date_str,published) values ('cpm-search-verify-draft','zzcpmverifydraftzz','06 out',false);
set local role anon;
do $$
begin
  assert (select count(*) from public.cpm_search('News','zzcpmverifydraftzz')) = 0, 'Draft leaked';
  assert public.cpm_search_normalize(' ÁÉíÓçã ') = 'aeioca', 'Accent normalization failed';
  assert (select count(*) from public.cpm_search('Club','%')) = 0, 'Percent interpreted as wildcard';
  assert (select count(*) from public.cpm_search('Player','_')) = 0, 'Underscore interpreted as wildcard';
  assert (select count(*) from public.cpm_search('Player','')) = 0, 'Blank player query enumerates players';
  assert (select title from public.cpm_search('Club','RMA',1)) = 'Real Madrid', 'Exact tag lookup failed';
  assert (select title from public.cpm_search('Club','madrid real',1)) = 'Real Madrid', 'Word order lookup failed';
  assert (select title from public.cpm_search('Club','real madird',1)) = 'Real Madrid', 'Typo lookup failed';
  assert (select game_id from public.cpm_search('Player','#IDJ1',1)) = 'IDJ1', 'Hash ID lookup failed';
  assert (select title from public.cpm_search('News','atenção',1)) = 'ATENCAO', 'Accented news lookup failed';
  assert (select count(*) from public.cpm_search('Player','Jogador',3,3)) = 2, 'Pagination failed';
  assert not exists (select id from public.cpm_search('Player','Jogador',3,0) intersect select id from public.cpm_search('Player','Jogador',3,3)), 'Pages overlap';
  assert (select count(*) from public.cpm_search('Club','',-1,-1)) = 1, 'Limits not clamped';
end $$;
rollback;
select 'PASS: draft exclusion, anon visibility, accent/tag/ID/typo, literal filters, pagination and bounded inputs' as verification;
