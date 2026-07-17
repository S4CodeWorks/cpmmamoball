/**
 * Funções de acesso ao banco — todas retornam dados tipados do Supabase.
 * Usadas pelo DataContext para popular o estado global do app.
 */

import { supabase } from './supabase';
import type { Club, Standing, Match, Scorer, NewsItem, Player, Position, GoalEntry } from './types';

// ── Tipos específicos do banco ─────────────────────────────────────────────

export interface Competition {
  id: string;
  nome: string;
  edicao: string;
  status: 'planejado' | 'inscricoes' | 'em_andamento' | 'encerrado';
  rodada_atual: number;
  total_rodadas: number;
}

// Jogador proposto numa inscrição — ainda não é um Player real (sem club_id, o time não existe ainda)
export interface InscricaoJogador {
  nick: string;
  game_id: string;
  discord?: string | null;
  posicao?: Position | null;
}

export interface Inscricao {
  id: number;
  competition_id: string;
  nome: string;
  tag: string;
  capitao: string;
  roster: string;
  jogadores: InscricaoJogador[];
  status: 'pendente' | 'aprovado' | 'recusado';
  created_at: string;
}

// ── Helpers de mapeamento ─────────────────────────────────────────────────

function rowToClub(r: Record<string, unknown>): Club {
  return {
    id:       r.id       as string,
    nome:     r.nome     as string,
    tag:      r.tag      as string,
    color:    r.color    as string,
    color2:   r.color2   as string,
    logo_url: (r.logo_url as string | null | undefined) ?? null,
  };
}

function rowToPlayer(r: Record<string, unknown>): Player {
  return {
    id:         r.id         as string,
    club_id:    r.club_id    as string,
    nick:       r.nick       as string,
    game_id:    r.game_id    as string,
    discord:    (r.discord as string | null | undefined) ?? null,
    posicao:    (r.posicao as Position | null | undefined) ?? null,
    is_captain: (r.is_captain as boolean) ?? false,
    created_at: r.created_at as string,
  };
}

function rowToStanding(r: Record<string, unknown>): Standing {
  // Supabase retorna colunas em minúsculo (j, v, e...) — aceita ambos por segurança
  return {
    club: r.club_id as string,
    J: ((r.j ?? r.J) as number) ?? 0,
    V: ((r.v ?? r.V) as number) ?? 0,
    E: ((r.e ?? r.E) as number) ?? 0,
    D: ((r.d ?? r.D) as number) ?? 0,
    GP: ((r.gp ?? r.GP) as number) ?? 0,
    GC: ((r.gc ?? r.GC) as number) ?? 0,
    SG: ((r.sg ?? r.SG) as number) ?? 0,
    P:  ((r.p  ?? r.P)  as number) ?? 0,
    form: ((r.form as string[]) ?? []) as ('V' | 'E' | 'D')[],
  };
}

function rowToMatch(r: Record<string, unknown>): Match {
  return {
    id:      r.id       as number,
    home:    r.home_id  as string,
    away:    r.away_id  as string,
    scoreH:  r.score_h  as number | null,
    scoreA:  r.score_a  as number | null,
    status:  r.status   as Match['status'],
    rodada:  r.rodada   as number,
    date:    r.date_str as string,
    stage:   r.stage    as string,
    home_scorers: (r.home_scorers as GoalEntry[] | null) ?? [],
    away_scorers: (r.away_scorers as GoalEntry[] | null) ?? [],
    home_assists: (r.home_assists as string[] | null) ?? [],
    away_assists: (r.away_assists as string[] | null) ?? [],
    is_wo:   (r.is_wo   as boolean | null) ?? false,
  };
}

function rowToScorer(r: Record<string, unknown>): Scorer {
  return {
    nick:    r.nick    as string,
    game_id: (r.game_id as string | null | undefined) ?? null,
    club:    r.club_id as string,
    goals:   r.goals   as number,
    assists: r.assists as number,
    jogos:   r.jogos   as number,
  };
}

