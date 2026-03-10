import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { prayerService } from '@/services/prayer.service';
import { PrayerFormData } from '@/types';

export const PRAYER_KEY = 'prayer';

export function usePrayerList(params?: { page?: number; limit?: number; search?: string; month?: string }) {
  return useQuery({
    queryKey: [PRAYER_KEY, params],
    queryFn: () => prayerService.getAll(params),
  });
}

export function usePrayerById(id: string) {
  return useQuery({
    queryKey: [PRAYER_KEY, id],
    queryFn: () => prayerService.getById(id),
    enabled: !!id,
  });
}

export function useCreatePrayer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PrayerFormData) => prayerService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PRAYER_KEY] }),
  });
}

export function useUpdatePrayer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PrayerFormData> }) =>
      prayerService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PRAYER_KEY] }),
  });
}

export function useDeletePrayer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => prayerService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PRAYER_KEY] }),
  });
}
