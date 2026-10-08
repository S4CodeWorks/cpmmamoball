import { supabase } from './supabase';

export type SearchKind = 'Club' | 'Player' | 'News';
export type SearchCategory = 'All' | SearchKind;
export interface SearchResult {
  kind: SearchKind;
  id: string;
  title: string;
  subtitle: string | null;
  club_id: string | null;
  game_id: string | null;
  image: string | null;
  tag: string | null;
  date_str: string | null;
  total_count: number;
}
export const SEARCH_PAGE_SIZE: Record<SearchKind, number> = { Club: 5, Player: 8, News: 5 };

/** Parameterized, RLS-respecting RPC. Only public presentation fields leave the DB. */
export async function fetchSearch(kind: SearchKind, query: string, signal: AbortSignal, offset = 0): Promise<SearchResult[]> {
  const { data, error } = await supabase.rpc('cpm_search', {
    search_kind: kind,
    search_query: query.trim().slice(0, 120),
    page_size: !query.trim() ? 3 : SEARCH_PAGE_SIZE[kind],
    page_offset: offset,
  }).abortSignal(signal);
  if (error) throw error;
  return (data ?? []) as SearchResult[];
}