function rowToNews(r: Record<string, unknown>): NewsItem {
  return {
    id:       r.id        as string,
    title:    r.title     as string,
    excerpt:  r.excerpt   as string,
    body:     (r.body as string | null | undefined) ?? '',
    tag:      r.tag       as string,
    date:     r.date_str  as string,
    readTime: r.read_time as string,
    author:   r.author    as string,
    img:      r.img       as string,
    category: (r.category as NewsItem['category'] | null) ?? 'noticia',
    match_id: (r.match_id as number | null) ?? null,
    competition_id: (r.competition_id as string | null) ?? null,
  };
}

// ── Leitura ───────────────────────────────────────────────────────────────

export async function fetchClubs(): Promise<Club[]> {
  const { data, error } = await supabase
    .from('clubs')
    .select('*')
    .order('nome');
  if (error) throw error;
  return (data ?? []).map(rowToClub);
}

export async function fetchCompetitions(): Promise<Competition[]> {
  const { data, error } = await supabase
    .from('competitions')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Competition[];
}

export async function fetchStandings(competitionId: string): Promise<Standing[]> {
  const { data, error } = await supabase
    .from('standings')
    .select('*')
    .eq('competition_id', competitionId)
    .order('p', { ascending: false })
    .order('sg', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToStanding);
}

export async function fetchMatches(competitionId: string): Promise<Match[]> {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('competition_id', competitionId)
    .order('rodada', { ascending: false })
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(rowToMatch);
}

export async function fetchScorers(competitionId: string): Promise<Scorer[]> {
  const { data, error } = await supabase
    .from('scorers')
    .select('*')
    .eq('competition_id', competitionId)
    .order('goals', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToScorer);
}

export async function fetchNews(): Promise<NewsItem[]> {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToNews);
}

export async function fetchInscricoes(competitionId?: string): Promise<Inscricao[]> {
  let q = supabase
    .from('inscricoes')
    .select('*')
    .order('created_at', { ascending: false });
  if (competitionId) q = q.eq('competition_id', competitionId);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Inscricao[];
}

// ── Favoritos / salvos (clubes, partidas, notícias) ────────────────────────
// Chave: 'club:<id>' | 'match:<id>' | 'art:<id>'

export async function fetchBookmarkKeys(userId: string): Promise<string[]> {
  const { data, error } = await supabase.from('bookmarks').select('key').eq('user_id', userId);
  if (error) throw error;
  return (data ?? []).map(r => (r as { key: string }).key);
}

export async function addBookmarkKey(userId: string, key: string): Promise<void> {
  const { error } = await supabase.from('bookmarks').insert({ user_id: userId, key });
  if (error) throw error;
}

export async function removeBookmarkKey(userId: string, key: string): Promise<void> {
  const { error } = await supabase.from('bookmarks').delete().eq('user_id', userId).eq('key', key);
  if (error) throw error;
}

// ── Escrita — Clubes ──────────────────────────────────────────────────────

export async function createClub(club: Omit<Club, 'id'> & { id: string }) {
  const { error } = await supabase.from('clubs').insert({
    id: club.id, nome: club.nome, tag: club.tag,
    color: club.color, color2: club.color2,
    logo_url: club.logo_url ?? null,
  });
  if (error) throw error;
}

export async function updateClub(id: string, patch: Partial<Omit<Club, 'id'>>) {
  const { error } = await supabase.from('clubs').update(patch).eq('id', id);
  if (error) throw error;
}

export async function deleteClub(id: string) {
  const { error } = await supabase.from('clubs').delete().eq('id', id);
  if (error) throw error;
}

// ── Leitura / Escrita — Jogadores ────────────────────────────────────────────

export interface PlayerSearchResult {
  id: string;
  nick: string;
  game_id: string;
  club_id: string;
}

