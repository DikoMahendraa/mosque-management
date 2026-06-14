-- AI integration settings (tokens stored in app_settings, same pattern as WhatsApp)
INSERT INTO public.app_settings (setting_key, setting_value, setting_type, description)
VALUES
  ('ai_enabled', 'false', 'boolean', 'Enable AI features across the dashboard'),
  ('ai_default_provider', 'template', 'string', 'Default AI provider: template (free), gemini, openai'),
  ('ai_gemini_api_key', '', 'string', 'Google Gemini API key (aistudio.google.com)'),
  ('ai_openai_api_key', '', 'string', 'OpenAI API key for ChatGPT / DALL-E'),
  ('ai_mosque_name', 'Masjid Darussalam', 'string', 'Mosque name shown on generated posters')
ON CONFLICT (setting_key) DO NOTHING;
