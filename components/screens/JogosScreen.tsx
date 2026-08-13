'use client';

import { useEffect, useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { I } from '@/components/icons';
import { TopAppBar } from '@/components/ui/TopAppBar';
import { MatchTile } from '@/components/ui/MatchTile';

import { SkeletonMatchCard } from '@/components/ui/Skeleton';

interface Props {
  onNav: (page: string, param?: string | number | null) => void;
  initialTab?: string | null;
}

export function JogosScreen({ onNav, initialTab }: Props) {
  const [tab, setTab] = useState(initialTab || 'hoje');
  useEffect(() => { if (initialTab) setTab(initialTab); }, [initialTab]);
  const { matches, loading } = useData();

  if (loading) {
    return (
      <>
        <TopAppBar large title="Jogos" subhead="Agenda da temporada" />
        <div className="tabs">
          {[{ id: 'hoje', label: 'Hoje' }, { id: 'proximos', label: 'Próximos' }, { id: 'resultados', label: 'Resultados' }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={tab === t.id ? 'is-active' : ''}>{t.label}</button>
          ))}
        </div>
        <div style={{ padding: '16px 16px 0' }}>
          <div className="d-match-grid">
            <SkeletonMatchCard />
            <SkeletonMatchCard />
            <SkeletonMatchCard />
            <SkeletonMatchCard />
          </div>
        </div>
      </>
    );
  }

  const today    = matches.filter(m => m.date.startsWith('Hoje') && m.status === 'agendado');
  const upcoming = matches.filter(m => m.status === 'agendado' && !m.date.startsWith('Hoje'));
  const results  = matches.filter(m => m.status === 'finalizado');

  const grouped = results.reduce<Record<number, typeof results>>((acc, m) => {
    (acc[m.rodada] = acc[m.rodada] || []).push(m);
    return acc;
  }, {});

  return (
    <>
      <TopAppBar large title="Jogos" subhead="Agenda da temporada" />

      <div className="tabs">
        {[{ id: 'hoje', label: 'Hoje' }, { id: 'proximos', label: 'Próximos' }, { id: 'resultados', label: 'Resultados' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={tab === t.id ? 'is-active' : ''}>{t.label}</button>
        ))}
      </div>

      <div style={{ padding: '16px 16px 0' }}>
        {tab === 'hoje' && (
          today.length > 0
            ? <div className="d-match-grid">{today.map(m => <MatchTile key={m.id} m={m} onClick={() => onNav('match', m.id)} />)}</div>
            : (
              <div className="empty">
                <div className="empty-icon">{I.calendar}</div>
                <h3 style={{ margin: '0 0 6px', fontSize: 16, color: 'var(--on-surface)', fontWeight: 700 }}>Sem jogos hoje</h3>
                <p style={{ margin: 0, fontSize: 14 }}>Confira os próximos na aba ao lado.</p>
              </div>
            )
        )}
        {tab === 'proximos' && (
          <div className="d-match-grid">{upcoming.map(m => <MatchTile key={m.id} m={m} onClick={() => onNav('match', m.id)} />)}</div>
        )}
        {tab === 'resultados' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {Object.entries(grouped).reverse().map(([rod, ms]) => (
              <div key={rod}>
                <div className="eyebrow" style={{ padding: '8px 4px 4px' }}>RODADA {rod}</div>
                <div className="d-match-grid" style={{ marginTop: 6 }}>
                  {ms.map(m => <MatchTile key={m.id} m={m} onClick={() => onNav('match', m.id)} showStage={false} />)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
