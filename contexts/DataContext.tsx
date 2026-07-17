'use client';

/**
 * DataContext — fornece todos os dados do Supabase para o app.
 * Usa Promise.allSettled em todas as buscas para que uma tabela com
 * problema não impeça o restante dos dados de atualizar.
 */

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { Club, Standing, Match, Scorer, NewsItem } from '@/lib/types';
import type { Competition, Inscricao } from '@/lib/db';
import {
  fetchClubs, fetchCompetitions, fetchStandings,
  fetchMatches, fetchScorers, fetchNews, fetchInscricoes,
} from '@/lib/db';

interface DataState {
  clubs:        Club[];
  competitions: Competition[];
  standings:    Standing[];
  matches:      Match[];
  scorers:      Scorer[];
  news:         NewsItem[];
  inscricoes:   Inscricao[];
  activeComp:   Competition | null;
  loading:      boolean;
  // true só até a primeira busca terminar — depois disso, telas com dado zero
  // podem confiar que é "vazio de verdade" e não "ainda carregando".
  initialLoad:  boolean;
  error:        string | null;
}

interface DataContextValue extends DataState {
  refresh: () => void;
  clubById: (id: string) => Club | undefined;
}

const DataContext = createContext<DataContextValue | null>(null);

// Extrai o valor de um PromiseSettledResult, retornando fallback em caso de rejeição.
function settled<T>(r: PromiseSettledResult<T>, fallback: T): T {
  return r.status === 'fulfilled' ? r.value : fallback;
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DataState>({
    clubs: [], competitions: [], standings: [], matches: [],
    scorers: [], news: [], inscricoes: [],
    activeComp: null, loading: true, initialLoad: true, error: null,
  });
  const hasLoadedOnce = useRef(false);

  const load = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null }));

    // Primeira rodada: tabelas independentes
    const [clubsR, compsR, newsR, inscR] = await Promise.allSettled([
      fetchClubs(),
      fetchCompetitions(),
      fetchNews(),
      fetchInscricoes(),
    ]);

    const clubs        = settled(clubsR,  []);
    const competitions = settled(compsR,  []);
    const news         = settled(newsR,   []);
    const inscricoes   = settled(inscR,   []);

    // Competição ativa: primeira em andamento, senão a mais recente
    const active =
      competitions.find(c => c.status === 'em_andamento') ??
      competitions[0] ?? null;

    let standings: Standing[] = [];
    let matches:   Match[]    = [];
    let scorers:   Scorer[]   = [];

    if (active) {
      // Segunda rodada: tabelas que dependem da competição ativa
      const [standR, matchR, scorR] = await Promise.allSettled([
        fetchStandings(active.id),
        fetchMatches(active.id),
        fetchScorers(active.id),
      ]);
      standings = settled(standR, []);
      matches   = settled(matchR, []);
      scorers   = settled(scorR,  []);
    }

    hasLoadedOnce.current = true;
    setState({
      clubs, competitions, standings, matches, scorers,
      news, inscricoes, activeComp: active,
      loading: false, initialLoad: false, error: null,
    });
  }, []);

  useEffect(() => { load(); }, [load]);

  const clubById = useCallback(
    (id: string) => state.clubs.find(c => c.id === id),
    [state.clubs],
  );

  return (
    <DataContext.Provider value={{ ...state, refresh: load, clubById }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData deve ser usado dentro de <DataProvider>');
  return ctx;
}
