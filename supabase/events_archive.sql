-- Add archive support for events (soft-hide outdated entries)
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS is_archived boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_events_is_archived
  ON public.events (is_archived);
