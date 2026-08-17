'use client';

import { useEffect, useMemo, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { I } from '@/components/icons';
import { TopAppBar } from '@/components/ui/TopAppBar';
import { SheetItem } from '@/components/ui/Sheet';
import { SectionHead, FormDots } from '@/components/ui/Primitives';
import { MatchTile } from '@/components/ui/MatchTile';
import { Crest } from '@/components/ui/Crest';
import { ColorMesh } from '@/components/ui/ColorMesh';
import { CompetitionPills } from '@/components/ui/CompetitionPills';
import { SkeletonHeroMatch, SkeletonMatchCard, SkeletonStandingsTable } from '@/components/ui/Skeleton';
import { useIsDesktop } from '@/hooks/useIsDesktop';
import { fetchMatches, fetchStandings, fetchMatchesForCompetitions, fetchApprovedInscricoesForCompetitions } from '@/lib/db';
import { buildHomeFeed, type FeaturedMoment } from '@/lib/homeFeed';
import type { Match, Club, Standing } from '@/lib/types';
import type { Inscricao } from '@/lib/db';

interface Props { onNav: (page: string, param?: string | number | null, extra?: string | null) => void; }

function FeaturedMatch({ m, variant, onClick }: { m: Match; variant: 'scheduled' | 'result'; onClick: () => void }) {
  const { clubById, competitions } = useData();
  const { resolvedTheme } = useApp();
  const home = clubById(m.home), away = clubById(m.away);
  if (!home || !away) return null;

  const comp = competitions.find(c => c.id === m.competition_id);
  const isSched = variant === 'scheduled';
  const isHomeWinner = !isSched && (m.scoreH ?? 0) > (m.scoreA ?? 0);
  const isAwayWinner = !isSched && (m.scoreA ?? 0) > (m.scoreH ?? 0);

  // Status semântico no canhoto
  const statusLabel = m.is_wo ? 'W.O.' : isSched ? 'Agendado' : 'Final';
  const statusColor = m.is_wo ? 'var(--error)' : isSched ? 'var(--warning)' : 'var(--primary)';

  return (
    <button onClick={onClick} className="tap" style={{ width: '100%', textAlign: 'left', display: 'block' }}>
      <div
        className="match-ticket"
        style={{
          position: 'relative',
          borderRadius: 'var(--r-2xl)',
          background: 'var(--surface-c)',
          border: '1px solid color-mix(in srgb, var(--outline-variant) 70%, transparent)',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: 'minmax(115px, 140px) 1fr',
        }}
      >
        <ColorMesh colors={[home.color, home.color2, away.color]} opacity={resolvedTheme === 'dark' ? 0.28 : 0.44} />

        {/* ── Canhoto do Ingresso (Left Stub) ── */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            padding: '20px 16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 16,
            borderRight: '1.5px dashed color-mix(in srgb, var(--outline-variant) 80%, transparent)',
            background: 'color-mix(in srgb, var(--surface) 35%, transparent)',
          }}
        >
          {/* Topo do Canhoto: Competição + Rodada */}
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700, lineHeight: 1.2, color: 'var(--on-surface)', wordBreak: 'break-word' }}>
              {comp?.nome ?? 'Liga'}
            </div>
            <div className="mono" style={{ fontSize: 11.5, color: 'var(--on-surface-variant)', marginTop: 4 }}>
              {m.stage}
            </div>
          </div>

          {/* Base do Canhoto: Status + Data */}
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: statusColor, lineHeight: 1.1 }}>
              {statusLabel}
            </div>
            <div className="mono tabular" style={{ fontSize: 11.5, color: 'var(--on-surface-variant)', marginTop: 4 }}>
              {m.date}
            </div>
          </div>
        </div>

        {/* ── Corpo do Ingresso (Ticket Body) ── */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            padding: '20px 22px 18px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 18,
          }}
        >
          {/* Confronto Central */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 14 }}>
            {/* Time Mandante */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, opacity: isAwayWinner ? 0.65 : 1 }}>
              <Crest id={home.id} size={54} radius={16} />
              <div style={{ textAlign: 'center', minWidth: 0, width: '100%' }}>
                <div style={{ fontSize: 14.5, fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1.1 }}>{home.tag}</div>
                <div style={{ fontSize: 11, color: 'var(--on-surface-variant)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 110 }}>{home.nome}</div>
              </div>
            </div>

            {/* Hub Central de Placar com Linha do Tempo */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 4px' }}>
              {isSched ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <span className="mono" style={{ fontSize: 32, fontWeight: 800, color: 'var(--on-surface-variant)', letterSpacing: '-0.04em', lineHeight: 1 }}>VS</span>
                  <div style={{ width: 44, height: 2, background: 'color-mix(in srgb, var(--outline-variant) 70%, transparent)', margin: '4px 0 6px' }} />
                  <span className="mono tabular" style={{ fontSize: 11, fontWeight: 600, color: 'var(--on-surface-variant)' }}>
                    {m.date.split('·')[1]?.trim() ?? 'Em breve'}
                  </span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="mono tabular" style={{ fontSize: 44, fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1, color: isHomeWinner ? 'var(--primary)' : 'var(--on-surface)' }}>
                      {m.scoreH}
                    </span>
                    <span className="mono" style={{ fontSize: 24, fontWeight: 300, color: 'var(--outline)', lineHeight: 1 }}>-</span>
                    <span className="mono tabular" style={{ fontSize: 44, fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1, color: isAwayWinner ? 'var(--primary)' : 'var(--on-surface)' }}>
                      {m.scoreA}
                    </span>
                  </div>
                  <div style={{ width: 56, height: 2, background: 'color-mix(in srgb, var(--outline-variant) 70%, transparent)', margin: '6px 0' }} />
                  <span className="mono tabular" style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>
                    {m.date.split('·')[1]?.trim() ?? 'Final'}
                  </span>
                </div>
              )}
            </div>

            {/* Time Visitante */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, opacity: isHomeWinner ? 0.65 : 1 }}>
              <Crest id={away.id} size={54} radius={16} />
              <div style={{ textAlign: 'center', minWidth: 0, width: '100%' }}>
                <div style={{ fontSize: 14.5, fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1.1 }}>{away.tag}</div>
                <div style={{ fontSize: 11, color: 'var(--on-surface-variant)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 110 }}>{away.nome}</div>
              </div>
            </div>
          </div>

          {/* Botão de Ação Estilizado */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 18px',
                borderRadius: 999,
                border: '1px solid var(--outline-variant)',
                background: 'color-mix(in srgb, var(--surface) 60%, transparent)',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--on-surface)',
                letterSpacing: '-0.01em',
              }}
            >
              {isSched ? 'Ver prévia do confronto' : 'Ver escalações e resumo'} ›
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

function FeaturedInscricao({ inscricao, competitionName, onClick }: { inscricao: Inscricao; competitionName: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="tap" style={{ width: '100%', textAlign: 'left' }}>
      <div style={{ borderRadius: 'var(--r-2xl)', padding: '20px 22px', background: 'var(--surface-c)', display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--primary-container)', color: 'var(--on-primary-container)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
          {I.check}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="eyebrow eyebrow-acc">Novo time · {competitionName}</div>
          <div style={{ fontSize: 17, fontWeight: 700, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {inscricao.tag} entrou na competição
          </div>
        </div>
        <span style={{ width: 22, height: 22, flexShrink: 0, color: 'var(--on-surface-variant)' }}>{I.chevR}</span>
      </div>
    </button>
  );
}

function FeaturedMoment({ moment, onNav }: { moment: FeaturedMoment; onNav: Props['onNav'] }) {
  if (moment.kind === 'none') return null;
  if (moment.kind === 'inscricao') {
    return (
      <FeaturedInscricao
        inscricao={moment.inscricao}
        competitionName={moment.competition.nome}
        onClick={() => onNav('tournaments', moment.competition.id)}
      />
    );
  }
  return (
    <FeaturedMatch
      m={moment.match}
      variant={moment.kind === 'result' ? 'result' : 'scheduled'}
      onClick={() => onNav('match', moment.match.id)}
    />
  );
}

function StandingsMini({ onNav, standings, title }: { onNav: Props['onNav']; standings: Standing[]; title?: string }) {
  const { clubById } = useData();
  const isDesktop = useIsDesktop();
  // Desktop tem mais espaço vertical na coluna lateral — mostra mais linhas da tabela
  const top5 = standings.slice(0, isDesktop ? 8 : 5);
  return (
    <div style={{ padding: '0 16px' }}>
      <div className="card-filled">
        {title && (
          <div style={{ padding: '12px 16px 0', fontSize: 12.5, fontWeight: 600, color: 'var(--on-surface-variant)' }}>{title}</div>
        )}
        <div style={{
          display: 'grid', gridTemplateColumns: '28px 1fr 38px 40px',
          padding: '12px 16px 8px',
          fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--on-surface-variant)',
          letterSpacing: '0.06em', textTransform: 'uppercase',
        }}>
          <span>#</span><span>Clube</span>
          <span style={{ textAlign: 'right' }}>Forma</span>
          <span style={{ textAlign: 'right' }}>Pts</span>
        </div>
        {top5.map((row, i) => {
          const c = clubById(row.club);
          if (!c) return null;
          return (
            <button key={row.club} onClick={() => onNav('club', row.club)} className="tap"
              style={{
                width: '100%', textAlign: 'left',
                display: 'grid', gridTemplateColumns: '28px 1fr 56px 40px',
                alignItems: 'center', gap: 10, padding: '12px 16px',
                borderTop: '1px solid var(--outline-variant)',
                background: i < 4 ? 'color-mix(in srgb, var(--primary) 5%, transparent)' : 'transparent',
              }}
            >
              <span className="mono tabular" style={{ fontSize: 14, fontWeight: 700, color: i < 4 ? 'var(--primary)' : 'var(--on-surface-variant)' }}>{i + 1}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <Crest id={row.club} size={28} />
                <span style={{ fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.nome}</span>
              </div>
              <div style={{ justifySelf: 'end' }}><FormDots form={row.form.slice(0, 3)} /></div>
              <span className="mono tabular" style={{ textAlign: 'right', fontSize: 18, fontWeight: 700 }}>{row.P}</span>
            </button>
          );
        })}
        <button onClick={() => onNav('tournaments')} className="tap"
          style={{
            width: '100%', padding: '14px',
            borderTop: '1px solid var(--outline-variant)',
            fontSize: 14, fontWeight: 600, color: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
          }}
        >
          Ver todos os clubes
          <span style={{ width: 18, height: 18 }}>{I.chevR}</span>
        </button>
      </div>
    </div>
  );
}

export function HomeScreen({ onNav }: Props) {
  const { showToast, theme, setTheme, resolvedTheme, favComps, toggleFavComp } = useApp();
  const { isLoggedIn, profile, user, signOut } = useAuth();
  const { matches: ctxMatches, standings: ctxStandings, competitions, activeComp, news, clubById } = useData();
  const isDesktop = useIsDesktop();

  // Ids favoritados que ainda existem entre as competições carregadas (uma
  // competição pode ter sido removida depois de favoritada).
  const favIds = useMemo(
    () => [...favComps].filter(id => competitions.some(c => c.id === id)),
    [favComps, competitions],
  );
  const hasFavorites = favIds.length > 0;

  // Seletor de competição — só usado no caminho SEM favoritos (comportamento
  // de hoje, preservado como fallback pra visitantes/usuários sem favoritos).
  const [selComp, setSelComp] = useState<string | null>(null);
  const selectedId = selComp ?? activeComp?.id ?? competitions[0]?.id ?? null;
  const isActiveComp = selectedId === activeComp?.id;
  const [local, setLocal] = useState<{ matches: Match[]; standings: Standing[] } | null>(null);

  useEffect(() => {
    if (hasFavorites || !selectedId || isActiveComp) { setLocal(null); return; }
    let cancelled = false;
    Promise.all([fetchMatches(selectedId), fetchStandings(selectedId)])
      .then(([matches, standings]) => { if (!cancelled) setLocal({ matches, standings }); })
      .catch(() => { if (!cancelled) setLocal({ matches: [], standings: [] }); });
    return () => { cancelled = true; };
  }, [hasFavorites, selectedId, isActiveComp]);

  // Caminho COM favoritos: busca em lote as partidas + inscrições aprovadas
  // de todas as competições favoritadas, e a tabela da primeira favoritada.
  const [favData, setFavData] = useState<{ matches: Match[]; inscricoes: Inscricao[]; standings: Standing[] } | null>(null);
  useEffect(() => {
    if (!hasFavorites) { setFavData(null); return; }
    let cancelled = false;
    Promise.all([
      fetchMatchesForCompetitions(favIds),
      fetchApprovedInscricoesForCompetitions(favIds),
      fetchStandings(favIds[0]),
    ]).then(([matches, inscricoes, standings]) => { if (!cancelled) setFavData({ matches, inscricoes, standings }); })
      .catch(() => { if (!cancelled) setFavData({ matches: [], inscricoes: [], standings: [] }); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasFavorites, favIds.join(',')]);

  // Enquanto a busca em lote das favoritas ainda está em voo, favData é null —
  // não é o mesmo que "sem dados", então não deve disparar o empty-state.
  const favLoading = hasFavorites && favData === null;

  const matches = hasFavorites ? (favData?.matches ?? []) : (isActiveComp ? ctxMatches : (local?.matches ?? []));
  const standings = hasFavorites ? (favData?.standings ?? []) : (isActiveComp ? ctxStandings : (local?.standings ?? []));

  const feed = useMemo(() => buildHomeFeed({
    competitions,
    matches,
    approvedInscricoes: hasFavorites ? (favData?.inscricoes ?? []) : [],
  }), [competitions, matches, hasFavorites, favData]);

  const greeting = isLoggedIn
    ? `Olá, ${profile?.nick || user?.email?.split('@')[0] || 'jogador'}`
    : 'Bem-vindo';
  // Desktop tem mais espaço na coluna esquerda — mostra mais partidas
  const listSize = isDesktop ? 5 : 3;
  const upcoming = feed.upcoming.slice(0, listSize);
  const recent = feed.recent.slice(0, listSize);
  const featuredNews = news[0];
  const extraNews = news.slice(1, 3);

  // Só mostra a tag de competição em cada card quando há 2+ favoritadas
  // mescladas na mesma lista — com 1 só (ou sem favoritos) é redundante.
  const showCompTag = hasFavorites && favIds.length > 1;
  const compName = (id: string) => competitions.find(c => c.id === id)?.nome;
  const standingsTitle = hasFavorites ? competitions.find(c => c.id === favIds[0])?.nome : undefined;

  const menu = (close: () => void) => (
    <>
      <SheetItem icon="auto" label="Tema do sistema"
        meta={theme === 'auto' ? 'Atual · ' + (resolvedTheme === 'dark' ? 'Escuro' : 'Claro') : 'Seguir o aparelho'}
        on={theme === 'auto'} onClick={() => { setTheme('auto'); close(); }} />
      <SheetItem icon="sun" label="Claro" on={theme === 'light'} onClick={() => { setTheme('light'); close(); }} />
      <SheetItem icon="moon" label="Escuro" on={theme === 'dark'} onClick={() => { setTheme('dark'); close(); }} />
      <div className="div-h" style={{ margin: '8px 16px' }} />
      <SheetItem icon="cog" label="Configurações" onClick={() => { close(); onNav('settings'); }} />
      {isLoggedIn
        ? <SheetItem icon="signOut" label="Sair da conta" danger onClick={() => { close(); signOut(); showToast('Até logo!'); }} />
        : <SheetItem icon="logIn" label="Entrar na conta" onClick={() => { close(); onNav('login'); }} />
      }
    </>
  );

  if (!featuredNews && feed.featured.kind === 'none' && !favLoading) {
    return (
      <>
        <TopAppBar large title={greeting} subhead="Federação CPM · 2026" menu={menu} />
        <div className="empty" style={{ marginTop: 48 }}>
          <div className="empty-icon">{I.trophy}</div>
          <h3 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 700, color: 'var(--on-surface)' }}>Em breve</h3>
          <p style={{ margin: 0, fontSize: 14 }}>A temporada ainda não começou. Fique de olho nas novidades!</p>
        </div>
      </>
    );
  }

  return (
    <>
      <TopAppBar large title={greeting} subhead="Federação CPM · 2026" menu={menu} />

      {/* Pills de competição — só no caminho sem favoritos (com favoritos, as
          listas já mesclam todas as competições relevantes de uma vez) */}
      {!hasFavorites && competitions.length > 1 && (
        <CompetitionPills competitions={competitions} selectedId={selectedId} onSelect={setSelComp}
          favIds={favComps} onToggleFav={toggleFavComp} />
      )}
      {/* Momento em destaque — full width */}
      <section style={{ padding: '8px 16px 0' }}>
        {favLoading ? <SkeletonHeroMatch /> : <FeaturedMoment moment={feed.featured} onNav={onNav} />}
      </section>

      {/* Desktop split: left = matches, right = standings */}
      <div className="d-split">
        {/* Left column: próximas + resultados */}
        <div>
          <SectionHead title="Próximas partidas" more="Ver tudo" onMore={() => onNav('jogos')} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 16px' }}>
            {favLoading ? (
              <><SkeletonMatchCard /><SkeletonMatchCard /></>
            ) : (
              upcoming.map(m => <MatchTile key={m.id} m={m} onClick={() => onNav('match', m.id)} compTag={showCompTag ? compName(m.competition_id) : undefined} />)
            )}
          </div>

          <SectionHead title="Últimos resultados" more="Histórico" onMore={() => onNav('jogos', null, 'resultados')} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 16px' }}>
            {favLoading ? (
              <><SkeletonMatchCard /><SkeletonMatchCard /></>
            ) : (
              recent.map(m => <MatchTile key={m.id} m={m} onClick={() => onNav('match', m.id)} compTag={showCompTag ? compName(m.competition_id) : undefined} />)
            )}
          </div>
        </div>

        {/* Right column: classificação */}
        <div>
          <SectionHead title="Classificação" more="Tabela completa" onMore={() => onNav('tournaments')} />
          {favLoading ? (
            <div style={{ padding: '0 16px' }}><SkeletonStandingsTable rows={5} /></div>
          ) : (
            <StandingsMini onNav={onNav} standings={standings} title={standingsTitle} />
          )}
        </div>
      </div>

      {/* News — só renderiza se houver notícias */}
      {featuredNews && (
        <>
          <SectionHead title="Notícias" more="Ver todas" onMore={() => onNav('news')} />
          <div style={{ padding: '0 16px' }}>
            <button onClick={() => onNav('article', featuredNews.id)} className="tap" style={{ width: '100%', textAlign: 'left', marginBottom: 14 }}>
              <div className="card-filled">
                <div className="ph-img" data-label={featuredNews.img} style={{ aspectRatio: '16/9' }} />
                <div style={{ padding: '16px 18px 18px' }}>
                  <div className="eyebrow eyebrow-acc">{featuredNews.tag} · {featuredNews.date}</div>
                  <h3 style={{ margin: '6px 0 0', fontSize: 17, lineHeight: 1.3, fontWeight: 700, letterSpacing: '-0.005em' }}>{featuredNews.title}</h3>
                </div>
              </div>
            </button>

            {extraNews.length > 0 && (
              <div className="d-news-grid">
                {extraNews.map(n => (
                  <button key={n.id} onClick={() => onNav('article', n.id)} className="tap" style={{ width: '100%', textAlign: 'left' }}>
                    <div className="card-filled" style={{ height: '100%' }}>
                      <div className="ph-img" data-label="" style={{ aspectRatio: '16/9' }} />
                      <div style={{ padding: '12px 14px 14px' }}>
                        <div className="eyebrow eyebrow-acc">{n.tag} · {n.date}</div>
                        <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3, marginTop: 5 }}>{n.title}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* CTA */}
      <section style={{ padding: '28px 16px 0' }}>
        <button onClick={() => onNav('subscription')} className="tap" style={{ width: '100%', textAlign: 'left' }}>
          <div style={{
            padding: '22px', borderRadius: 'var(--r-xl)',
            background: 'var(--primary-container)', color: 'var(--on-primary-container)',
            display: 'flex', alignItems: 'center', gap: 16,
          }}>
            <span style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--primary)', color: 'var(--on-primary)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              {I.ticket}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.8 }}>Inscrições abertas</div>
              <div style={{ fontSize: 17, fontWeight: 700, marginTop: 2 }}>Inscreva seu time</div>
            </div>
            <span style={{ width: 22, height: 22 }}>{I.chevR}</span>
          </div>
        </button>
      </section>
    </>
  );
}
