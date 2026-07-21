export interface Club {
  id: string;
  nome: string;
  tag: string;
  color: string;
  color2: string;
  logo_url?: string | null;
}

export type Position = 'GK' | 'VL' | 'PV/ATK' | 'MC';

export interface Player {
  id: string;
  club_id: string;
  nick: string;
  game_id: string;
  discord?: string | null;
  posicao?: Position | null;
  is_captain: boolean;
  created_at: string;
}

export interface Standing {
  club: string;
  J: number;
  V: number;
  E: number;
  D: number;
  GP: number;
  GC: number;
  SG: number;
  P: number;
  form: ('V' | 'E' | 'D')[];
}

// Um gol dentro de home_scorers/away_scorers — se own_goal, o nick pertence ao
// elenco do time ADVERSÁRIO daquele array (marcou contra o próprio time).
// assist (opcional) é o nick de um companheiro do PRÓPRIO artilheiro que deu
// o passe pra esse gol específico — nunca se aplica a gol contra.
export interface GoalEntry {
  nick: string;
  own_goal?: boolean;
  assist?: string | null;
}

export interface Match {
  id: number;
  competition_id: string;
  home: string;
  away: string;
  scoreH: number | null;
  scoreA: number | null;
  status: 'agendado' | 'finalizado' | 'ao_vivo';
  rodada: number;
  date: string;
  stage: string;
  home_scorers: GoalEntry[];
  away_scorers: GoalEntry[];
  is_wo: boolean;
}

export interface Scorer {
  nick: string;
  game_id?: string | null;
  club: string;
  goals: number;
  assists: number;
  jogos: number;
}

export type NewsCategory = 'noticia' | 'inscricoes' | 'comunicado' | 'resultado';

export interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  body: string;
  tag: string;
  date: string;
  readTime: string;
  author: string;
  img: string;
  category: NewsCategory;
  match_id: number | null;
  competition_id: string | null;
}

export type Page =
  | 'home'
  | 'tournaments'
  | 'jogos'
  | 'news'
  | 'match'
  | 'club'
  | 'article'
  | 'more'
  | 'saved'
  | 'profile'
  | 'settings'
  | 'subscription'
  | 'rules'
  | 'support'
  | 'search'
  | 'login'
  | 'admin';

export interface HistoryEntry {
  page: Page;
  param: string | number | null;
  extra: string | null;
}

export type FormResult = 'V' | 'E' | 'D';
