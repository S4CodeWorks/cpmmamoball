'use client';

import { useApp } from '@/contexts/AppContext';
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
