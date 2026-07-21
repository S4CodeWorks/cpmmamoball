'use client';

import type { Competition } from '@/lib/db';

// Barra de pills pra alternar entre competições — usada por qualquer tela que
// precise mostrar dados de "uma competição de cada vez" sem esconder as outras
// quando há mais de uma cadastrada (Tournaments, Home).
export function CompetitionPills({ competitions, selectedId, onSelect }: {
  competitions: Competition[]; selectedId: string | null; onSelect: (id: string) => void;
}) {
  return (
    <div style={{ padding: '0 16px 16px', display: 'flex', gap: 8, overflowX: 'auto' }} className="hide-scrollbar">
      {competitions.map(c => (
        <button key={c.id} onClick={() => onSelect(c.id)} className="tap"
          style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 8, height: 38, padding: '0 16px', borderRadius: 999, background: selectedId === c.id ? 'var(--secondary-container)' : 'transparent', color: selectedId === c.id ? 'var(--on-secondary-container)' : 'var(--on-surface)', border: '1px solid ' + (selectedId === c.id ? 'transparent' : 'var(--outline-variant)'), fontWeight: selectedId === c.id ? 700 : 500, fontSize: 13.5, whiteSpace: 'nowrap' }}>
          {c.status === 'em_andamento' && <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--primary)' }} />}
          {c.nome} {c.edicao}
        </button>
      ))}
    </div>
  );
}
