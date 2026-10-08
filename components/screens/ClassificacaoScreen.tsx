'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type KeyboardEvent, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CpmIcon, CpmMenuItem, CpmPopover } from '@/components/ui/CpmUi';
import { Crest } from '@/components/ui/Crest';
import { useApp } from '@/contexts/AppContext';
import { useData } from '@/contexts/DataContext';
import { fetchBracketTies, fetchMatches, fetchScorers, fetchStandings, type Competition } from '@/lib/db';
import type { BracketTie, Club, Match, Scorer, Standing } from '@/lib/types';
import { resolveBracket, type BracketStage, type ResolvedBracketTie } from '@/lib/bracket';
import { shareLink } from '@/lib/share';

interface Props {
  onNav: (page: string, param?: string | number | null, extra?: string | null) => void;
  initialTab?: string | null;
  initialCompetitionId?: string | null;
}

type ViewTab = 'table' | 'bracket' | 'scorers';
type SelectionData = {
  competitionId: string;
  loadedKey: number;
  standings: Standing[];
  scorers: Scorer[];
  matches: Match[];
  ties: BracketTie[];
  error: string | null;
};

const EMPTY_STANDINGS: Standing[] = [];
const EMPTY_SCORERS: Scorer[] = [];
const EMPTY_MATCHES: Match[] = [];
const EMPTY_TIES: BracketTie[] = [];

const FORMAT_LABELS: Record<Competition['classification_format'], string> = {
  league: 'Liga',
  knockout_single: 'Jogo único',
  knockout_two_leg: 'Ida e volta',
};

function subscribeWideLayout(callback: () => void) {
  const media = window.matchMedia('(min-width: 769px)');
  media.addEventListener('change', callback);
  return () => media.removeEventListener('change', callback);
}

const getWideLayoutSnapshot = () => window.matchMedia('(min-width: 769px)').matches;
const getWideLayoutServerSnapshot = () => false;

function useWideLayout() {
  return useSyncExternalStore(subscribeWideLayout, getWideLayoutSnapshot, getWideLayoutServerSnapshot);
}

function resultLabel(value: string) {
  return value === 'V' ? 'Vitória' : value === 'E' ? 'Empate' : value === 'D' ? 'Derrota' : 'Sem resultado';
}

function FormRun({ form, compact = false }: { form: Standing['form']; compact?: boolean }) {
  const values = form.slice(-5);
  return <div role="group" className={'cpm-classification-form' + (compact ? ' is-compact' : '')} aria-label={values.length ? `Últimos resultados: ${values.map(resultLabel).join(', ')}` : 'Sem resultados recentes'}>
    {Array.from({ length: 5 }, (_, index) => {
      const value = values[index] ?? '';
      return <span key={index} className={`cpm-form-result${value ? ` is-${value.toLowerCase()}` : ' is-empty'}`} aria-hidden="true">{value || '–'}</span>;
    })}
  </div>;
}

function ZoneLegend({ count }: { count: number }) {
  if (count < 4) return null;
  return <div className="cpm-classification-legend">
    <span><CpmIcon name="check" />1º–4º · faixa de playoffs (convenção atual)</span>
    {count > 4 && <span><CpmIcon name="classificationChevronUp" className="is-down" />Últimos 2 · faixa de rebaixamento (convenção atual)</span>}
    <span className="cpm-classification-abbreviations">J jogos · GP gols pró · GC gols contra · SG saldo</span>
    <span className="cpm-classification-form-legend"><b className="is-v">V</b> vitória <b className="is-e">E</b> empate <b className="is-d">D</b> derrota · traço sem registro</span>
  </div>;
}

