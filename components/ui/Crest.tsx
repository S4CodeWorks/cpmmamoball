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
    // Logo real: sempre a imagem original, sem crop nem borda/máscara —
    // objectFit "contain" garante que ela nunca é cortada, mesmo se não for quadrada.
    return (
      <img
        src={c.logo_url}
        alt={c.nome}
        style={{
          width: size, height: size,
          objectFit: 'contain',
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
