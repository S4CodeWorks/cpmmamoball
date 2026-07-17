'use client';

import { useEffect, useRef, useState } from 'react';
import { I } from '@/components/icons';
import { Sheet } from './Sheet';
import { useIsDesktop } from '@/hooks/useIsDesktop';

interface TopAppBarProps {
  title: string;
  large?: boolean;
  subhead?: string;
  showBack?: boolean;
  onBack?: () => void;
  menu?: (close: () => void) => React.ReactNode;
  rightExtras?: React.ReactNode;
}

// ── Dropdown para desktop ─────────────────────────────────────────────────────

interface DropdownProps {
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  children: React.ReactNode;
}

function DropdownMenu({ open, onClose, anchorRef, children }: DropdownProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos,     setPos]     = useState({ top: 0, right: 16 });
  const [visible, setVisible] = useState(false);

  // Calcula posição relativa ao botão trigger
  useEffect(() => {
    if (open) {
      if (anchorRef.current) {
        const rect = anchorRef.current.getBoundingClientRect();
        setPos({
          top:   rect.bottom + 6,
          right: window.innerWidth - rect.right,
        });
      }
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    } else {
      setVisible(false);
    }
  }, [open, anchorRef]);

  // Fechar ao clicar fora ou pressionar Escape
  useEffect(() => {
    if (!open) return;
    const onMouse = (e: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        anchorRef.current && !anchorRef.current.contains(e.target as Node)
      ) onClose();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', onMouse);
    document.addEventListener('keydown',   onKey);
    return () => {
      document.removeEventListener('mousedown', onMouse);
      document.removeEventListener('keydown',   onKey);
    };
  }, [open, onClose, anchorRef]);

  if (!open) return null;

  return (
    <div
      ref={menuRef}
      role="menu"
      style={{
        position: 'fixed',
        top:   pos.top,
        right: pos.right,
        zIndex: 200,
        background:   'var(--surface-c)',
        border:       '1px solid var(--outline-variant)',
        borderRadius: 'var(--r-lg)',
        boxShadow:    '0 8px 24px rgba(0,0,0,0.14), 0 2px 6px rgba(0,0,0,0.08)',
        minWidth: 230,
        overflow: 'hidden',
        // Animação de entrada
        opacity:   visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.96)',
        transformOrigin: 'top right',
        transition: 'opacity 0.14s ease, transform 0.14s ease',
      }}
    >
      <div style={{ padding: '4px 0' }}>
        {children}
      </div>
    </div>
  );
}

// ── TopAppBar ─────────────────────────────────────────────────────────────────

export function TopAppBar({ title, large, subhead, showBack, onBack, menu, rightExtras }: TopAppBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isDesktop  = useIsDesktop();
  const menuBtnRef = useRef<HTMLButtonElement>(null);

  const close = () => setMenuOpen(false);
  const toggle = () => setMenuOpen(v => !v);

  return (
    <>
      <div className={`app-bar${large ? ' large' : ''}`}>
        <div className="app-bar-row">
          {showBack
            ? <button className="icon-btn" onClick={onBack} aria-label="Voltar">{I.back}</button>
            : <span style={{ width: 8 }} />
          }
          {!large && <span className="title">{title}</span>}
          {large  && <div style={{ flex: 1 }} />}
          {rightExtras}
          {menu && (
            <button
              ref={menuBtnRef}
              className="icon-btn"
              onClick={toggle}
              aria-label="Mais opções"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
            >
              {I.menuDots}
            </button>
          )}
        </div>

        {large && (
          <>
            {subhead && <div className="subhead">{subhead}</div>}
            <div className="headline">{title}</div>
          </>
        )}
      </div>

      {/* Desktop: dropdown junto ao botão | Mobile: sheet vindo de baixo */}
      {menu && (
        isDesktop
          ? <DropdownMenu open={menuOpen} onClose={close} anchorRef={menuBtnRef}>
              {menu(close)}
            </DropdownMenu>
          : <Sheet open={menuOpen} onClose={close}>
              {menu(close)}
            </Sheet>
      )}
    </>
  );
}
