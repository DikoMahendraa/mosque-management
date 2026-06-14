-- Public bucket for generated event poster images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-posters',
  'event-posters',
  true,
  5242880,
  ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read event posters"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'event-posters');

CREATE POLICY "Authenticated upload event posters"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'event-posters');

CREATE POLICY "Authenticated update event posters"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'event-posters');

CREATE POLICY "Authenticated delete event posters"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'event-posters');
