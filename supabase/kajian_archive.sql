-- Add archive support for kajian (soft-hide outdated entries)
ALTER TABLE public.kajian
  ADD COLUMN IF NOT EXISTS is_archived boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_kajian_is_archived
  ON public.kajian (is_archived);
