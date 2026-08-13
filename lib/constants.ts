/**
 * Constantes compartilhadas — centraliza valores que antes viviam soltos em
 * componentes, pra evitar que uma mudança (nova posição, nova temporada, novo
 * limite de elenco) precise ser feita em vários lugares manualmente.
 */

import type { Position } from './types';

export const POSICOES: Position[] = ['GK', 'VL', 'PV/ATK', 'MC'];

export const MAX_ROSTER = 10;
export const MIN_ROSTER = 5;

// Defaults usados ao criar uma nova competição no Admin — ajustar aqui a cada temporada.
export const CURRENT_SEASON_EDICAO = '2026';
export const DEFAULT_TOTAL_RODADAS = 22;
