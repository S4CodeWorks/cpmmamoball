'use client';

/**
 * Suite completa de Skeleton Screens fluidos e modernos.
 * Réplicas fieis dos componentes reais para evitar Cumulative Layout Shift (CLS).
 */

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  radius?: number;
  circle?: boolean;
  style?: React.CSSProperties;
}

export function Skeleton({ width = '100%', height = 14, radius = 8, circle, style }: SkeletonProps) {
  return (
    <div
      className="skeleton"
      aria-hidden="true"
      style={{ width, height, borderRadius: circle ? 999 : radius, flexShrink: 0, ...style }}
    />
  );
}

// Uma linha de lista genérica: avatar + 2 linhas de texto + valor à direita
export function SkeletonRow({ avatar = true, avatarSize = 28 }: { avatar?: boolean; avatarSize?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px' }}>
      {avatar && <Skeleton width={avatarSize} height={avatarSize} radius={9} />}
      <div style={{ flex: 1, minWidth: 0 }}>
        <Skeleton width="60%" height={13} style={{ marginBottom: 7 }} />
        <Skeleton width="35%" height={10} />
      </div>
      <Skeleton width={28} height={16} />
    </div>
  );
}

// Lista de linhas dentro de um card-filled — substitui "Carregando..." em qualquer lista
export function SkeletonList({ rows = 4, avatar = true }: { rows?: number; avatar?: boolean }) {
  return (
    <div className="card-filled" aria-busy="true" aria-label="Carregando">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ borderTop: i ? '1px solid var(--outline-variant)' : 'none' }}>
          <SkeletonRow avatar={avatar} />
        </div>
      ))}
    </div>
  );
}

// Formato exato do MatchTile real (ver components/ui/MatchTile.tsx)
export function SkeletonMatchCard() {
  return (
    <div style={{ background: 'var(--surface-c)', borderRadius: 'var(--r-xl)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Skeleton width={64} height={22} radius={8} />
        <Skeleton width={44} height={10} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[0, 1].map(i => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Skeleton width={32} height={32} circle />
            <Skeleton width={i === 0 ? '55%' : '40%'} height={13} />
            <Skeleton width={14} height={13} style={{ marginLeft: 'auto' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// Partida principal em destaque no topo da Home
export function SkeletonHeroMatch() {
  return (
    <div style={{ borderRadius: 'var(--r-2xl)', padding: '20px 22px', background: 'var(--surface-c)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <Skeleton width={92} height={26} radius={999} />
        <Skeleton width={70} height={11} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 10 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Skeleton width={52} height={52} radius={14} />
          <Skeleton width={48} height={14} />
          <Skeleton width={32} height={22} style={{ marginTop: 2 }} />
        </div>
        <Skeleton width={22} height={14} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
          <Skeleton width={52} height={52} radius={14} />
          <Skeleton width={48} height={14} />
          <Skeleton width={32} height={22} style={{ marginTop: 2 }} />
        </div>
      </div>
    </div>
  );
}

// Replica exata da tabela de classificação (Standings)
export function SkeletonStandingsTable({ rows = 6 }: { rows?: number }) {
  return (
    <div className="card-filled" aria-busy="true" aria-label="Carregando classificação">
      <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr repeat(4, 28px)', padding: '12px 16px', gap: 8, borderBottom: '1px solid var(--outline-variant)' }}>
        <Skeleton width={16} height={10} />
        <Skeleton width={60} height={10} />
        <Skeleton width={20} height={10} />
        <Skeleton width={20} height={10} />
        <Skeleton width={20} height={10} />
        <Skeleton width={20} height={10} />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '28px 1fr repeat(4, 28px)', alignItems: 'center', padding: '12px 16px', gap: 8, borderTop: i ? '1px solid var(--outline-variant)' : 'none' }}>
          <Skeleton width={16} height={12} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Skeleton width={26} height={26} radius={8} />
            <Skeleton width={i % 2 === 0 ? '60%' : '75%'} height={13} />
          </div>
          <Skeleton width={20} height={13} />
          <Skeleton width={20} height={13} />
          <Skeleton width={20} height={13} />
          <Skeleton width={20} height={13} />
        </div>
      ))}
    </div>
  );
}

// Replica da tabela de artilharia (Scorers)
export function SkeletonScorersList({ rows = 5 }: { rows?: number }) {
  return (
    <div className="card-filled" aria-busy="true" aria-label="Carregando artilharia">
      <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 32px 32px', padding: '12px 16px', gap: 8, borderBottom: '1px solid var(--outline-variant)' }}>
        <Skeleton width={16} height={10} />
        <Skeleton width={70} height={10} />
        <Skeleton width={20} height={10} style={{ margin: '0 auto' }} />
        <Skeleton width={20} height={10} style={{ marginLeft: 'auto' }} />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '28px 1fr 32px 32px', alignItems: 'center', padding: '12px 16px', gap: 8, borderTop: i ? '1px solid var(--outline-variant)' : 'none' }}>
          <Skeleton width={16} height={12} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Skeleton width={28} height={28} radius={9} />
            <div style={{ flex: 1 }}>
              <Skeleton width={i % 2 === 0 ? '55%' : '40%'} height={13} style={{ marginBottom: 4 }} />
              <Skeleton width="30%" height={9} />
            </div>
          </div>
          <Skeleton width={18} height={14} style={{ margin: '0 auto' }} />
          <Skeleton width={18} height={14} style={{ marginLeft: 'auto' }} />
        </div>
      ))}
    </div>
  );
}

