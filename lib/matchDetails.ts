import type { GoalEntry, Match } from './types';
import { matchDate } from './matchDate';

export interface GoalGroup { nick: string; ownGoal: boolean; goals: number; assists: string[] }

/** Entries have no timestamps: aggregate attribution, never imply an event timeline. */
export function groupMatchGoals(entries: GoalEntry[]): GoalGroup[] {
  const groups = new Map<string, GoalGroup>();
  for (const entry of entries) {
    const ownGoal = Boolean(entry.own_goal), key = JSON.stringify([entry.nick, ownGoal]);
    if (!groups.has(key)) groups.set(key, { nick: entry.nick, ownGoal, goals: 0, assists: [] });
    const group = groups.get(key)!;
    group.goals++;
    if (!ownGoal && entry.assist && !group.assists.includes(entry.assist)) group.assists.push(entry.assist);
  }
  return [...groups.values()];
}

/** Only explicit, valid dates can establish that a match precedes another. */
export function matchMoment(match: Match): number | null {
  for (const iso of [match.scheduledAt, match.finalizedAt]) {
    if (iso && Number.isFinite(Date.parse(iso))) return Date.parse(iso);
  }
  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const legacy = match.date?.match(/\b(\d{1,2})\s*[\/\s]\s*(\d{1,2}|jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)\s*[\/\s]\s*(\d{4})\b/i);
  if (!legacy) return null;
  const day = Number(legacy[1]), month = /^\d+$/.test(legacy[2]) ? Number(legacy[2]) - 1 : months.indexOf(legacy[2].toLowerCase()), year = Number(legacy[3]);
  const date = new Date(Date.UTC(year, month, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month && date.getUTCDate() === day ? date.getTime() : null;
}

export function previousEncounters(match: Match, matches: Match[]): Match[] {
  const current = matchMoment(match);
  if (current == null) return [];
  return matches.filter(other => {
    const time = matchMoment(other);
    return other.id !== match.id && other.status === 'finalizado' && time != null && time < current &&
      other.scoreH != null && other.scoreA != null &&
      ((other.home === match.home && other.away === match.away) || (other.home === match.away && other.away === match.home));
  }).sort((a, b) => matchMoment(b)! - matchMoment(a)! || b.id - a.id);
}

export function encounterRecord(match: Match, matches: Match[]) {
  let homeWins = 0, awayWins = 0, draws = 0;
  for (const other of matches) {
    if (other.scoreH == null || other.scoreA == null) continue;
    const homeScore = other.home === match.home ? other.scoreH : other.scoreA;
    const awayScore = other.home === match.home ? other.scoreA : other.scoreH;
    if (homeScore === awayScore) draws++;
    else if (homeScore > awayScore) homeWins++;
    else awayWins++;
  }
  return { homeWins, awayWins, draws };
}

export function matchDetailDate(match: Match): string {
  const date = matchDate(match);
  if (match.status === 'agendado') return date.day === '—' ? 'Data a definir' : date.short + ' · ' + date.time;
  const moment = matchMoment(match);
  if (moment == null) return match.date?.trim() || 'Data a definir';
  return new Intl.DateTimeFormat('pt-BR', { timeZone: [match.scheduledAt, match.finalizedAt].some(iso => iso && Number.isFinite(Date.parse(iso))) ? 'America/Sao_Paulo' : 'UTC', day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(moment)).replace(/ de /g, ' ').replace('.', '');
}

export function matchStatus(match: Match) {
  if (match.is_wo) return { label: 'W.O.', icon: 'authAlert' as const };
  if (match.status === 'agendado') return { label: 'Agendado', icon: 'calendar' as const };
  if (match.status === 'ao_vivo') return { label: 'Ao vivo', icon: 'matchBall' as const };
  return { label: match.scoreH != null && match.scoreH === match.scoreA ? 'Empate' : 'Final', icon: 'check' as const };
}
