import { ImageResponse } from 'next/og';
import { fetchMatchById, fetchClubById } from '@/lib/db';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

function Badge({ tag, color }: { tag: string; color: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      width: 220, height: 220, borderRadius: 44, background: color,
      fontSize: 64, fontWeight: 800, color: '#0a0c08',
    }}>
      {tag}
    </div>
  );
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const matchId = Number(id);
  const m = Number.isFinite(matchId) ? await fetchMatchById(matchId).catch(() => null) : null;
  const [home, away] = m ? await Promise.all([fetchClubById(m.home), fetchClubById(m.away)]) : [null, null];

  const homeTag = home?.tag ?? 'A';
  const awayTag = away?.tag ?? 'B';
  const homeColor = home?.color ?? '#3b82f6';
  const awayColor = away?.color ?? '#f59e0b';
  const scoreLabel = m?.status === 'finalizado' ? `${m.scoreH} — ${m.scoreA}` : '×';
  const subLabel = m ? `${m.stage} · ${m.date}` : 'CPM MamoBall';

  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', background: '#0a0c08',
        fontFamily: 'sans-serif',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 64 }}>
          <Badge tag={homeTag} color={homeColor} />
          <div style={{ display: 'flex', color: '#e6e9dd', fontSize: 88, fontWeight: 800 }}>{scoreLabel}</div>
          <Badge tag={awayTag} color={awayColor} />
        </div>
        <div style={{ display: 'flex', marginTop: 48, fontSize: 32, color: '#9aa08c' }}>{subLabel}</div>
        <div style={{ display: 'flex', marginTop: 16, fontSize: 24, fontWeight: 700, color: '#5f6a4d', letterSpacing: 4 }}>CPM MAMOBALL</div>
      </div>
    ),
    { ...size }
  );
}
