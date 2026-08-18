-- =============================================================================
-- CFM MAMOBALL — SCHEMA COMPLETO
-- =============================================================================
-- Este arquivo é a fonte de verdade do banco de dados.
-- Para aplicar em um projeto novo: cole tudo no SQL Editor do Supabase.
-- Última revisão: 2026-07-26 (resincronizado com as migrações aplicadas em produção)
-- =============================================================================


-- =============================================================================
-- SEÇÃO 1 — TABELAS PRINCIPAIS
-- =============================================================================

-- Clubes participantes do campeonato
CREATE TABLE IF NOT EXISTS clubs (
  id          text PRIMARY KEY,              -- slug único, ex: "flamengo-cfm"
  nome        text NOT NULL,
  tag         text NOT NULL,                 -- abreviação, ex: "FLA"
  color       text NOT NULL DEFAULT '#666666',
  color2      text NOT NULL DEFAULT '#ffffff',
  logo_url    text,
  created_at  timestamptz DEFAULT now()
);

-- Competições (torneios, ligas, copas)
CREATE TABLE IF NOT EXISTS competitions (
  id              text PRIMARY KEY,          -- slug único, ex: "serie-a-2026"
  nome            text NOT NULL,
  edicao          text NOT NULL,             -- ex: "2026", "1ª Edição"
  status          text NOT NULL DEFAULT 'planejado'
                  CHECK (status IN ('planejado', 'inscricoes', 'em_andamento', 'encerrado')),
  rodada_atual    int  NOT NULL DEFAULT 0,
  total_rodadas   int  NOT NULL DEFAULT 22,
  created_at      timestamptz DEFAULT now()
);

-- Jogadores (elenco dos clubes)
CREATE TABLE IF NOT EXISTS players (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id     text NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  nick        text NOT NULL,
  game_id     text NOT NULL UNIQUE,          -- ID no jogo (MamoBall) — único no sistema, previne multi-clube
  discord     text,                          -- ID numérico do Discord (apenas números)
  posicao     text CHECK (posicao IS NULL OR posicao IN ('GK', 'VL', 'PV/ATK', 'MC')),
  is_captain  boolean NOT NULL DEFAULT false,
  created_at  timestamptz DEFAULT now()
);


-- =============================================================================
-- SEÇÃO 2 — TABELAS PIVOT (relacionamentos N:N)
-- =============================================================================

-- Clubes inscritos em cada competição
CREATE TABLE IF NOT EXISTS club_competitions (
  club_id         text NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  competition_id  text NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  PRIMARY KEY (club_id, competition_id)
);

-- Jogadores inscritos em cada competição (auto-populado via trigger ou admin)
CREATE TABLE IF NOT EXISTS player_competitions (
  player_id       uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  competition_id  text NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  PRIMARY KEY (player_id, competition_id)
);


-- =============================================================================
-- SEÇÃO 3 — DADOS DE PARTIDAS
-- =============================================================================

-- Partidas agendadas e finalizadas
-- OBS: o status 'ao_vivo' existe no CHECK por compatibilidade futura (placar em
-- tempo real), mas nada no app hoje lê ou escreve esse valor — é enum morto até
-- essa feature ser implementada de verdade.
CREATE TABLE IF NOT EXISTS matches (
  id              bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  competition_id  text NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  home_id         text NOT NULL REFERENCES clubs(id),
  away_id         text NOT NULL REFERENCES clubs(id),
  score_h         int,                       -- NULL se ainda não finalizado
  score_a         int,
  status          text NOT NULL DEFAULT 'agendado'
                  CHECK (status IN ('agendado', 'ao_vivo', 'finalizado')),
  rodada          int  NOT NULL,
  date_str        text NOT NULL,             -- ex: "28/05/2026 às 21:00"
  stage           text NOT NULL,             -- ex: "Fase de Grupos", "Final"
  home_scorers    jsonb NOT NULL DEFAULT '[]'::jsonb, -- [{nick, own_goal?, assist?}] goleadores do time da casa
  away_scorers    jsonb NOT NULL DEFAULT '[]'::jsonb, -- [{nick, own_goal?, assist?}] goleadores do visitante
  is_wo           boolean DEFAULT false,     -- walkover (vitória administrativa)
  created_at      timestamptz DEFAULT now(),
  finalized_at    timestamptz,               -- quando o resultado foi lançado (distinto de created_at = agendamento)
  scheduled_at    timestamptz                -- data+hora real da partida, pra ordenar entre competições diferentes
);

