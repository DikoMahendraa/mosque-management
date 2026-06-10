-- Create mosque_admins table
CREATE TABLE public.mosque_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  position text NOT NULL,
  phone text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  photo text DEFAULT '',
  period_start date NOT NULL,
  period_end date NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Auto-update updated_at
CREATE TRIGGER mosque_admins_updated_at
  BEFORE UPDATE ON public.mosque_admins
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Enable Row Level Security
ALTER TABLE public.mosque_admins ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Public can read mosque_admins"
  ON public.mosque_admins FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert mosque_admins"
  ON public.mosque_admins FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update mosque_admins"
  ON public.mosque_admins FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete mosque_admins"
  ON public.mosque_admins FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Optional: Seed sample data
INSERT INTO public.mosque_admins (name, position, phone, email, photo, period_start, period_end)
VALUES
  (
    'H. Abdullah Mukhtar, S.E.',
    'Ketua DKM',
    '0812-1234-5678',
    'abdullah@darussalam.or.id',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    '2022-01-01',
    '2025-12-31'
  ),
  (
    'Ir. Ahmad Syukri',
    'Wakil Ketua',
    '0813-2345-6789',
    'ahmad.syukri@darussalam.or.id',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    '2022-01-01',
    '2025-12-31'
  ),
  (
    'Muhammad Ridwan, S.Ag.',
    'Sekretaris',
    '0814-3456-7890',
    'ridwan@darussalam.or.id',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200',
    '2022-01-01',
    '2025-12-31'
  );
