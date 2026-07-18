'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useData } from '@/contexts/DataContext';
import { I } from '@/components/icons';
import { TopAppBar } from '@/components/ui/TopAppBar';
import { SheetItem } from '@/components/ui/Sheet';
import { FormDots } from '@/components/ui/Primitives';
import { MatchTile } from '@/components/ui/MatchTile';
import { Crest } from '@/components/ui/Crest';
import { useIsDesktop } from '@/hooks/useIsDesktop';
import { fetchPlayers } from '@/lib/db';
import { shareLink } from '@/lib/share';
import { pathForPage } from '@/lib/routes';
import type { Player } from '@/lib/types';

interface Props {
  onNav: (page: string, param?: string | number | null) => void;
  onBack?: () => void;
  clubId?: string;
}

function StatBlock({ n, l, big }: { n: string | number; l: string; big?: boolean }) {
  return (
    <div style={{ padding: '4px 10px', textAlign: 'center' }}>
      <div className="mono tabular" style={{ fontSize: big ? 22 : 18, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1, color: big ? 'var(--primary)' : 'var(--on-surface)' }}>{n}</div>
      <div style={{ fontSize: 11, color: 'var(--on-surface-variant)', marginTop: 6 }}>{l}</div>
    </div>
  );
}

function Info({ k, v, last }: { k: string; v: React.ReactNode; last?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: last ? 'none' : '1px solid var(--outline-variant)', fontSize: 13.5 }}>
      <span style={{ color: 'var(--on-surface-variant)' }}>{k}</span>
      <span style={{ fontWeight: 600 }}>{v}</span>
    </div>
  );
}

