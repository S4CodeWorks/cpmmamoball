'use client';

// Fundo "mesh gradient" desfocado pras heros de clube/partida — várias manchas
// de cor grandes, borradas e posicionadas fora da borda visível. Ao contrário
// de um radial-gradient puro (que sempre tem um raio onde a cor para e revela
// um corte duro contra o fundo), o blur nunca deixa uma borda visível porque
// as manchas se estendem pra além do container e se dissolvem gradualmente.
export function ColorMesh({ colors, opacity = 0.48 }: { colors: string[]; opacity?: number }) {
  const blobs = colors.filter(Boolean).slice(0, 3);
  if (blobs.length === 0) return null;

  const positions = [
    { top: '-40%', left: '-15%', width: '90%' },
    { top: '-30%', right: '-15%', width: '85%' },
    { bottom: '-45%', left: '30%', width: '80%' },
  ];

  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        zIndex: 0,
        pointerEvents: 'none',
        maskImage: 'radial-gradient(ellipse 95% 90% at 50% 50%, black 40%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 95% 90% at 50% 50%, black 40%, transparent 100%)',
      }}
    >
      {blobs.map((color, i) => {
        const p = positions[i % positions.length];
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              ...p,
              aspectRatio: '1',
              borderRadius: '50%',
              background: color,
              filter: 'blur(76px)',
              opacity,
              transform: 'translateZ(0)',
            }}
          />
        );
      })}
      {/* Suave fusão periférica */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 35%, color-mix(in srgb, var(--surface) 50%, transparent) 100%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
