-- =============================================================================
-- CFM MAMOBALL — SCHEMA COMPLETO
-- =============================================================================
-- Este arquivo é a fonte de verdade do banco de dados.
-- Para aplicar em um projeto novo: cole tudo no SQL Editor do Supabase.
-- Última revisão: 2026-05-28
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
  game_id     text NOT NULL UNIQUE,          -- ID no jogo (MamoBall) — único no sistema, previne multi
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
  created_at      timestamptz DEFAULT now()
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

-- Favoritos do usuário (notícias, partidas, etc.)
CREATE TABLE IF NOT EXISTS bookmarks (
  id          bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key         text NOT NULL,                 -- ex: "news:uuid" ou "match:123"
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
  created_at      timestamptz DEFAULT now()
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
-- O campo role é imutável via trigger (enforce_role_lock), então não precisamos
-- de subquery aqui — evita risco de recursão infinita.
CREATE POLICY "user update own profile" ON profiles FOR UPDATE TO authenticated
  USING  (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Apenas o SQL Editor (sem JWT) pode criar/promover/rebaixar perfis
CREATE POLICY "superadmin manage profiles" ON profiles FOR ALL
  USING      (auth.jwt() IS NULL)
  WITH CHECK (auth.jwt() IS NULL);


-- =============================================================================
-- SEÇÃO 8 — TRIGGERS E FUNÇÕES
-- =============================================================================

-- Impede que qualquer UPDATE via API altere o campo `role` em profiles.
-- Mesmo que a policy do RLS já bloqueie, este trigger é uma segunda camada.
CREATE OR REPLACE FUNCTION enforce_role_immutable()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.role <> OLD.role AND auth.jwt() IS NOT NULL THEN
    RAISE EXCEPTION 'role cannot be changed via API';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER enforce_role_lock
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION enforce_role_immutable();

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
-- anon: só leitura nas tabelas públicas
GRANT SELECT ON clubs, competitions, players, club_competitions,
               player_competitions, matches, standings, scorers, news
TO anon;

-- authenticated: leitura em tudo + INSERT em inscricoes e bookmarks
GRANT SELECT ON clubs, competitions, players, club_competitions,
               player_competitions, matches, standings, scorers, news
TO authenticated;

GRANT SELECT, INSERT, DELETE ON bookmarks TO authenticated;
GRANT INSERT ON inscricoes TO authenticated;
GRANT SELECT, UPDATE ON profiles TO authenticated;

-- Staff recebe escrita via RLS policy (não via GRANT direto)
-- Isso garante que mesmo com o grant, o RLS ainda verifica o role


-- =============================================================================
-- FIM DO SCHEMA
-- =============================================================================
