import type { Match } from './types';
import type { Competition, Inscricao } from './db';

// Momento em destaque pra Home — resultado recente, inscrição aprovada
// recente, ou o próximo jogo agendado (fallback = comportamento de hoje).
export type FeaturedMoment =
  | { kind: 'result'; match: Match; competition: Competition }
  | { kind: 'inscricao'; inscricao: Inscricao; competition: Competition }
  | { kind: 'upcoming'; match: Match; competition: Competition }
  | { kind: 'none' };

export interface HomeFeed {
  featured: FeaturedMoment;
  upcoming: Match[]; // mesclado entre competições, mais próximo primeiro
  recent: Match[];   // mesclado entre competições, mais recente primeiro
}

// Janela de "recente" pro destaque do banner — resultado/inscrição fora
// dessa janela não vence um jogo agendado.
const RECENCY_WINDOW_MS = 48 * 60 * 60 * 1000;

function msOf(iso: string | null): number {
  if (!iso) return -Infinity; // sem timestamp real → nunca "recente", vai pro fim
  const t = Date.parse(iso);
  return isNaN(t) ? -Infinity : t;
}

// Desempate determinístico pra partidas sem scheduledAt/finalizedAt (linhas
// legadas pré-migração) — reproduz a ordem já usada hoje numa só competição.
function legacyOrderKey(m: Match): [number, number] {
  return [m.rodada, m.id];
}

export function buildHomeFeed(input: {
  competitions: Competition[];
  matches: Match[];                // já filtradas às competições relevantes
  approvedInscricoes: Inscricao[]; // idem
  now?: number;
}): HomeFeed {
  const now = input.now ?? Date.now();
  const compById = new Map(input.competitions.map(c => [c.id, c]));

  const finalized = input.matches.filter(m => m.status === 'finalizado');
  const scheduled = input.matches.filter(m => m.status === 'agendado');

  // Últimos resultados: mais recente primeiro. Sem finalizedAt (legado) vai
  // pro fim, desempatado por (rodada, id) desc entre si.
  const recent = [...finalized].sort((a, b) => {
    const ta = msOf(a.finalizedAt), tb = msOf(b.finalizedAt);
    if (ta !== tb) return tb - ta;
    const [ra, ia] = legacyOrderKey(a), [rb, ib] = legacyOrderKey(b);
    return rb - ra || ib - ia;
  });

  // Próximas partidas: mais próxima primeiro. Sem scheduledAt vai pro fim,
  // desempatado por (rodada, id) asc — replica a ordem atual de 1 competição.
  const upcoming = [...scheduled].sort((a, b) => {
    const aHas = a.scheduledAt != null, bHas = b.scheduledAt != null;
    if (aHas !== bHas) return aHas ? -1 : 1;
    if (aHas && bHas) return msOf(a.scheduledAt) - msOf(b.scheduledAt);
    const [ra, ia] = legacyOrderKey(a), [rb, ib] = legacyOrderKey(b);
    return ra - rb || ia - ib;
  });

  // Momento em destaque — prioridade explícita e determinística:
  // 1. Resultado finalizado dentro de 48h (o mais recente de todos)
  // 2. Empate exato entre resultado e inscrição → resultado vence
  // 3. Inscrição aprovada dentro de 48h, se não houver resultado mais recente
  // 4. Nada recente → cai pro próximo jogo agendado
  // 5. Nada agendado nem recente, mas há histórico antigo → mostra assim mesmo
  // 6. Sem dado nenhum → 'none'
  const bestResult = recent[0];
  const bestInscricao = input.approvedInscricoes[0];
  const resultAge = bestResult ? now - msOf(bestResult.finalizedAt) : Infinity;
  const inscricaoAge = bestInscricao?.reviewed_at ? now - Date.parse(bestInscricao.reviewed_at) : Infinity;

  let featured: FeaturedMoment = { kind: 'none' };
  if (bestResult && resultAge <= RECENCY_WINDOW_MS && resultAge <= inscricaoAge) {
    const c = compById.get(bestResult.competition_id);
    if (c) featured = { kind: 'result', match: bestResult, competition: c };
  } else if (bestInscricao && inscricaoAge <= RECENCY_WINDOW_MS) {
    const c = compById.get(bestInscricao.competition_id);
    if (c) featured = { kind: 'inscricao', inscricao: bestInscricao, competition: c };
  }
  if (featured.kind === 'none' && upcoming[0]) {
    const c = compById.get(upcoming[0].competition_id);
    if (c) featured = { kind: 'upcoming', match: upcoming[0], competition: c };
  }
  if (featured.kind === 'none' && bestResult) {
    const c = compById.get(bestResult.competition_id);
    if (c) featured = { kind: 'result', match: bestResult, competition: c };
  }

  return { featured, upcoming, recent };
}
