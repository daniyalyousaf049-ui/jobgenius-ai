-- Add gamification fields to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS xp integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS current_streak integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS best_streak integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_interview_at timestamptz;

-- Allow authenticated users to read display_name + xp for the leaderboard.
-- (RLS still scopes write/update to owner via existing policies.)
DROP POLICY IF EXISTS "Leaderboard is viewable by authenticated" ON public.profiles;
CREATE POLICY "Leaderboard is viewable by authenticated"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Helpful index for leaderboard ordering
CREATE INDEX IF NOT EXISTS profiles_xp_idx ON public.profiles (xp DESC);