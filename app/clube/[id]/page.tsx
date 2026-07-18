import type { Metadata } from 'next';
import { PhoneShell } from '@/components/PhoneShell';
import { fetchClubById } from '@/lib/db';

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const c = await fetchClubById(id).catch(() => null);
  if (!c) return { title: 'Clube · CPM MamoBall' };

  const title = `${c.nome} (${c.tag})`;
  const description = `${c.nome} · CPM MamoBall`;
  return {
    title: `${title} · CPM MamoBall`,
    description,
    openGraph: { title, description, type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function ClubePage({ params }: Params) {
  const { id } = await params;
  return <PhoneShell initialPage="club" initialParam={id} />;
}
