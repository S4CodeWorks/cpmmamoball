'use client';

import React from 'react';

/**
 * Suite Ultra-Moderna & Dinâmica de Skeleton Screens (2026 Edition).
 * Design minimalista com micro-bordas glassmorphic, varredura angular e delays em cascata.
 */

export interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  radius?: number;
  circle?: boolean;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({
  width = '100%',
  height = 14,
  radius = 8,
  circle = false,
  delay = 0,
  className = '',
  style,
}: SkeletonProps) {
  const customStyle: React.CSSProperties = {
    width,
    height,
    borderRadius: circle ? 999 : radius,
    flexShrink: 0,
    ...(delay > 0 ? ({ '--sk-delay': `${delay}s` } as React.CSSProperties) : {}),
    ...style,
  };

  return <div className={`skeleton ${className}`.trim()} aria-hidden="true" style={customStyle} />;
}

// ── Micro-Primitivas Avançadas ────────────────────────────────────────────────

export function SkeletonPill({ width = 72, height = 24, delay = 0 }: { width?: number | string; height?: number; delay?: number }) {
  return <Skeleton width={width} height={height} radius={999} delay={delay} />;
}

export function SkeletonAvatar({ size = 32, radius = 10, circle = false, delay = 0 }: { size?: number; radius?: number; circle?: boolean; delay?: number }) {
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <Skeleton width={size} height={size} radius={radius} circle={circle} delay={delay} />
    </div>
  );
}

export function SkeletonText({
  lines = 2,
  gap = 7,
  firstWidth = '75%',
  lastWidth = '45%',
  height = 12,
  baseDelay = 0,
}: {
  lines?: number;
  gap?: number;
  firstWidth?: string;
  lastWidth?: string;
  height?: number;
  baseDelay?: number;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap, width: '100%' }}>
      {Array.from({ length: lines }).map((_, i) => {
        let w = firstWidth;
        if (lines > 1) {
          if (i === lines - 1) w = lastWidth;
          else if (i > 0) w = '85%';
        }
        return <Skeleton key={i} width={w} height={height} radius={height / 2} delay={baseDelay + i * 0.05} />;
      })}
    </div>
  );
}

// ── Componentes de Linha e Lista ──────────────────────────────────────────────

export function SkeletonRow({
  avatar = true,
  avatarSize = 30,
  delay = 0,
}: {
  avatar?: boolean;
  avatarSize?: number;
  delay?: number;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px' }}>
      {avatar && <SkeletonAvatar size={avatarSize} radius={9} delay={delay} />}
      <div style={{ flex: 1, minWidth: 0 }}>
        <Skeleton width="62%" height={13} radius={6} delay={delay + 0.04} style={{ marginBottom: 6 }} />
        <Skeleton width="38%" height={10} radius={5} delay={delay + 0.08} />
      </div>
      <Skeleton width={32} height={18} radius={6} delay={delay + 0.12} />
    </div>
  );
}

export function SkeletonList({ rows = 4, avatar = true, baseDelay = 0 }: { rows?: number; avatar?: boolean; baseDelay?: number }) {
  return (
    <div className="skeleton-card" aria-busy="true" aria-label="Carregando">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ borderTop: i ? '1px solid var(--outline-variant)' : 'none' }}>
          <SkeletonRow avatar={avatar} delay={baseDelay + i * 0.06} />
        </div>
      ))}
    </div>
  );
}

// ── MatchTile & Partidas ──────────────────────────────────────────────────────