-- Classificação por competição (calculada e armazenada pelo admin)
CREATE TABLE IF NOT EXISTS standings (
  id              bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  competition_id  text NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  club_id         text NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  j               int NOT NULL DEFAULT 0,    -- jogos
  v               int NOT NULL DEFAULT 0,    -- vitórias
  e               int NOT NULL DEFAULT 0,    -- empates
  d               int NOT NULL DEFAULT 0,    -- derrotas
  gp              int NOT NULL DEFAULT 0,    -- gols pró
  gc              int NOT NULL DEFAULT 0,    -- gols contra
  sg              int NOT NULL DEFAULT 0,    -- saldo de gols
  p               int NOT NULL DEFAULT 0,    -- pontos
  form            text[] NOT NULL DEFAULT '{}', -- últimos 5: 'V','E','D'
  UNIQUE (competition_id, club_id)
);

-- Artilheiros e assistências por competição
CREATE TABLE IF NOT EXISTS scorers (
  id              bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  competition_id  text NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  club_id         text NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  nick            text NOT NULL,
  game_id         text,                      -- ID do jogo do artilheiro — exibido como selo abaixo do nick
  goals           int  NOT NULL DEFAULT 0,
  assists         int  NOT NULL DEFAULT 0,
  jogos           int  NOT NULL DEFAULT 0,
  UNIQUE (competition_id, nick)
);


-- =============================================================================
-- SEÇÃO 4 — CONTEÚDO E APP
-- =============================================================================

-- Notícias e artigos publicados
CREATE TABLE IF NOT EXISTS news (
  id          text PRIMARY KEY DEFAULT (gen_random_uuid())::text,
  title       text NOT NULL,
  excerpt     text NOT NULL DEFAULT '',
  body        text NOT NULL DEFAULT '',      -- corpo completo do artigo (parágrafos separados por \n\n)
  tag         text NOT NULL DEFAULT 'Liga',  -- ex: "Transferências", "Resultados"
  date_str    text NOT NULL,
  read_time   text NOT NULL DEFAULT '3 min',
  author      text NOT NULL DEFAULT 'Redação CFM',
  img         text NOT NULL DEFAULT '',
  published   boolean NOT NULL DEFAULT true,
  created_at  timestamptz DEFAULT now(),
  category      text NOT NULL DEFAULT 'noticia' CHECK (category IN ('noticia','inscricoes','comunicado','resultado')),
  match_id      bigint REFERENCES matches(id) ON DELETE SET NULL,       -- category='resultado': partida exibida no card
  competition_id text REFERENCES competitions(id) ON DELETE SET NULL    -- category='inscricoes': competição do card de inscrição
);

-- Favoritos, salvos e preferências de notificação do usuário — chave livre com
-- prefixo por tipo: "club:<id>" (clube favorito), "notif:<id>" (notificação
-- ativada), tudo o mais é "salvo" (notícia/partida/artigo).
CREATE TABLE IF NOT EXISTS bookmarks (
  id          bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key         text NOT NULL,                 -- ex: "news:uuid", "match:123", "club:x", "notif:y"
  created_at  timestamptz DEFAULT now(),
  UNIQUE (user_id, key)
);

