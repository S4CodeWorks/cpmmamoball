/**
 * data.ts — Os dados agora vêm do Supabase via DataContext.
 *
 * Este arquivo mantém apenas os helpers de fallback usados em
 * componentes que ainda não migraram para useData().
 * NÃO adicionar novos dados hardcoded aqui.
 */

import type { Club } from './types';

// Listas vazias — dados reais vêm de contexts/DataContext.tsx
export const CLUBS:     Club[]   = [];
export const STANDINGS: never[]  = [];
export const MATCHES:   never[]  = [];
export const SCORERS:   never[]  = [];
export const NEWS:      never[]  = [];

/** Retorna clube pelo id. Preferir useData().clubById() nos componentes. */
export const clubById = (id: string): Club | undefined =>
  CLUBS.find(c => c.id === id);

export const ABBREV = (c?: Club): string =>
  (c?.tag || c?.nome?.slice(0, 3) || '?').toUpperCase();
