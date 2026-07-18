'use client';

import { useState } from 'react';
import { Sheet } from './Sheet';
import { I } from '@/components/icons';

export interface SelectOption {
  value: string;
  label: string;
}

// Select próprio da plataforma — substitui o <select> nativo do navegador.
// Abre a mesma folha (Sheet) usada em outros menus do app, mantendo o visual
// consistente em vez do dropdown genérico do sistema operacional.
export function Select({ value, onChange, options, placeholder = 'Selecione', title, className, style, disabled }: {
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
  placeholder?: string;
  title?: string;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);

  return (
    <>
      <button type="button" disabled={disabled} onClick={() => setOpen(true)}
        className={className ?? 'input'}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
          textAlign: 'left', cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.6 : 1,
          ...style,
        }}>
        <span style={{
          color: selected ? 'var(--on-surface)' : 'var(--on-surface-variant)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {selected ? selected.label : placeholder}
        </span>
        <span style={{ width: 16, height: 16, color: 'var(--on-surface-variant)', flexShrink: 0, transform: open ? 'rotate(180deg)' : undefined, transition: 'transform .15s' }}>
          {I.chevD}
        </span>
      </button>

      <Sheet open={open} onClose={() => setOpen(false)}>
        {title && <div style={{ padding: '4px 20px 14px', fontSize: 16, fontWeight: 700 }}>{title}</div>}
        <div style={{ paddingBottom: 8, maxHeight: '60dvh', overflowY: 'auto' }}>
          {options.map((o, i) => (
            <button key={o.value} onClick={() => { onChange(o.value); setOpen(false); }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
                padding: '14px 20px', border: 'none', borderTop: i > 0 || title ? '1px solid var(--outline-variant)' : 'none',
                background: o.value === value ? 'color-mix(in srgb, var(--primary) 10%, transparent)' : 'transparent',
                color: 'var(--on-surface)', fontSize: 14.5, fontWeight: o.value === value ? 700 : 500,
                textAlign: 'left', cursor: 'pointer',
              }}>
              {o.label}
              {o.value === value && <span style={{ width: 16, height: 16, color: 'var(--primary)', flexShrink: 0 }}>{I.check}</span>}
            </button>
          ))}
        </div>
      </Sheet>
    </>
  );
}
