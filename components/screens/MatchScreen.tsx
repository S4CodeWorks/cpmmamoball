'use client';

import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { useData } from '@/contexts/DataContext';
import { CpmIcon, type CpmIconName } from '@/components/ui/CpmUi';
import { Crest } from '@/components/ui/Crest';
import { fetchClubById, fetchCompetitions, fetchMatchById, fetchMatches, fetchPlayers, type Competition } from '@/lib/db';
import { groupMatchGoals, previousEncounters, encounterRecord, matchDetailDate, matchStatus, matchMoment } from '@/lib/matchDetails';
import { matchDate } from '@/lib/matchDate';
import { shareLink } from '@/lib/share';
import { pathForPage } from '@/lib/routes';
import type { Club, Match, Player } from '@/lib/types';

interface Props {
  onNav: (page: string, param?: string | number | null, extra?: string | null) => void;
  onBack?: () => void;
  matchId?: number;
}
type Section = 'goals' | 'history' | 'round';
const sections: { id: Section; label: string; icon: CpmIconName }[] = [
  { id: 'goals', label: 'Gols', icon: 'matchBall' },
  { id: 'history', label: 'Confrontos', icon: 'trophy' },
  { id: 'round', label: 'Rodada', icon: 'calendar' },
];
type Detail = { id: number; match: Match; home: Club; away: Club; competition: Competition | null; matches: Match[]; relatedError: boolean };
type Resource = { id: number; state: 'ready'; data: Detail } | { id: number; state: 'missing' | 'error' };

function SectionHeading({ icon, children, count }: { icon: CpmIconName; children: ReactNode; count?: number }) {
  return <div className="cpm-match-section-heading"><CpmIcon name={icon}/><h2>{children}</h2>{count != null && <span>{count}</span>}</div>;
}

function Feedback({ icon, title, subtitle, action, onAction }: { icon: CpmIconName; title: string; subtitle?: string; action?: string; onAction?: () => void }) {
  return <div className="cpm-match-feedback"><span className="cpm-match-feedback-icon"><CpmIcon name={icon}/></span><p>{title}</p>{subtitle && <span>{subtitle}</span>}{action && <button type="button" onClick={onAction}>{action}</button>}</div>;
}

function ClubIdentity({ club, onNav }: { club: Club; onNav: Props['onNav'] }) {
  const href = pathForPage('club', club.id)!;
  return <a className="cpm-detail-club" href={href} onClick={event => navigate(event, () => onNav('club', club.id))}>
    <span className="cpm-detail-club-crest"><Crest id={club.id} club={club} size={72}/></span>
    <span className="cpm-detail-club-name">{club.nome}</span><span className="cpm-detail-club-tag">{club.tag}</span>
  </a>;
}

function navigate(event: MouseEvent<HTMLAnchorElement>, open: () => void) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault(); open();
}

function Scoreboard({ detail, onNav }: { detail: Detail; onNav: Props['onNav'] }) {
  const { match, home, away, competition } = detail, scheduled = match.status === 'agendado';
  const status = matchStatus(match);
  return <section className="cpm-match-scoreboard" aria-label={`${home.nome} contra ${away.nome}`}>
    <h1 className="cpm-match-sr">{home.nome} contra {away.nome} · Partida {match.id}</h1>
    <div className="cpm-match-competition"><CpmIcon name="trophy"/><span>{competition ? [competition.nome, competition.edicao].filter(Boolean).join(' ') : 'Competição'}</span><small>{match.rodada ? 'Rodada ' + match.rodada : 'Rodada a definir'}</small></div>
    <div className="cpm-match-scoreboard-main">
      <ClubIdentity club={home} onNav={onNav}/>
      <div className="cpm-match-result"><div className="cpm-match-score" aria-label={scheduled ? 'Partida agendada' : `${home.nome} ${match.scoreH ?? 'placar não registrado'}, ${away.nome} ${match.scoreA ?? 'placar não registrado'}`}>
        {scheduled ? <strong>VS</strong> : <><strong>{match.scoreH ?? '—'}</strong><span aria-hidden="true">–</span><strong>{match.scoreA ?? '—'}</strong></>}
      </div><span className="cpm-match-status"><CpmIcon name={status.icon}/>{status.label}</span></div>
      <ClubIdentity club={away} onNav={onNav}/>
    </div>
    <div className="cpm-match-divider"/>
    <div className="cpm-match-metadata"><span><CpmIcon name="calendar"/>{matchDetailDate(match)}</span><span>{match.stage || 'Fase a definir'}</span></div>
  </section>;
}

