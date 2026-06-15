import { createClient } from '@/lib/supabase/client';
import { dataUrlToBlob } from '@/lib/event-poster';

const BUCKET = 'event-posters';

export async function uploadEventPoster(dataUrl: string, fileName?: string): Promise<string> {
  const supabase = createClient();
  const blob = dataUrlToBlob(dataUrl);
  const path = fileName ?? `poster-${Date.now()}.png`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: 'image/png',
    upsert: true,
  });

  if (error) {
    // Fallback: use data URL if storage bucket is not set up yet
    if (error.message.includes('Bucket not found') || error.message.includes('not found')) {
      return dataUrl;
    }
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
