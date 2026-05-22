export interface Club {
  id: string;
  nome: string;
  tag: string;
  color: string;
  color2: string;
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

export interface Match {
  id: number;
  home: string;
  away: string;
  scoreH: number | null;
  scoreA: number | null;
  status: 'agendado' | 'finalizado' | 'ao_vivo';
  rodada: number;
  date: string;
  stage: string;
}

export interface Scorer {
  nick: string;
  club: string;
  goals: number;
  assists: number;
  jogos: number;
}

export interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  tag: string;
  date: string;
  readTime: string;
  author: string;
  img: string;
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
  | 'profile'
  | 'settings'
  | 'subscription'
  | 'rules'
  | 'support'
  | 'search'
  | 'admin';

export interface HistoryEntry {
  page: Page;
  param: string | number | null;
  extra: string | null;
}

export type FormResult = 'V' | 'E' | 'D';