function Goals({ match, home, away, rosters, reminding, saving, onReminder }: { match: Match; home: Club; away: Club; rosters: { key: string; home: Player[]; away: Player[] } | null; reminding: boolean; saving: boolean; onReminder: () => void }) {
  const key = home.id + ':' + away.id;
  const hasGoals = match.home_scorers.length + match.away_scorers.length > 0;
  if (match.status === 'agendado') {
    const date = matchDate(match);
    return <div className="cpm-match-scheduled"><Feedback icon="calendar" title={date.time === 'A definir' ? 'Horário a definir' : date.short + ' · ' + date.time} subtitle="Agendado"/><button type="button" className={'cpm-match-action' + (reminding ? ' is-selected' : '')} aria-pressed={reminding} aria-label={reminding ? 'Desativar lembrete desta partida' : 'Lembrar desta partida'} disabled={saving} onClick={onReminder}><CpmIcon name="matchBell"/><span>{reminding ? 'Lembrete salvo' : 'Lembrar'}</span></button></div>;
  }
  if (match.is_wo) return <Feedback icon="authAlert" title="Encerrado por W.O."/>;
  if (!hasGoals) return <Feedback icon="matchBall" title="Gols não registrados"/>;
  const groups = [{ club: home, opposite: away, side: 'home' as const, entries: match.home_scorers }, { club: away, opposite: home, side: 'away' as const, entries: match.away_scorers }];
  return <section className="cpm-match-goals-section" aria-label="Gols"><SectionHeading icon="matchBall" count={match.home_scorers.length + match.away_scorers.length}>Gols</SectionHeading><div className="cpm-match-goal-groups">
    {groups.map(({ club, opposite, side, entries }) => <div className="cpm-match-goal-group" key={club.id}>
      <div className="cpm-match-goal-team"><Crest id={club.id} club={club} size={24}/><strong>{club.nome}</strong><span>{club.tag}</span><span className="cpm-match-goal-total" aria-label={`${entries.length} gols registrados`}><CpmIcon name="matchBall"/>{entries.length}</span></div>
      {entries.length ? groupMatchGoals(entries).map(group => {
        const rosterSide = group.ownGoal ? side === 'home' ? 'away' : 'home' : side;
        const gameId = rosters?.key === key ? rosters[rosterSide].find(player => player.nick === group.nick)?.game_id : null;
        return <div className="cpm-match-goal-row" key={JSON.stringify([group.nick, group.ownGoal])}>
          <span className="cpm-match-player-icon"><CpmIcon name="user"/></span><div className="cpm-match-player"><strong>{group.nick}</strong>
            {(gameId || group.ownGoal) && <span className="cpm-match-player-id">{[group.ownGoal ? opposite.tag : null, gameId ? '#' + gameId : null].filter(Boolean).join(' · ')}</span>}
            {group.ownGoal ? <span className="cpm-match-attribution"><CpmIcon name="authAlert"/>Gol contra</span> : group.assists.length > 0 && <span className="cpm-match-attribution" aria-label={'Assistências: ' + group.assists.join(', ')}><CpmIcon name="matchAssist"/>{group.assists.join(', ')}</span>}
          </div><span className={'cpm-match-goal-count' + (group.ownGoal ? ' is-own' : '')} aria-label={`${group.goals} ${group.goals === 1 ? 'gol' : 'gols'}${group.ownGoal ? ' contra' : ''}`}><CpmIcon name="matchBall"/>{group.goals}</span>
        </div>;
      }) : <p className="cpm-match-team-empty">Nenhum gol registrado</p>}
    </div>)}
  </div></section>;
}

