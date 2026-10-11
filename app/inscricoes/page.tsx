import { PhoneShell } from '@/components/PhoneShell';
export default async function RegistrationPage({ searchParams }: { searchParams: Promise<{ competicao?: string }> }) {
  const params = await searchParams;
  return <PhoneShell initialPage="subscription" initialParam={params.competicao || null} />;
}