// Topo e estatísticas da tela do clube (ClubScreen)
export function SkeletonClubHero() {
  return (
    <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--outline-variant)' }}>
      <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <Skeleton width={80} height={80} radius={22} />
        <div style={{ flex: 1 }}>
          <Skeleton width={100} height={11} style={{ marginBottom: 8 }} />
          <Skeleton width="70%" height={26} style={{ marginBottom: 6 }} />
          <Skeleton width={40} height={12} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', padding: '12px 8px 14px', background: 'var(--surface-c-low)', borderTop: '1px solid var(--outline-variant)' }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <Skeleton width={32} height={22} />
            <Skeleton width={40} height={10} />
          </div>
        ))}
      </div>
    </div>
  );
}

// Placar e cabeçalho da tela de partida (MatchScreen)
export function SkeletonMatchHero() {
  return (
    <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--outline-variant)', padding: '20px 16px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <Skeleton width={140} height={12} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 14 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <Skeleton width={56} height={56} circle />
          <Skeleton width={48} height={14} />
          <Skeleton width={70} height={10} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Skeleton width={44} height={50} radius={12} />
          <Skeleton width={10} height={20} />
          <Skeleton width={44} height={50} radius={12} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <Skeleton width={56} height={56} circle />
          <Skeleton width={48} height={14} />
          <Skeleton width={70} height={10} />
        </div>
      </div>
    </div>
  );
}

// Feed de notícias (NewsScreen)
export function SkeletonNewsCard() {
  return (
    <div className="card-filled" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Skeleton width="30%" height={10} radius={4} />
      <Skeleton width="90%" height={18} />
      <Skeleton width="100%" height={12} />
      <Skeleton width="65%" height={12} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
        <Skeleton width={70} height={10} />
        <Skeleton width={45} height={10} />
      </div>
    </div>
  );
}

// Leitura de artigo de notícia (ArticleScreen)
export function SkeletonArticleBody() {
  return (
    <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Skeleton width={100} height={12} />
      <Skeleton width="95%" height={28} />
      <Skeleton width="70%" height={24} />
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', margin: '8px 0' }}>
        <Skeleton width={36} height={36} circle />
        <div style={{ flex: 1 }}>
          <Skeleton width={110} height={12} style={{ marginBottom: 4 }} />
          <Skeleton width={80} height={10} />
        </div>
      </div>
      <Skeleton width="100%" height={180} radius={16} />
      <Skeleton width="100%" height={14} />
      <Skeleton width="98%" height={14} />
      <Skeleton width="92%" height={14} />
      <Skeleton width="85%" height={14} />
    </div>
  );
}

// Tabela da área administrativa (AdminScreen)
export function SkeletonAdminTable({ rows = 4 }: { rows?: number }) {
  return (
    <div className="card-filled" style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, borderBottom: '1px solid var(--outline-variant)' }}>
        <Skeleton width={120} height={16} />
        <Skeleton width={80} height={28} radius={999} />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '10px 0', borderTop: i ? '1px solid var(--outline-variant)' : 'none' }}>
          <div style={{ flex: 1 }}>
            <Skeleton width="50%" height={14} style={{ marginBottom: 6 }} />
            <Skeleton width="30%" height={10} />
          </div>
          <Skeleton width={64} height={24} radius={6} />
        </div>
      ))}
    </div>
  );
}
