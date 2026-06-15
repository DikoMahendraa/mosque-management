import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAISettingsServer, resolveAIProviderWithPreference } from '@/lib/ai-settings.server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const settings = await getAISettingsServer();
  const activeProvider = resolveAIProviderWithPreference(settings, 'auto');

  return NextResponse.json({
    enabled: settings.enabled,
    default_provider: settings.default_provider,
    active_provider: activeProvider,
    mosque_name: settings.mosque_name,
    has_gemini_key: !!settings.gemini_api_key.trim(),
    has_openai_key: !!settings.openai_api_key.trim(),
    template_available: true,
  });
}

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const settings = await getAISettingsServer();
  const provider = resolveAIProviderWithPreference(settings, 'auto');

  if (!provider) {
    return NextResponse.json(
      {
        error: 'AI belum dikonfigurasi',
        message: 'Simpan API key Gemini atau OpenAI di Pengaturan → Integrasi AI, atau gunakan template gratis di dashboard.',
      },
      { status: 400 }
    );
  }

  return NextResponse.json(
    {
      ok: true,
      provider,
      message: provider
        ? `Provider ${provider} siap digunakan untuk generate poster.`
        : 'Belum ada API key AI yang tersimpan.',
    },
    { status: 200 }
  );
}
