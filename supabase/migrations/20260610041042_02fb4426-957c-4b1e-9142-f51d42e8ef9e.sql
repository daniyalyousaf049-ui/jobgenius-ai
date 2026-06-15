
CREATE TABLE public.skillpasses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL,
  overall_score integer NOT NULL,
  stage_scores jsonb NOT NULL DEFAULT '[]'::jsonb,
  passed boolean NOT NULL,
  slug text UNIQUE,
  published boolean NOT NULL DEFAULT false,
  open_to_work boolean NOT NULL DEFAULT false,
  display_name text,
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '1 year'),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.skillpasses TO authenticated;
GRANT SELECT ON public.skillpasses TO anon;
GRANT ALL ON public.skillpasses TO service_role;

ALTER TABLE public.skillpasses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage own skillpasses"
  ON public.skillpasses FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view published skillpasses"
  ON public.skillpasses FOR SELECT
  USING (published = true);

CREATE INDEX skillpasses_user_id_idx ON public.skillpasses(user_id);
CREATE INDEX skillpasses_slug_idx ON public.skillpasses(slug) WHERE published = true;

CREATE TRIGGER skillpasses_updated_at
  BEFORE UPDATE ON public.skillpasses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
