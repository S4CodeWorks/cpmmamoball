'use client';

import { useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useData } from '@/contexts/DataContext';
import { I } from '@/components/icons';
import { TopAppBar } from '@/components/ui/TopAppBar';
import { SheetItem } from '@/components/ui/Sheet';
import { SectionHead } from '@/components/ui/Primitives';
import { MatchTile } from '@/components/ui/MatchTile';
import { Crest } from '@/components/ui/Crest';
import { ColorMesh } from '@/components/ui/ColorMesh';
import { Skeleton, SkeletonMatchHero, SkeletonList } from '@/components/ui/Skeleton';
import { useIsDesktop } from '@/hooks/useIsDesktop';
import { fetchPlayers, fetchMatchById, fetchMatches } from '@/lib/db';
import { shareLink } from '@/lib/share';
import { pathForPage } from '@/lib/routes';
import type { Club, Match } from '@/lib/types';

interface Props {
  onNav: (page: string, param?: string | number | null) => void;
  onBack?: () => void;
  matchId?: number;
}

function TeamHead({ club, winner, onClick }: { club: Club; winner?: boolean; right?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="tap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, opacity: winner === false ? 0.55 : 1, textAlign: 'center' }}>
      <Crest id={club.id} size={56} radius={16} />
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.15 }}>{club.tag}</div>
        <div style={{ fontSize: 11, color: 'var(--on-surface-variant)', marginTop: 3, maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{club.nome}</div>
      </div>
    </button>
  );
}

