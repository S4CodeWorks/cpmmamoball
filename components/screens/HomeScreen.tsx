'use client';

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
import { useIsDesktop } from '@/hooks/useIsDesktop';
import type { Match, Club } from '@/lib/types';

interface Props { onNav: (page: string, param?: string | number | null, extra?: string | null) => void; }

function SideHero({ club, score, right }: { club: Club; score: number | null; right?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: right ? 'flex-end' : 'flex-start', gap: 10 }}>
      <Crest id={club.id} size={52} radius={14} />
      <div style={{ textAlign: right ? 'right' : 'left' }}>
        <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.1 }}>{club.tag}</div>
      </div>
      {score == null
        ? <span className="mono" style={{ fontSize: 28, color: 'var(--on-surface-variant)', fontWeight: 600, letterSpacing: '-0.04em', lineHeight: 1, marginTop: 2 }}>—</span>
        : <span className="mono tabular" style={{ fontSize: 44, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1, marginTop: 2 }}>{score}</span>
      }
    </div>
  );
}

function FeaturedMatch({ m, onClick }: { m: Match; onClick: () => void }) {
  const { clubById } = useData();
  const { resolvedTheme } = useApp();
  const home = clubById(m.home), away = clubById(m.away);
  if (!home || !away) return null;
  return (
    <button onClick={onClick} className="tap" style={{ width: '100%', textAlign: 'left' }}>
      <div style={{
        position: 'relative', borderRadius: 'var(--r-2xl)', padding: '20px 22px',
        background: 'var(--surface-c)', overflow: 'hidden',
      }}>
        <ColorMesh colors={[home.color, home.color2, away.color]} opacity={resolvedTheme === 'dark' ? 0.28 : 0.42} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <span className="chip chip-acc">{m.date}</span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>{m.stage}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 10 }}>
            <SideHero club={home} score={m.scoreH} />
            <div style={{ textAlign: 'center', color: 'var(--on-surface-variant)' }}>
              <div className="mono" style={{ fontSize: 13 }}>vs</div>
            </div>
            <SideHero club={away} score={m.scoreA} right />
          </div>
        </div>
      </div>
    </button>
  );
}

function StandingsMini({ onNav }: { onNav: Props['onNav'] }) {
  const { standings, clubById } = useData();
  const isDesktop = useIsDesktop();
  // Desktop tem mais espaço vertical na coluna lateral — mostra mais linhas da tabela
  const top5 = standings.slice(0, isDesktop ? 8 : 5);
  return (
    <div style={{ padding: '0 16px' }}>
      <div className="card-filled">
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
  const { showToast, theme, setTheme, resolvedTheme } = useApp();
  const { isLoggedIn, profile, user, signOut } = useAuth();
  const { matches, standings: _standings, news, clubById } = useData();
  const isDesktop = useIsDesktop();
  const greeting = isLoggedIn
    ? `Olá, ${profile?.nick || user?.email?.split('@')[0] || 'jogador'}`
    : 'Bem-vindo';
  // Desktop tem mais espaço na coluna esquerda — mostra mais partidas
  const listSize = isDesktop ? 5 : 3;
  const upcoming = matches.filter(m => m.status === 'agendado').slice(0, listSize);
  const recent = matches.filter(m => m.status === 'finalizado').slice(0, listSize);
  const featuredNews = news[0];
  const extraNews = news.slice(1, 3);

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

  if (!featuredNews && upcoming.length === 0 && recent.length === 0) {
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

      {/* Featured match — full width */}
      <section style={{ padding: '8px 16px 0' }}>
        {upcoming[0] && <FeaturedMatch m={upcoming[0]} onClick={() => onNav('match', upcoming[0].id)} />}
      </section>

      {/* Desktop split: left = matches, right = standings */}
      <div className="d-split">
        {/* Left column: próximas + resultados */}
        <div>
          <SectionHead title="Próximas partidas" more="Ver tudo" onMore={() => onNav('jogos')} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 16px' }}>
            {upcoming.map(m => <MatchTile key={m.id} m={m} onClick={() => onNav('match', m.id)} />)}
          </div>

          <SectionHead title="Últimos resultados" more="Histórico" onMore={() => onNav('jogos', null, 'resultados')} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 16px' }}>
            {recent.map(m => <MatchTile key={m.id} m={m} onClick={() => onNav('match', m.id)} />)}
          </div>
        </div>

        {/* Right column: classificação */}
        <div>
          <SectionHead title="Classificação" more="Tabela completa" onMore={() => onNav('tournaments')} />
          <StandingsMini onNav={onNav} />
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
