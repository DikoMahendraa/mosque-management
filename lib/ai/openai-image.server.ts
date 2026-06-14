interface OpenAIImageResult {
  mimeType: string;
  base64: string;
}

export async function generateOpenAIBackground(
  apiKey: string,
  prompt: string
): Promise<OpenAIImageResult> {
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt,
      size: '1024x1792',
      n: 1,
      response_format: 'b64_json',
    }),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.error?.message ?? `OpenAI error (${res.status})`);
  }

  const b64 = json.data?.[0]?.b64_json;
  if (!b64) {
    throw new Error('OpenAI tidak mengembalikan gambar');
  }

  return { mimeType: 'image/png', base64: b64 };
}

export function openAIResultToDataUrl(result: OpenAIImageResult): string {
  return `data:${result.mimeType};base64,${result.base64}`;
}
