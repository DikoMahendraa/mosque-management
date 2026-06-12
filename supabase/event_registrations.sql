-- Event registrations (linked from landing page via events.id)
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id   UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  address    TEXT NOT NULL,
  age        INTEGER NOT NULL CHECK (age > 0 AND age < 150),
  phone      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id
  ON public.event_registrations(event_id);

ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_insert_event_registrations"
  ON public.event_registrations FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "public_read_event_registrations"
  ON public.event_registrations FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "auth_manage_event_registrations"
  ON public.event_registrations FOR ALL
  TO authenticated
  USING (auth.role() = 'authenticated');

GRANT SELECT, INSERT ON public.event_registrations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_registrations TO authenticated;
