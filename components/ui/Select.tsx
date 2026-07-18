'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Sheet } from './Sheet';
import { I } from '@/components/icons';
import { useIsDesktop } from '@/hooks/useIsDesktop';

export interface SelectOption {
  value: string;
  label: string;
}

// Select próprio da plataforma — substitui o <select> nativo do navegador.
// Mobile: abre a mesma folha (Sheet) usada em outros menus do app.
// Desktop: menu ancorado embaixo do campo, renderizado num portal (document.body)
// pra nunca ser cortado por um ancestral com overflow:hidden (cards, modais...).
// Fecha ao clicar fora, Esc, ou rolar a página.
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
  const isDesktop = useIsDesktop();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const selected = options.find(o => o.value === value);

  useEffect(() => setMounted(true), []);

  const openMenu = () => {
    const r = triggerRef.current?.getBoundingClientRect();
    if (r) setPos({ top: r.bottom + 6, left: r.left, width: r.width });
    setOpen(o => !o);
  };

  // Portal pro .app-root mais próximo (não pro document.body direto) — assim o
  // menu herda as CSS variables do tema (inclusive .dc-mono, quando aplicável)
  // em vez de cair fora do escopo e ficar sem estilo nenhum.
  const portalTarget = triggerRef.current?.closest('.app-root') ?? (mounted ? document.body : null);

  // Desktop: fecha ao clicar fora, Esc, ou rolar (posição fica obsoleta)
  useEffect(() => {
    if (!isDesktop || !open) return;
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    const onScroll = () => setOpen(false);
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [isDesktop, open]);

  const trigger = (
    <button ref={triggerRef} type="button" disabled={disabled} onClick={openMenu}
      className={className ?? 'input'}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
        textAlign: 'left', cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.6 : 1,
        width: '100%',
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
  );

  const optionRow = (o: SelectOption, i: number, compact?: boolean) => (
    <button key={o.value} onClick={() => { onChange(o.value); setOpen(false); }}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
        padding: compact ? '9px 12px' : '14px 20px',
        border: 'none', borderTop: i > 0 && !compact ? '1px solid var(--outline-variant)' : 'none',
        borderRadius: compact ? 'var(--r-sm)' : 0,
        background: o.value === value ? 'color-mix(in srgb, var(--primary) 10%, transparent)' : 'transparent',
        color: 'var(--on-surface)', fontSize: compact ? 13.5 : 14.5, fontWeight: o.value === value ? 700 : 500,
        textAlign: 'left', cursor: 'pointer',
      }}>
      {o.label}
      {o.value === value && <span style={{ width: 15, height: 15, color: 'var(--primary)', flexShrink: 0 }}>{I.check}</span>}
    </button>
  );

  if (isDesktop) {
    return (
      <>
        {trigger}
        {open && pos && portalTarget && createPortal(
          <div ref={menuRef} style={{
            position: 'fixed', top: pos.top, left: pos.left, minWidth: pos.width, zIndex: 300,
            background: 'var(--surface-c-highest)', borderRadius: 'var(--r-md)', border: '1px solid var(--outline-variant)',
            boxShadow: 'var(--shadow-lg)', padding: 6, maxHeight: 280, overflowY: 'auto',
            animation: 'dcInFade .12s ease',
          }}>
            {options.map((o, i) => optionRow(o, i, true))}
          </div>,
          portalTarget,
        )}
      </>
    );
  }

  return (
    <>
      {trigger}
      <Sheet open={open} onClose={() => setOpen(false)}>
        {title && <div style={{ padding: '4px 20px 14px', fontSize: 16, fontWeight: 700 }}>{title}</div>}
        <div style={{ paddingBottom: 8, maxHeight: '60dvh', overflowY: 'auto' }}>
          {options.map((o, i) => optionRow(o, i, false))}
        </div>
      </Sheet>
    </>
  );
}