// Busca por nick OU ID do jogo — duas queries ilike separadas (em vez de um filtro
// .or() com string interpolada) pra não dar brecha de injeção de filtro PostgREST.
export async function searchPlayers(query: string, limit = 8): Promise<PlayerSearchResult[]> {
  const q = query.trim();
  if (!q) return [];
  const pattern = `%${q}%`;
  const [byNick, byGameId] = await Promise.all([
    supabase.from('players').select('id, nick, game_id, club_id').ilike('nick', pattern).limit(limit),
    supabase.from('players').select('id, nick, game_id, club_id').ilike('game_id', pattern).limit(limit),
  ]);
  if (byNick.error) throw byNick.error;
  if (byGameId.error) throw byGameId.error;
  const map = new Map<string, PlayerSearchResult>();
  [...(byNick.data ?? []), ...(byGameId.data ?? [])].forEach(p => map.set((p as PlayerSearchResult).id, p as PlayerSearchResult));
  return [...map.values()].slice(0, limit);
}

export async function fetchPlayers(clubId: string): Promise<Player[]> {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('club_id', clubId)
    .order('is_captain', { ascending: false })
    .order('nick');
  if (error) throw error;
  return (data ?? []).map(rowToPlayer);
}

export interface PlayerInput {
  club_id: string;
  nick: string;
  game_id: string;
  discord?: string | null;
  posicao?: Position | null;
  is_captain?: boolean;
}

// Mensagem amigável quando o ID do jogo já existe em outra conta/time (constraint UNIQUE do banco)
function friendlyPlayerError(error: { code?: string; message: string }): Error {
  if (error.code === '23505') {
    return new Error('Esse ID do jogo já está cadastrado em outro jogador (possível multi).');
  }
  return new Error(error.message);
}

export async function createPlayer(p: PlayerInput): Promise<string> {
  const { data, error } = await supabase.from('players').insert({
    club_id:    p.club_id,
    nick:       p.nick,
    game_id:    p.game_id,
    discord:    p.discord ?? null,
    posicao:    p.posicao ?? null,
    is_captain: p.is_captain ?? false,
  }).select('id').single();
  if (error) throw friendlyPlayerError(error);
  return (data as { id: string }).id;
}

export async function updatePlayer(id: string, patch: Partial<Omit<PlayerInput, 'club_id'>>) {
  const { error } = await supabase.from('players').update(patch).eq('id', id);
  if (error) throw friendlyPlayerError(error);
}

export async function deletePlayer(id: string) {
  const { error } = await supabase.from('players').delete().eq('id', id);
  if (error) throw error;
}

// Verifica quais desses IDs de jogo já existem no sistema (checagem anti-multi
// antes de enviar a inscrição — o jogador ainda não é um Player real nesse ponto).
export async function fetchTakenGameIds(gameIds: string[]): Promise<string[]> {
  const clean = gameIds.filter(Boolean);
  if (clean.length === 0) return [];
  const { data, error } = await supabase
    .from('players')
    .select('game_id')
    .in('game_id', clean);
  if (error) throw error;
  return (data ?? []).map(r => (r as { game_id: string }).game_id);
}

export async function fetchPlayerCompetitions(playerId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('player_competitions')
    .select('competition_id')
    .eq('player_id', playerId);
  if (error) throw error;
  return (data ?? []).map(r => (r as { competition_id: string }).competition_id);
}

export async function setPlayerCompetitions(playerId: string, competitionIds: string[]): Promise<void> {
  const { error: delErr } = await supabase
    .from('player_competitions')
    .delete()
    .eq('player_id', playerId);
  if (delErr) throw delErr;
  if (competitionIds.length === 0) return;
  const { error: insErr } = await supabase
    .from('player_competitions')
    .insert(competitionIds.map(cid => ({ player_id: playerId, competition_id: cid })));
  if (insErr) throw insErr;
}

// ── Vínculo clube ↔ competição ────────────────────────────────────────────────