function LeagueTable({ standings, clubs, onClub }: { standings: Standing[]; clubs: Club[]; onClub: (clubId: string) => void }) {
  const clubById = useMemo(() => new Map(clubs.map(club => [club.id, club])), [clubs]);
  const reducedMotion = useReducedMotion();
  const sorted = useMemo(() => standings.map((row, index) => ({ row, index }))
    .sort((a, b) => b.row.P - a.row.P || b.row.SG - a.row.SG || a.index - b.index)
    .map(item => item.row), [standings]);
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!sorted.length) return <EmptyState icon="trophy" title="Tabela sem times" detail="Os clubes inscritos aparecem aqui quando a classificação estiver disponível." />;

  return <div className="cpm-classification-table-wrap">
    <div className="cpm-league-wide" role="table" aria-label="Tabela da liga">
      <div className="cpm-league-head" role="row">
        <span role="columnheader">#</span><span className="cpm-league-head-crest" aria-hidden="true" /><span role="columnheader">Clube</span><span role="columnheader" className="is-right">Pts</span>
        <span role="columnheader">J</span><span role="columnheader">V</span><span role="columnheader">E</span><span role="columnheader">D</span><span role="columnheader">GP</span><span role="columnheader">GC</span><span role="columnheader">SG</span><span role="columnheader">Últimos 5</span>
      </div>
      {sorted.map((row, index) => {
        const club = clubById.get(row.club);
        if (!club) return null;
        const zone = sorted.length >= 4 && index < 4 ? 'is-qualifying' : sorted.length > 4 && index >= sorted.length - 2 ? 'is-relegation' : '';
        const sg = row.SG > 0 ? `+${row.SG}` : String(row.SG);
        return <div key={row.club} className={`cpm-league-row ${zone}`} role="row">
          <span role="cell" className="cpm-league-position"><span>{index + 1}</span></span>
          <span className="cpm-league-crest" aria-hidden="true"><Crest id={club.id} size={40} /></span>
          <div role="cell" className="cpm-league-club-cell"><button type="button" className="cpm-league-name" onClick={() => onClub(club.id)} aria-label={`Abrir clube ${club.nome}`}>{club.nome}</button></div>
          <span role="cell" className="cpm-league-points">{row.P}</span>
          <span role="cell">{row.J}</span><span role="cell" className="is-positive">{row.V}</span><span role="cell" className="is-muted">{row.E}</span><span role="cell" className="is-negative">{row.D}</span>
          <span role="cell">{row.GP}</span><span role="cell">{row.GC}</span><span role="cell" className={row.SG > 0 ? 'is-positive' : row.SG < 0 ? 'is-negative' : ''}>{sg}</span>
          <span role="cell" className="cpm-league-form-cell"><FormRun form={row.form} /></span>
        </div>;
      })}
    </div>

    <div className="cpm-league-compact" role="region" aria-label="Tabela da liga">
      <div className="cpm-league-compact-head"><span>Clube</span><span>Pts</span></div>
      {sorted.map((row, index) => {
        const club = clubById.get(row.club);
        if (!club) return null;
        const isOpen = expanded === row.club;
        const zone = sorted.length >= 4 && index < 4 ? 'is-qualifying' : sorted.length > 4 && index >= sorted.length - 2 ? 'is-relegation' : '';
        return <article key={row.club} aria-label={`${index + 1}º lugar, ${club.nome}`} className={`cpm-league-compact-row ${zone}${isOpen ? ' is-expanded' : ''}`}>
          <div className="cpm-league-compact-main">
            <span className="cpm-league-position"><span>{index + 1}</span></span>
            <Crest id={club.id} size={40} />
            <button type="button" className="cpm-league-name" onClick={() => onClub(club.id)} aria-label={`Abrir clube ${club.nome}`}>{club.nome}</button>
            <span className="cpm-league-points"><b>{row.P}</b><small>pts</small></span>
          </div>
          <div className="cpm-league-quick-stats">
            <span className="cpm-quick-stat"><small>J</small><b>{row.J}</b></span>
            <span className="cpm-quick-stat"><small>SG</small><b className={row.SG > 0 ? 'is-positive' : row.SG < 0 ? 'is-negative' : ''}>{row.SG > 0 ? '+' : ''}{row.SG}</b></span>
            <FormRun form={row.form} compact />
            <button type="button" className="cpm-league-expand" aria-label={`${isOpen ? 'Ocultar' : 'Ver'} estatísticas completas de ${club.nome}`} aria-expanded={isOpen} aria-controls={isOpen ? `cpm-club-stats-${row.club}` : undefined} onClick={() => setExpanded(isOpen ? null : row.club)}>
              <CpmIcon name="classificationChevronUp" className={isOpen ? '' : 'is-down'} />
            </button>
          </div>
          <AnimatePresence initial={false}>
            {isOpen && <motion.div id={`cpm-club-stats-${row.club}`} role="group" aria-label={`Estatísticas completas de ${club.nome}`} className="cpm-league-expanded-stats" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: reducedMotion ? 0 : 0.12, ease: 'easeOut' }}>
              <div><small>Vitórias</small><b>{row.V}</b></div><div><small>Empates</small><b>{row.E}</b></div><div><small>Derrotas</small><b>{row.D}</b></div>
              <div><small>Gols pró</small><b>{row.GP}</b></div><div><small>Gols contra</small><b>{row.GC}</b></div><div><small>Saldo</small><b>{row.SG > 0 ? `+${row.SG}` : row.SG}</b></div>
            </motion.div>}
          </AnimatePresence>
        </article>;
      })}
    </div>
    <ZoneLegend count={sorted.length} />
  </div>;
}

