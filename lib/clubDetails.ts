import type { Match, Player, Scorer } from './types';
import { matchMoment } from './matchDetails';

/** Dated fixtures precede undated ones; the round is the deterministic legacy fallback. */
export function clubFixtures(matches: Match[]) {
  const upcoming = matches.filter(match => match.status !== 'finalizado').sort((a, b) =>
    (a.status === 'ao_vivo' ? 0 : 1) - (b.status === 'ao_vivo' ? 0 : 1) ||
    (matchMoment(a) ?? Infinity) - (matchMoment(b) ?? Infinity) || a.rodada - b.rodada || a.id - b.id);
  const results = matches.filter(match => match.status === 'finalizado').sort((a, b) =>
    (matchMoment(b) ?? -Infinity) - (matchMoment(a) ?? -Infinity) || b.rodada - a.rodada || b.id - a.id);
  return { upcoming, results };
}

/** Stable game ID wins. A nickname fallback requires a unique player AND scorer in this club. */
export function playerStatistics(player: Player, players: Player[], scorers: Scorer[]): Scorer | null {
  const clubRows = scorers.filter(row => row.club === player.club_id);
  if (player.game_id?.trim()) {
    const exact = clubRows.filter(row => row.game_id?.trim() === player.game_id.trim());
    if (exact.length === 1) return exact[0];
    if (exact.length > 1) return null;
  }
  const byName = clubRows.filter(row => row.nick === player.nick && !row.game_id?.trim());
  return player.nick && players.filter(row => row.nick === player.nick).length === 1 && byName.length === 1 ? byName[0] : null;
}
