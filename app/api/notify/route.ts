import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

const vapidSubject = process.env.VAPID_SUBJECT;
const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivate = process.env.VAPID_PRIVATE_KEY;

if (vapidSubject && vapidPublic && vapidPrivate) {
  webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);
}

// Envia um push broadcast pra todo mundo inscrito. Só staff pode disparar —
// a checagem é via RLS: o cliente Supabase usa o token de quem chamou, e a
// tabela push_subscriptions só libera SELECT pra usuários com role='staff'
// (ver migração push_subscriptions_staff_read). Sem token válido ou sem ser
// staff, a leitura de inscrições simplesmente vem vazia/erro.
export async function POST(req: Request) {
  if (!vapidSubject || !vapidPublic || !vapidPrivate) {
    return Response.json({ error: 'Push não configurado no servidor' }, { status: 503 });
  }

  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace(/^Bearer /, '');
  if (!token) return Response.json({ error: 'unauthorized' }, { status: 401 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );

  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (profile?.role !== 'staff') return Response.json({ error: 'forbidden' }, { status: 403 });

  const body = await req.json().catch(() => null) as { title?: string; body?: string; url?: string } | null;
  if (!body?.title) return Response.json({ error: 'title é obrigatório' }, { status: 400 });

  const { data: subs, error } = await supabase.from('push_subscriptions').select('id, endpoint, p256dh, auth');
  if (error) return Response.json({ error: error.message }, { status: 500 });

  const payload = JSON.stringify({ title: body.title, body: body.body ?? '', url: body.url ?? '/' });

  let sent = 0;
  for (const s of subs ?? []) {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload);
      sent++;
    } catch (err: unknown) {
      const statusCode = (err as { statusCode?: number })?.statusCode;
      if (statusCode === 404 || statusCode === 410) {
        await supabase.from('push_subscriptions').delete().eq('id', s.id);
      }
    }
  }

  return Response.json({ sent, total: (subs ?? []).length });
}
