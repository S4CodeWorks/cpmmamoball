import { ImageResponse } from 'next/og';
import { fetchNewsById } from '@/lib/db';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const CATEGORY_LABEL: Record<string, string> = {
  noticia: 'Notícia',
  inscricoes: 'Inscrições abertas',
  comunicado: 'Comunicado',
  resultado: 'Resultado de jogo',
};

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const n = await fetchNewsById(id).catch(() => null);

  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', background: '#0a0c08', padding: '80px 90px',
        fontFamily: 'sans-serif',
      }}>
        <div style={{
          display: 'flex', alignSelf: 'flex-start', fontSize: 26, fontWeight: 800,
          color: '#0a0c08', background: '#c8e06d', padding: '10px 24px', borderRadius: 999,
          marginBottom: 36, letterSpacing: 1,
        }}>
          {CATEGORY_LABEL[n?.category ?? 'noticia'] ?? 'Notícia'}
        </div>
        <div style={{ display: 'flex', fontSize: 64, fontWeight: 800, color: '#e6e9dd', lineHeight: 1.15, maxWidth: 1000 }}>
          {n?.title ?? 'CPM MamoBall'}
        </div>
        <div style={{ display: 'flex', marginTop: 40, fontSize: 24, fontWeight: 700, color: '#5f6a4d', letterSpacing: 4 }}>CPM MAMOBALL</div>
      </div>
    ),
    { ...size }
  );
}