export async function fetchClubsInCompetition(competitionId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('club_competitions')
    .select('club_id')
    .eq('competition_id', competitionId);
  if (error) throw error;
  return (data ?? []).map(r => (r as { club_id: string }).club_id);
}

export async function enrollClub(clubId: string, competitionId: string): Promise<void> {
  const { error } = await supabase
    .from('club_competitions')
    .insert({ club_id: clubId, competition_id: competitionId });
  if (error) throw error;
}

export async function unenrollClub(clubId: string, competitionId: string): Promise<void> {
  const { error } = await supabase
    .from('club_competitions')
    .delete()
    .eq('club_id', clubId)
    .eq('competition_id', competitionId);
  if (error) throw error;
}

export async function fetchPlayersInCompetition(clubId: string, competitionId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('player_competitions')
    .select('player_id')
    .eq('competition_id', competitionId);
  if (error) throw error;
  const allIds = (data ?? []).map(r => (r as { player_id: string }).player_id);
  return allIds;
}

// Inscreve o clube, cria entrada de classificação zerada e enrola todos os jogadores
export async function enrollClubWithRoster(clubId: string, competitionId: string): Promise<void> {
  await enrollClub(clubId, competitionId);
  // Classificação zerada — para o clube aparecer na tabela imediatamente
  await upsertStanding(competitionId, clubId, { J: 0, V: 0, E: 0, D: 0, GP: 0, GC: 0, SG: 0, P: 0, form: [] });
  // Jogadores
  const players = await fetchPlayers(clubId);
  if (players.length === 0) return;
  const { error } = await supabase
    .from('player_competitions')
    .upsert(
      players.map(p => ({ player_id: p.id, competition_id: competitionId })),
      { onConflict: 'player_id,competition_id' }
    );
  if (error) throw error;
}

// Remove o clube, a classificação e todos os jogadores da competição
export async function unenrollClubWithRoster(clubId: string, competitionId: string): Promise<void> {
  await unenrollClub(clubId, competitionId);
  // Remove standings
  await supabase.from('standings').delete().eq('competition_id', competitionId).eq('club_id', clubId);
  // Remove jogadores
  const players = await fetchPlayers(clubId);
  if (players.length === 0) return;
  const playerIds = players.map(p => p.id);
  await supabase.from('player_competitions').delete().eq('competition_id', competitionId).in('player_id', playerIds);
}

// ── Escrita — Competições ─────────────────────────────────────────────────

export async function createCompetition(c: Omit<Competition, 'id'> & { id: string }) {
  const { error } = await supabase.from('competitions').insert(c);
  if (error) throw error;
}

export async function updateCompetition(id: string, patch: Partial<Competition>) {
  const { error } = await supabase.from('competitions').update(patch).eq('id', id);
  if (error) throw error;
}

export async function deleteCompetition(id: string) {
  const { error } = await supabase.from('competitions').delete().eq('id', id);
  if (error) throw error;
}

// ── Escrita — Partidas ────────────────────────────────────────────────────

export interface MatchInput {
  competition_id: string;
  home_id: string;
  away_id: string;
  rodada: number;
  date_str: string;
  stage: string;
  score_h?: number | null;
  score_a?: number | null;
  status?: Match['status'];
  home_scorers?: GoalEntry[];
  away_scorers?: GoalEntry[];
  home_assists?: string[];
  away_assists?: string[];
  is_wo?: boolean;
}

export async function createMatch(m: MatchInput) {
  const { error } = await supabase.from('matches').insert({
    ...m,
    status: m.status ?? 'agendado',
  });
  if (error) throw error;
}

export async function updateMatch(id: number, patch: Partial<MatchInput & { status: Match['status'] }>) {
  const { error } = await supabase.from('matches').update(patch).eq('id', id);
  if (error) throw error;
}

export async function deleteMatch(id: number) {
  const { error } = await supabase.from('matches').delete().eq('id', id);
  if (error) throw error;
}

