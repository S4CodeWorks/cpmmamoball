import type { InscricaoJogador } from './db';

export const MIN_ROSTER = 5;
export const MAX_ROSTER = 10;
export const MAX_LIST_LENGTH = 12000;
export type RegistrationPlayer = InscricaoJogador & { key: string };
export interface RegistrationDraft {
  nome: string;
  tag: string;
  jogadores: InscricaoJogador[];
  captain: InscricaoJogador | null;
}
export const blankPlayer = (): InscricaoJogador => ({ nick: '', game_id: '', discord: '', posicao: null });
export const cleanGameId = (value: string) => value.trim().replace(/^#/, '');
export const cleanDiscord = (value: string) => value.trim().replace(/^<@!?([0-9]+)>$/, '$1');
const strip = (value: string) => value.replace(/[*`]/g, '').trim();

/** Community list parser: identifiers always stay strings and retain case. */
export function parseRegistrationList(source: string): RegistrationDraft {
  const draft: RegistrationDraft = { nome: '', tag: '', jogadores: [], captain: null };
  let captainMention = '';
  for (const raw of source.split(/\r?\n/)) {
    const line = strip(raw);
    const heading = line.match(/(?:^|\s)(Nome(?:\s+do\s+time)?|Tag|Capit[aã]o)\s*:\s*(.*)$/i);
    if (heading) {
      if (/^nome/i.test(heading[1])) draft.nome = strip(heading[2]);
      else if (/^tag/i.test(heading[1])) draft.tag = strip(heading[2]);
      else captainMention = cleanDiscord(strip(heading[2]));
      continue;
    }
    if (/nick\s*\|.*id/i.test(line)) continue;
    const game = line.match(/#([a-zA-Z0-9]+)/);
    if (!game) {
      // Keep incomplete numbered entries reviewable; ignore only empty markers.
      const remainder = line.replace(/^[\d\s.()\-\uFE0F\u20E3]+/u, '').trim();
      if (/^\d/.test(line) && remainder) draft.jogadores.push({ nick: remainder, game_id: '', discord: null, posicao: null });
      continue;
    }
    const nick = strip(line.slice(0, game.index).replace(/^[\d\s.()\-\uFE0F\u20E3]+/u, '').replace(/[|·,;]+\s*$/, ''));
    const discord = line.match(/<@!?(\d+)>/);
    draft.jogadores.push({ nick, game_id: game[1], discord: discord?.[1] || null, posicao: null });
  }
  // An exact unique Discord match is evidence; nickname and row position are not.
  const matches = draft.jogadores.filter(p => p.discord && p.discord === captainMention);
  if (matches.length === 1) draft.captain = { ...matches[0] };
  return draft;
}

export function playerIssues(player: InscricaoJogador): string[] {
  const errors: string[] = [];
  if (!player.nick.trim() || player.nick.trim().length > 80) errors.push('Informe um nick de até 80 caracteres.');
  if (!/^[A-Za-z0-9]{1,32}$/.test(cleanGameId(player.game_id))) errors.push('Informe o ID do jogo, com letras e números.');
  if ((player.discord || '').length > 100) errors.push('Discord deve ter até 100 caracteres.');
  if (player.posicao && !['GK', 'VL', 'PV/ATK', 'MC'].includes(player.posicao)) errors.push('Selecione uma posição válida.');
  return errors;
}

export function registrationIssues(draft: RegistrationDraft): string[] {
  const errors: string[] = [];
  if (!draft.nome.trim() || draft.nome.trim().length > 80) errors.push('Informe o nome do time, até 80 caracteres.');
  if (!draft.tag.trim() || draft.tag.trim().length > 4) errors.push('A tag precisa de 1 a 4 caracteres.');
  if (draft.jogadores.length < MIN_ROSTER || draft.jogadores.length > MAX_ROSTER) errors.push('O elenco precisa de 5 a 10 jogadores.');
  const seen = new Set<string>();
  draft.jogadores.forEach((p, i) => {
    if (playerIssues(p).length) errors.push(`Revise nick e ID do jogador ${i + 1}.`);
    const id = cleanGameId(p.game_id);
    if (seen.has(id)) errors.push(`ID repetido: #${id}.`);
    seen.add(id);
  });
  if (!draft.captain || playerIssues(draft.captain).length) errors.push('Escolha um capitão com nick e ID do jogo.');
  return [...new Set(errors)];
}

export function normalizePlayer(p: InscricaoJogador): InscricaoJogador {
  return { nick: p.nick.trim(), game_id: cleanGameId(p.game_id), discord: cleanDiscord(p.discord || '') || null, posicao: p.posicao || null };
}

/** Validate untrusted JSON without coercing Discord snowflakes to JS numbers. */
export function readDraft(input: unknown): RegistrationDraft | null {
  if (!input || typeof input !== 'object') return null;
  const obj = input as Record<string, unknown>;
  const readPlayer = (value: unknown): InscricaoJogador | null => {
    if (!value || typeof value !== 'object') return null;
    const p = value as Record<string, unknown>;
    if (typeof p.nick !== 'string' || typeof p.game_id !== 'string' || (p.discord != null && typeof p.discord !== 'string')) return null;
    if (p.posicao != null && !['GK', 'VL', 'PV/ATK', 'MC'].includes(String(p.posicao))) return null;
    return normalizePlayer(p as unknown as InscricaoJogador);
  };
  if (typeof obj.nome !== 'string' || typeof obj.tag !== 'string' || !Array.isArray(obj.jogadores) || obj.jogadores.length > 50) return null;
  const jogadores = obj.jogadores.map(readPlayer);
  const captain = obj.captain == null ? null : readPlayer(obj.captain);
  if (jogadores.some(p => !p) || (obj.captain != null && !captain)) return null;
  return { nome: obj.nome.trim(), tag: obj.tag.trim(), jogadores: jogadores as InscricaoJogador[], captain };
}
