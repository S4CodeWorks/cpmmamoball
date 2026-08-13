'use client';

import { useState } from 'react';
import { useData } from '@/contexts/DataContext';

// Escudo genérico — usado sempre que o clube não tem logo cadastrada, ou
// quando a imagem da logo real falha ao carregar.
const GENERIC_CREST = '/escudo-generico.png';

interface CrestProps {
  id: string;
  size?: number;
  radius?: number;
}

export function Crest({ id, size = 40 }: CrestProps) {
  const { clubById } = useData();
  const [imgError, setImgError] = useState(false);
  const c = clubById(id);
  if (!c) return null;

  const src = (c.logo_url && !imgError) ? c.logo_url : GENERIC_CREST;

  // Logo real: sempre a imagem original, sem crop nem borda/máscara —
  // objectFit "contain" garante que ela nunca é cortada, mesmo se não for quadrada.
  return (
    <img
      src={src}
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