// ── Resumo — artilheiros reais, sem tempo/cartões (Mamoball não tem) ──────────
function Resumo({ m, home, away, isSched }: { m: Match; home: Club; away: Club; isSched: boolean }) {
  // Nick → ID do jogo, pra exibir o selo abaixo do nick de cada goleador
  const [gameIds, setGameIds] = useState<Record<string, string>>({});
  useEffect(() => {
    if (isSched || m.is_wo) return;
    let cancelled = false;
    Promise.all([fetchPlayers(home.id), fetchPlayers(away.id)])
      .then(([hp, ap]) => {
        if (cancelled) return;
        const gids: Record<string, string> = {};
        [...hp, ...ap].forEach(p => { gids[p.nick] = p.game_id; });
        setGameIds(gids);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [m.id, m.is_wo, home.id, away.id, isSched]);

  if (isSched) {
    return (
      <div className="empty">
        <div className="empty-icon"><span style={{ width: 28, height: 28, color: 'var(--primary)' }}>{I.calendar}</span></div>
        <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 700 }}>Partida agendada</h3>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>{m.date}</p>
      </div>
    );
  }

  if (m.is_wo) {
    return (
      <div className="empty" style={{ padding: '32px 24px' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
        <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 700 }}>W.O.</h3>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--on-surface-variant)' }}>Partida encerrada por W.O.</p>
      </div>
    );
  }

  const hasScorers = m.home_scorers.length > 0 || m.away_scorers.length > 0;

  if (!hasScorers) {
    return (
      <div className="empty" style={{ padding: '32px 24px' }}>
        <div className="empty-icon">⚽</div>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--on-surface-variant)' }}>Artilheiros não registrados para esta partida.</p>
      </div>
    );
  }

  // Intercalar gols de cada lado para exibição cronológica (sem tempo → só alternamos)
  type Ev = { side: 'home' | 'away'; nick: string; own_goal?: boolean; assist?: string | null };
  const homeGoals: Ev[] = m.home_scorers.map(g => ({ side: 'home', nick: g.nick, own_goal: g.own_goal, assist: g.assist }));
  const awayGoals: Ev[] = m.away_scorers.map(g => ({ side: 'away', nick: g.nick, own_goal: g.own_goal, assist: g.assist }));
  const events: Ev[] = [];
  const maxLen = Math.max(homeGoals.length, awayGoals.length);
  for (let i = 0; i < maxLen; i++) {
    if (homeGoals[i]) events.push(homeGoals[i]);
    if (awayGoals[i]) events.push(awayGoals[i]);
  }

  return (
    <div style={{ padding: '0 16px' }}>
      <div className="card-filled" style={{ padding: '8px 18px 12px' }}>
        {events.map((e, i) => {
          const isHome = e.side === 'home';
          // Gol contra: o jogador pertence ao elenco OPOSTO ao lado que marcou no placar
          const crestClubId = e.own_goal ? (isHome ? away.id : home.id) : (isHome ? home.id : away.id);
          return (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 36px 1fr', alignItems: 'center', gap: 8, padding: '11px 0', borderTop: i > 0 ? '1px solid var(--outline-variant)' : 'none' }}>
              {/* Lado mandante */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, opacity: isHome ? 1 : 0 }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{e.nick}{e.own_goal && <span style={{ color: 'var(--error)', fontWeight: 700 }}> (contra)</span>}</div>
                  {gameIds[e.nick] && <div className="mono" style={{ fontSize: 10.5, color: 'var(--on-surface-variant)' }}>#{gameIds[e.nick]}</div>}
                  {e.assist && <div style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>🎯 {e.assist}</div>}
                </div>
                <Crest id={isHome ? crestClubId : home.id} size={20} />
              </div>
              {/* Ícone de gol */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <span style={{ width: 30, height: 30, borderRadius: 10, background: e.own_goal ? 'color-mix(in srgb, var(--error) 18%, transparent)' : 'var(--primary-container)', display: 'grid', placeItems: 'center', fontSize: 15 }}>⚽</span>
              </div>
              {/* Lado visitante */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: !isHome ? 1 : 0 }}>
                <Crest id={!isHome ? crestClubId : away.id} size={20} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{e.nick}{e.own_goal && <span style={{ color: 'var(--error)', fontWeight: 700 }}> (contra)</span>}</div>
                  {gameIds[e.nick] && <div className="mono" style={{ fontSize: 10.5, color: 'var(--on-surface-variant)' }}>#{gameIds[e.nick]}</div>}
                  {e.assist && <div style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>🎯 {e.assist}</div>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── H2H — confrontos diretos reais, a partir do contexto ─────────────────────
function H2H({ m }: { m: Match }) {
  const { matches, clubById } = useData();

  const home = clubById(m.home)!;
  const away = clubById(m.away)!;

  // Confrontos anteriores entre estes dois clubes (exclui a partida atual)
  const past = matches.filter(x =>
    x.id !== m.id &&
    x.status === 'finalizado' &&
    ((x.home === m.home && x.away === m.away) || (x.home === m.away && x.away === m.home))
  );

  if (past.length === 0) {
    return (
      <div className="empty" style={{ padding: '32px 24px' }}>
        <div style={{ fontSize: 36, marginBottom: 10 }}>⚔️</div>
        <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700 }}>Sem confrontos anteriores</h3>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--on-surface-variant)' }}>Nenhum duelo registrado entre estes times.</p>
      </div>
    );
  }

  // Estatísticas
  let homeWins = 0, awayWins = 0, draws = 0;
  past.forEach(x => {
    const hIsHome = x.home === m.home;
    const xH = x.scoreH ?? 0, xA = x.scoreA ?? 0;
    if (xH === xA) draws++;
    else if ((hIsHome && xH > xA) || (!hIsHome && xA > xH)) homeWins++;
    else awayWins++;
  });

  return (
    <div style={{ padding: '0 16px' }}>
      <div className="card-filled" style={{ padding: '20px 18px' }}>
        {/* Resumo de vitórias */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 16, marginBottom: 18 }}>
          <div style={{ textAlign: 'center' }}>
            <Crest id={home.id} size={40} />
            <div className="mono tabular" style={{ fontSize: 26, fontWeight: 800, marginTop: 10 }}>{homeWins}</div>
            <div style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>{homeWins === 1 ? 'vitória' : 'vitórias'}</div>
          </div>
          <div style={{ textAlign: 'center', color: 'var(--on-surface-variant)' }}>
            <div className="mono tabular" style={{ fontSize: 20, fontWeight: 600 }}>{draws}</div>
            <div style={{ fontSize: 11 }}>{draws === 1 ? 'empate' : 'empates'}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Crest id={away.id} size={40} />
            <div className="mono tabular" style={{ fontSize: 26, fontWeight: 800, marginTop: 10 }}>{awayWins}</div>
            <div style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>{awayWins === 1 ? 'vitória' : 'vitórias'}</div>
          </div>
        </div>

        <div style={{ height: 1, background: 'var(--outline-variant)', margin: '0 0 4px' }} />

        {/* Lista dos jogos anteriores */}
        {past.slice(0, 6).map((x, i) => {
          const ch = clubById(x.home);
          const ca = clubById(x.away);
          if (!ch || !ca) return null;
          return (
            <div key={x.id} style={{ display: 'grid', gridTemplateColumns: '1fr 52px 1fr', gap: 6, alignItems: 'center', padding: '12px 0', borderTop: i ? '1px solid var(--outline-variant)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{ch.tag}</span>
                <Crest id={x.home} size={22} />
              </div>
              <span className="mono tabular" style={{ fontSize: 13, fontWeight: 700, textAlign: 'center' }}>
                {x.is_wo ? 'W.O.' : `${x.scoreH ?? '?'}–${x.scoreA ?? '?'}`}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Crest id={x.away} size={22} />
                <span style={{ fontSize: 12, fontWeight: 600 }}>{ca.tag}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function MatchScreen({ onNav, onBack, matchId }: Props) {
  const { matches: ctxMatches, clubById, competitions } = useData();
  // A partida pode pertencer a uma competição diferente da "ativa" do contexto
  // (ex: clicada a partir do seletor de competições da Home) — busca local, por
  // id e depois pelas demais partidas da mesma competição, quando não está
  // entre as partidas já carregadas globalmente.
  const [localData, setLocalData] = useState<{ match: Match; competitionMatches: Match[] } | null>(null);
  const [loadingMatch, setLoadingMatch] = useState(false);
  const foundInCtx = ctxMatches.find(x => x.id === matchId);

  useEffect(() => {
    if (foundInCtx || matchId == null) { setLocalData(null); setLoadingMatch(false); return; }
    let cancelled = false;
    setLoadingMatch(true);
    fetchMatchById(matchId).then(async match => {
      if (cancelled) return;
      if (!match) { setLocalData(null); return; }
      const competitionMatches = await fetchMatches(match.competition_id).catch(() => [match]);
      if (!cancelled) setLocalData({ match, competitionMatches });
    }).catch(() => { if (!cancelled) setLocalData(null); })
      .finally(() => { if (!cancelled) setLoadingMatch(false); });
    return () => { cancelled = true; };
  }, [matchId, foundInCtx]);

  const m = foundInCtx ?? localData?.match ?? null;
  if (!m) {
    if (loadingMatch) {
      return (
        <div aria-busy="true" aria-label="Carregando partida">
          <SkeletonMatchHero />
          <div style={{ padding: '16px' }}>
            <SkeletonList rows={4} />
          </div>
        </div>
      );
    }
    return <div className="empty"><p>Partida não encontrada.</p></div>;
  }
  const matchesForRodada = foundInCtx ? ctxMatches : (localData?.competitionMatches ?? []);
  const home = clubById(m.home)!;
  const away = clubById(m.away)!;
  const isSched = m.status === 'agendado';
  const [tab, setTab] = useState('resumo');
  const { bookmarks, toggleBookmark, notifs, toggleNotif, showToast, resolvedTheme } = useApp();
  const isDesktop = useIsDesktop();
  const matchKey = 'match:' + m.id;
  const isBookmarked = bookmarks.has(matchKey);
  const isNotif = notifs.has(matchKey);
  const otherMatches = matchesForRodada.filter(x => x.rodada === m.rodada && x.id !== m.id).slice(0, 3);

  const menu = (close: () => void) => (
    <>
      <SheetItem icon={isBookmarked ? 'starFilled' : 'star'} label={isBookmarked ? 'Salvo nos favoritos' : 'Salvar partida'}
        meta="Encontre depois em Mais → Salvos" on={isBookmarked}
        onClick={() => { toggleBookmark(matchKey); showToast(isBookmarked ? 'Removido dos favoritos' : 'Partida salva'); }} />
      {isSched && (
        <SheetItem icon={isNotif ? 'bell' : 'bellOff'} label="Lembrar 15 min antes" on={isNotif}
          onClick={() => { toggleNotif(matchKey); showToast(isNotif ? 'Lembrete desativado' : 'Lembrete ativado'); }} />
      )}
      <SheetItem icon="share" label="Compartilhar" meta={`${home.tag} vs ${away.tag} · ${m.stage}`}
        onClick={async () => {
          close();
          const r = await shareLink({ title: `${home.tag} vs ${away.tag}`, text: `${home.tag} vs ${away.tag} · ${m.stage} · CPM MamoBall`, url: `${window.location.origin}${pathForPage('match', m.id)}` });
          if (r === 'copied') showToast('Link copiado');
          else if (r === 'failed') showToast('Não foi possível compartilhar');
        }} />
    </>
  );

  return (
    <>
      {/* Sticky match hero */}
      <div style={{ position: 'sticky', top: 0, zIndex: 30, background: 'var(--surface)', borderBottom: '1px solid var(--outline-variant)' }}>
        <ColorMesh colors={[home.color, home.color2, away.color]} opacity={resolvedTheme === 'dark' ? 0.3 : 0.46} />
        <div style={{ position: 'relative', zIndex: 1 }}>
        <TopAppBar showBack onBack={onBack} title="" menu={menu} />
        <div style={{ padding: '0 16px 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 14 }}>
            <span className="mono" style={{ fontSize: 11, color: 'var(--on-surface-variant)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {competitions.find(c => c.id === m.competition_id)?.nome ?? 'Liga'} · {m.stage}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 14 }}>
            <TeamHead club={home} winner={!isSched && (m.scoreH ?? 0) > (m.scoreA ?? 0) ? true : isSched ? undefined : false} onClick={() => onNav('club', home.id)} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              {!isSched && !m.is_wo && <span className="chip" style={{ height: 24, padding: '0 10px', fontSize: 11 }}>Encerrado</span>}
              {!isSched && m.is_wo  && <span className="chip" style={{ height: 24, padding: '0 10px', fontSize: 11, background: 'color-mix(in srgb, var(--error) 15%, transparent)', color: 'var(--error)' }}>W.O.</span>}
              {isSched ? (
                <>
                  <span className="mono" style={{ fontSize: 36, color: 'var(--on-surface-variant)', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1 }}>vs</span>
                  <span className="chip chip-warn" style={{ marginTop: 2 }}>{m.date}</span>
                </>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className="mono tabular" style={{ fontSize: 60, fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 1 }}>{m.scoreH}</span>
                  <span className="mono" style={{ fontSize: 26, color: 'var(--outline)' }}>:</span>
                  <span className="mono tabular" style={{ fontSize: 60, fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 1 }}>{m.scoreA}</span>
                </div>
              )}
            </div>
            <TeamHead club={away} winner={!isSched && (m.scoreA ?? 0) > (m.scoreH ?? 0) ? true : isSched ? undefined : false} onClick={() => onNav('club', away.id)} />
          </div>
        </div>
        </div>
      </div>

      {/* Desktop: split view */}
      {isDesktop ? (
        <div className="d-split" style={{ paddingTop: 16 }}>
          <div>
            <div style={{ padding: '8px 16px 12px', fontWeight: 700, fontSize: 15, color: 'var(--on-surface)' }}>Resumo da Partida</div>
            <Resumo m={m} home={home} away={away} isSched={isSched} />
          </div>
          <div>
            <div style={{ padding: '8px 16px 12px', fontWeight: 700, fontSize: 15, color: 'var(--on-surface)' }}>Confrontos Diretos</div>
            <H2H m={m} />
            {otherMatches.length > 0 && (
              <>
                <SectionHead title="Outros jogos da rodada" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 16px' }}>
                  {otherMatches.map(x => (
                    <MatchTile key={x.id} m={x} onClick={() => onNav('match', x.id)} showStage={false} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="tabs">
            {[{ id: 'resumo', label: 'Resumo' }, { id: 'h2h', label: 'Confrontos' }].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} className={tab === t.id ? 'is-active' : ''}>{t.label}</button>
            ))}
          </div>
          <div style={{ padding: '16px 0' }}>
            {tab === 'resumo' && <Resumo m={m} home={home} away={away} isSched={isSched} />}
            {tab === 'h2h'   && <H2H m={m} />}
          </div>
          {otherMatches.length > 0 && (
            <>
              <SectionHead title="Outros jogos da rodada" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 16px' }}>
                {otherMatches.map(x => (
                  <MatchTile key={x.id} m={x} onClick={() => onNav('match', x.id)} showStage={false} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}
