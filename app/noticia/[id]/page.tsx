import type { Metadata } from 'next';
import { PhoneShell } from '@/components/PhoneShell';
import { fetchNewsById } from '@/lib/db';

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const n = await fetchNewsById(id).catch(() => null);
  if (!n) return { title: 'Notícia · CPM MamoBall' };

  const description = n.excerpt || `${n.title} · CPM MamoBall`;
  return {
    title: `${n.title} · CPM MamoBall`,
    description,
    openGraph: { title: n.title, description, type: 'article' },
    twitter: { card: 'summary_large_image', title: n.title, description },
  };
}

export default async function NoticiaPage({ params }: Params) {
  const { id } = await params;
  return <PhoneShell initialPage="article" initialParam={id} />;
}
