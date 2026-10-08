'use client';

import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import type { Club } from '@/lib/types';

// Escudo genérico — usado sempre que o clube não tem logo cadastrada, ou
// quando a imagem da logo real falha ao carregar.
const GENERIC_CREST = '/escudo-generico.png';

interface CrestProps {
  id: string;
  size?: number;
  height?: number;
  radius?: number;
  club?: Pick<Club, 'nome' | 'logo_url'>;
}

export function Crest({ id, size = 40, height = size, club }: CrestProps) {
  const { clubById } = useData();
  const [imgError, setImgError] = useState(false);
  const c = club ?? clubById(id);
  if (!c) return null;

  const src = (c.logo_url && !imgError) ? c.logo_url : GENERIC_CREST;

  // Logo real: sempre a imagem original, sem crop nem borda/máscara —
  // objectFit "contain" garante que ela nunca é cortada, mesmo se não for quadrada.
  return (
    <img
      src={src}
      alt={c.nome}
      style={{
        width: size, height,
        objectFit: 'contain',
        flexShrink: 0,
        display: 'block',
      }}
      onError={() => setImgError(true)}
    />
  );
}
