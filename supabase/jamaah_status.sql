-- Add jamaah category/status: jamaah tetap, musafir, or donatur
ALTER TABLE public.jamaah
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'jamaah_tetap'
    CHECK (status IN ('jamaah_tetap', 'musafir', 'donatur'));

CREATE INDEX IF NOT EXISTS idx_jamaah_status
  ON public.jamaah (status);
