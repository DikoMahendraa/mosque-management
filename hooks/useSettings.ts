import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '@/services/settings.service';
import { WhatsAppSettings } from '@/types';

export const SETTINGS_KEY = 'settings';

export function useSettings() {
  return useQuery({
    queryKey: [SETTINGS_KEY],
    queryFn: () => settingsService.getAll(),
  });
}

export function useWhatsAppSettings() {
  return useQuery({
    queryKey: [SETTINGS_KEY, 'whatsapp'],
    queryFn: () => settingsService.getWhatsAppSettings(),
  });
}

export function useUpdateWhatsAppSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (settings: Partial<WhatsAppSettings>) =>
      settingsService.updateWhatsAppSettings(settings),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [SETTINGS_KEY] });
      qc.invalidateQueries({ queryKey: [SETTINGS_KEY, 'whatsapp'] });
    },
  });
}

export function useUpdateSetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      settingsService.updateSetting(key, value),
    onSuccess: () => qc.invalidateQueries({ queryKey: [SETTINGS_KEY] }),
  });
}
