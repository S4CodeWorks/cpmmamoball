'use client';

import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Select } from './Select';
import type { Match, FormResult } from '@/lib/types';

// Label de campo de formulário — marca obrigatoriedade com um ponto colorido
// em vez de asterisco. Ausência do ponto = campo opcional.
export function FieldLabel({ children, required, style }: {
  children: React.ReactNode; required?: boolean; style?: React.CSSProperties;
}) {
  return (
    <label className="field-label" style={style}>
      {required && <span className="field-req-dot" aria-hidden="true" />}
      {children}
    </label>
  );
}

export function FormDots({ form }: { form: FormResult[] }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {form.map((r, i) => (
        <span key={i} className={`formdot ${r}`}>{r}</span>
      ))}
    </div>
  );
}

export function StatusBadge({ m, compact }: { m: Match; compact?: boolean }) {
  const style = compact ? { height: 22, padding: '0 8px', fontSize: 11 } : {};
  if (m.status === 'agendado') return <span className="chip chip-warn" style={style}>{m.date}</span>;
  return <span className="chip" style={style}>Encerrado</span>;
}

export function SectionHead({ title, more, onMore }: {
  title: string;
  more?: string;
  onMore?: () => void;
}) {
  return (
    <div className="section-head">
      <h2>{title}</h2>
      {more && <button className="more" onClick={onMore}>{more}</button>}
    </div>
  );
}

// ── usePagination — hook genérico de paginação (fatia um array já filtrado) ──
export function usePagination<T>(items: T[], initialPageSize = 10) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const pageItems = items.slice(start, start + pageSize);

  // Volta pra página 1 quando o total de itens encolhe abaixo da página atual
  // (busca/filtro mudou) — evita ficar preso numa página vazia. Ajuste de
  // state durante o render (padrão oficial do React), não precisa de efeito.
  if (safePage !== page) setPage(safePage);

  return {
    page: safePage, setPage, pageSize, setPageSize: (n: number) => { setPageSize(n); setPage(1); },
    totalPages, pageItems, total: items.length,
    rangeLabel: items.length === 0 ? '0 de 0' : `${start + 1}–${Math.min(start + pageSize, items.length)} de ${items.length}`,
  };
}

// ── PageBar — controles de paginação: setas, números com reticências, tamanho de página ──
export function PageBar({ page, totalPages, onPage, pageSize, onPageSize, rangeLabel, pageSizeOptions }: {
  page: number; totalPages: number; onPage: (p: number) => void;
  pageSize?: number; onPageSize?: (n: number) => void; rangeLabel?: string;
  pageSizeOptions?: number[];
}) {
  if (totalPages <= 1 && !onPageSize) return null;

  // Monta a lista de números a mostrar, com reticências pra não lotar a tela
  // em listas grandes: sempre primeira, última, atual e vizinhas.
  const nums: (number | '…')[] = [];
  const add = (n: number) => { if (!nums.includes(n)) nums.push(n); };
  add(1);
  for (let n = page - 1; n <= page + 1; n++) if (n > 1 && n < totalPages) add(n);
  add(totalPages);
  const withDots: (number | '…')[] = [];
  let prev = 0;
  for (const n of nums.sort((a, b) => (a as number) - (b as number))) {
    if (typeof n === 'number' && prev && n - prev > 1) withDots.push('…');
    withDots.push(n);
    if (typeof n === 'number') prev = n;
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', padding: '14px 2px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5, color: 'var(--on-surface-variant)' }}>
        {rangeLabel && <span>{rangeLabel}</span>}
        {onPageSize && pageSize && (
          <Select title="Itens por página" value={String(pageSize)} onChange={v => onPageSize(Number(v))}
            style={{ height: 30, padding: '0 8px', fontSize: 12.5, width: 'auto' }}
            options={(pageSizeOptions ?? [10, 25, 50, 100]).map(n => ({ value: String(n), label: `${n}/página` }))} />
        )}
      </div>
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button onClick={() => onPage(page - 1)} disabled={page === 1}
            style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: 'var(--surface-c-high)', color: 'var(--on-surface-variant)', cursor: page === 1 ? 'default' : 'pointer', opacity: page === 1 ? 0.4 : 1 }}>‹</button>
          {withDots.map((n, i) => n === '…' ? (
            <span key={`d${i}`} style={{ width: 24, textAlign: 'center', fontSize: 12.5, color: 'var(--on-surface-variant)' }}>…</span>
          ) : (
            <button key={n} onClick={() => onPage(n)}
              style={{ minWidth: 30, height: 30, borderRadius: 8, border: 'none', padding: '0 6px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', background: n === page ? 'var(--primary)' : 'transparent', color: n === page ? 'var(--on-primary)' : 'var(--on-surface-variant)' }}>
              {n}
            </button>
          ))}
          <button onClick={() => onPage(page + 1)} disabled={page === totalPages}
            style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: 'var(--surface-c-high)', color: 'var(--on-surface-variant)', cursor: page === totalPages ? 'default' : 'pointer', opacity: page === totalPages ? 0.4 : 1 }}>›</button>
        </div>
      )}
    </div>
  );
}

export function Toast() {
  const { toast } = useApp();
  if (!toast) return null;
  return (
    <div style={{
      position: 'absolute',
      bottom: 96, left: 16, right: 16,
      zIndex: 70,
      background: 'var(--surface-c-highest)',
      color: 'var(--on-surface)',
      padding: '14px 18px',
      borderRadius: 12,
      fontSize: 14, fontWeight: 500,
      boxShadow: 'var(--shadow-md)',
      animation: 'slideUp .2s ease',
    }}>{toast}</div>
  );
}