-- Formulário de inscrição de times (fluxo pendente → aprovado/recusado)
CREATE TABLE IF NOT EXISTS inscricoes (
  id              bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  competition_id  text NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  nome            text NOT NULL,             -- nome do clube candidato
  tag             text NOT NULL,
  capitao         text NOT NULL,             -- nick do capitão
  capitao_game_id text NOT NULL DEFAULT '',  -- ID do jogo do capitão
  capitao_discord text NOT NULL DEFAULT '',  -- discord do capitão
  roster          text NOT NULL DEFAULT '',  -- legado — lista de jogadores em texto livre
  jogadores       jsonb NOT NULL DEFAULT '[]'::jsonb, -- [{nick, game_id, discord, posicao}] — ainda sem club_id, time não existe
  status          text NOT NULL DEFAULT 'pendente'
                  CHECK (status IN ('pendente', 'aprovado', 'recusado')),
  created_at      timestamptz DEFAULT now(),
  reviewed_at     timestamptz                -- quando o staff aprovou/recusou (distinto de created_at = envio)
);

-- Inscrições de push notification do navegador (Web Push, VAPID) — usada por
-- lib/push.ts (cliente) e app/api/notify/route.ts (broadcast do staff).
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  endpoint    text NOT NULL UNIQUE,
  p256dh      text NOT NULL,
  auth        text NOT NULL,
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL = inscrição de visitante
  created_at  timestamptz DEFAULT now()
);


-- =============================================================================
-- SEÇÃO 5 — AUTENTICAÇÃO / PERFIS
-- =============================================================================

-- Perfil de usuário (criado automaticamente ao cadastrar no Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nick        text,
  role        text NOT NULL DEFAULT 'torcedor'
              CHECK (role IN ('torcedor', 'jogador', 'staff')),
  created_at  timestamptz DEFAULT now()
);


-- =============================================================================
-- SEÇÃO 6 — INDEXES DE PERFORMANCE
-- =============================================================================

