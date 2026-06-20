-- Create app_settings table for global application settings
CREATE TABLE IF NOT EXISTS public.app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text NOT NULL UNIQUE,
  setting_value text,
  setting_type text NOT NULL DEFAULT 'string', -- 'string', 'boolean', 'number', 'json'
  description text,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Auto-update updated_at
DROP TRIGGER IF EXISTS app_settings_updated_at ON public.app_settings;
CREATE TRIGGER app_settings_updated_at
  BEFORE UPDATE ON public.app_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Enable Row Level Security
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies
DROP POLICY IF EXISTS "Public can read app_settings" ON public.app_settings;
DROP POLICY IF EXISTS "Authenticated users can insert app_settings" ON public.app_settings;
DROP POLICY IF EXISTS "Authenticated users can update app_settings" ON public.app_settings;
DROP POLICY IF EXISTS "Authenticated users can delete app_settings" ON public.app_settings;

CREATE POLICY "Public can read app_settings"
  ON public.app_settings FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert app_settings"
  ON public.app_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update app_settings"
  ON public.app_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete app_settings"
  ON public.app_settings FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Insert default WhatsApp API settings
INSERT INTO public.app_settings (setting_key, setting_value, setting_type, description)
VALUES
  ('whatsapp_api_enabled', 'false', 'boolean', 'Enable/disable WhatsApp API broadcast feature'),
  ('whatsapp_api_provider', 'fonnte', 'string', 'WhatsApp API provider (fonnte, wablas, twilio)'),
  ('whatsapp_api_token', '', 'string', 'WhatsApp API token/key'),
  ('whatsapp_api_device', '', 'string', 'WhatsApp device number or sender'),
  ('auth_require_email_verification_for_new_users', 'false', 'boolean', 'Require email invitation/verification for newly created users')
ON CONFLICT (setting_key) DO NOTHING;
