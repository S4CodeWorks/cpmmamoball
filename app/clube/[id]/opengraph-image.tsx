import { ImageResponse } from 'next/og';
import { fetchClubById } from '@/lib/db';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await fetchClubById(id).catch(() => null);

  const color = c?.color ?? '#3b82f6';
  const color2 = c?.color2 ?? '#ffffff';

  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', background: '#0a0c08',
        fontFamily: 'sans-serif',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 260, height: 260, borderRadius: 56, background: color,
          fontSize: 96, fontWeight: 800, color: color2,
        }}>
          {c?.tag ?? '?'}
        </div>
        <div style={{ display: 'flex', marginTop: 48, fontSize: 56, fontWeight: 800, color: '#e6e9dd' }}>{c?.nome ?? 'Clube'}</div>
        <div style={{ display: 'flex', marginTop: 16, fontSize: 24, fontWeight: 700, color: '#5f6a4d', letterSpacing: 4 }}>CPM MAMOBALL</div>
      </div>
    ),
    { ...size }
  );
}