-- Queries mais comuns do app (filtrar por competição, clube, usuário)
CREATE INDEX IF NOT EXISTS idx_matches_competition    ON matches(competition_id);
CREATE INDEX IF NOT EXISTS idx_matches_home_away      ON matches(home_id, away_id);
CREATE INDEX IF NOT EXISTS idx_standings_competition  ON standings(competition_id);
CREATE INDEX IF NOT EXISTS idx_scorers_competition    ON scorers(competition_id);
CREATE INDEX IF NOT EXISTS idx_players_club           ON players(club_id);
CREATE INDEX IF NOT EXISTS idx_news_published         ON news(published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inscricoes_comp        ON inscricoes(competition_id, status);
CREATE INDEX IF NOT EXISTS idx_matches_finalized_at   ON matches(finalized_at DESC) WHERE finalized_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_matches_scheduled_at   ON matches(scheduled_at)      WHERE scheduled_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_inscricoes_reviewed_at ON inscricoes(reviewed_at DESC) WHERE reviewed_at IS NOT NULL;


-- =============================================================================
-- SEÇÃO 7 — ROW LEVEL SECURITY (RLS)
-- =============================================================================
-- Modelo de acesso:
--   anon        → leitura pública (SELECT)
--   authenticated (torcedor/jogador) → leitura + atualizar próprio perfil
--   authenticated (staff) → leitura + escrita em tudo
--   SQL Editor (sem JWT) → acesso total (para o DBA / superadmin)

ALTER TABLE clubs              ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE players            ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_competitions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches            ENABLE ROW LEVEL SECURITY;
ALTER TABLE standings          ENABLE ROW LEVEL SECURITY;
ALTER TABLE scorers            ENABLE ROW LEVEL SECURITY;
ALTER TABLE news               ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks          ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscricoes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- FORCE RLS impede que o owner da tabela (postgres) bypasse as policies
ALTER TABLE clubs              FORCE ROW LEVEL SECURITY;
ALTER TABLE competitions       FORCE ROW LEVEL SECURITY;
ALTER TABLE players            FORCE ROW LEVEL SECURITY;
ALTER TABLE club_competitions  FORCE ROW LEVEL SECURITY;
ALTER TABLE player_competitions FORCE ROW LEVEL SECURITY;
ALTER TABLE matches            FORCE ROW LEVEL SECURITY;
ALTER TABLE standings          FORCE ROW LEVEL SECURITY;
ALTER TABLE scorers            FORCE ROW LEVEL SECURITY;
ALTER TABLE news               FORCE ROW LEVEL SECURITY;
ALTER TABLE bookmarks          FORCE ROW LEVEL SECURITY;
ALTER TABLE inscricoes         FORCE ROW LEVEL SECURITY;
ALTER TABLE profiles           FORCE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions FORCE ROW LEVEL SECURITY;

-- -------------------------------------------------------
-- Leitura pública (qualquer um, inclusive não autenticado)
-- -------------------------------------------------------
DROP POLICY IF EXISTS "public read clubs"             ON clubs;
DROP POLICY IF EXISTS "public read competitions"      ON competitions;
DROP POLICY IF EXISTS "public read players"           ON players;
DROP POLICY IF EXISTS "public read club_competitions" ON club_competitions;
DROP POLICY IF EXISTS "public read matches"           ON matches;
DROP POLICY IF EXISTS "public read standings"         ON standings;
DROP POLICY IF EXISTS "public read scorers"           ON scorers;
DROP POLICY IF EXISTS "public read news"              ON news;

CREATE POLICY "public read clubs"             ON clubs             FOR SELECT USING (true);
CREATE POLICY "public read competitions"      ON competitions       FOR SELECT USING (true);
CREATE POLICY "public read players"           ON players            FOR SELECT USING (true);
CREATE POLICY "public read club_competitions" ON club_competitions  FOR SELECT USING (true);
CREATE POLICY "public read matches"           ON matches            FOR SELECT USING (true);
CREATE POLICY "public read standings"         ON standings          FOR SELECT USING (true);
CREATE POLICY "public read scorers"           ON scorers            FOR SELECT USING (true);
CREATE POLICY "public read news"              ON news               FOR SELECT USING (published = true);

-- -------------------------------------------------------
-- Staff: escrita completa (INSERT / UPDATE / DELETE)
-- -------------------------------------------------------
DROP POLICY IF EXISTS "staff manage clubs"               ON clubs;
DROP POLICY IF EXISTS "staff manage competitions"        ON competitions;
DROP POLICY IF EXISTS "staff manage players"             ON players;
DROP POLICY IF EXISTS "staff manage club_competitions"   ON club_competitions;
DROP POLICY IF EXISTS "staff manage player_competitions" ON player_competitions;
DROP POLICY IF EXISTS "staff manage matches"             ON matches;
DROP POLICY IF EXISTS "staff manage standings"           ON standings;
DROP POLICY IF EXISTS "staff manage scorers"             ON scorers;
DROP POLICY IF EXISTS "staff manage news"                ON news;
DROP POLICY IF EXISTS "staff manage inscricoes"          ON inscricoes;

CREATE POLICY "staff manage clubs"             ON clubs             FOR ALL TO authenticated
  USING      ((SELECT role FROM profiles WHERE id = auth.uid()) = 'staff')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'staff');

CREATE POLICY "staff manage competitions"      ON competitions       FOR ALL TO authenticated
  USING      ((SELECT role FROM profiles WHERE id = auth.uid()) = 'staff')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'staff');

CREATE POLICY "staff manage players"           ON players            FOR ALL TO authenticated
  USING      ((SELECT role FROM profiles WHERE id = auth.uid()) = 'staff')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'staff');

CREATE POLICY "staff manage club_competitions" ON club_competitions  FOR ALL TO authenticated
  USING      ((SELECT role FROM profiles WHERE id = auth.uid()) = 'staff')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'staff');

CREATE POLICY "staff manage player_competitions" ON player_competitions FOR ALL TO authenticated
  USING      ((SELECT role FROM profiles WHERE id = auth.uid()) = 'staff')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'staff');

CREATE POLICY "staff manage matches"           ON matches            FOR ALL TO authenticated
  USING      ((SELECT role FROM profiles WHERE id = auth.uid()) = 'staff')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'staff');

CREATE POLICY "staff manage standings"         ON standings          FOR ALL TO authenticated
  USING      ((SELECT role FROM profiles WHERE id = auth.uid()) = 'staff')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'staff');

CREATE POLICY "staff manage scorers"           ON scorers            FOR ALL TO authenticated
  USING      ((SELECT role FROM profiles WHERE id = auth.uid()) = 'staff')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'staff');