export function ClubScreen({ onNav, onBack, clubId }: Props) {
  const { clubs, standings, matches, scorers, activeComp, clubById } = useData();
  const c = clubById(clubId || '') || clubs[0];
  if (!c) return <div className="empty"><p>Clube não encontrado.</p></div>;

  const row = standings.find(r => r.club === c.id);
  const pos = standings.findIndex(r => r.club === c.id) + 1;
  const clubMatches = matches.filter(m => m.home === c.id || m.away === c.id);
  const nextM = clubMatches.find(m => m.status === 'agendado');
  const recent = clubMatches.filter(m => m.status === 'finalizado');
  const [tab, setTab] = useState('visao');
  const { favClubs, toggleFav, showToast } = useApp();
  const isFav = favClubs.has(c.id);
  const isDesktop = useIsDesktop();

  // ── Jogadores reais ──────────────────────────────────────────────────────
  const [players, setPlayers] = useState<Player[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoadingPlayers(true);
    fetchPlayers(c.id)
      .then(data => { if (!cancelled) setPlayers(data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoadingPlayers(false); });
    return () => { cancelled = true; };
  }, [c.id]);

  // Artilheiros indexados por nick
  const scorerMap = Object.fromEntries(scorers.map(s => [s.nick, s]));
  const captain = players.find(p => p.is_captain);

  const menu = (close: () => void) => (
    <>
      <SheetItem icon={isFav ? 'heartFilled' : 'heart'} label={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        meta="Receba notificações dos jogos do clube" on={isFav}
        onClick={() => { toggleFav(c.id); showToast(isFav ? `${c.tag} removido dos favoritos` : `${c.tag} adicionado aos favoritos`); }} />
      <SheetItem icon="share" label="Compartilhar" onClick={async () => {
        close();
        const r = await shareLink({ title: c.nome, text: `${c.nome} (${c.tag}) · CPM MamoBall`, url: `${window.location.origin}${pathForPage('club', c.id)}` });
        if (r === 'copied') showToast('Link copiado');
        else if (r === 'failed') showToast('Não foi possível compartilhar');
      }} />
      <SheetItem icon="bell" label="Notificações do clube" meta="Avisar sobre novos jogos" on={isFav}
        onClick={() => { toggleFav(c.id); }} />
    </>
  );

  /* ── Painel: Visão Geral ─────────────────────────────────────────────────── */

  const VisaoPanel = (
    <div style={{ padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="card-filled" style={{ padding: '18px 20px' }}>
        <div className="eyebrow eyebrow-acc" style={{ marginBottom: 12 }}>Forma recente</div>
        <div style={{ display: 'flex', gap: 6 }}>
          <FormDots form={row?.form ?? []} />
        </div>
        {row && (
          <p style={{ margin: '14px 0 0', fontSize: 14, color: 'var(--on-surface-variant)', lineHeight: 1.5 }}>
            {row.V} vitória{row.V !== 1 ? 's' : ''}, {row.E} empate{row.E !== 1 ? 's' : ''} e {row.D} derrota{row.D !== 1 ? 's' : ''} em {row.J} jogo{row.J !== 1 ? 's' : ''}.
          </p>
        )}
      </div>
      {nextM && (
        <div>
          <div className="eyebrow" style={{ padding: '8px 4px 10px' }}>PRÓXIMO JOGO</div>
          <MatchTile m={nextM} onClick={() => onNav('match', nextM.id)} showStage />
        </div>
      )}
      <div>
        <div className="eyebrow" style={{ padding: '8px 4px 10px' }}>ÚLTIMOS RESULTADOS</div>
        <div className="card-filled">
          {recent.slice(0, 3).length === 0
            ? <div style={{ padding: '16px', fontSize: 13, color: 'var(--on-surface-variant)' }}>Nenhum resultado ainda.</div>
            : recent.slice(0, 3).map((m, i) => (
              <button key={m.id} onClick={() => onNav('match', m.id)} className="tap"
                style={{ width: '100%', textAlign: 'left', display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 10, padding: '14px 16px', borderTop: i ? '1px solid var(--outline-variant)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: 13, fontWeight: (m.scoreH ?? 0) > (m.scoreA ?? 0) ? 700 : 500 }}>{clubById(m.home)?.tag}</span>
                  <Crest id={m.home} size={24} />
                </div>
                <span className="mono tabular" style={{ fontSize: 15, fontWeight: 700, padding: '4px 10px', background: 'var(--surface-c-high)', borderRadius: 8, whiteSpace: 'nowrap' }}>{m.scoreH}–{m.scoreA}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Crest id={m.away} size={24} />
                  <span style={{ fontSize: 13, fontWeight: (m.scoreA ?? 0) > (m.scoreH ?? 0) ? 700 : 500 }}>{clubById(m.away)?.tag}</span>
                </div>
              </button>
            ))
          }
        </div>
      </div>
    </div>
  );

  /* ── Painel: Elenco ──────────────────────────────────────────────────────── */

  const ElencoPanel = (
    <div style={{ padding: '0 16px' }}>
      <div className="card-filled">
        {loadingPlayers ? (
          <div style={{ padding: '20px 16px', fontSize: 13, color: 'var(--on-surface-variant)' }}>Carregando elenco...</div>
        ) : players.length === 0 ? (
          <div style={{ padding: '20px 16px', fontSize: 13, color: 'var(--on-surface-variant)' }}>Nenhum jogador cadastrado.</div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 40px 40px', padding: '14px 16px', fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--on-surface-variant)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              <span>JOGADOR</span>
              <span style={{ textAlign: 'center' }}>G</span>
              <span style={{ textAlign: 'right' }}>A</span>
            </div>
            {players.map(p => {
              const stats = scorerMap[p.nick];
              const goals   = stats?.goals   ?? 0;
              const assists = stats?.assists ?? 0;
              return (
                <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '1fr 40px 40px', alignItems: 'center', gap: 10, padding: '12px 16px', borderTop: '1px solid var(--outline-variant)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <span style={{ width: 32, height: 32, borderRadius: 9, background: p.is_captain ? 'var(--primary-container)' : 'var(--surface-c-high)', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 800, color: p.is_captain ? 'var(--on-primary-container)' : 'var(--on-surface-variant)', flexShrink: 0 }}>
                      {p.is_captain ? 'C' : p.nick[0]?.toUpperCase()}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}>
                        {p.nick}
                        {p.is_captain && (
                          <span style={{ fontSize: 10, background: 'var(--primary-container)', color: 'var(--on-primary-container)', padding: '1px 7px', borderRadius: 999, fontWeight: 700, letterSpacing: '0.03em', flexShrink: 0 }}>CAP</span>
                        )}
                      </div>
                      <div className="mono" style={{ fontSize: 11.5, color: 'var(--on-surface-variant)', marginTop: 1 }}>
                        #{p.game_id}
                      </div>
                    </div>
                  </div>
                  <span className="mono tabular" style={{ textAlign: 'center', fontSize: 14, fontWeight: 600 }}>{goals}</span>
                  <span className="mono tabular" style={{ textAlign: 'right', fontSize: 13, color: 'var(--on-surface-variant)' }}>{assists}</span>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );

  /* ── Painel: Sobre ───────────────────────────────────────────────────────── */

  const SobrePanel = (
    <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="card-filled" style={{ padding: '6px 18px' }}>
        {captain && <Info k="Capitão" v={captain.nick} />}
        <Info k="Jogadores" v={loadingPlayers ? '—' : players.length} />
        <Info k="Cores" v={
          <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
            <span style={{ width: 18, height: 18, borderRadius: 4, background: c.color }} />
            <span style={{ width: 18, height: 18, borderRadius: 4, background: c.color2, border: '1px solid var(--outline-variant)' }} />
          </span>
        } last={!captain} />
      </div>
      {activeComp && (
        <div>
          <div className="eyebrow" style={{ padding: '8px 4px 10px' }}>COMPETIÇÃO ATUAL</div>
          <div className="card-filled" style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{activeComp.nome}</div>
            <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginTop: 4 }}>{activeComp.edicao}</div>
          </div>
        </div>
      )}
    </div>
  );

  /* ── Painel: Jogos ───────────────────────────────────────────────────────── */

  const JogosPanel = (
    <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {clubMatches.length === 0
        ? <div style={{ padding: '20px 0', fontSize: 13, color: 'var(--on-surface-variant)' }}>Nenhuma partida registrada.</div>
        : clubMatches.map(m => <MatchTile key={m.id} m={m} onClick={() => onNav('match', m.id)} showStage />)
      }
    </div>
  );

  const compName = activeComp?.nome ?? 'Liga';

  return (
    <>
      {/* Sticky club hero */}
      <div style={{ position: 'sticky', top: 0, zIndex: 30, background: `radial-gradient(560px 260px at 12% -10%, ${c.color}59 0%, transparent 60%), radial-gradient(480px 240px at 95% 10%, ${c.color2}40 0%, transparent 55%), linear-gradient(180deg, ${c.color}26 0%, transparent 75%), var(--surface)`, borderBottom: '1px solid var(--outline-variant)' }}>
        <TopAppBar showBack onBack={onBack} title=""
          rightExtras={
            <button className={`icon-btn${isFav ? ' is-on' : ''}`}
              onClick={() => { toggleFav(c.id); showToast(isFav ? `${c.tag} removido dos favoritos` : `${c.tag} adicionado aos favoritos`); }}
              aria-label="Favoritar">
              {isFav ? I.heartFilled : I.heart}
            </button>
          }
          menu={menu}
        />
        <div style={{ padding: '0 20px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <Crest id={c.id} size={80} radius={22} />
          <div style={{ minWidth: 0, flex: 1 }}>
            {pos > 0 && <div className="eyebrow eyebrow-acc">#{pos} · {compName}</div>}
            <h1 style={{ margin: '6px 0 6px', fontSize: 26, lineHeight: 1.1, fontWeight: 800, letterSpacing: '-0.02em', wordBreak: 'break-word' }}>{c.nome}</h1>
            <div className="mono" style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>{c.tag}</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', padding: '12px 8px 14px', background: 'var(--surface-c-low)', borderTop: '1px solid var(--outline-variant)' }}>
          <StatBlock n={row?.P ?? 0} l="Pontos" big />
          <StatBlock n={row?.J ?? 0} l="Jogos" />
          <StatBlock n={row?.V ?? 0} l="Vitórias" />
          <StatBlock n={(row?.SG ?? 0) > 0 ? '+' + (row?.SG ?? 0) : (row?.SG ?? 0)} l="Saldo" />
        </div>
      </div>

      {/* Desktop: painéis lado a lado + jogos abaixo */}
      {isDesktop ? (
        <>
          <div className="d-split" style={{ paddingTop: 8 }}>
            {/* Left: Visão + Sobre */}
            <div>
              <div style={{ padding: '8px 16px 4px', fontWeight: 700, fontSize: 15, color: 'var(--on-surface)' }}>Visão Geral</div>
              {VisaoPanel}
              <div style={{ padding: '24px 16px 4px', fontWeight: 700, fontSize: 15, color: 'var(--on-surface)' }}>Sobre</div>
              {SobrePanel}
            </div>
            {/* Right: Elenco */}
            <div>
              <div style={{ padding: '24px 16px 4px', fontWeight: 700, fontSize: 15, color: 'var(--on-surface)' }}>Elenco</div>
              {ElencoPanel}
            </div>
          </div>
          {/* Jogos — full width below */}
          <div style={{ padding: '28px 0 0' }}>
            <div style={{ padding: '0 16px 12px', fontWeight: 700, fontSize: 15, color: 'var(--on-surface)' }}>Todos os Jogos</div>
            {JogosPanel}
          </div>
        </>
      ) : (
        /* Mobile: 4 tabs */
        <>
          <div className="tabs">
            {[{ id: 'visao', label: 'Visão' }, { id: 'elenco', label: 'Elenco' }, { id: 'jogos', label: 'Jogos' }, { id: 'sobre', label: 'Sobre' }].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} className={tab === t.id ? 'is-active' : ''}>{t.label}</button>
            ))}
          </div>

          {tab === 'visao'  && VisaoPanel}
          {tab === 'elenco' && ElencoPanel}
          {tab === 'jogos'  && JogosPanel}
          {tab === 'sobre'  && SobrePanel}
        </>
      )}
    </>
  );
}
