'use client';

import { useEffect, useRef, useState } from 'react';
import { I } from '@/components/icons';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Sheet({ open, onClose, children }: SheetProps) {
  const [rendered, setRendered] = useState(false);
  const [visible,  setVisible]  = useState(false);
  const [dragY,    setDragY]    = useState(0);

  const draggingRef = useRef(false);
  const startYRef   = useRef(0);
  const sheetRef    = useRef<HTMLDivElement>(null);

  // Mount/unmount com animação
  useEffect(() => {
    if (open) {
      setRendered(true);
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    } else {
      setVisible(false);
      const t = setTimeout(() => { setRendered(false); setDragY(0); }, 360);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Fechar com Escape
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);

  // touchmove precisa ser { passive: false } para poder cancelar scroll
  useEffect(() => {
    const el = sheetRef.current;
    if (!el || !rendered) return;

    const onMove = (e: TouchEvent) => {
      if (!draggingRef.current) return;
      const delta = e.touches[0].clientY - startYRef.current;
      if (delta > 0) {
        setDragY(delta);
        e.preventDefault(); // impede scroll da página durante drag
      }
    };

    el.addEventListener('touchmove', onMove, { passive: false });
    return () => el.removeEventListener('touchmove', onMove);
  }, [rendered]);

  if (!rendered) return null;

  const isDragging = dragY > 0;
  const transform  = !visible
    ? 'translateY(105%)'
    : isDragging
    ? `translateY(${dragY}px)`
    : 'translateY(0)';

  const handleTouchStart = (e: React.TouchEvent) => {
    startYRef.current = e.touches[0].clientY;
    draggingRef.current = true;
  };

  const handleTouchEnd = () => {
    draggingRef.current = false;
    if (dragY > 90) {
      onClose();
    } else {
      setDragY(0);
    }
  };

  return (
    <>
      {/* Scrim com blur */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.45)',
          backdropFilter: visible ? 'blur(3px)' : 'none',
          WebkitBackdropFilter: visible ? 'blur(3px)' : 'none',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.3s ease, backdrop-filter 0.3s ease',
        }}
      />

      {/* Painel */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          position: 'fixed',
          bottom: 0, left: 0, right: 0,
          zIndex: 101,
          background: 'var(--surface-c)',
          borderRadius: '20px 20px 0 0',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          maxHeight: '85dvh',
          overflowY: 'auto',
          transform,
          transition: isDragging ? 'none' : 'transform 0.38s cubic-bezier(0.32, 0.72, 0, 1)',
          willChange: 'transform',
          boxShadow: '0 -4px 32px rgba(0,0,0,0.18)',
        }}
      >
        {/* Handle arrastável */}
        <div style={{
          width: 40, height: 4, borderRadius: 99,
          background: 'var(--outline-variant)',
          margin: '12px auto 4px',
          cursor: 'grab',
          touchAction: 'none',
        }} />

        <div style={{ paddingBottom: 8 }}>
          {children}
        </div>
      </div>
    </>
  );
}

// ── SheetItem — funciona tanto no Sheet quanto no DropdownMenu ─────────────────

interface SheetItemProps {
  icon: string;
  label: string;
  meta?: string;
  onClick?: () => void;
  on?: boolean;
  danger?: boolean;
}

export function SheetItem({ icon, label, meta, onClick, on, danger }: SheetItemProps) {
  return (
    <button
      onClick={onClick}
      className={`sheet-item${on ? ' is-on' : ''}${danger ? ' danger' : ''}`}
    >
      <span className="ico">{I[icon] || icon}</span>
      <div style={{ flex: 1 }}>
        <div>{label}</div>
        {meta && <div className="meta">{meta}</div>}
      </div>
      {on != null && (
        <span className={`toggle${on ? ' is-on' : ''}`} style={{ pointerEvents: 'none' }}>
          <span className="thumb" />
        </span>
      )}
    </button>
  );
}
