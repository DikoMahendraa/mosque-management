-- Donation campaigns linked to kajian (and optionally event/standalone later)
CREATE TABLE IF NOT EXISTS public.donation_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  reference_type text NOT NULL DEFAULT 'kajian'
    CHECK (reference_type IN ('standalone', 'event', 'kajian')),
  reference_id uuid,
  target_amount numeric(15, 2) NOT NULL DEFAULT 0 CHECK (target_amount >= 0),
  collected_amount numeric(15, 2) NOT NULL DEFAULT 0 CHECK (collected_amount >= 0),
  start_date date,
  end_date date,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('draft', 'active', 'completed', 'closed')),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT donation_campaigns_date_range CHECK (
    start_date IS NULL OR end_date IS NULL OR end_date >= start_date
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS donation_campaigns_kajian_unique
  ON public.donation_campaigns (reference_id)
  WHERE reference_type = 'kajian' AND reference_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_donation_campaigns_reference
  ON public.donation_campaigns (reference_type, reference_id);

CREATE TRIGGER donation_campaigns_updated_at
  BEFORE UPDATE ON public.donation_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.donation_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active donation_campaigns"
  ON public.donation_campaigns FOR SELECT
  USING (status = 'active');

CREATE POLICY "Authenticated can read all donation_campaigns"
  ON public.donation_campaigns FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can insert donation_campaigns"
  ON public.donation_campaigns FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update donation_campaigns"
  ON public.donation_campaigns FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can delete donation_campaigns"
  ON public.donation_campaigns FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

GRANT SELECT ON public.donation_campaigns TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.donation_campaigns TO authenticated;