function History({ detail, onNav, onRetry }: { detail: Detail; onNav: Props['onNav']; onRetry: () => void }) {
  const { match, home, away, matches, relatedError } = detail, past = previousEncounters(match, matches);
  const { clubById } = useData();
  if (relatedError) return <Feedback icon="authAlert" title="Não foi possível carregar" action="Tentar novamente" onAction={onRetry}/>;
  if (!past.length) return <Feedback icon="trophy" title="Sem confrontos registrados"/>;
  const { homeWins, awayWins, draws } = encounterRecord(match, past);
  const club = (id: string) => id === home.id ? home : id === away.id ? away : clubById(id);
  return <section className="cpm-match-history-section" aria-label="Confrontos"><SectionHeading icon="trophy" count={past.length}>Confrontos</SectionHeading><div className="cpm-match-history-card">
    <div className="cpm-match-record">
      <div><span><Crest id={home.id} club={home} size={24}/>{home.tag}</span><strong className={homeWins > awayWins ? 'is-leading' : ''}>{homeWins}</strong><small>{homeWins === 1 ? 'vitória' : 'vitórias'}</small></div>
      <div><span>Empates</span><strong>{draws}</strong><small>{draws === 1 ? 'empate' : 'empates'}</small></div>
      <div><span><Crest id={away.id} club={away} size={24}/>{away.tag}</span><strong className={awayWins > homeWins ? 'is-leading' : ''}>{awayWins}</strong><small>{awayWins === 1 ? 'vitória' : 'vitórias'}</small></div>
    </div><div className="cpm-match-distribution" role="img" aria-label={`${home.tag}: ${homeWins} vitórias; ${draws} empates; ${away.tag}: ${awayWins} vitórias`}>
      <span className="is-home" style={{ '--match-ratio': homeWins } as CSSProperties}/><span style={{ '--match-ratio': draws } as CSSProperties}/><span className="is-away" style={{ '--match-ratio': awayWins } as CSSProperties}/>
    </div><div className="cpm-match-past-games">{past.slice(0, 6).map(other => {
      const h = club(other.home)!, a = club(other.away)!;
      return <a className="cpm-match-past" key={other.id} href={pathForPage('match', other.id)!} onClick={event => navigate(event, () => onNav('match', other.id))} aria-label={`${h.nome} ${other.scoreH} a ${other.scoreA} ${a.nome}, ${matchDetailDate(other)}`}>
        <span>{matchDate(other).short}</span><span className="cpm-match-past-result"><small>{h.tag}</small><Crest id={h.id} club={h} size={20}/><strong>{other.scoreH} – {other.scoreA}</strong><Crest id={a.id} club={a} size={20}/><small>{a.tag}</small></span><CpmIcon name="arrow"/>
      </a>;
    })}</div>
  </div></section>;
}

function Round({ detail, onNav, onRetry }: { detail: Detail; onNav: Props['onNav']; onRetry: () => void }) {
  const { clubById } = useData(), reduced = useReducedMotion();
  const { match, matches, relatedError } = detail;
  const otherMatches = matches.filter(other => other.competition_id === match.competition_id && other.rodada === match.rodada && other.id !== match.id)
    .sort((a, b) => (matchMoment(a) ?? Infinity) - (matchMoment(b) ?? Infinity) || a.id - b.id);
  const club = (id: string) => id === detail.home.id ? detail.home : id === detail.away.id ? detail.away : clubById(id);
  return <section className="cpm-match-round-section" aria-label="Rodada"><SectionHeading icon="calendar">{match.rodada ? 'Rodada ' + match.rodada : 'Rodada'}</SectionHeading>
    {relatedError ? <Feedback icon="authAlert" title="Não foi possível carregar" action="Tentar novamente" onAction={onRetry}/> : !otherMatches.length ? <Feedback icon="calendar" title="Sem outros jogos nesta rodada"/> : <div className="cpm-match-round-games">{otherMatches.map(other => {
      const h = club(other.home), a = club(other.away), scheduled = other.status === 'agendado', status = other.status === 'finalizado' && !other.is_wo ? {label:'Final'} : matchStatus(other);
      const team = (id: string, c: Club | undefined, score: number | null) => <span className="cpm-match-round-team"><span className="cpm-match-round-crest"><Crest id={id} club={c} size={32} height={36}/></span><span>{c?.nome || 'Clube a definir'}</span><strong>{scheduled ? '—' : score ?? '—'}</strong></span>;
      return <motion.a className="cpm-match-round-game" key={other.id} href={pathForPage('match', other.id)!} onClick={event => navigate(event, () => onNav('match', other.id))} whileTap={reduced ? undefined : { scale: 0.997 }}>
        <span className="cpm-match-round-fixture"><span className="cpm-match-round-state"><span>{status.label}</span><small>{other.rodada ? 'Rodada ' + other.rodada : 'Rodada a definir'}</small></span><span className="cpm-match-round-teams">{team(other.home, h, other.scoreH)}<strong className="cpm-match-round-score">{scheduled ? 'VS' : `${other.scoreH ?? '—'} - ${other.scoreA ?? '—'}`}</strong>{team(other.away, a, other.scoreA)}</span><CpmIcon name="arrow"/></span>
        <span className="cpm-match-round-context"><span><CpmIcon name="trophy"/>{other.stage || 'Fase a definir'}</span><span className="cpm-match-round-date">{matchDate(other).short}</span><CpmIcon name="arrow"/></span>
      </motion.a>;
    })}</div>}
  </section>;
}

