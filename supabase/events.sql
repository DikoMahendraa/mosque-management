-- Create events table
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  event_date date NOT NULL,
  location text NOT NULL,
  poster text DEFAULT '',
  status text NOT NULL DEFAULT 'upcoming'
    CHECK (status IN ('upcoming', 'finished')),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Auto-update updated_at
CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Enable Row Level Security
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Public can read events"
  ON public.events FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert events"
  ON public.events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update events"
  ON public.events FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete events"
  ON public.events FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Optional: Seed sample data
INSERT INTO public.events (title, description, event_date, location, poster, status)
VALUES
  (
    'Tabligh Akbar Milad Masjid ke-39',
    '<p>Peringatan ulang tahun Masjid Darussalam ke-39 dengan berbagai kegiatan.</p>',
    '2024-03-20',
    'Halaman Masjid Darussalam',
    'https://images.unsplash.com/photo-1564769610726-59cead6a6f8f?w=600',
    'upcoming'
  ),
  (
    'Isra Miraj 1445 H',
    '<p>Peringatan Isra dan Miraj Nabi Muhammad SAW 1445 H.</p>',
    '2024-02-08',
    'Masjid Darussalam – Ruang Utama',
    'https://images.unsplash.com/photo-1564769610726-59cead6a6f8f?w=600',
    'finished'
  );
