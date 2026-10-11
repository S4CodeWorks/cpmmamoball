'use client';

import { useEffect, useId, useRef, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { CpmIcon, CpmPopover, type CpmIconName } from '@/components/ui/CpmUi';
import { Crest } from '@/components/ui/Crest';
import { MatchScoreboard } from './MatchScreen';
import { fetchClubById, fetchClubs, fetchCompetitions, fetchClubMatches, fetchClubCompetitionIds, fetchPlayers, fetchCompetitionPlayerIds, fetchStandings, fetchScorers, fetchBracketTies, type Competition } from '@/lib/db';
import { clubFixtures, playerStatistics } from '@/lib/clubDetails';
import { resolveBracket } from '@/lib/bracket';
import { matchDate } from '@/lib/matchDate';
import { matchStatus } from '@/lib/matchDetails';
import { pathForPage } from '@/lib/routes';
import { shareLink } from '@/lib/share';
import type { Club, Match, Player, Standing, Scorer, BracketTie } from '@/lib/types';

type Navigate = (page: string, param?: string | number | null, extra?: string | null) => void;
interface Props { onNav: Navigate; onBack?: () => void; clubId?: string }
type Tab = 'summary' | 'games' | 'roster';
const tabs: { id: Tab; label: string; icon: CpmIconName }[] = [
  { id: 'summary', label: 'Resumo', icon: 'searchShield' },
  { id: 'games', label: 'Jogos', icon: 'matchBall' },
  { id: 'roster', label: 'Elenco', icon: 'user' },
];
type Index = { club: Club; clubs: Club[]; competitions: Competition[]; matches: Match[]; players: Player[] | null };
type Selection = { key: string; standings: Standing[] | null; scorers: Scorer[] | null; players: Set<string> | null; ties: BracketTie[] | null };
const fulfilled = <T,>(result: PromiseSettledResult<T>): T | null => result.status === 'fulfilled' ? result.value : null;

function useClub(id: string) {
  const [resource, setResource] = useState<{ id: string; data?: Index; state: 'ready' | 'missing' | 'error' } | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => { if (active) { active = false; setResource({ id, state: 'error' }); } }, 12000);
    const load = async () => {
      const club = id ? await fetchClubById(id) : null;
      if (!club) { if (active) setResource({ id, state: 'missing' }); return; }
      const [clubs, competitions, matches, enrolled, roster] = await Promise.all([
        fetchClubs(), fetchCompetitions(), fetchClubMatches(club.id), fetchClubCompetitionIds(club.id),
        Promise.allSettled([fetchPlayers(club.id)]),
      ]);
      const ids = new Set([...enrolled, ...matches.map(match => match.competition_id)]);
      if (active) setResource({ id, state: 'ready', data: { club, clubs, matches, competitions: competitions.filter(comp => ids.has(comp.id)), players: fulfilled(roster[0]) } });
    };
    load().catch(() => { if (active) setResource({ id, state: 'error' }); }).finally(() => clearTimeout(timer));
    return () => { active = false; clearTimeout(timer); };
  }, [id, attempt]);
  return { resource: resource?.id === id ? resource : null, retry: () => { setResource(null); setAttempt(value => value + 1); } };
}

function Heading({ icon, children, action }: { icon: CpmIconName; children: ReactNode; action?: ReactNode }) {
  return <div className="cpm-club-heading"><CpmIcon name={icon}/><h2>{children}</h2>{action}</div>;
}
function Action({ icon, children, onClick, label, pressed, disabled }: { icon: CpmIconName; children: ReactNode; onClick: () => void; label?: string; pressed?: boolean; disabled?: boolean }) {
  return <button type="button" className="cpm-club-action" aria-label={label} aria-pressed={pressed} disabled={disabled} onClick={onClick}><CpmIcon name={icon}/><span>{children}</span></button>;
}
function State({ icon = 'calendar', children, action, onAction }: { icon?: CpmIconName; children: ReactNode; action?: string; onAction?: () => void }) {
  return <div className="cpm-club-state" role="status"><span><CpmIcon name={icon}/></span><p>{children}</p>{action && <Action icon="arrow" onClick={onAction!}>{action}</Action>}</div>;
}
function Loading({ compact = false }: { compact?: boolean }) {
  return <div className={'cpm-club-loading' + (compact ? ' is-compact' : '')} role="status" aria-label="Carregando clube" aria-busy="true">{[0, 1, 2].map(value => <div key={value} aria-hidden="true"><span/><span/><span/></div>)}</div>;
}
function navigate(event: MouseEvent<HTMLAnchorElement>, open: () => void) {
  if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault(); open();
}

