const GEMINI_IMAGE_MODELS = [
  'gemini-2.5-flash-image',
  'gemini-2.0-flash-preview-image-generation',
] as const;

interface GeminiImageResult {
  mimeType: string;
  base64: string;
}

export async function generateGeminiBackground(
  apiKey: string,
  prompt: string
): Promise<GeminiImageResult> {
  let lastError = 'Gemini tidak dapat menghasilkan gambar';

  for (const model of GEMINI_IMAGE_MODELS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseModalities: ['TEXT', 'IMAGE'],
              imageConfig: { aspectRatio: '4:5' },
            },
          }),
        }
      );

      const json = await res.json();

      if (!res.ok) {
        lastError = json.error?.message ?? `Gemini error (${res.status})`;
        continue;
      }

      const parts = json.candidates?.[0]?.content?.parts ?? [];
      for (const part of parts) {
        if (part.inlineData?.data) {
          return {
            mimeType: part.inlineData.mimeType || 'image/png',
            base64: part.inlineData.data,
          };
        }
      }

      lastError = 'Gemini tidak mengembalikan gambar. Coba lagi atau gunakan template gratis.';
    } catch (err) {
      lastError = err instanceof Error ? err.message : lastError;
    }
  }

  throw new Error(lastError);
}

export function geminiResultToDataUrl(result: GeminiImageResult): string {
  return `data:${result.mimeType};base64,${result.base64}`;
}
