import { createClient } from '@supabase/supabase-js';
import { MAX_LIST_LENGTH, readDraft, registrationIssues } from '@/lib/registration';

export async function POST(req: Request) {
  const token = req.headers.get('authorization')?.replace(/^Bearer /, '');
  if (!token) return Response.json({ error: 'Entre na sua conta para enviar.' }, { status: 401 });
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!, {
    global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false },
  });
  const { data: auth, error: authError } = await db.auth.getUser(token);
  if (authError || !auth.user) return Response.json({ error: 'Sua sessão expirou. Entre novamente.' }, { status: 401 });
  if (Number(req.headers.get('content-length')) > 65536) return Response.json({ error: 'Inscrição muito longa.' }, { status: 413 });
  const body = await req.json().catch(() => null);
  const draft = readDraft(body?.draft);
  if (!draft || typeof body?.competitionId !== 'string' || body.agree !== true || typeof body?.source !== 'string' || body.source.length > MAX_LIST_LENGTH || new TextEncoder().encode(body.source).length > 16384) return Response.json({ error: 'Revise a inscrição e aceite o regulamento.' }, { status: 400 });
  const issues = registrationIssues(draft);
  if (issues.length) return Response.json({ error: issues[0], issues }, { status: 422 });
  const { data: comp, error: compError } = await db.from('competitions').select('id, status').eq('id', body.competitionId).maybeSingle();
  if (compError) return Response.json({ error: 'Não foi possível conferir a competição. Tente novamente.' }, { status: 503 });
  if (!comp || comp.status !== 'inscricoes') return Response.json({ error: 'As inscrições desta competição estão fechadas.', closed: true }, { status: 409 });
  const { data: taken, error: lookupError } = await db.from('players').select('game_id').in('game_id', draft.jogadores.map(p => p.game_id));
  if (lookupError) return Response.json({ error: 'Não foi possível conferir os IDs. Tente novamente.' }, { status: 503 });
  if (taken?.length) return Response.json({ error: 'Há IDs já cadastrados em outro time.', taken: taken.map(p => p.game_id) }, { status: 409 });
  const { error } = await db.from('inscricoes').insert({
    competition_id: comp.id, nome: draft.nome, tag: draft.tag,
    capitao: draft.captain!.nick, capitao_game_id: draft.captain!.game_id, capitao_discord: draft.captain!.discord || '',
    jogadores: draft.jogadores, roster: body.source, status: 'pendente',
  });
  if (error) return Response.json({ error: error.code === '42501' ? 'Envio não autorizado. Confira a sessão e se as inscrições continuam abertas.' : 'Não foi possível enviar. Seus dados continuam aqui para tentar novamente.' }, { status: 400 });
  return Response.json({ status: 'pendente' }, { status: 201, headers: { 'Cache-Control': 'no-store' } });
}