function EmptyState({ icon, title, detail, action }: { icon: 'trophy' | 'ball'; title: string; detail: string; action?: ReactNode }) {
  return <div className="cpm-classification-empty">
    <span className="cpm-classification-empty-icon"><CpmIcon name={icon === 'trophy' ? 'trophy' : 'classificationBall'} /></span>
    <strong>{title}</strong><p>{detail}</p>{action}
  </div>;
}

function ScorersList({ scorers, clubs, onClub }: { scorers: Scorer[]; clubs: Club[]; onClub: (clubId: string) => void }) {
  const clubById = useMemo(() => new Map(clubs.map(club => [club.id, club])), [clubs]);
  if (!scorers.length) return <EmptyState icon="ball" title="Artilharia em branco" detail="Os goleadores entram na lista depois que os resultados forem lançados." />;
  return <section className="cpm-scorers-list" aria-labelledby="cpm-scorers-heading">
    <h2 id="cpm-scorers-heading">Artilharia</h2>
    <ol>{scorers.map((scorer, index) => {
      const club = clubById.get(scorer.club);
      return <li key={`${scorer.club}-${scorer.nick}-${scorer.game_id ?? ''}`}>
        <button type="button" className={'cpm-scorer-item' + (index === 0 ? ' is-leader' : '')} onClick={() => onClub(scorer.club)} aria-label={`${index + 1}º, ${scorer.nick}, ${club?.nome ?? scorer.club}, ${scorer.goals} gols, ${scorer.assists} assistências, ${scorer.jogos} jogos`}>
          <span className="cpm-scorer-position">{index + 1}</span>
          <span className="cpm-scorer-emblem"><Crest id={scorer.club} club={club ?? { nome: scorer.club, logo_url: null }} size={24} height={27.4286} /></span>
          <span className="cpm-scorer-identity"><strong>{scorer.nick}</strong><span>{club?.nome ?? scorer.club}</span><span>{scorer.assists} assist. · {scorer.jogos} jogos</span></span>
          <span className="cpm-scorer-score"><b>{scorer.goals}</b><span>gols</span></span>
        </button>
      </li>;
    })}</ol>
  </section>;
}

function formatMatchDate(match: Match | null) {
  if (!match) return 'Partida ainda não vinculada';
  if (match.scheduledAt) {
    const date = new Date(match.scheduledAt);
    if (!Number.isNaN(date.getTime())) return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', timeZone: 'America/Sao_Paulo' }).format(date).replace('.', '');
  }
  return match.date || 'Data a definir';
}

function legScore(match: Match) {
  return match.status === 'finalizado' && match.scoreH !== null && match.scoreA !== null ? `${match.scoreH}–${match.scoreA}` : 'A definir';
}

function LegLink({ match, label, clubs, onMatch }: { match: Match | null; label: string; clubs: Map<string, Club>; onMatch: (id: number) => void }) {
  if (!match) return <div className="cpm-tie-leg is-missing"><span>{label}</span><span>Partida ainda não vinculada</span></div>;
  const home = clubs.get(match.home);
  const away = clubs.get(match.away);
  return <button type="button" className="cpm-tie-leg" onClick={() => onMatch(match.id)} aria-label={`${label}, ${home?.nome ?? match.home} ${legScore(match)} ${away?.nome ?? match.away}, ${formatMatchDate(match)}. Abrir partida`}>
    <span>{label} · {formatMatchDate(match)}</span>
    <b>{home?.tag ?? match.home} <strong>{legScore(match)}</strong> {away?.tag ?? match.away}</b>
  </button>;
}

