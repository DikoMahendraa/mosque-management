import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAISettingsServer, resolveAIProviderWithPreference } from '@/lib/ai-settings.server';
import { buildPosterBackgroundPrompt } from '@/lib/ai/poster-prompt';
import { generateGeminiBackground, geminiResultToDataUrl } from '@/lib/ai/gemini-image.server';
import { generateOpenAIBackground, openAIResultToDataUrl } from '@/lib/ai/openai-image.server';
import { EventPosterTemplate } from '@/types';

interface GeneratePosterBody {
  title: string;
  eventDate: string;
  location: string;
  description?: string;
  mosqueName?: string;
  template?: EventPosterTemplate;
  provider?: 'auto' | 'gemini' | 'openai';
}

function pickProvider(
  settings: Awaited<ReturnType<typeof getAISettingsServer>>,
  requested: GeneratePosterBody['provider']
): 'gemini' | 'openai' | null {
  return resolveAIProviderWithPreference(settings, requested);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: GeneratePosterBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { title, eventDate, location, template = 'emerald', provider = 'auto' } = body;

  if (!title?.trim() || !eventDate || !location?.trim()) {
    return NextResponse.json(
      { error: 'Data tidak lengkap', message: 'Title, tanggal, dan lokasi wajib diisi' },
      { status: 400 }
    );
  }

  const settings = await getAISettingsServer();
  const mosqueName = body.mosqueName?.trim() || settings.mosque_name || 'Masjid Darussalam';
  const activeProvider = pickProvider(settings, provider);

  if (!activeProvider) {
    return NextResponse.json(
      {
        error: 'AI belum dikonfigurasi',
        message: 'Aktifkan Integrasi AI dan simpan API key Gemini atau OpenAI di Pengaturan.',
      },
      { status: 400 }
    );
  }

  const prompt = buildPosterBackgroundPrompt({
    title: title.trim(),
    description: body.description,
    template,
    mosqueName,
    location: location.trim(),
  });

  try {
    let backgroundDataUrl: string;

    if (activeProvider === 'gemini') {
      const result = await generateGeminiBackground(settings.gemini_api_key, prompt);
      backgroundDataUrl = geminiResultToDataUrl(result);
    } else {
      const result = await generateOpenAIBackground(settings.openai_api_key, prompt);
      backgroundDataUrl = openAIResultToDataUrl(result);
    }

    return NextResponse.json({
      backgroundDataUrl,
      provider: activeProvider,
      message: 'Background AI berhasil dibuat. Teks event akan ditambahkan otomatis di browser.',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal menghasilkan gambar AI';
    const status = message.includes('429') || message.toLowerCase().includes('quota') ? 429 : 502;
    return NextResponse.json({ error: 'AI generation failed', message }, { status });
  }
}
