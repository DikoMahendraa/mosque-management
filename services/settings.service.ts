import { createClient } from '@/lib/supabase/client';
import { AppSetting, AuthSettings, WhatsAppSettings, ApiResponse } from '@/types';

function mapSetting(row: Record<string, unknown>): AppSetting {
  return {
    id: String(row.id),
    setting_key: String(row.setting_key ?? ''),
    setting_value: String(row.setting_value ?? ''),
    setting_type: row.setting_type as AppSetting['setting_type'],
    description: String(row.description ?? ''),
    updated_by: row.updated_by ? String(row.updated_by) : undefined,
    created_at: String(row.created_at ?? ''),
    updated_at: String(row.updated_at ?? ''),
  };
}

export const settingsService = {
  async getAll(): Promise<ApiResponse<AppSetting[]>> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .order('setting_key', { ascending: true });

    if (error) throw new Error(error.message);
    return {
      data: (data ?? []).map((row: Record<string, unknown>) => mapSetting(row)),
    };
  },

  async getByKey(key: string): Promise<ApiResponse<AppSetting>> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .eq('setting_key', key)
      .single();

    if (error) throw new Error(error.message);
    return { data: mapSetting(data) };
  },

  async updateSetting(key: string, value: string): Promise<ApiResponse<AppSetting>> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('app_settings')
      .update({
        setting_value: value,
        ...(user ? { updated_by: user.id } : {}),
      })
      .eq('setting_key', key)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { data: mapSetting(data), message: 'Pengaturan berhasil diupdate' };
  },

  async getWhatsAppSettings(): Promise<WhatsAppSettings> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .in('setting_key', [
        'whatsapp_api_enabled',
        'whatsapp_api_provider',
        'whatsapp_api_token',
        'whatsapp_api_device',
      ]);

    if (error) throw new Error(error.message);

    const settings = data ?? [];
    return {
      enabled: settings.find((s) => s.setting_key === 'whatsapp_api_enabled')?.setting_value === 'true',
      provider: (settings.find((s) => s.setting_key === 'whatsapp_api_provider')?.setting_value || 'fonnte') as WhatsAppSettings['provider'],
      token: settings.find((s) => s.setting_key === 'whatsapp_api_token')?.setting_value || '',
      device: settings.find((s) => s.setting_key === 'whatsapp_api_device')?.setting_value || '',
    };
  },

  async updateWhatsAppSettings(settings: Partial<WhatsAppSettings>): Promise<void> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const updates = [];

    if (settings.enabled !== undefined) {
      updates.push({
        setting_key: 'whatsapp_api_enabled',
        setting_value: String(settings.enabled),
        ...(user ? { updated_by: user.id } : {}),
      });
    }

    if (settings.provider) {
      updates.push({
        setting_key: 'whatsapp_api_provider',
        setting_value: settings.provider,
        ...(user ? { updated_by: user.id } : {}),
      });
    }

    if (settings.token !== undefined) {
      updates.push({
        setting_key: 'whatsapp_api_token',
        setting_value: settings.token,
        ...(user ? { updated_by: user.id } : {}),
      });
    }

    if (settings.device !== undefined) {
      updates.push({
        setting_key: 'whatsapp_api_device',
        setting_value: settings.device,
        ...(user ? { updated_by: user.id } : {}),
      });
    }

    for (const update of updates) {
      const { error } = await supabase
        .from('app_settings')
        .update(update)
        .eq('setting_key', update.setting_key);

      if (error) throw new Error(error.message);
    }
  },

  async getAuthSettings(): Promise<AuthSettings> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .eq('setting_key', 'auth_require_email_verification_for_new_users')
      .maybeSingle();

    if (error) throw new Error(error.message);

    return {
      requireEmailVerificationForNewUsers: data?.setting_value === 'true',
    };
  },

  async updateAuthSettings(settings: Partial<AuthSettings>): Promise<void> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (settings.requireEmailVerificationForNewUsers === undefined) return;

    const { error } = await supabase
      .from('app_settings')
      .upsert({
        setting_key: 'auth_require_email_verification_for_new_users',
        setting_value: String(settings.requireEmailVerificationForNewUsers),
        setting_type: 'boolean',
        description: 'Require email invitation/verification for newly created users',
        ...(user ? { updated_by: user.id } : {}),
      }, { onConflict: 'setting_key' });

    if (error) throw new Error(error.message);
  },
};