function outcomeLabel(result: ResolvedBracketTie) {
  switch (result.outcome) {
    case 'final': return result.firstLeg && result.secondLeg ? 'Agregado final' : 'Final';
    case 'partial': return 'Agregado parcial';
    case 'tied': return result.secondLeg ? 'Empate no agregado' : 'Empate';
    case 'bye': return 'BYE · vaga avançada';
    case 'invalid': return 'Partida incompatível';
    case 'upcoming': return 'Aguardando resultado';
    default: return 'Vagas a definir';
  }
}

function TeamSlot({ slot, score, isWinner, clubs, onClub, side }: {
  slot: ResolvedBracketTie['home']; score: number | null; isWinner: boolean;
  clubs: Map<string, Club>; onClub: (id: string) => void; side: 'home' | 'away';
}) {
  const club = slot.clubId ? clubs.get(slot.clubId) : null;
  return <div className={`cpm-tie-team cpm-tie-slot-${side}${isWinner ? ' is-winner' : ''}`}>
    {club ? <button type="button" className="cpm-tie-club" onClick={() => onClub(club.id)} aria-label={`Abrir clube ${club.nome}`}><Crest id={club.id} size={28} /><span>{club.nome}</span></button>
      : <span className="cpm-tie-pending">{slot.label}</span>}
    <b className="cpm-tie-score">{score === null ? '–' : score}</b>
  </div>;
}

function TieCard({ result, format, clubs, destination, onClub, onMatch }: {
  result: ResolvedBracketTie; format: Competition['classification_format']; clubs: Map<string, Club>;
  destination: string | null; onClub: (id: string) => void; onMatch: (id: number) => void;
}) {
  const winner = result.winnerClubId;
  const isTwoLeg = format === 'knockout_two_leg';
  return <article className={`cpm-tie-card ${isTwoLeg ? 'is-two-leg' : 'is-single'} outcome-${result.outcome}`} data-bracket-tie-id={result.tie.id}>
    <header className="cpm-tie-context"><b>{result.code}</b><span>{outcomeLabel(result)}</span></header>
    <div className="cpm-tie-scoreboard">
      <TeamSlot slot={result.home} score={result.homeGoals} isWinner={Boolean(winner && winner === result.home.clubId)} clubs={clubs} onClub={onClub} side="home" />
      <TeamSlot slot={result.away} score={result.awayGoals} isWinner={Boolean(winner && winner === result.away.clubId)} clubs={clubs} onClub={onClub} side="away" />
    </div>
    {isTwoLeg ? <div className="cpm-tie-legs">
      <LegLink match={result.firstLeg} label="Ida" clubs={clubs} onMatch={onMatch} />
      <LegLink match={result.secondLeg} label="Volta" clubs={clubs} onMatch={onMatch} />
    </div> : result.firstLeg && <LegLink match={result.firstLeg} label="Partida" clubs={clubs} onMatch={onMatch} />}
    <footer className="cpm-tie-destination">
      <span>{winner ? `Classificado · ${clubs.get(winner)?.nome ?? winner}` : result.outcome === 'tied' ? 'Empate · vaga pendente' : result.outcome === 'bye' ? 'Avança sem adversário' : result.outcome === 'invalid' ? 'Confira o vínculo da partida' : result.outcome === 'partial' ? 'Resultado parcial · falta concluir a volta' : 'Vaga pendente'}</span>
      {destination && <b>{result.code} → {destination}</b>}
    </footer>
  </article>;
}

