import { EventPosterTemplate } from '@/types';

export interface GenerateAIPosterRequest {
  title: string;
  eventDate: string;
  location: string;
  description?: string;
  mosqueName?: string;
  template?: EventPosterTemplate;
  provider?: 'auto' | 'gemini' | 'openai';
}

export interface GenerateAIPosterResponse {
  backgroundDataUrl: string;
  provider: 'gemini' | 'openai';
  message: string;
}

export async function generateAIPosterBackground(
  payload: GenerateAIPosterRequest
): Promise<GenerateAIPosterResponse> {
  const res = await fetch('/api/ai/generate-event-poster', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message ?? json.error ?? 'Gagal menghasilkan background AI');
  }

  return json as GenerateAIPosterResponse;
}