CREATE POLICY "staff manage news"              ON news               FOR ALL TO authenticated
  USING      ((SELECT role FROM profiles WHERE id = auth.uid()) = 'staff')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'staff');

CREATE POLICY "staff manage inscricoes"        ON inscricoes         FOR ALL TO authenticated
  USING      ((SELECT role FROM profiles WHERE id = auth.uid()) = 'staff')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'staff');

-- -------------------------------------------------------
-- Inscrições: qualquer usuário autenticado pode enviar, mas só com status 'pendente'
-- (impede burlar a triagem do staff enviando status='aprovado' no body)
-- -------------------------------------------------------
DROP POLICY IF EXISTS "authenticated submit inscricao" ON inscricoes;

CREATE POLICY "authenticated submit inscricao" ON inscricoes FOR INSERT TO authenticated
  WITH CHECK (status = 'pendente');

-- -------------------------------------------------------
-- Bookmarks: usuário gerencia apenas os próprios
-- -------------------------------------------------------
DROP POLICY IF EXISTS "user manage own bookmarks" ON bookmarks;

CREATE POLICY "user manage own bookmarks" ON bookmarks FOR ALL TO authenticated
  USING      (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- -------------------------------------------------------
-- Profiles: acesso restrito
-- -------------------------------------------------------
-- Qualquer usuário autenticado pode ler profiles (nick é dado público do jogo).
-- anon NÃO tem acesso (ver Seção 9 — profiles não está na lista de grants do anon).
DROP POLICY IF EXISTS "allow authenticated read profiles" ON profiles;
DROP POLICY IF EXISTS "user update own profile"           ON profiles;
DROP POLICY IF EXISTS "superadmin manage profiles"        ON profiles;

CREATE POLICY "allow authenticated read profiles" ON profiles FOR SELECT TO authenticated
  USING (true);

-- Usuário atualiza o próprio perfil.
-- O campo role é imutável via trigger (lock_role_changes), então não precisamos
-- de subquery aqui — evita risco de recursão infinita.
CREATE POLICY "user update own profile" ON profiles FOR UPDATE TO authenticated
  USING  (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Apenas o SQL Editor (sem JWT) pode criar/promover/rebaixar perfis
CREATE POLICY "superadmin manage profiles" ON profiles FOR ALL
  USING      (auth.jwt() IS NULL)
  WITH CHECK (auth.jwt() IS NULL);

-- -------------------------------------------------------
-- Push subscriptions: qualquer um pode se inscrever/desinscrever pelo endpoint
-- (não exige login — notificações são por navegador, não por conta), mas só
-- staff pode LER a lista completa (necessário pra disparar o broadcast).
-- -------------------------------------------------------
DROP POLICY IF EXISTS "anyone can subscribe"                       ON push_subscriptions;
DROP POLICY IF EXISTS "anyone can update own subscription by endpoint" ON push_subscriptions;
DROP POLICY IF EXISTS "anyone can unsubscribe by endpoint"         ON push_subscriptions;
DROP POLICY IF EXISTS "staff can read subscriptions to broadcast"  ON push_subscriptions;

CREATE POLICY "anyone can subscribe" ON push_subscriptions FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "anyone can update own subscription by endpoint" ON push_subscriptions FOR UPDATE TO anon, authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "anyone can unsubscribe by endpoint" ON push_subscriptions FOR DELETE TO anon, authenticated
  USING (true);

CREATE POLICY "staff can read subscriptions to broadcast" ON push_subscriptions FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'staff'));


-- =============================================================================
-- SEÇÃO 8 — TRIGGERS E FUNÇÕES
-- =============================================================================

-- Impede que qualquer UPDATE via API altere o campo `role` em profiles.
-- Mesmo que a policy do RLS já bloqueie, este trigger é uma segunda camada.
CREATE OR REPLACE FUNCTION lock_role_changes()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF auth.jwt() IS NOT NULL THEN
      RAISE EXCEPTION 'Alteração de cargo não permitida via API. Use o SQL Editor do Supabase.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER enforce_role_lock
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION lock_role_changes();

