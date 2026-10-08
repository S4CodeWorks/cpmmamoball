import type { BracketTie, Club, CompetitionFormat, Match } from './types';

export interface BracketSlot {
  clubId: string | null;
  label: string;
  sourceLabel: string | null;
}

export type BracketOutcome = 'upcoming' | 'partial' | 'final' | 'tied' | 'bye' | 'invalid' | 'pending';

export interface ResolvedBracketTie {
  tie: BracketTie;
  code: string;
  home: BracketSlot;
  away: BracketSlot;
  firstLeg: Match | null;
  secondLeg: Match | null;
  homeGoals: number | null;
  awayGoals: number | null;
  winnerClubId: string | null;
  outcome: BracketOutcome;
}

export interface BracketStage {
  order: number;
  name: string;
  ties: ResolvedBracketTie[];
}

const nameOf = (id: string | null, clubs: Map<string, Club>) => id ? clubs.get(id)?.nome ?? id : null;

function stageCode(stage: string, order: number): string {
  const normalized = stage.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
  const initial = normalized.includes('quart') ? 'Q'
    : normalized.includes('oitav') ? 'O'
      : normalized.includes('semi') ? 'S'
        : normalized.includes('final') ? 'F'
          : (stage.trim().match(/[\p{L}\p{N}]/u)?.[0] ?? 'F').toUpperCase();
  return `${initial}${order}`;
}

function scoreForClub(match: Match, clubId: string): number | null {
  if (match.status !== 'finalizado' || match.scoreH === null || match.scoreA === null) return null;
  if (match.home === clubId) return match.scoreH;
  if (match.away === clubId) return match.scoreA;
  return null;
}

function isMatchForPair(match: Match, a: string, b: string): boolean {
  return (match.home === a && match.away === b) || (match.home === b && match.away === a);
}

/** Resolve only explicit bracket links and stored match scores. A tied result stays unresolved. */
export function resolveBracket(
  ties: BracketTie[],
  matches: Match[],
  clubs: Club[],
  format: CompetitionFormat,
): BracketStage[] {
  const byId = new Map(ties.map(tie => [tie.id, tie]));
  const matchById = new Map(matches.map(match => [match.id, match]));
  const clubById = new Map(clubs.map(club => [club.id, club]));
  const resolved = new Map<string, ResolvedBracketTie>();
  const resolving = new Set<string>();

  const resolveTie = (tie: BracketTie): ResolvedBracketTie => {
    const known = resolved.get(tie.id);
    if (known) return known;
    const code = stageCode(tie.stage_name, tie.tie_order);
    if (resolving.has(tie.id)) {
      const invalid: ResolvedBracketTie = {
        tie, code, home: { clubId: null, label: 'Vaga pendente', sourceLabel: null },
        away: { clubId: null, label: 'Vaga pendente', sourceLabel: null }, firstLeg: null,
        secondLeg: null, homeGoals: null, awayGoals: null, winnerClubId: null, outcome: 'invalid',
      };
      return invalid;
    }
    resolving.add(tie.id);

    const resolveSlot = (clubId: string | null, sourceId: string | null, isAbsent = false): BracketSlot => {
      if (clubId) return { clubId, label: nameOf(clubId, clubById) ?? 'Clube', sourceLabel: null };
      if (sourceId) {
        const source = byId.get(sourceId);
        if (!source) return { clubId: null, label: 'Vaga pendente', sourceLabel: null };
        const sourceResult = resolveTie(source);
        if (sourceResult.winnerClubId) {
          const id = sourceResult.winnerClubId;
          return { clubId: id, label: nameOf(id, clubById) ?? 'Clube', sourceLabel: sourceResult.code };
        }
        return { clubId: null, label: `Vencedor ${sourceResult.code}`, sourceLabel: sourceResult.code };
      }
      return { clubId: null, label: isAbsent ? 'Avança sem adversário' : 'A definir', sourceLabel: null };
    };

    const home = resolveSlot(tie.home_club_id, tie.home_source_tie_id, tie.is_bye && !tie.home_club_id);
    const away = resolveSlot(tie.away_club_id, tie.away_source_tie_id, tie.is_bye && !tie.away_club_id);
    const firstLeg = tie.first_leg_match_id ? matchById.get(tie.first_leg_match_id) ?? null : null;
    const secondLeg = tie.second_leg_match_id ? matchById.get(tie.second_leg_match_id) ?? null : null;
    let homeGoals: number | null = null;
    let awayGoals: number | null = null;
    let winnerClubId: string | null = null;
    let outcome: BracketOutcome = 'pending';

    if (tie.is_bye) {
      winnerClubId = home.clubId ?? away.clubId;
      outcome = winnerClubId ? 'bye' : 'pending';
    } else if (!home.clubId || !away.clubId) {
      outcome = 'pending';
    } else if (home.clubId === away.clubId) {
      outcome = 'invalid';
    } else if (format === 'knockout_single') {
      if (!firstLeg) outcome = 'upcoming';
      else if (!isMatchForPair(firstLeg, home.clubId, away.clubId)) outcome = 'invalid';
      else {
        homeGoals = scoreForClub(firstLeg, home.clubId);
        awayGoals = scoreForClub(firstLeg, away.clubId);
        if (homeGoals === null || awayGoals === null) outcome = 'upcoming';
        else if (homeGoals === awayGoals) outcome = 'tied';
        else {
          outcome = 'final';
          winnerClubId = homeGoals > awayGoals ? home.clubId : away.clubId;
        }
      }
    } else if (format === 'knockout_two_leg') {
      const legs = [firstLeg, secondLeg];
      if (legs.some(leg => leg && !isMatchForPair(leg, home.clubId!, away.clubId!))) {
        outcome = 'invalid';
      } else {
        const played = legs.filter((leg): leg is Match => leg !== null && leg.status === 'finalizado'
          && leg.scoreH !== null && leg.scoreA !== null);
        homeGoals = played.length ? played.reduce((sum, leg) => sum + (scoreForClub(leg, home.clubId!) ?? 0), 0) : null;
        awayGoals = played.length ? played.reduce((sum, leg) => sum + (scoreForClub(leg, away.clubId!) ?? 0), 0) : null;
        const complete = Boolean(firstLeg && secondLeg && played.length === 2);
        if (!played.length) outcome = 'upcoming';
        else if (!complete) outcome = 'partial';
        else if (homeGoals === awayGoals) outcome = 'tied';
        else {
          outcome = 'final';
          winnerClubId = homeGoals! > awayGoals! ? home.clubId : away.clubId;
        }
      }
    } else {
      outcome = 'pending';
    }

    const value: ResolvedBracketTie = {
      tie, code, home, away, firstLeg, secondLeg, homeGoals, awayGoals, winnerClubId, outcome,
    };
    resolving.delete(tie.id);
    resolved.set(tie.id, value);
    return value;
  };

  const rows = ties.map(resolveTie);
  const groups = new Map<number, BracketStage>();
  for (const row of rows) {
    const stage = groups.get(row.tie.stage_order) ?? { order: row.tie.stage_order, name: row.tie.stage_name, ties: [] };
    stage.ties.push(row);
    groups.set(row.tie.stage_order, stage);
  }
  return [...groups.values()]
    .sort((a, b) => a.order - b.order)
    .map(stage => ({ ...stage, ties: stage.ties.sort((a, b) => a.tie.tie_order - b.tie.tie_order) }));
}
