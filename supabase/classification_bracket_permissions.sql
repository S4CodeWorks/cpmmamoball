-- Restringe os privilégios automáticos do Supabase para a tabela pública nova.
-- A política RLS continua permitindo escrita somente para usuários staff.
REVOKE ALL PRIVILEGES ON public.competition_bracket_ties FROM anon;
REVOKE ALL PRIVILEGES ON public.competition_bracket_ties FROM authenticated;
GRANT SELECT ON public.competition_bracket_ties TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.competition_bracket_ties TO authenticated;

-- Índices das FKs de clubes e das origens, evitando buscas completas ao excluir.
CREATE INDEX IF NOT EXISTS idx_bracket_ties_home_club
  ON public.competition_bracket_ties(home_club_id);
CREATE INDEX IF NOT EXISTS idx_bracket_ties_away_club
  ON public.competition_bracket_ties(away_club_id);
CREATE INDEX IF NOT EXISTS idx_bracket_ties_home_source
  ON public.competition_bracket_ties(home_source_tie_id, competition_id);
CREATE INDEX IF NOT EXISTS idx_bracket_ties_away_source
  ON public.competition_bracket_ties(away_source_tie_id, competition_id);
