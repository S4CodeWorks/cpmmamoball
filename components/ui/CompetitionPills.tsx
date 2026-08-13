'use client';

import { I } from '@/components/icons';
import type { Competition } from '@/lib/db';

// Barra de pills pra alternar entre competições — usada por qualquer tela que
// precise mostrar dados de "uma competição de cada vez" sem esconder as outras
// quando há mais de uma cadastrada (Tournaments, Home). A estrela opcional
// favorita a competição pra alimentar o feed personalizado da Home.
export function CompetitionPills({ competitions, selectedId, onSelect, favIds, onToggleFav }: {
  competitions: Competition[]; selectedId: string | null; onSelect: (id: string) => void;
  favIds?: Set<string>; onToggleFav?: (id: string) => void;
}) {
  return (
    <div style={{ padding: '0 16px 16px', display: 'flex', gap: 8, overflowX: 'auto' }} className="hide-scrollbar">
      {competitions.map(c => {
        const isFav = favIds?.has(c.id) ?? false;
        return (
          <button key={c.id} onClick={() => onSelect(c.id)} className="tap"
            style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 8, height: 38, padding: '0 12px 0 16px', borderRadius: 999, background: selectedId === c.id ? 'var(--secondary-container)' : 'transparent', color: selectedId === c.id ? 'var(--on-secondary-container)' : 'var(--on-surface)', border: '1px solid ' + (selectedId === c.id ? 'transparent' : 'var(--outline-variant)'), fontWeight: selectedId === c.id ? 700 : 500, fontSize: 13.5, whiteSpace: 'nowrap' }}>
            {c.status === 'em_andamento' && <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--primary)' }} />}
            {c.nome} {c.edicao}
            {onToggleFav && (
              <span
                role="button"
                aria-label={isFav ? 'Remover dos favoritos' : 'Favoritar competição'}
                onClick={e => { e.stopPropagation(); onToggleFav(c.id); }}
                style={{ width: 16, height: 16, display: 'grid', placeItems: 'center', color: isFav ? 'var(--primary)' : 'var(--on-surface-variant)' }}
              >
                {isFav ? I.starFilled : I.star}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
