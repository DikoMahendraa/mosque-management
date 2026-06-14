import { EventPosterTemplate } from '@/types';
import { stripHtml, truncate } from '@/lib/utils';

const STYLE_HINTS: Record<EventPosterTemplate, string> = {
  emerald:
    'elegant Islamic emerald green and teal tones, geometric arabesque patterns, soft golden accents, mosque silhouette, peaceful spiritual atmosphere',
  gold:
    'warm Ramadan golden amber theme, Islamic lantern lights, crescent moon, rich decorative patterns, festive but respectful',
  night:
    'deep blue night sky with subtle stars, mosque dome silhouette, serene spiritual mood, modern minimalist Islamic design',
};

export function buildPosterBackgroundPrompt(input: {
  title: string;
  description?: string;
  template: EventPosterTemplate;
  mosqueName: string;
  location: string;
}): string {
  const style = STYLE_HINTS[input.template];
  const plainDescription = input.description
    ? truncate(stripHtml(input.description).replace(/\s+/g, ' ').trim(), 400)
    : '';

  const contextParts = [
    `event about "${input.title}" at ${input.mosqueName}, location ${input.location}.`,
    plainDescription ? `Event details for mood: ${plainDescription}` : '',
  ].filter(Boolean);

  return [
    'Create a beautiful vertical event poster BACKGROUND ONLY for a mosque community gathering.',
    'CRITICAL: Do NOT include any text, letters, words, numbers, watermarks, or typography anywhere in the image.',
    'Leave clean readable areas at the top third and lower half for text overlay later.',
    `Visual style: ${style}.`,
    `Mood inspiration (do not render as text): ${contextParts.join(' ')}`,
    'Professional social media flyer background, high quality, portrait 4:5 aspect ratio.',
  ].join(' ');
}
