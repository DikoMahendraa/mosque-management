import { createClient } from '@/lib/supabase/server';
import { AISettings } from '@/types';

const AI_SETTING_KEYS = [
  'ai_enabled',
  'ai_default_provider',
  'ai_gemini_api_key',
  'ai_openai_api_key',
  'ai_mosque_name',
] as const;

export async function getAISettingsServer(): Promise<AISettings> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('app_settings')
    .select('*')
    .in('setting_key', [...AI_SETTING_KEYS]);

  if (error) throw new Error(error.message);

  const settings = data ?? [];
  const get = (key: string, fallback = '') =>
    settings.find((s) => s.setting_key === key)?.setting_value ?? fallback;

  return {
    enabled: get('ai_enabled') === 'true',
    default_provider: (get('ai_default_provider', 'template') || 'template') as AISettings['default_provider'],
    gemini_api_key: get('ai_gemini_api_key'),
    openai_api_key: get('ai_openai_api_key'),
    mosque_name: get('ai_mosque_name', 'Masjid Darussalam'),
  };
}

export function resolveAIProvider(settings: AISettings): 'gemini' | 'openai' | null {
  const provider = settings.default_provider;

  if (provider === 'gemini' && settings.gemini_api_key.trim()) return 'gemini';
  if (provider === 'openai' && settings.openai_api_key.trim()) return 'openai';

  if (settings.gemini_api_key.trim()) return 'gemini';
  if (settings.openai_api_key.trim()) return 'openai';

  return null;
}

export function resolveAIProviderWithPreference(
  settings: AISettings,
  preferred?: 'auto' | 'gemini' | 'openai'
): 'gemini' | 'openai' | null {
  if (preferred === 'gemini' && settings.gemini_api_key.trim()) return 'gemini';
  if (preferred === 'openai' && settings.openai_api_key.trim()) return 'openai';
  return resolveAIProvider(settings);
}
