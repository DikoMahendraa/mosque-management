-- Create ustad table
CREATE TABLE public.ustad (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama text NOT NULL,
  nomor_whatsapp text NOT NULL,
  alamat text NOT NULL DEFAULT '',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_ustad_whatsapp UNIQUE (nomor_whatsapp)
);

-- Auto-update updated_at
CREATE TRIGGER ustad_updated_at
  BEFORE UPDATE ON public.ustad
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Enable Row Level Security
ALTER TABLE public.ustad ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Public can read ustad"
  ON public.ustad FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert ustad"
  ON public.ustad FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update ustad"
  ON public.ustad FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete ustad"
  ON public.ustad FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Optional: Seed sample data
INSERT INTO public.ustad (nama, nomor_whatsapp, alamat)
VALUES
  (
    'Ustadz Ahmad Hidayat',
    '081234567890',
    'Jl. Masjid No. 123, Jakarta Selatan'
  ),
  (
    'Ustadz Muhammad Rizki',
    '081234567891',
    'Jl. Raya Bogor No. 45, Jakarta Timur'
  );
