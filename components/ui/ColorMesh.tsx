'use client';

// Fundo "mesh gradient" desfocado pras heros de clube/partida — várias manchas
// de cor grandes, borradas e posicionadas fora da borda visível. Ao contrário
// de um radial-gradient puro (que sempre tem um raio onde a cor para e revela
// um corte duro contra o fundo), o blur nunca deixa uma borda visível porque
// as manchas se estendem pra além do container e se dissolvem gradualmente.
export function ColorMesh({ colors, opacity = 0.5 }: { colors: string[]; opacity?: number }) {
  const blobs = colors.filter(Boolean).slice(0, 3);
  if (blobs.length === 0) return null;

  const positions = [
    { top: '-45%', left: '-20%', width: '85%' },
    { top: '-35%', right: '-20%', width: '75%' },
    { bottom: '-55%', left: '25%', width: '80%' },
  ];

  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>
      {blobs.map((color, i) => {
        const p = positions[i % positions.length];
        return (
          <div key={i} style={{
            position: 'absolute', ...p, aspectRatio: '1', borderRadius: '50%',
            background: color, filter: 'blur(64px)', opacity,
            transform: 'translateZ(0)', // força camada própria — blur mais suave em telas menores
          }} />
        );
      })}
    </div>
  );
}