function Fixture({ match, clubs, competition, onNav }: { match: Match; clubs: Club[]; competition: Competition | null; onNav: Navigate }) {
  const result = match.status === 'finalizado', date = matchDate(match), status = matchStatus(match);
  const home = clubs.find(club => club.id === match.home), away = clubs.find(club => club.id === match.away);
  const name = (club?: Club) => club?.nome || 'Clube a definir';
  const team = (club: Club | undefined, score: number | null) => <span className="cpm-club-fixture-team"><span className="cpm-club-emblem">{club ? <Crest id={club.id} club={club} size={32} height={36}/> : <CpmIcon name="searchShield"/>}</span><span>{name(club)}</span>{result && <b>{score ?? '—'}</b>}</span>;
  return <a className={'cpm-club-fixture' + (result ? ' is-result' : '')} href={pathForPage('match', match.id)!} onClick={event => navigate(event, () => onNav('match', match.id))} aria-label={`${name(home)} contra ${name(away)}, ${result ? `${match.scoreH ?? '—'} a ${match.scoreA ?? '—'}, ${status.label}` : date.time}, ${date.short}`}>
    <span className="cpm-club-fixture-main"><span className="cpm-club-fixture-status"><b>{result ? status.label : date.time}</b><small>Rodada {match.rodada || '—'}</small></span><span className="cpm-club-fixture-teams">{team(home, match.scoreH)}<strong>{result ? `${match.scoreH ?? '—'} – ${match.scoreA ?? '—'}` : match.status === 'ao_vivo' ? 'Ao vivo' : 'VS'}</strong>{team(away, match.scoreA)}</span><CpmIcon name="arrow"/></span>
    <span className="cpm-club-fixture-compact-date"><span>{date.short} · {result ? status.label : `Rodada ${match.rodada || '—'}`}</span>{result && <small>Rodada {match.rodada || '—'}</small>}</span>
    <span className="cpm-club-fixture-footer"><span><CpmIcon name="trophy"/>{competition ? [competition.nome, competition.edicao].filter(Boolean).join(' ') : match.stage || 'Competição'}</span><small>{date.short}</small><CpmIcon name="arrow"/></span>
  </a>;
}

