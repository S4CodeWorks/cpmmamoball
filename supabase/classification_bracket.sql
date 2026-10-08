-- Modelo aditivo da Classificação: formato da competição e vínculos explícitos da chave.
-- Competições existentes recebem 'league'; nenhum jogo ou resultado é alterado.
ALTER TABLE public.competitions
  ADD COLUMN IF NOT EXISTS classification_format text NOT NULL DEFAULT 'league';

ALTER TABLE public.competitions
  DROP CONSTRAINT IF EXISTS competitions_classification_format_check;
ALTER TABLE public.competitions
  ADD CONSTRAINT competitions_classification_format_check
  CHECK (classification_format IN ('league', 'knockout_single', 'knockout_two_leg'));

CREATE TABLE IF NOT EXISTS public.competition_bracket_ties (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id        text NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
  stage_order           int NOT NULL CHECK (stage_order > 0),
  stage_name            text NOT NULL CHECK (char_length(stage_name) BETWEEN 2 AND 48),
  tie_order             int NOT NULL CHECK (tie_order > 0),
  home_club_id          text REFERENCES public.clubs(id) ON DELETE RESTRICT,
  away_club_id          text REFERENCES public.clubs(id) ON DELETE RESTRICT,
  home_source_tie_id    uuid,
  away_source_tie_id    uuid,
  first_leg_match_id    bigint REFERENCES public.matches(id) ON DELETE SET NULL,
  second_leg_match_id   bigint REFERENCES public.matches(id) ON DELETE SET NULL,
  is_bye                boolean NOT NULL DEFAULT false,
  created_at            timestamptz NOT NULL DEFAULT now(),
  UNIQUE (competition_id, stage_order, tie_order),
  UNIQUE (id, competition_id),
  FOREIGN KEY (home_source_tie_id, competition_id)
    REFERENCES public.competition_bracket_ties(id, competition_id) ON DELETE RESTRICT,
  FOREIGN KEY (away_source_tie_id, competition_id)
    REFERENCES public.competition_bracket_ties(id, competition_id) ON DELETE RESTRICT,
  CHECK (first_leg_match_id IS DISTINCT FROM second_leg_match_id),
  CHECK (
    (NOT is_bye
      AND num_nonnulls(home_club_id, home_source_tie_id) = 1
      AND num_nonnulls(away_club_id, away_source_tie_id) = 1)
    OR
    (is_bye
      AND first_leg_match_id IS NULL AND second_leg_match_id IS NULL
      AND ((home_club_id IS NOT NULL AND home_source_tie_id IS NULL AND away_club_id IS NULL AND away_source_tie_id IS NULL)
        OR (away_club_id IS NOT NULL AND away_source_tie_id IS NULL AND home_club_id IS NULL AND home_source_tie_id IS NULL)))
  )
);

CREATE INDEX IF NOT EXISTS idx_bracket_ties_competition_stage
  ON public.competition_bracket_ties(competition_id, stage_order, tie_order);
CREATE UNIQUE INDEX IF NOT EXISTS idx_bracket_ties_first_match
  ON public.competition_bracket_ties(first_leg_match_id) WHERE first_leg_match_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_bracket_ties_second_match
  ON public.competition_bracket_ties(second_leg_match_id) WHERE second_leg_match_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bracket_ties_home_club
  ON public.competition_bracket_ties(home_club_id);
CREATE INDEX IF NOT EXISTS idx_bracket_ties_away_club
  ON public.competition_bracket_ties(away_club_id);
CREATE INDEX IF NOT EXISTS idx_bracket_ties_home_source
  ON public.competition_bracket_ties(home_source_tie_id, competition_id);
CREATE INDEX IF NOT EXISTS idx_bracket_ties_away_source
  ON public.competition_bracket_ties(away_source_tie_id, competition_id);

ALTER TABLE public.competition_bracket_ties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_bracket_ties FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read competition bracket" ON public.competition_bracket_ties;
DROP POLICY IF EXISTS "staff manage competition bracket" ON public.competition_bracket_ties;
CREATE POLICY "public read competition bracket" ON public.competition_bracket_ties
  FOR SELECT USING (true);
CREATE POLICY "staff manage competition bracket" ON public.competition_bracket_ties
  FOR ALL TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'staff')
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'staff');

REVOKE ALL PRIVILEGES ON public.competition_bracket_ties FROM anon;
REVOKE ALL PRIVILEGES ON public.competition_bracket_ties FROM authenticated;
GRANT SELECT ON public.competition_bracket_ties TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.competition_bracket_ties TO authenticated;