function KnockoutBracket({ stages, format, clubs, onClub, onMatch }: {
  stages: BracketStage[]; format: Competition['classification_format']; clubs: Club[];
  onClub: (id: string) => void; onMatch: (id: number) => void;
}) {
  const wide = useWideLayout();
  const reducedMotion = useReducedMotion();
  const [requestedStage, setRequestedStage] = useState(stages[0]?.order ?? 1);
  const activeStage = stages.some(stage => stage.order === requestedStage) ? requestedStage : stages[0]?.order ?? 1;
  const clubById = useMemo(() => new Map(clubs.map(club => [club.id, club])), [clubs]);
  const destinations = useMemo(() => {
    const map = new Map<string, string>();
    for (const stage of stages) for (const result of stage.ties) {
      for (const sourceId of [result.tie.home_source_tie_id, result.tie.away_source_tie_id]) {
        if (sourceId) map.set(sourceId, result.code);
      }
    }
    return map;
  }, [stages]);

  const visible = stages.find(stage => stage.order === activeStage) ?? stages[0];
  const onStageKeyDown = (event: KeyboardEvent<HTMLButtonElement>, current: number) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const currentIndex = stages.findIndex(stage => stage.order === current);
    const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? stages.length - 1 : (currentIndex + (event.key === 'ArrowRight' ? 1 : -1) + stages.length) % stages.length;
    const next = stages[nextIndex];
    if (!next) return;
    setRequestedStage(next.order);
    requestAnimationFrame(() => document.getElementById(`cpm-phase-tab-${next.order}`)?.focus());
  };
  if (!stages.length) return <EmptyState icon="ball" title="Chave ainda não configurada" detail="A competição é de mata-mata. As fases e os confrontos aparecerão aqui depois que o chaveamento for cadastrado." />;

  if (!wide) return <div className="cpm-knockout-mobile">
    <nav className="cpm-phase-tabs" role="tablist" aria-label="Fases do mata-mata">
      {stages.map(stage => <button key={stage.order} id={`cpm-phase-tab-${stage.order}`} type="button" role="tab" aria-selected={activeStage === stage.order} aria-controls="cpm-knockout-phase-panel" tabIndex={activeStage === stage.order ? 0 : -1} className={activeStage === stage.order ? 'is-active' : ''} onClick={() => setRequestedStage(stage.order)} onKeyDown={event => onStageKeyDown(event, stage.order)}>{stage.name}</button>)}
    </nav>
    <div className="cpm-phase-heading"><h2>{visible.name}</h2><span>{visible.ties.length} {visible.ties.length === 1 ? 'confronto' : 'confrontos'}</span></div>
    <motion.section id="cpm-knockout-phase-panel" role="tabpanel" aria-labelledby={`cpm-phase-tab-${visible.order}`} key={visible.order} className="cpm-phase-ties" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: reducedMotion ? 0 : 0.12 }}>
      {visible.ties.map(result => <TieCard key={result.tie.id} result={result} format={format} clubs={clubById} destination={destinations.get(result.tie.id) ?? null} onClub={onClub} onMatch={onMatch} />)}
    </motion.section>
    <BracketRouteNote stages={stages} />
  </div>;

  return <KnockoutDesktop stages={stages} format={format} clubs={clubById} destinations={destinations} onClub={onClub} onMatch={onMatch} />;
}

function BracketRouteNote({ stages }: { stages: BracketStage[] }) {
  const codeById = new Map(stages.flatMap(stage => stage.ties.map(tie => [tie.tie.id, tie.code] as const)));
  const routes = stages.flatMap(stage => stage.ties.map(tie => destinationsLabel(tie, codeById))).filter((label): label is string => Boolean(label));
  return routes.length ? <p className="cpm-bracket-route-note" aria-label="Origem das vagas entre fases">{routes.join(' · ')}</p> : null;
}

function destinationsLabel(result: ResolvedBracketTie, codeById: Map<string, string>) {
  const sources = [result.tie.home_source_tie_id, result.tie.away_source_tie_id].filter(Boolean);
  return sources.length ? `${sources.map(id => codeById.get(id!) ?? 'vaga anterior').join(' + ')} → ${result.code}` : '';
}

