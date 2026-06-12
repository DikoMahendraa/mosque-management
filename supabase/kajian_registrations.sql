-- Kajian registrations (linked from landing page via kajian.id)
CREATE TABLE IF NOT EXISTS public.kajian_registrations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kajian_id  UUID NOT NULL REFERENCES public.kajian(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  address    TEXT NOT NULL,
  age        INTEGER NOT NULL CHECK (age > 0 AND age < 150),
  phone      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kajian_registrations_kajian_id
  ON public.kajian_registrations(kajian_id);

ALTER TABLE public.kajian_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_insert_kajian_registrations"
  ON public.kajian_registrations FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "public_read_kajian_registrations"
  ON public.kajian_registrations FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "auth_manage_kajian_registrations"
  ON public.kajian_registrations FOR ALL
  TO authenticated
  USING (auth.role() = 'authenticated');

GRANT SELECT, INSERT ON public.kajian_registrations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kajian_registrations TO authenticated;
