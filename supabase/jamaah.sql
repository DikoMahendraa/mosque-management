-- Create jamaah table
CREATE TABLE public.jamaah (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama text NOT NULL,
  nomor_whatsapp text NOT NULL,
  alamat text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'jamaah_tetap'
    CHECK (status IN ('jamaah_tetap', 'musafir', 'donatur')),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_jamaah_whatsapp UNIQUE (nomor_whatsapp)
);

-- Auto-update updated_at
CREATE TRIGGER jamaah_updated_at
  BEFORE UPDATE ON public.jamaah
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Enable Row Level Security
ALTER TABLE public.jamaah ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Public can read jamaah"
  ON public.jamaah FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert jamaah"
  ON public.jamaah FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update jamaah"
  ON public.jamaah FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete jamaah"
  ON public.jamaah FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Optional: Seed sample data
INSERT INTO public.jamaah (nama, nomor_whatsapp, alamat)
VALUES
  (
    'Bapak Abdullah Rahman',
    '082345678901',
    'Jl. Pemuda No. 12, Jakarta Pusat'
  ),
  (
    'Ibu Siti Aisyah',
    '082345678902',
    'Jl. Kenanga No. 78, Jakarta Barat'
  ),
  (
    'Bapak Umar Khattab',
    '082345678903',
    'Jl. Melati No. 34, Jakarta Selatan'
  );