// ── Escrita — Artilharia ──────────────────────────────────────────────────

export interface ScorerInput {
  competition_id: string;
  club_id: string;
  nick: string;
  game_id?: string | null;
  goals?: number;
  assists?: number;
  jogos?: number;
}

export async function deleteScorersForCompetition(competitionId: string): Promise<void> {
  const { error } = await supabase.from('scorers').delete().eq('competition_id', competitionId);
  if (error) throw error;
}

export async function upsertScorer(s: ScorerInput) {
  const { error } = await supabase.from('scorers').upsert({
    competition_id: s.competition_id,
    club_id: s.club_id,
    nick: s.nick,
    game_id: s.game_id ?? null,
    goals: s.goals ?? 0,
    assists: s.assists ?? 0,
    jogos: s.jogos ?? 0,
  }, { onConflict: 'competition_id,nick' });
  if (error) throw error;
}

// ── Escrita — Classificação ───────────────────────────────────────────────

export async function upsertStanding(competitionId: string, clubId: string, data: Partial<Omit<Standing, 'club'>>) {
  // Colunas do banco são minúsculas — mapeia explicitamente
  const row: Record<string, unknown> = {
    competition_id: competitionId,
    club_id: clubId,
  };
  if (data.J  !== undefined) row.j  = data.J;
  if (data.V  !== undefined) row.v  = data.V;
  if (data.E  !== undefined) row.e  = data.E;
  if (data.D  !== undefined) row.d  = data.D;
  if (data.GP !== undefined) row.gp = data.GP;
  if (data.GC !== undefined) row.gc = data.GC;
  if (data.SG !== undefined) row.sg = data.SG;
  if (data.P  !== undefined) row.p  = data.P;
  if (data.form !== undefined) row.form = data.form;
  const { error } = await supabase.from('standings').upsert(row, { onConflict: 'competition_id,club_id' });
  if (error) throw error;
}

// ── Escrita — Notícias ────────────────────────────────────────────────────

export interface NewsInput {
  title: string;
  excerpt?: string;
  body?: string;
  tag?: string;
  date_str: string;
  read_time?: string;
  author?: string;
  img?: string;
  category?: NewsItem['category'];
  match_id?: number | null;
  competition_id?: string | null;
}

export async function createNews(n: NewsInput) {
  const { error } = await supabase.from('news').insert({
    title: n.title,
    excerpt: n.excerpt ?? '',
    body: n.body ?? '',
    tag: n.tag ?? 'Liga',
    date_str: n.date_str,
    read_time: n.read_time ?? '3 min',
    author: n.author ?? 'Redação CPM',
    img: n.img ?? '',
    category: n.category ?? 'noticia',
    match_id: n.match_id ?? null,
    competition_id: n.competition_id ?? null,
    published: true,
  });
  if (error) throw error;
}

export async function deleteNews(id: string) {
  const { error } = await supabase.from('news').delete().eq('id', id);
  if (error) throw error;
}

// ── Escrita — Inscrições ──────────────────────────────────────────────────

export async function updateInscricaoStatus(id: number, status: 'aprovado' | 'recusado') {
  const { error } = await supabase.from('inscricoes').update({ status }).eq('id', id);
  if (error) throw error;
}

// ── Escrita — Inscrição de time ───────────────────────────────────────────────

export interface InscricaoInput {
  competition_id: string;
  nome: string;
  tag: string;
  capitao: string;
  roster?: string;
  jogadores: InscricaoJogador[];
}

export async function createInscricao(i: InscricaoInput) {
  const { error } = await supabase.from('inscricoes').insert({
    competition_id: i.competition_id,
    nome: i.nome,
    tag: i.tag,
    capitao: i.capitao,
    roster: i.roster ?? '',
    jogadores: i.jogadores,
    status: 'pendente',
  });
  if (error) throw error;
}