export function SkeletonMatchCard({ delay = 0 }: { delay?: number }) {
  return (
    <div className="skeleton-card" style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <SkeletonPill width={70} height={22} delay={delay} />
        <Skeleton width={48} height={10} radius={4} delay={delay + 0.04} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[0, 1].map(i => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <SkeletonAvatar size={30} circle delay={delay + 0.06 + i * 0.04} />
            <Skeleton width={i === 0 ? '58%' : '44%'} height={13} radius={6} delay={delay + 0.08 + i * 0.04} />
            <Skeleton width={16} height={14} radius={4} style={{ marginLeft: 'auto' }} delay={delay + 0.1 + i * 0.04} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Hero de Partida em Destaque (Home) ────────────────────────────────────────

export function SkeletonHeroMatch() {
  return (
    <div className="skeleton-card" style={{ padding: '20px 22px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <SkeletonPill width={96} height={26} delay={0} />
        <Skeleton width={74} height={11} radius={5} delay={0.05} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 12 }}>
        {/* Time Mandante */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10 }}>
          <SkeletonAvatar size={54} radius={16} delay={0.08} />
          <Skeleton width={52} height={14} radius={6} delay={0.12} />
          <Skeleton width={38} height={28} radius={8} style={{ marginTop: 2 }} delay={0.16} />
        </div>
        {/* VS / Divisor central */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <Skeleton width={24} height={14} radius={6} delay={0.14} />
        </div>
        {/* Time Visitante */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
          <SkeletonAvatar size={54} radius={16} delay={0.08} />
          <Skeleton width={52} height={14} radius={6} delay={0.12} />
          <Skeleton width={38} height={28} radius={8} style={{ marginTop: 2 }} delay={0.16} />
        </div>
      </div>
    </div>
  );
}

// ── Tabela de Classificação (Standings) ───────────────────────────────────────

export function SkeletonStandingsTable({ rows = 6, baseDelay = 0 }: { rows?: number; baseDelay?: number }) {
  return (
    <div className="skeleton-card" aria-busy="true" aria-label="Carregando classificação">
      {/* Header */}
      <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr repeat(4, 28px)', padding: '12px 16px', gap: 8, borderBottom: '1px solid var(--outline-variant)' }}>
        <Skeleton width={14} height={9} radius={3} delay={baseDelay} />
        <Skeleton width={64} height={9} radius={3} delay={baseDelay + 0.02} />
        <Skeleton width={18} height={9} radius={3} delay={baseDelay + 0.04} />
        <Skeleton width={18} height={9} radius={3} delay={baseDelay + 0.06} />
        <Skeleton width={18} height={9} radius={3} delay={baseDelay + 0.08} />
        <Skeleton width={18} height={9} radius={3} delay={baseDelay + 0.1} />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => {
        const d = baseDelay + 0.05 + i * 0.04;
        return (
          <div
            key={i}
            style={{
              display: 'grid',
              gridTemplateColumns: '28px 1fr repeat(4, 28px)',
              alignItems: 'center',
              padding: '12px 16px',
              gap: 8,
              borderTop: i ? '1px solid var(--outline-variant)' : 'none',
              background: i < 4 ? 'color-mix(in srgb, var(--primary) 4%, transparent)' : 'transparent',
            }}
          >
            <Skeleton width={14} height={13} radius={4} delay={d} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <SkeletonAvatar size={26} radius={8} delay={d + 0.02} />
              <Skeleton width={i % 2 === 0 ? '62%' : '76%'} height={13} radius={5} delay={d + 0.04} />
            </div>
            <Skeleton width={18} height={12} radius={4} delay={d + 0.06} />
            <Skeleton width={18} height={12} radius={4} delay={d + 0.08} />
            <Skeleton width={18} height={12} radius={4} delay={d + 0.1} />
            <Skeleton width={20} height={15} radius={5} delay={d + 0.12} />
          </div>
        );
      })}
    </div>
  );
}

// ── Tabela de Artilharia com Pódio (Scorers) ──────────────────────────────────

export function SkeletonScorersList({ rows = 5 }: { rows?: number }) {
  return (
    <div aria-busy="true" aria-label="Carregando artilharia">
      {/* Pódio visual dos 3 primeiros */}
      <div className="skeleton-card" style={{ padding: '20px 16px 26px', marginBottom: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', alignItems: 'end', gap: 10 }}>
          {/* 2º Lugar */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <SkeletonAvatar size={46} radius={14} delay={0.06} />
            <Skeleton width={50} height={12} radius={5} delay={0.1} />
            <Skeleton width={28} height={20} radius={6} delay={0.14} />
            <Skeleton width="100%" height={70} radius={12} delay={0.18} />
          </div>
          {/* 1º Lugar (Campeão) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ position: 'relative' }}>
              <Skeleton width={18} height={12} radius={4} style={{ margin: '0 auto 4px' }} delay={0.02} />
              <SkeletonAvatar size={58} radius={16} delay={0.04} />
            </div>
            <Skeleton width={64} height={13} radius={5} delay={0.08} />
            <Skeleton width={34} height={24} radius={6} delay={0.12} />
            <Skeleton width="100%" height={94} radius={12} delay={0.16} />
          </div>
          {/* 3º Lugar */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <SkeletonAvatar size={46} radius={14} delay={0.08} />
            <Skeleton width={50} height={12} radius={5} delay={0.12} />
            <Skeleton width={28} height={20} radius={6} delay={0.16} />
            <Skeleton width="100%" height={56} radius={12} delay={0.2} />
          </div>
        </div>
      </div>

      {/* Lista adicional */}
      <div className="skeleton-card">
        {Array.from({ length: rows }).map((_, i) => {
          const d = 0.2 + i * 0.05;
          return (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '24px 1fr 36px', alignItems: 'center', gap: 12, padding: '14px 16px', borderTop: i ? '1px solid var(--outline-variant)' : 'none' }}>
              <Skeleton width={14} height={12} radius={4} delay={d} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <SkeletonAvatar size={28} radius={9} delay={d + 0.02} />
                <div style={{ flex: 1 }}>
                  <Skeleton width={i % 2 === 0 ? '55%' : '42%'} height={13} radius={5} delay={d + 0.04} style={{ marginBottom: 4 }} />
                  <Skeleton width="32%" height={9} radius={4} delay={d + 0.06} />
                </div>
              </div>
              <Skeleton width={22} height={18} radius={5} delay={d + 0.08} style={{ marginLeft: 'auto' }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Hero de Clube (ClubScreen) ────────────────────────────────────────────────

export function SkeletonClubHero() {
  return (
    <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--outline-variant)' }}>
      <div style={{ padding: '22px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <SkeletonAvatar size={80} radius={22} delay={0.04} />
        <div style={{ flex: 1 }}>
          <SkeletonPill width={100} height={20} delay={0.08} />
          <Skeleton width="75%" height={26} radius={7} delay={0.12} style={{ margin: '8px 0 6px' }} />
          <Skeleton width={44} height={12} radius={4} delay={0.16} />
        </div>
      </div>
      {/* 4 Métricas Estatísticas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', padding: '14px 8px', background: 'var(--surface-c-low)', borderTop: '1px solid var(--outline-variant)' }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <Skeleton width={34} height={22} radius={6} delay={0.18 + i * 0.04} />
            <Skeleton width={42} height={10} radius={4} delay={0.22 + i * 0.04} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Hero de Partida (MatchScreen) ─────────────────────────────────────────────

export function SkeletonMatchHero() {
  return (
    <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--outline-variant)', padding: '20px 16px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <Skeleton width={140} height={12} radius={6} delay={0.02} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 14 }}>
        {/* Mandante */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <SkeletonAvatar size={58} radius={18} delay={0.06} />
          <Skeleton width={48} height={14} radius={5} delay={0.1} />
          <Skeleton width={72} height={10} radius={4} delay={0.14} />
        </div>
        {/* Placar Central */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Skeleton width={46} height={52} radius={12} delay={0.12} />
          <Skeleton width={10} height={22} radius={3} delay={0.14} />
          <Skeleton width={46} height={52} radius={12} delay={0.16} />
        </div>
        {/* Visitante */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <SkeletonAvatar size={58} radius={18} delay={0.06} />
          <Skeleton width={48} height={14} radius={5} delay={0.1} />
          <Skeleton width={72} height={10} radius={4} delay={0.14} />
        </div>
      </div>
    </div>
  );
}

// ── Notícias e Artigos (NewsScreen / ArticleScreen) ───────────────────────────

export function SkeletonNewsCard({ delay = 0 }: { delay?: number }) {
  return (
    <div className="skeleton-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Skeleton width="100%" height={150} radius={12} delay={delay} />
      <SkeletonPill width={80} height={20} delay={delay + 0.04} />
      <Skeleton width="92%" height={18} radius={6} delay={delay + 0.08} />
      <Skeleton width="100%" height={12} radius={4} delay={delay + 0.12} />
      <Skeleton width="65%" height={12} radius={4} delay={delay + 0.14} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
        <Skeleton width={72} height={10} radius={4} delay={delay + 0.16} />
        <Skeleton width={44} height={10} radius={4} delay={delay + 0.18} />
      </div>
    </div>
  );
}

export function SkeletonArticleBody() {
  return (
    <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <SkeletonPill width={110} height={22} delay={0.04} />
      <Skeleton width="96%" height={30} radius={8} delay={0.08} />
      <Skeleton width="72%" height={24} radius={7} delay={0.12} />
      {/* Autor */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', margin: '6px 0' }}>
        <SkeletonAvatar size={38} circle delay={0.14} />
        <div style={{ flex: 1 }}>
          <Skeleton width={110} height={13} radius={5} delay={0.16} style={{ marginBottom: 4 }} />
          <Skeleton width={80} height={10} radius={4} delay={0.18} />
        </div>
      </div>
      {/* Capa */}
      <Skeleton width="100%" height={200} radius={16} delay={0.2} />
      {/* Parágrafos */}
      <SkeletonText lines={4} firstWidth="100%" lastWidth="80%" height={14} gap={10} baseDelay={0.24} />
      <SkeletonText lines={3} firstWidth="98%" lastWidth="65%" height={14} gap={10} baseDelay={0.36} />
    </div>
  );
}

// ── Tabela do Painel Administrativo (AdminScreen) ─────────────────────────────

export function SkeletonAdminTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="skeleton-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, borderBottom: '1px solid var(--outline-variant)' }}>
        <Skeleton width={140} height={18} radius={6} delay={0.04} />
        <SkeletonPill width={90} height={30} delay={0.08} />
      </div>
      {/* Barra de busca */}
      <Skeleton width="100%" height={38} radius={10} delay={0.1} />
      {/* Linhas */}
      {Array.from({ length: rows }).map((_, i) => {
        const d = 0.14 + i * 0.05;
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 0', borderTop: i ? '1px solid var(--outline-variant)' : 'none' }}>
            <div style={{ flex: 1 }}>
              <Skeleton width={i % 2 === 0 ? '54%' : '46%'} height={14} radius={5} delay={d} style={{ marginBottom: 6 }} />
              <Skeleton width="28%" height={10} radius={4} delay={d + 0.03} />
            </div>
            <Skeleton width={70} height={26} radius={8} delay={d + 0.06} />
          </div>
        );
      })}
    </div>
  );
}