-- Cria automaticamente um perfil na tabela `profiles` quando um usuário
-- se cadastra pelo Supabase Auth.
-- IMPORTANTE: SET search_path = public é obrigatório — sem isso o trigger
-- roda no contexto do schema auth e não encontra a tabela profiles.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nick, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'nick', 'torcedor')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Permite ao usuário autenticado excluir a própria conta (LGPD)
-- Cascateia para profiles e bookmarks automaticamente (ON DELETE CASCADE)
CREATE OR REPLACE FUNCTION public.delete_my_account()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Não autenticado'; END IF;
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;
GRANT EXECUTE ON FUNCTION public.delete_my_account() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_my_account() FROM anon;

-- OBS: Este trigger fica no schema auth, então precisa ser criado manualmente
-- no SQL Editor (não pode ser feito via migrations normais do Supabase CLI):
--
-- CREATE OR REPLACE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- -----------------------------------------------------------------------------
-- UPGRADE FUTURO (opcional, para escala):
-- As policies de staff usam (SELECT role FROM profiles WHERE id = auth.uid()).
-- Isso funciona bem para projetos pequenos. Se o app crescer muito, o ideal é
-- gravar o role no app_metadata do JWT para evitar subquery por linha:
--
--   CREATE OR REPLACE FUNCTION sync_role_to_app_metadata()
--   RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
--   BEGIN
--     UPDATE auth.users
--     SET raw_app_meta_data = raw_app_meta_data || jsonb_build_object('role', NEW.role)
--     WHERE id = NEW.id;
--     RETURN NEW;
--   END;
--   $$;
--
--   CREATE TRIGGER sync_role_on_change
--     AFTER UPDATE OF role ON profiles
--     FOR EACH ROW EXECUTE FUNCTION sync_role_to_app_metadata();
--
-- Aí as policies virariam:
--   USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'staff')
--
-- ATENÇÃO: o JWT é gerado no login (~1h de validade). Mudanças de role
-- só refletem no JWT após o usuário re-logar. A abordagem atual com subquery
-- é imediata e preferível para poucos admins.
-- -----------------------------------------------------------------------------


-- =============================================================================
-- SEÇÃO 9 — GRANTS (permissões mínimas por role)
-- =============================================================================
-- anon: só leitura nas tabelas públicas (mais INSERT/UPDATE/DELETE em
-- push_subscriptions, que aceita inscrição sem login)
GRANT SELECT ON clubs, competitions, players, club_competitions,
               player_competitions, matches, standings, scorers, news
TO anon;

GRANT INSERT, UPDATE, DELETE ON push_subscriptions TO anon;

-- authenticated: leitura em tudo + escrita (o RLS acima é quem de fato decide
-- se a escrita é permitida — GRANT sozinho não basta pra passar pela FORCE RLS,
-- então dar INSERT/UPDATE/DELETE aqui pra todo mundo autenticado é seguro: só
-- quem bate na policy de staff (ou é dono da própria linha) consegue de verdade)
GRANT SELECT, INSERT, UPDATE, DELETE ON clubs, competitions, players,
               club_competitions, player_competitions, matches, standings,
               scorers, news
TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON bookmarks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON inscricoes TO authenticated;
GRANT SELECT, UPDATE ON profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON push_subscriptions TO authenticated;


-- OBSERVAÇÃO (agora corrigido): o banco de produção tinha
-- GRANT INSERT/UPDATE/DELETE de `anon` em bookmarks/inscricoes/news/
-- player_competitions, mais amplo do que o necessário (provavelmente de um
-- GRANT ALL rodado uma vez durante desenvolvimento). Não era uma falha de
-- segurança ativa — o RLS com FORCE ainda bloqueava porque não há nenhuma
-- policy que libere `anon` pra escrever nessas tabelas — mas o REVOKE abaixo
-- mantém o princípio do menor privilégio também no GRANT.
REVOKE INSERT, UPDATE, DELETE ON bookmarks, inscricoes, news, player_competitions FROM anon;


-- =============================================================================
-- FIM DO SCHEMA
-- =============================================================================
