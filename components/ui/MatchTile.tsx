'use client';

import { useData } from '@/contexts/DataContext';
import { Crest } from './Crest';
import { StatusBadge } from './Primitives';
import type { Match, Club } from '@/lib/types';

interface TeamLineProps {
  club: Club;
  score: number | null;
  faded?: boolean;
  winner?: boolean;
}

function TeamLine({ club, score, faded, winner }: TeamLineProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <Crest id={club.id} size={32} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 15, fontWeight: winner ? 700 : 500,
          color: faded ? 'var(--on-surface-variant)' : 'var(--on-surface)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{club.nome}</div>
      </div>
      {score == null
        ? <span className="mono" style={{ fontSize: 14, color: 'var(--on-surface-variant)' }}>–</span>
        : <span className="mono tabular" style={{
            fontSize: 22, fontWeight: winner ? 700 : 500,
            color: faded ? 'var(--on-surface-variant)' : 'var(--on-surface)',
            minWidth: 24, textAlign: 'right',
          }}>{score}</span>
      }
    </div>
  );
}

interface MatchTileProps {
  m: Match;
  onClick?: () => void;
  showStage?: boolean;
}

export function MatchTile({ m, onClick, showStage = true }: MatchTileProps) {
  const { clubById } = useData();
  const home = clubById(m.home);
  const away = clubById(m.away);
  if (!home || !away) return null;
  const isSched = m.status === 'agendado';

  return (
    <button
      onClick={onClick}
      className="tap"
      style={{
        width: '100%', textAlign: 'left',
        background: 'var(--surface-c)',
        borderRadius: 'var(--r-xl)',
        padding: '14px 16px',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <StatusBadge m={m} compact />
        {showStage && (
          <span className="mono" style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>{m.stage}</span>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <TeamLine club={home} score={m.scoreH} faded={isSched} winner={!isSched && (m.scoreH ?? 0) > (m.scoreA ?? 0)} />
        <TeamLine club={away} score={m.scoreA} faded={isSched} winner={!isSched && (m.scoreA ?? 0) > (m.scoreH ?? 0)} />
      </div>
    </button>
  );
}