export function ClubScreen({ onNav, onBack, clubId = '' }: Props) {
  const app = useApp(), reduced = useReducedMotion(), { resource, retry } = useClub(clubId);
  const [tab, setTab] = useState<Tab>('summary'), [games, setGames] = useState<'upcoming' | 'results'>('upcoming');
  const [selected, setSelected] = useState<string | null>(null), [selection, setSelection] = useState<Selection | null>(null);
  const [attempt, setAttempt] = useState(0), [pending, setPending] = useState(false);
  const panel = useId(), tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const index = resource?.data, club = index?.club;
  const competition = index?.competitions.find(comp => comp.id === selected) ?? index?.competitions.find(comp => comp.status === 'em_andamento') ?? index?.competitions[0] ?? null;
  const selectedId = competition?.id, selectionKey = `${clubId}:${selectedId ?? ''}:${attempt}`;
  useEffect(() => {
    if (!selectedId) return;
    let active = true;
    const timer = setTimeout(() => { if (active) { active = false; setSelection({ key: selectionKey, standings: null, scorers: null, players: null, ties: null }); } }, 12000);
    Promise.allSettled([fetchStandings(selectedId), fetchScorers(selectedId), fetchCompetitionPlayerIds(selectedId), competition?.classification_format === 'league' ? Promise.resolve([] as BracketTie[]) : fetchBracketTies(selectedId)])
      .then(([standings, scorers, players, ties]) => { if (active) setSelection({ key: selectionKey, standings: fulfilled(standings), scorers: fulfilled(scorers), players: fulfilled(players), ties: fulfilled(ties) }); })
      .finally(() => clearTimeout(timer));
    return () => { active = false; clearTimeout(timer); };
  }, [selectedId, selectionKey, competition?.classification_format]);
  const data = selection?.key === selectionKey ? selection : null;
  const retrySelection = () => setAttempt(value => value + 1);
  const keyboard = (event: KeyboardEvent<HTMLButtonElement>, at: number) => {
    const next = event.key === 'ArrowRight' ? (at + 1) % 3 : event.key === 'ArrowLeft' ? (at + 2) % 3 : event.key === 'Home' ? 0 : event.key === 'End' ? 2 : null;
    if (next === null) return; event.preventDefault(); setTab(tabs[next].id); tabRefs.current[next]?.focus();
  };
  const back = onBack ?? (() => onNav('search'));
  if (!resource) return <main className="cpm-club"><Loading/></main>;
  if (!club || !index) return <main className="cpm-club"><div className="cpm-club-toolbar"><Action icon="searchBack" onClick={back}>Voltar</Action></div><State icon="searchAlert" action={resource.state === 'error' ? 'Tentar novamente' : 'Buscar clubes'} onAction={resource.state === 'error' ? retry : () => onNav('search')}>{resource.state === 'error' ? 'Não foi possível carregar o clube' : 'Clube não encontrado'}</State></main>;

  const matches = index.matches.filter(match => !competition || match.competition_id === competition.id);
  const { upcoming, results } = clubFixtures(matches), next = upcoming[0];
  const table = data?.standings, row = table?.find(row => row.club === club.id);
  const position = table ? [...table].sort((a, b) => b.P - a.P || b.SG - a.SG).findIndex(row => row.club === club.id) + 1 : 0;
  const roster = index.players?.filter(player => !competition || data?.players?.has(player.id));
  const favorite = app.favClubs.has(club.id), league = competition?.classification_format === 'league';
  const compName = competition ? [competition.nome, competition.edicao].filter(Boolean).join(' ') : '';
  const stages = data?.ties ? resolveBracket(data.ties, matches, index.clubs, competition!.classification_format) : [];
  const tie = stages.flatMap(stage => stage.ties).filter(result => result.home.clubId === club.id || result.away.clubId === club.id).reverse().find(result => result.outcome !== 'final' && result.outcome !== 'bye') ?? stages.flatMap(stage => stage.ties).filter(result => result.home.clubId === club.id || result.away.clubId === club.id).at(-1);
  const currentMatch = next ?? (league ? null : tie?.secondLeg ?? tie?.firstLeg);
  const home = currentMatch ? index.clubs.find(club => club.id === currentMatch.home) : null, away = currentMatch ? index.clubs.find(club => club.id === currentMatch.away) : null;
  const selector = <CpmPopover className="cpm-club-selector" label="Competição do clube" role="listbox" trigger={<><CpmIcon name="trophy"/><span>{compName}</span><CpmIcon name="chevron"/></>}>
    {close => index.competitions.map(comp => <button type="button" role="option" aria-selected={comp.id === competition?.id} key={comp.id} onClick={() => { setSelected(comp.id); close(); }}><CpmIcon name="trophy"/><span>{[comp.nome, comp.edicao].filter(Boolean).join(' ')}</span></button>)}
  </CpmPopover>;
  const openTable = () => onNav('tournaments', competition!.id, league ? 'table' : 'bracket');
  const participation = !competition ? <State icon="trophy">Sem competição vinculada</State> : <section className="cpm-club-participation">{selector}<div className="cpm-club-divider"/>{!data ? <Loading compact/> : league ? table === null ? <State icon="searchAlert" action="Tentar novamente" onAction={retrySelection}>Classificação indisponível</State> : <><div className="cpm-club-metrics"><div><strong>{position ? `${position}º` : '—'}</strong><small>Posição</small></div><div><strong>{row?.P ?? '—'}</strong><small>Pontos</small></div></div><Action icon="arrow" onClick={openTable}>Ver tabela</Action></> : data.ties === null ? <State icon="searchAlert" action="Tentar novamente" onAction={retrySelection}>Chave indisponível</State> : <><div className="cpm-club-knockout"><h3><CpmIcon name="trophy"/>{tie?.tie.stage_name || 'Mata-mata'}</h3><small>{competition.classification_format === 'knockout_single' ? 'Jogo único' : 'Ida e volta'}</small>{tie && <p>{tie.home.label} × {tie.away.label}</p>}{tie && tie.homeGoals !== null && tie.awayGoals !== null && <p>{competition.classification_format === 'knockout_two_leg' ? 'Agregado · ' : ''}{tie.homeGoals} – {tie.awayGoals}</p>}</div><Action icon="arrow" onClick={openTable}>Ver chave</Action></>}</section>;
  const campaign = league && data && table !== null && <section className="cpm-club-campaign"><Heading icon="matchBall">Campanha</Heading><div className="cpm-club-form" role="img" aria-label={row?.form?.length ? row.form.slice(-5).map(value => value === 'V' ? 'Vitória' : value === 'E' ? 'Empate' : 'Derrota').join(', ') : 'Sem resultados recentes'}>{Array.from({ length: 5 }, (_, i) => { const value = row?.form?.slice(-5)[i]; return <span key={i} className={value === 'V' ? 'is-win' : value === 'D' ? 'is-loss' : ''} aria-hidden="true">{value || '—'}</span>; })}</div><div className="cpm-club-campaign-stats">{[['Jogos', row?.J], ['Vitórias', row?.V], ['Empates', row?.E], ['Derrotas', row?.D]].map(([label, value]) => <div key={label}><strong>{value ?? '—'}</strong><small>{label}</small></div>)}</div><div className="cpm-club-divider"/><div className="cpm-club-balance"><span>{row ? `${row.GP} pró · ${row.GC} contra` : '— pró · — contra'}</span><span>{row ? `${row.SG > 0 ? '+' : ''}${row.SG} saldo` : '— saldo'}</span></div></section>;
  const recent = <section className="cpm-club-recent"><Heading icon="clock" action={<Action icon="arrow" onClick={() => { setGames('results'); setTab('games'); }}>Ver jogos</Action>}>{league || !tie ? 'Últimos resultados' : competition?.classification_format === 'knockout_two_leg' ? 'Ida' : 'Resultados'}</Heading><div className="cpm-club-fixtures">{results.length ? results.slice(0, 3).map(match => <Fixture key={match.id} match={match} clubs={index.clubs} competition={competition} onNav={onNav}/>) : <State>Nenhum resultado registrado</State>}</div></section>;
  return <main className="cpm-club">
    <section className="cpm-club-identity" aria-label="Clube"><div className="cpm-club-toolbar"><Action icon="searchBack" onClick={back}>Voltar</Action><span/><Action icon="star" label={favorite ? 'Remover clube dos salvos' : 'Favoritar clube'} pressed={favorite} disabled={pending || app.savedLoading} onClick={async () => { setPending(true); try { await app.saveWithFeedback('club:' + club.id, !favorite, 'Clube'); } finally { setPending(false); } }}>{favorite ? 'Favoritado' : 'Favoritar'}</Action><Action icon="matchShare" label="Compartilhar clube" onClick={async () => { const result = await shareLink({ title: club.nome, text: club.nome + ' · CPM MamoBall', url: window.location.origin + pathForPage('club', club.id) }); if (result === 'copied') app.showToast('Link copiado', { variant: 'copied' }); else if (result === 'failed') app.showError(new Error('Não foi possível compartilhar. Tente novamente.')); }}>Compartilhar</Action></div><div className="cpm-club-name"><Crest key={club.id} id={club.id} club={club} size={64}/><div><h1>{club.nome}</h1><div className="cpm-club-colors"><span>{club.tag}</span><span>Cores</span>{[club.color, club.color2].filter(Boolean).map((color, i) => <i key={i} title={color} aria-label={`Cor ${i + 1}: ${color}`} style={{ backgroundColor: /^#[\da-f]{3,8}$/i.test(color) ? color : undefined }}/>)}</div></div></div></section>
    <div className="cpm-club-tabs" role="tablist" aria-label="Detalhes do clube">{tabs.map((item, i) => <button type="button" key={item.id} ref={node => { tabRefs.current[i] = node; }} role="tab" id={`${panel}-${item.id}`} aria-selected={item.id === tab} aria-controls={panel} tabIndex={item.id === tab ? 0 : -1} onClick={() => setTab(item.id)} onKeyDown={event => keyboard(event, i)}><CpmIcon name={item.icon}/>{item.label}</button>)}</div>
    <motion.div key={tab} id={panel} role="tabpanel" tabIndex={0} aria-labelledby={`${panel}-${tab}`} initial={false} animate={{ opacity: 1 }} transition={{ duration: reduced ? 0 : .12 }}>
      {tab === 'summary' && !competition ? <State icon="trophy">Sem competição vinculada</State> : tab === 'summary' ? <div className="cpm-club-summary"><section className="cpm-club-next"><Heading icon={league || !tie ? next?.status === 'ao_vivo' ? 'matchBall' : 'calendar' : 'trophy'}>{league || !tie ? next?.status === 'ao_vivo' ? 'Ao vivo' : 'Próximo jogo' : tie.tie.stage_name}</Heading>{currentMatch && home && away ? <><MatchScoreboard detail={{ match: currentMatch, home, away, competition }} onNav={onNav} context={!league && tie ? { round: tie.tie.stage_name, stage: competition?.classification_format === 'knockout_single' ? 'Jogo único' : currentMatch.id === tie.tie.second_leg_match_id ? 'Volta' : 'Ida' } : undefined}/><Action icon="arrow" onClick={() => onNav('match', currentMatch.id)}>Ver partida</Action></> : <State>Nenhum jogo agendado</State>}</section><aside className="cpm-club-rail">{participation}{campaign}</aside>{!league && !results.length ? null : recent}</div> : tab === 'games' ? <div className="cpm-club-games"><div className="cpm-club-game-tabs" role="group" aria-label="Situação dos jogos"><button type="button" aria-pressed={games === 'upcoming'} onClick={() => setGames('upcoming')}><CpmIcon name="calendar"/>Próximos<small>{upcoming.length}</small></button><button type="button" aria-pressed={games === 'results'} onClick={() => setGames('results')}><CpmIcon name="calendar"/>Resultados<small>{results.length}</small></button></div><div className="cpm-club-fixtures">{(games === 'upcoming' ? upcoming : results).length ? (games === 'upcoming' ? upcoming : results).map(match => <Fixture key={match.id} match={match} clubs={index.clubs} competition={competition} onNav={onNav}/>) : <State>{matches.length ? games === 'upcoming' ? 'Nenhum jogo agendado' : 'Nenhum resultado registrado' : 'Nenhuma partida registrada'}</State>}</div></div> : <section className="cpm-club-roster"><Heading icon="user">Elenco</Heading>{index.players === null ? <State icon="searchAlert" action="Tentar novamente" onAction={retry}>Não foi possível carregar o elenco</State> : competition && !data ? <Loading compact/> : competition && data?.players === null ? <State icon="searchAlert" action="Tentar novamente" onAction={retrySelection}>Não foi possível carregar o elenco</State> : !roster?.length ? <State icon="user">Nenhum jogador cadastrado</State> : <>{competition && data?.scorers === null && <State icon="searchAlert" action="Tentar novamente" onAction={retrySelection}>Estatísticas indisponíveis</State>}<table className="cpm-club-roster-table"><thead><tr><th scope="col">Jogador</th><th scope="col"><CpmIcon name="matchBall"/><span>Gols</span></th><th scope="col"><CpmIcon name="matchAssist"/><span>Assist.</span></th></tr></thead><tbody>{roster.map(player => { const stats = playerStatistics(player, roster, data?.scorers ?? []); return <tr key={player.id}><td><div className="cpm-club-player"><span className="cpm-club-player-avatar">{player.nick?.[0]?.toUpperCase() || <CpmIcon name="user"/>}</span><div><strong>{player.nick || 'Jogador sem nome'}</strong><small>{player.game_id ? '#' + player.game_id : 'ID indisponível'}{player.posicao && <span>{player.posicao}</span>}</small>{player.is_captain && <small><CpmIcon name="searchShield"/>Capitão</small>}</div></div></td><td>{stats?.goals ?? '—'}</td><td>{stats?.assists ?? '—'}</td></tr>; })}</tbody></table></>}</section>}
    </motion.div>
  </main>;
}
