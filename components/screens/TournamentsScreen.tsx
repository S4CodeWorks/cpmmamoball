'use client';

import { useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useData } from '@/contexts/DataContext';
import { I } from '@/components/icons';
import { TopAppBar } from '@/components/ui/TopAppBar';
import { SheetItem } from '@/components/ui/Sheet';
import { Crest } from '@/components/ui/Crest';
import { CompetitionPills } from '@/components/ui/CompetitionPills';
import { Skeleton, SkeletonList, SkeletonStandingsTable, SkeletonScorersList } from '@/components/ui/Skeleton';
import { shareLink } from '@/lib/share';
import { useIsDesktop } from '@/hooks/useIsDesktop';
import { fetchStandings, fetchScorers } from '@/lib/db';
import type { Standing, Scorer } from '@/lib/types';

interface Props {
  onNav: (page: string, param?: string | number | null, extra?: string | null) => void;
  initialTab?: string | null;
}

// Grid: # | Clube | J | V | E | D | SG | Pts (mobile)
// Desktop tem espaço de sobra — soma GP e GC, que no mobile ficam escondidos
const GRID = '28px 1fr 28px 28px 28px 28px 40px 40px';
const GRID_DESKTOP = '28px 1fr 28px 28px 28px 28px 36px 36px 40px 40px';

function Td({ children, c, right }: { children: React.ReactNode; c?: string; right?: boolean }) {
  return (
    <span className="mono tabular" style={{ textAlign: right ? 'right' : 'center', fontSize: 13, fontWeight: 500, color: c || 'var(--on-surface)' }}>
      {children}
    </span>
  );
}

function Legend({ c, t }: { c: string; t: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5, color: 'var(--on-surface-variant)' }}>
      <span style={{ width: 10, height: 10, borderRadius: 3, background: c }} />
      {t}
    </div>
  );
}

