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

// Nenhuma chamada individual ao Supabase tem timeout próprio — se uma travar
// (rede lenta, banco "acordando" de uma pausa), o Promise.allSettled espera
// pra sempre e o app fica preso no skeleton indefinidamente. Isso força um
// limite: depois de LOAD_TIMEOUT_MS, desiste e mostra erro com opção de tentar de novo.
const LOAD_TIMEOUT_MS = 12000;
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then(v => { clearTimeout(timer); resolve(v); }, e => { clearTimeout(timer); reject(e); });
  });
}

async function fetchAll(): Promise<Omit<DataState, 'loading' | 'initialLoad' | 'error'>> {
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

  return { clubs, competitions, standings, matches, scorers, news, inscricoes, activeComp: active };
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
    try {
      const data = await withTimeout(fetchAll(), LOAD_TIMEOUT_MS);
      hasLoadedOnce.current = true;
      setState({ ...data, loading: false, initialLoad: false, error: null });
    } catch {
      // Timeout ou falha inesperada — nunca deixa o usuário preso no skeleton;
      // mostra erro com botão de tentar de novo em vez de esperar pra sempre.
      setState(s => ({
        ...s, loading: false, initialLoad: false,
        error: 'Não foi possível carregar os dados. Verifique sua conexão.',
      }));
    }
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
