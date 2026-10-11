-- CPM MamoBall security hardening. Existing data is retained.
-- Deploy the accompanying lib/push.ts change with this migration.
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';

ALTER POLICY "public read news" ON public.news TO anon, authenticated USING (published = true);
DROP POLICY "allow authenticated read profiles" ON public.profiles;
DROP POLICY "superadmin manage profiles" ON public.profiles;
CREATE POLICY "read own profile" ON public.profiles FOR SELECT TO authenticated
  USING (id = (SELECT auth.uid()));

-- Remove privileges outside RLS and re-establish only required operations.
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.clubs, public.club_competitions, public.competitions,
  public.competition_bracket_ties, public.matches, public.news,
  public.players, public.player_competitions, public.scorers, public.standings,
  public.announcements TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.clubs, public.club_competitions,
  public.competitions, public.competition_bracket_ties, public.matches,
  public.news, public.players, public.player_competitions,
  public.scorers, public.standings, public.announcements TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookmarks, public.announcement_reads TO authenticated;
GRANT SELECT ON public.profiles TO authenticated;
GRANT UPDATE (nick) ON public.profiles TO authenticated;
GRANT SELECT, UPDATE, DELETE ON public.inscricoes TO authenticated;

ALTER TABLE public.inscricoes ADD COLUMN submitted_by uuid DEFAULT auth.uid()
  REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX inscricoes_submitted_by_idx ON public.inscricoes (submitted_by);
-- Historic rows stay unattributed rather than assigning a fictitious owner.
GRANT INSERT (competition_id,nome,tag,capitao,capitao_game_id,capitao_discord,
  roster,jogadores,status) ON public.inscricoes TO authenticated;
ALTER POLICY "authenticated submit inscricao" ON public.inscricoes
  WITH CHECK (submitted_by = (SELECT auth.uid()) AND status = 'pendente'
    AND reviewed_at IS NULL AND EXISTS (
      SELECT 1 FROM public.competitions c WHERE c.id = competition_id AND c.status = 'inscricoes'
    ) AND jsonb_typeof(jogadores) = 'array' AND jsonb_array_length(jogadores) BETWEEN 1 AND 100
      AND octet_length(jogadores::text) <= 65536 AND octet_length(roster) <= 16384);
CREATE OR REPLACE FUNCTION public.lock_inscricao_author()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  IF NEW.submitted_by IS DISTINCT FROM OLD.submitted_by
    AND current_user IN ('anon','authenticated') THEN
    RAISE EXCEPTION 'Autoria da inscrição é imutável' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER lock_inscricao_author BEFORE UPDATE ON public.inscricoes
  FOR EACH ROW EXECUTE FUNCTION public.lock_inscricao_author();

-- Capability per browser permits anonymous push without trusting user_id or endpoint.
ALTER TABLE public.push_subscriptions ADD COLUMN capability_hash text;
DROP POLICY "anyone can subscribe" ON public.push_subscriptions;
DROP POLICY "anyone can update own subscription by endpoint" ON public.push_subscriptions;
DROP POLICY "anyone can unsubscribe by endpoint" ON public.push_subscriptions;
GRANT SELECT (id,endpoint,p256dh,auth,user_id,created_at) ON public.push_subscriptions TO authenticated;
GRANT DELETE ON public.push_subscriptions TO authenticated;
CREATE POLICY "staff delete expired subscriptions" ON public.push_subscriptions
  FOR DELETE TO authenticated USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'staff'
  ));

CREATE OR REPLACE FUNCTION public.register_push_subscription(
  p_endpoint text, p_p256dh text, p_auth text, p_capability text
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE affected integer;
BEGIN
  IF p_capability IS NULL OR p_capability !~ '^[a-f0-9]{64}$'
    OR p_endpoint IS NULL OR char_length(p_endpoint) > 4096
    OR p_endpoint !~ '^https://(fcm\.googleapis\.com|updates\.push\.services\.mozilla\.com|web\.push\.apple\.com|[a-z0-9-]+\.notify\.windows\.com)/[^[:space:]]+$'
    OR p_p256dh IS NULL OR p_p256dh !~ '^[A-Za-z0-9_-]{80,100}={0,2}$'
    OR p_auth IS NULL OR p_auth !~ '^[A-Za-z0-9_-]{20,30}={0,2}$' THEN
    RAISE EXCEPTION 'Assinatura push inválida' USING ERRCODE = '22023';
  END IF;
  INSERT INTO public.push_subscriptions (endpoint,p256dh,auth,user_id,capability_hash)
    VALUES (p_endpoint,p_p256dh,p_auth,auth.uid(),
      pg_catalog.encode(extensions.digest(p_capability,'sha256'),'hex'))
    ON CONFLICT (endpoint) DO UPDATE SET
      p256dh = EXCLUDED.p256dh, auth = EXCLUDED.auth, user_id = EXCLUDED.user_id
    WHERE public.push_subscriptions.capability_hash = EXCLUDED.capability_hash;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN
    RAISE EXCEPTION 'Assinatura pertence a outro navegador' USING ERRCODE = '42501';
  END IF;
END;
$$;
CREATE OR REPLACE FUNCTION public.unregister_push_subscription(p_endpoint text,p_capability text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE affected integer;
BEGIN
  IF p_capability IS NULL OR p_capability !~ '^[a-f0-9]{64}$' THEN
    RAISE EXCEPTION 'Credencial push inválida' USING ERRCODE = '22023';
  END IF;
  DELETE FROM public.push_subscriptions
    WHERE endpoint = p_endpoint AND capability_hash =
      pg_catalog.encode(extensions.digest(p_capability,'sha256'),'hex');
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected = 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.lock_role_changes()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role
    AND current_user NOT IN ('postgres','supabase_admin','service_role') THEN
    RAISE EXCEPTION 'Alteração de cargo exige administração autorizada'
      USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;
ALTER FUNCTION public.handle_new_user() SET search_path = '';
ALTER FUNCTION public.delete_my_account() SET search_path = '';
REVOKE EXECUTE ON FUNCTION public.delete_my_account() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_my_account() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user(), public.lock_role_changes(),
  public.lock_inscricao_author(), public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.register_push_subscription(text,text,text,text),
  public.unregister_push_subscription(text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.register_push_subscription(text,text,text,text),
  public.unregister_push_subscription(text,text) TO anon, authenticated;

REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM PUBLIC, anon, authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL ON TABLES FROM PUBLIC, anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL ON SEQUENCES FROM PUBLIC, anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE EXECUTE ON FUNCTIONS FROM anon, authenticated;
-- supabase_admin defaults are managed by the platform; postgres is not a member.
-- Explicit grants/RLS remain mandatory for objects created under that owner.

NOTIFY pgrst, 'reload schema';
