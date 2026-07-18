import type { Metadata } from 'next';
import { PhoneShell } from '@/components/PhoneShell';
import { fetchMatchById, fetchClubById } from '@/lib/db';

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const matchId = Number(id);
  const m = Number.isFinite(matchId) ? await fetchMatchById(matchId).catch(() => null) : null;
  if (!m) return { title: 'Partida · CPM MamoBall' };

  const [home, away] = await Promise.all([fetchClubById(m.home), fetchClubById(m.away)]);
  const homeName = home?.tag ?? 'Time A';
  const awayName = away?.tag ?? 'Time B';
  const title = m.status === 'finalizado'
    ? `${homeName} ${m.scoreH} × ${m.scoreA} ${awayName}`
    : `${homeName} × ${awayName} — ${m.date}`;
  const description = `${m.stage} · CPM MamoBall`;

  return {
    title: `${title} · CPM MamoBall`,
    description,
    openGraph: { title, description, type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function PartidaPage({ params }: Params) {
  const { id } = await params;
  return <PhoneShell initialPage="match" initialParam={Number(id)} />;
}
