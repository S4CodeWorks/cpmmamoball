'use client';

import { useState } from 'react';
import { ABBREV } from '@/lib/data';
import { useData } from '@/contexts/DataContext';

interface CrestProps {
  id: string;
  size?: number;
  radius?: number;
}

export function Crest({ id, size = 40, radius }: CrestProps) {
  const { clubById } = useData();
  const [imgError, setImgError] = useState(false);
  const c = clubById(id);
  if (!c) return null;

  const r = radius ?? Math.round(size * 0.28);

  if (c.logo_url && !imgError) {
    return (
      <img
        src={c.logo_url}
        alt={c.nome}
        style={{
          width: size, height: size,
          borderRadius: r,
          objectFit: 'cover',
          flexShrink: 0,
          display: 'block',
        }}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className="crest"
      style={{
        width: size, height: size,
        background: c.color, color: c.color2,
        borderRadius: r,
        fontSize: Math.max(10, Math.round(size * 0.32)),
        flexShrink: 0,
      }}
      aria-label={c.nome}
    >
      <span>{ABBREV(c)}</span>
    </div>
  );
}