function Podium({ s, place, h, onClick, crown }: { s: Scorer; place: number; h: number; onClick: () => void; crown?: boolean }) {
  return (
    <button onClick={onClick} className="tap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center', width: '100%' }}>
      <div style={{ position: 'relative' }}>
        <Crest id={s.club} size={crown ? 56 : 44} radius={14} />
        {crown && <span style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', color: 'var(--primary)', fontSize: 18 }}>★</span>}
      </div>
      <div style={{ fontSize: 13, fontWeight: 700 }}>{s.nick}</div>
      {s.game_id && <div className="mono" style={{ fontSize: 10.5, color: 'var(--on-surface-variant)', marginTop: -4 }}>#{s.game_id}</div>}
      <div className="mono tabular" style={{ fontSize: crown ? 28 : 22, fontWeight: 800, color: crown ? 'var(--primary)' : 'var(--on-surface)', letterSpacing: '-0.02em' }}>{s.goals}</div>
      <div style={{ width: '100%', height: h, borderRadius: '12px 12px 0 0', background: crown ? 'var(--primary-container)' : 'var(--surface-c-high)', display: 'grid', placeItems: 'center', fontFamily: 'var(--mono)', fontSize: 16, fontWeight: 800, color: crown ? 'var(--on-primary-container)' : 'var(--on-surface-variant)' }}>{place}°</div>
    </button>
  );
}

// ── Classificação ─────────────────────────────────────────────────────────────
// Busca localmente se compId !== activeCompId (pill diferente da competição ativa)
function Classificacao({ onNav, compId, activeCompId }: { onNav: Props['onNav']; compId: string; activeCompId: string }) {
  const { standings: ctxStandings, clubById } = useData();
  const isDesktop = useIsDesktop();
  const grid = isDesktop ? GRID_DESKTOP : GRID;
  const [local, setLocal] = useState<Standing[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!compId || compId === activeCompId) { setLocal(null); return; }
    setLoading(true);
    fetchStandings(compId)
      .then(setLocal)
      .catch(() => setLocal([]))
      .finally(() => setLoading(false));
  }, [compId, activeCompId]);

  const standings = local ?? ctxStandings;

  if (loading) {
    return <div style={{ padding: '0 16px' }}><SkeletonStandingsTable rows={6} /></div>;
  }

  if (standings.length === 0) {
    return (
      <div className="empty" style={{ padding: '40px 24px' }}>
        <div className="empty-icon">{I.trophy}</div>
        <p style={{ margin: 0, fontSize: 14 }}>Nenhum time inscrito nesta competição ainda.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '0 16px' }}>
      <div className="card-filled">
        {/* Cabeçalho */}
        <div style={{ display: 'grid', gridTemplateColumns: grid, padding: '14px 16px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--on-surface-variant)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          <span>#</span><span>Clube</span>
          <span style={{ textAlign: 'center' }}>J</span>
          <span style={{ textAlign: 'center' }}>V</span>
          <span style={{ textAlign: 'center' }}>E</span>
          <span style={{ textAlign: 'center' }}>D</span>
          {isDesktop && <span style={{ textAlign: 'right' }}>GP</span>}
          {isDesktop && <span style={{ textAlign: 'right' }}>GC</span>}
          <span style={{ textAlign: 'right' }}>SG</span>
          <span style={{ textAlign: 'right' }}>Pts</span>
        </div>

        {/* Linhas */}
        {standings.map((row, i) => {
          const c = clubById(row.club);
          if (!c) return null;
          const inPlayoffs = i < 4;
          const inRel      = standings.length > 4 && i >= standings.length - 2;
          return (
            <button key={row.club} onClick={() => onNav('club', row.club)} className="tap"
              style={{ width: '100%', textAlign: 'left', display: 'grid', gridTemplateColumns: grid, alignItems: 'center', gap: 6, padding: '14px 16px', borderTop: '1px solid var(--outline-variant)', background: inPlayoffs ? 'color-mix(in srgb, var(--primary) 10%, transparent)' : 'transparent' }}>

              {/* Posição */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 3, height: 22, borderRadius: 2, flexShrink: 0, background: inPlayoffs ? 'var(--primary)' : inRel ? 'var(--error)' : 'transparent' }} />
                <span className="mono tabular" style={{ fontSize: 13, fontWeight: 700, color: inPlayoffs ? 'var(--primary)' : inRel ? 'var(--error)' : 'var(--on-surface)' }}>{i + 1}</span>
              </div>

              {/* Clube */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <Crest id={row.club} size={28} />
                <span style={{ fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.nome}</span>
              </div>

              <Td>{row.J}</Td>
              <Td c="var(--primary)">{row.V}</Td>
              <Td c="var(--on-surface-variant)">{row.E}</Td>
              <Td c="var(--error)">{row.D}</Td>
              {isDesktop && <Td right c="var(--on-surface-variant)">{row.GP}</Td>}
              {isDesktop && <Td right c="var(--on-surface-variant)">{row.GC}</Td>}
              <Td right c={row.SG > 0 ? 'var(--primary)' : row.SG < 0 ? 'var(--error)' : 'var(--on-surface-variant)'}>
                {row.SG > 0 ? '+' : ''}{row.SG}
              </Td>
              <span className="mono tabular" style={{ textAlign: 'right', fontSize: 18, fontWeight: 800 }}>{row.P}</span>
            </button>
          );
        })}
      </div>

      {/* Legenda */}
      <div style={{ marginTop: 16, padding: '14px 18px', background: 'var(--surface-c-low)', borderRadius: 'var(--r-lg)', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Legend c="var(--primary)" t="Top 4 · Playoffs" />
        <Legend c="var(--error)"   t="Últimos 2 · Rebaixamento" />
      </div>
    </div>
  );
}

// ── Artilharia ────────────────────────────────────────────────────────────────
function Artilharia({ onNav, compId, activeCompId }: { onNav: Props['onNav']; compId: string; activeCompId: string }) {
  const { scorers: ctxScorers, clubById } = useData();
  const [local, setLocal] = useState<Scorer[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!compId || compId === activeCompId) { setLocal(null); return; }
    setLoading(true);
    fetchScorers(compId)
      .then(setLocal)
      .catch(() => setLocal([]))
      .finally(() => setLoading(false));
  }, [compId, activeCompId]);

  const scorers = local ?? ctxScorers;

  if (loading) {
    return (
      <div style={{ padding: '0 16px' }}>
        <div className="card-filled" style={{ padding: '20px 16px 26px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', alignItems: 'end', gap: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <Skeleton width={44} height={44} circle /><Skeleton width={50} height={72} radius={12} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <Skeleton width={56} height={56} circle /><Skeleton width={50} height={96} radius={12} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <Skeleton width={44} height={44} circle /><Skeleton width={50} height={58} radius={12} />
            </div>
          </div>
        </div>
        <div style={{ marginTop: 12 }}><SkeletonList rows={3} /></div>
      </div>
    );
  }

  if (scorers.length === 0) {
    return (
      <div className="empty" style={{ padding: '40px 24px' }}>
        <div className="empty-icon">{I.trophy}</div>
        <p style={{ margin: 0, fontSize: 14 }}>Nenhum artilheiro cadastrado ainda.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '0 16px' }}>
      {/* Pódio */}
      <div className="card-filled" style={{ padding: '20px 16px 26px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', alignItems: 'end', gap: 10 }}>
          {scorers[1] && <Podium s={scorers[1]} place={2} h={72} onClick={() => onNav('club', scorers[1].club)} />}
          {scorers[0] && <Podium s={scorers[0]} place={1} h={96} onClick={() => onNav('club', scorers[0].club)} crown />}
          {scorers[2] && <Podium s={scorers[2]} place={3} h={58} onClick={() => onNav('club', scorers[2].club)} />}
        </div>
      </div>

      {/* Restante da lista (4º em diante) */}
      {scorers.length > 3 && (
        <div className="card-filled" style={{ marginTop: 12 }}>
          {scorers.slice(3).map((s, i) => {
            const c = clubById(s.club);
            if (!c) return null;
            return (
              <button key={s.nick} onClick={() => onNav('club', s.club)} className="tap"
                style={{ width: '100%', textAlign: 'left', display: 'grid', gridTemplateColumns: '24px 1fr 40px', alignItems: 'center', gap: 12, padding: '14px 16px', borderTop: i ? '1px solid var(--outline-variant)' : 'none' }}>
                <span className="mono tabular" style={{ fontSize: 13, fontWeight: 700, color: 'var(--on-surface-variant)' }}>{i + 4}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                  <Crest id={s.club} size={28} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 600 }}>{s.nick}</div>
                    <div style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>
                      {s.game_id && <span className="mono">#{s.game_id} · </span>}{c.nome} · {s.assists} assist.
                    </div>
                  </div>
                </div>
                <span className="mono tabular" style={{ fontSize: 20, fontWeight: 700, textAlign: 'right', letterSpacing: '-0.02em' }}>{s.goals}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── TournamentsScreen ─────────────────────────────────────────────────────────
export function TournamentsScreen({ onNav, initialTab }: Props) {
  const [tab, setTab] = useState(initialTab || 'classificacao');
  const { notifs, toggleNotif, favComps, toggleFavComp, showToast } = useApp();
  const { competitions, activeComp } = useData();
  const [comp, setComp] = useState<string | null>(null);

  const selectedId   = comp ?? activeComp?.id ?? competitions[0]?.id ?? null;
  const activeCompId = activeComp?.id ?? '';
  const isDesktop    = useIsDesktop();

  useEffect(() => { if (initialTab) setTab(initialTab); }, [initialTab]);

  const notifKey = 'comp:' + selectedId;
  const isNotif  = notifs.has(notifKey);
  const isFavComp = favComps.has(selectedId ?? '');

  const menu = (close: () => void) => (
    <>
      <SheetItem icon={isNotif ? 'bell' : 'bellOff'} label={isNotif ? 'Notificações ativadas' : 'Receber notificações'}
        meta="Avisamos sobre novos jogos e resultados" on={isNotif}
        onClick={() => { toggleNotif(notifKey); showToast(isNotif ? 'Notificações desativadas' : 'Notificações ativadas'); }} />
      <SheetItem icon={isFavComp ? 'starFilled' : 'star'} label={isFavComp ? 'Competição favoritada' : 'Favoritar competição'}
        meta="Prioriza essa competição na sua Home" on={isFavComp}
        onClick={() => { if (selectedId) { toggleFavComp(selectedId); showToast(isFavComp ? 'Removida dos favoritos' : 'Adicionada aos favoritos'); } }} />
      <SheetItem icon="share" label="Compartilhar competição" onClick={async () => {
        close();
        const sel = competitions.find(c => c.id === selectedId);
        const r = await shareLink({ title: sel ? `${sel.nome} ${sel.edicao}` : 'CPM MamoBall', text: 'CPM MamoBall' });
        if (r === 'copied') showToast('Link copiado');
        else if (r === 'failed') showToast('Não foi possível compartilhar');
      }} />
      <SheetItem icon="rules" label="Regulamento" onClick={() => { close(); onNav('rules'); }} />
    </>
  );

  // Props compartilhadas pelos painéis — repassam compId para busca local quando necessário
  const panelProps = { onNav, compId: selectedId ?? '', activeCompId };

  return (
    <>
      <TopAppBar large title="Competições" menu={menu} />

      {competitions.length === 0 && (
        <div className="empty" style={{ marginTop: 32 }}>
          <div className="empty-icon">{I.trophy}</div>
          <p style={{ margin: 0, fontSize: 14 }}>Nenhuma competição cadastrada ainda.</p>
        </div>
      )}

      {/* Pills de competição */}
      <CompetitionPills competitions={competitions} selectedId={selectedId} onSelect={setComp} favIds={favComps} onToggleFav={toggleFavComp} />

      {/* Barra de progresso da competição selecionada */}
      {(() => {
        const sel = competitions.find(c => c.id === selectedId);
        if (!sel) return null;
        const indeterminate = sel.total_rodadas === 0;
        const pct = indeterminate ? null : sel.total_rodadas > 0
          ? Math.round((sel.rodada_atual / sel.total_rodadas) * 100) : 0;
        return (
          <div style={{ padding: '0 16px 4px' }}>
            <div style={{ padding: '14px 18px', borderRadius: 'var(--r-lg)', background: 'var(--surface-c)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--on-surface-variant)', marginBottom: indeterminate ? 0 : 8 }}>
                <span style={{ fontWeight: 600, color: 'var(--on-surface)' }}>
                  {indeterminate ? `Rodada ${sel.rodada_atual}` : `Rodada ${sel.rodada_atual} de ${sel.total_rodadas}`}
                </span>
                {pct !== null && <span className="mono">{pct}%</span>}
              </div>
              {!indeterminate && (
                <div style={{ height: 6, background: 'var(--surface-c-high)', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: 'var(--primary)', borderRadius: 999 }} />
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Desktop: painéis lado a lado. Mobile: abas */}
      {selectedId && (isDesktop ? (
        <div className="d-split" style={{ paddingTop: 16 }}>
          <div>
            <div style={{ padding: '8px 16px 12px', fontWeight: 700, fontSize: 15, color: 'var(--on-surface)' }}>Tabela de Classificação</div>
            <Classificacao {...panelProps} />
          </div>
          <div>
            <div style={{ padding: '8px 16px 12px', fontWeight: 700, fontSize: 15, color: 'var(--on-surface)' }}>Artilharia</div>
            <Artilharia {...panelProps} />
          </div>
        </div>
      ) : (
        <>
          <div className="tabs" style={{ marginTop: 4 }}>
            {[{ id: 'classificacao', label: 'Tabela' }, { id: 'artilharia', label: 'Artilharia' }].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} className={tab === t.id ? 'is-active' : ''}>{t.label}</button>
            ))}
          </div>
          <div style={{ paddingTop: 14 }}>
            {tab === 'classificacao' && <Classificacao {...panelProps} />}
            {tab === 'artilharia'    && <Artilharia    {...panelProps} />}
          </div>
        </>
      ))}
    </>
  );
}