function MatchLoading() {
  return <div className="cpm-match-loading" aria-busy="true" aria-label="Carregando partida"><div className="cpm-match-skeleton-hero"><span className="cpm-match-skeleton"/><div><span className="cpm-match-skeleton"/><span className="cpm-match-skeleton"/><span className="cpm-match-skeleton"/></div><span className="cpm-match-skeleton"/></div><div className="cpm-match-skeleton-section"/><div className="cpm-match-skeleton-section"/></div>;
}

export function MatchScreen({ onNav, matchId }: Props) {
  const app = useApp(), reduced = useReducedMotion(), panelId = useId();
  const [resource, setResource] = useState<Resource | null>(null), [attempt, setAttempt] = useState(0);
  const [selected, setSelected] = useState<{ id: number | undefined; section: Section }>({ id: matchId, section: 'goals' });
  const [feedback, setFeedback] = useState<{ id: number; message: string } | null>(null), [pending, setPending] = useState(false);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]), operationId = useRef(matchId);
  useEffect(() => { operationId.current = matchId; }, [matchId]);
  const validId = typeof matchId === 'number' && Number.isSafeInteger(matchId) && matchId > 0;
  const current = resource?.id === matchId ? resource : null;
  const detail = current?.state === 'ready' ? current.data : null;
  const [rosters, setRosters] = useState<{ key: string; home: Player[]; away: Player[] } | null>(null);
  const homeId = detail?.home.id, awayId = detail?.away.id;
  const loadPlayers = !!detail && !detail.match.is_wo && detail.match.status !== 'agendado' && detail.match.home_scorers.length + detail.match.away_scorers.length > 0;
  useEffect(() => {
    if (!loadPlayers || !homeId || !awayId) return;
    let cancelled = false;
    Promise.allSettled([fetchPlayers(homeId), fetchPlayers(awayId)]).then(([h, a]) => {
      if (!cancelled) setRosters({ key: homeId + ':' + awayId, home: h.status === 'fulfilled' ? h.value : [], away: a.status === 'fulfilled' ? a.value : [] });
    });
    return () => { cancelled = true; };
  }, [homeId, awayId, loadPlayers]);
  const section = selected.id === matchId ? selected.section : 'goals';
  const select = (value: Section) => setSelected({ id: matchId, section: value });
  useEffect(() => {
    if (!validId || matchId == null) return;
    let cancelled = false;
    const timer = setTimeout(() => { if (!cancelled) { cancelled = true; setResource({ id: matchId, state: 'error' }); } }, 12000);
    const load = async () => {
      const match = await fetchMatchById(matchId);
      if (cancelled) return;
      if (!match) { setResource({ id: matchId, state: 'missing' }); return; }
      const [h, a, games, competitions] = await Promise.allSettled([fetchClubById(match.home), fetchClubById(match.away), fetchMatches(match.competition_id), fetchCompetitions()]);
      if (cancelled) return;
      if (h.status !== 'fulfilled' || !h.value || a.status !== 'fulfilled' || !a.value) throw new Error('Clubes indisponíveis');
      setResource({ id: matchId, state: 'ready', data: { id: matchId, match, home: h.value, away: a.value, competition: competitions.status === 'fulfilled' ? competitions.value.find(c => c.id === match.competition_id) ?? null : null, matches: games.status === 'fulfilled' ? games.value : [], relatedError: games.status === 'rejected' } });
    };
    load().catch(() => { if (!cancelled) setResource({ id: matchId, state: 'error' }); }).finally(() => clearTimeout(timer));
    return () => { cancelled = true; clearTimeout(timer); };
  }, [matchId, validId, attempt]);
  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 5000);
    return () => clearTimeout(timer);
  }, [feedback]);
  const retry = () => { setResource(null); setAttempt(value => value + 1); };
  const games = () => onNav('jogos', detail?.match.competition_id ?? null, detail?.match.status === 'finalizado' ? 'resultados' : 'proximos');
  const key = detail ? 'match:' + detail.match.id : '', saved = app.bookmarks.has(key), reminding = app.notifs.has(key);
  const toggleSaved = async (reminder = false) => {
    if (!detail || pending) return;
    const id = detail.id, wasSaved = reminder ? reminding : saved;
    setPending(true);
    try {
      await app.setSavedKey(reminder ? 'notif:' + key : key, !wasSaved);
      if (operationId.current === id) setFeedback({ id, message: reminder ? wasSaved ? 'Lembrete removido' : 'Lembrete salvo' : wasSaved ? 'Partida removida dos salvos' : 'Partida salva' });
    } catch { app.showError(new Error('Não foi possível salvar. Tente novamente.')); }
    finally { setPending(false); }
  };
  const share = async () => {
    if (!detail) return;
    const id = detail.id;
    const result = await shareLink({ title: `${detail.home.nome} × ${detail.away.nome}`, text: `${detail.home.tag} × ${detail.away.tag} · CPM MamoBall`, url: window.location.origin + pathForPage('match', id) });
    if (operationId.current !== id) return;
    if (result === 'copied') setFeedback({ id, message: 'Link copiado' });
    else if (result === 'failed') app.showError(new Error('Não foi possível compartilhar'));
  };
  const keyboard = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const next = event.key === 'ArrowRight' ? (index + 1) % 3 : event.key === 'ArrowLeft' ? (index + 2) % 3 : event.key === 'Home' ? 0 : event.key === 'End' ? 2 : null;
    if (next == null) return;
    event.preventDefault(); select(sections[next].id); buttons.current[next]?.focus();
  };
  const loading = validId && !current;
  return <div className="cpm-match">
    <div className="cpm-match-toolbar"><button type="button" className="cpm-match-action cpm-match-back" onClick={games} aria-label="Voltar para jogos"><CpmIcon name="authBack"/><span>Jogos</span></button><span className="cpm-match-id">Partida{validId ? ' #' + matchId : ''}</span>
      {detail && <><button type="button" className={'cpm-match-action cpm-match-icon-action' + (saved ? ' is-selected' : '')} disabled={!detail || pending || app.savedLoading} aria-label={saved ? 'Remover partida dos salvos' : 'Salvar partida'} aria-pressed={saved} onClick={() => void toggleSaved()}><CpmIcon name="bookmark"/><span>{saved ? 'Salvo' : 'Salvar'}</span></button>
      <button type="button" className="cpm-match-action cpm-match-icon-action" disabled={!detail} aria-label="Compartilhar partida" onClick={() => void share()}><CpmIcon name="matchShare"/><span>Compartilhar</span></button></>}
    </div>
    {loading ? <MatchLoading/> : !detail ? <Feedback icon={current?.state === 'error' ? 'authAlert' : 'search'} title={current?.state === 'error' ? 'Não foi possível carregar' : 'Partida não encontrada'} action={current?.state === 'error' ? 'Tentar novamente' : 'Ver jogos'} onAction={current?.state === 'error' ? retry : games}/> : <>
      <Scoreboard detail={detail} onNav={onNav}/>
      <div className="cpm-match-tabs" role="tablist" aria-label="Detalhes da partida">{sections.map((tab, index) => <button type="button" key={tab.id} ref={el => { buttons.current[index] = el; }} role="tab" id={panelId + '-' + tab.id} aria-controls={panelId + '-panel'} aria-selected={section === tab.id} tabIndex={section === tab.id ? 0 : -1} className={section === tab.id ? 'is-selected' : ''} onClick={() => select(tab.id)} onKeyDown={event => keyboard(event, index)}><CpmIcon name={tab.icon}/><span>{tab.label}</span></button>)}</div>
      <div className="cpm-match-sections">
        <div className="cpm-match-wide"><div className="cpm-match-primary"><Goals key={detail.id} match={detail.match} home={detail.home} away={detail.away} rosters={rosters} reminding={reminding} saving={pending || app.savedLoading} onReminder={() => void toggleSaved(true)}/></div><History detail={detail} onNav={onNav} onRetry={retry}/><div className="cpm-match-wide-round"><Round detail={detail} onNav={onNav} onRetry={retry}/></div></div>
        <motion.div key={section} id={panelId + '-panel'} className="cpm-match-compact" role="tabpanel" aria-labelledby={panelId + '-' + section} tabIndex={0} initial={reduced ? false : { opacity: 0.85 }} animate={{ opacity: 1 }} transition={{ duration: 0.12, ease: 'easeOut' }}>
          {section === 'goals' ? <Goals key={detail.id} match={detail.match} home={detail.home} away={detail.away} rosters={rosters} reminding={reminding} saving={pending || app.savedLoading} onReminder={() => void toggleSaved(true)}/> : section === 'history' ? <History detail={detail} onNav={onNav} onRetry={retry}/> : <Round detail={detail} onNav={onNav} onRetry={retry}/>}
        </motion.div>
      </div>
    </>}
    {feedback && feedback.id === matchId && <div className="cpm-match-success" role="status"><CpmIcon name="check"/>{feedback.message}</div>}
  </div>;
}