function KnockoutDesktop({ stages, format, clubs, destinations, onClub, onMatch }: {
  stages: BracketStage[]; format: Competition['classification_format']; clubs: Map<string, Club>;
  destinations: Map<string, string>; onClub: (id: string) => void; onMatch: (id: number) => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [paths, setPaths] = useState<Array<{ id: string; d: string }>>([]);

  const measure = useCallback(() => {
    const element = root.current;
    if (!element) return;
    const bounds = element.getBoundingClientRect();
    const next: Array<{ id: string; d: string }> = [];
    for (const stage of stages) for (const result of stage.ties) {
      for (const [side, sourceId] of [['home', result.tie.home_source_tie_id], ['away', result.tie.away_source_tie_id]] as const) {
        if (!sourceId) continue;
        const source = element.querySelector<HTMLElement>(`[data-bracket-tie-id="${sourceId}"]`);
        const target = element.querySelector<HTMLElement>(`[data-bracket-tie-id="${result.tie.id}"] .cpm-tie-slot-${side}`);
        if (!source || !target) continue;
        const a = source.getBoundingClientRect();
        const b = target.getBoundingClientRect();
        const x1 = a.right - bounds.left;
        const y1 = a.top + a.height / 2 - bounds.top;
        const x2 = b.left - bounds.left;
        const y2 = b.top + b.height / 2 - bounds.top;
        const curve = Math.max(16, (x2 - x1) / 2);
        next.push({ id: `${sourceId}-${result.tie.id}-${side}`, d: `M ${x1} ${y1} C ${x1 + curve} ${y1}, ${x2 - curve} ${y2}, ${x2} ${y2}` });
      }
    }
    setPaths(next);
  }, [stages]);

  useEffect(() => {
    measure();
    const rootElement = root.current;
    if (!rootElement || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(rootElement);
    rootElement.querySelectorAll('.cpm-tie-card').forEach(card => observer.observe(card));
    window.addEventListener('resize', measure);
    return () => { observer.disconnect(); window.removeEventListener('resize', measure); };
  }, [measure]);

  return <div className="cpm-bracket-scroll">
    <div className="cpm-bracket-grid" ref={root} style={{ gridTemplateColumns: `repeat(${stages.length}, minmax(var(${format === 'knockout_two_leg' ? '--cpm-classification-bracket-twoleg-min' : '--cpm-classification-bracket-single-min'}, ${format === 'knockout_two_leg' ? '272px' : '212px'}), 1fr))` }}>
      <svg className="cpm-bracket-connectors" aria-hidden="true" width="100%" height="100%">
        {paths.map(path => <path key={path.id} d={path.d} />)}
      </svg>
      {stages.map(stage => <section key={stage.order} className="cpm-bracket-stage">
        <h2>{stage.name}</h2>
        <div className="cpm-bracket-stage-ties">
          {stage.ties.map(result => <TieCard key={result.tie.id} result={result} format={format} clubs={clubs} destination={destinations.get(result.tie.id) ?? null} onClub={onClub} onMatch={onMatch} />)}
        </div>
      </section>)}
    </div>
  </div>;
}

export function ClassificacaoScreen({ onNav, initialTab, initialCompetitionId }: Props) {
  const { competitions, activeComp, standings: activeStandings, scorers: activeScorers, matches: activeMatches, clubs } = useData();
  const { favComps, toggleFavComp, notifs, toggleNotif, showToast } = useApp();
  const reducedMotion = useReducedMotion();
  const [compId, setCompId] = useState(initialCompetitionId ?? '');
  const [tab, setTab] = useState<ViewTab>(() => initialTab === 'artilharia' ? 'scorers' : 'table');
  const [reloadKey, setReloadKey] = useState(0);
  const [data, setData] = useState<SelectionData>({ competitionId: '', loadedKey: -1, standings: [], scorers: [], matches: [], ties: [], error: null });

  const selectedId = compId || activeComp?.id || competitions[0]?.id || '';
  const selected = competitions.find(competition => competition.id === selectedId) ?? null;
  const isLeague = !selected || selected.classification_format === 'league';
  const isKnockout = selected?.classification_format === 'knockout_single' || selected?.classification_format === 'knockout_two_leg';

  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    const useActive = selectedId === activeComp?.id;
    Promise.all([
      useActive ? Promise.resolve(activeStandings) : fetchStandings(selectedId),
      useActive ? Promise.resolve(activeScorers) : fetchScorers(selectedId),
      isKnockout ? (useActive ? Promise.resolve(activeMatches) : fetchMatches(selectedId)) : Promise.resolve([] as Match[]),
      isKnockout ? fetchBracketTies(selectedId) : Promise.resolve([] as BracketTie[]),
    ]).then(([nextStandings, nextScorers, nextMatches, nextTies]) => {
      if (!cancelled) setData({ competitionId: selectedId, loadedKey: reloadKey, standings: nextStandings, scorers: nextScorers, matches: nextMatches, ties: nextTies, error: null });
    }).catch(() => {
      if (!cancelled) setData(current => ({ ...current, competitionId: selectedId, loadedKey: reloadKey, error: 'Não foi possível carregar a classificação desta competição.' }));
    });
    return () => { cancelled = true; };
  }, [selectedId, activeComp?.id, activeStandings, activeScorers, activeMatches, isKnockout, reloadKey]);

  const standings = data.competitionId === selectedId ? data.standings : EMPTY_STANDINGS;
  const scorers = data.competitionId === selectedId ? data.scorers : EMPTY_SCORERS;
  const matches = data.competitionId === selectedId ? data.matches : EMPTY_MATCHES;
  const ties = data.competitionId === selectedId ? data.ties : EMPTY_TIES;
  const loading = Boolean(selectedId) && (data.competitionId !== selectedId || data.loadedKey !== reloadKey);
  const error = data.competitionId === selectedId && data.loadedKey === reloadKey ? data.error : null;
  const stages = useMemo(() => selected && isKnockout ? resolveBracket(ties, matches, clubs, selected.classification_format) : [], [ties, matches, clubs, isKnockout, selected]);
  const roundNames = stages.map(stage => stage.name).join(' · ');
  const favorite = selected ? favComps.has(selected.id) : false;
  const notificationKey = selected ? `comp:${selected.id}` : '';
  const notifications = notificationKey ? notifs.has(notificationKey) : false;

  const onSelectCompetition = (id: string, close: () => void) => {
    setCompId(id); close();
  };

  const retry = () => setReloadKey(value => value + 1);
  const selectTab = (next: ViewTab) => setTab(next);
  const handleTabKey = (event: KeyboardEvent<HTMLButtonElement>, current: ViewTab) => {
    const tabs: ViewTab[] = isLeague ? ['table', 'scorers'] : ['bracket', 'scorers'];
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const currentIndex = tabs.indexOf(current);
    const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (currentIndex + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    const next = tabs[nextIndex];
    setTab(next);
    requestAnimationFrame(() => document.getElementById(`cpm-classification-tab-${next}`)?.focus());
  };

  const shareCompetition = async (close: () => void) => {
    close();
    const result = await shareLink({ title: selected ? `${selected.nome} ${selected.edicao}` : 'CPM MamoBall', text: 'CPM MamoBall' });
    if (result === 'copied') showToast('Link copiado');
    else if (result === 'failed') showToast('Não foi possível compartilhar');
  };

  const menu = (close: () => void) => <div className="cpm-menu-links">
    <CpmMenuItem icon="classificationBell" onClick={() => { if (selected) toggleNotif(notificationKey); close(); showToast(notifications ? 'Notificações desativadas' : 'Notificações ativadas'); }}>
      {notifications ? 'Notificações ativadas' : 'Receber notificações'}
    </CpmMenuItem>
    <CpmMenuItem icon={favorite ? 'star' : 'star'} onClick={() => { if (selected) toggleFavComp(selected.id); close(); showToast(favorite ? 'Removida dos favoritos' : 'Adicionada aos favoritos'); }}>
      {favorite ? 'Remover dos favoritos' : 'Favoritar competição'}
    </CpmMenuItem>
    <CpmMenuItem icon="classificationShare" onClick={() => void shareCompetition(close)}>Compartilhar competição</CpmMenuItem>
    <CpmMenuItem icon="classificationRules" onClick={() => { close(); onNav('rules'); }}>Regulamento</CpmMenuItem>
  </div>;

  const tabs: Array<{ id: ViewTab; label: string; icon: 'menu' | 'classificationBall' | 'trophy' }> = isLeague
    ? [{ id: 'table', label: 'Tabela', icon: 'menu' }, { id: 'scorers', label: 'Artilharia', icon: 'classificationBall' }]
    : [{ id: 'bracket', label: 'Chave', icon: 'trophy' }, { id: 'scorers', label: 'Artilharia', icon: 'classificationBall' }];
  const activeTab = tabs.some(item => item.id === tab) ? tab : tabs[0].id;

  return <div className="cpm-classification">
    <div className="cpm-classification-inner">
      <header className="cpm-classification-page-context">
        <h1>Classificação</h1>
        <div className="cpm-classification-controls">
          {selected ? <CpmPopover label="Selecionar competição" role="listbox" className="cpm-classification-selector" trigger={<>
            <CpmIcon name="trophy" /><span><b>{selected.nome}</b><small>{selected.edicao}</small></span><CpmIcon name="chevron" />
          </>}>
            {close => <div className="cpm-competition-options">
              {competitions.map(competition => <button key={competition.id} type="button" role="option" aria-selected={competition.id === selectedId} className={`cpm-competition-option${competition.id === selectedId ? ' is-selected' : ''}`} onClick={() => onSelectCompetition(competition.id, close)}>
                <span className="cpm-competition-option-icon"><CpmIcon name="trophy" /></span>
                <span><b>{competition.nome} {competition.edicao}</b><small>{FORMAT_LABELS[competition.classification_format]}</small></span>
                {competition.id === selectedId && <span className="cpm-competition-check" aria-hidden="true">✓</span>}
              </button>)}
            </div>}
          </CpmPopover> : <span className="cpm-classification-no-competition">Nenhuma competição</span>}
          <CpmPopover label="Ações da competição" className="cpm-classification-more" trigger={<CpmIcon name="classificationMenuDots" />}>{menu}</CpmPopover>
        </div>
      </header>

      {selected && <div className="cpm-classification-tabs" role="tablist" aria-label="Visualizações da classificação">
        {tabs.map(item => <button key={item.id} id={`cpm-classification-tab-${item.id}`} type="button" role="tab" aria-selected={activeTab === item.id} aria-controls="cpm-classification-panel" tabIndex={activeTab === item.id ? 0 : -1} className={activeTab === item.id ? 'is-active' : ''} onClick={() => selectTab(item.id)} onKeyDown={event => handleTabKey(event, item.id)}>
          <CpmIcon name={item.icon} /><span>{item.label}</span>
        </button>)}
      </div>}

      {selected && <div className="cpm-classification-context">
        <div className="cpm-classification-format"><CpmIcon name={selected.classification_format === 'league' ? 'menu' : 'trophy'} /><span>{FORMAT_LABELS[selected.classification_format]}</span></div>
        {selected.classification_format === 'league' ? <div className="cpm-classification-round">
          <span>{selected.total_rodadas > 0 ? `Rodada ${selected.rodada_atual} de ${selected.total_rodadas}` : `Rodada ${selected.rodada_atual}`}</span>
          {selected.total_rodadas > 0 && <div className="cpm-round-track" aria-label={`${Math.min(selected.rodada_atual, selected.total_rodadas)} de ${selected.total_rodadas} rodadas`}><span style={{ transform: `scaleX(${Math.max(0, Math.min(100, selected.rodada_atual / selected.total_rodadas * 100)) / 100})` }} /></div>}
        </div> : <span className="cpm-classification-stages-summary">{roundNames || (loading ? 'Carregando fases' : 'Fases a definir')}</span>}
      </div>}

      {!selected ? <EmptyState icon="trophy" title="Nenhuma competição cadastrada" detail="Assim que uma competição for criada, a classificação aparece aqui." /> : <div id="cpm-classification-panel" className="cpm-classification-panel" role="tabpanel" aria-labelledby={`cpm-classification-tab-${activeTab}`}>
        {loading ? <ClassificationLoading /> : error ? <EmptyState icon="ball" title="Não foi possível carregar" detail={error} action={<button type="button" className="cpm-button cpm-button-primary" onClick={retry}>Tentar novamente</button>} /> : <AnimatePresence mode="wait" initial={false}>
          <motion.div key={`${selectedId}-${activeTab}`} className="cpm-classification-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? 0 : 0.12, ease: 'easeOut' }}>
            {activeTab === 'table' && selected.classification_format === 'league' && <LeagueTable standings={standings} clubs={clubs} onClub={id => onNav('club', id)} />}
            {activeTab === 'bracket' && isKnockout && <KnockoutBracket stages={stages} format={selected.classification_format} clubs={clubs} onClub={id => onNav('club', id)} onMatch={id => onNav('match', id)} />}
            {activeTab === 'scorers' && <ScorersList scorers={scorers} clubs={clubs} onClub={id => onNav('club', id)} />}
          </motion.div>
        </AnimatePresence>}
      </div>}
    </div>
  </div>;
}

function ClassificationLoading() {
  return <div className="cpm-classification-loading" aria-busy="true" aria-label="Carregando classificação">
    <div className="cpm-league-skeleton-head"><span /><span /><span /></div>
    {Array.from({ length: 6 }, (_, index) => <div className="cpm-league-skeleton-row" key={index}><i /><span /><b /><span /><span /></div>)}
  </div>;
}
