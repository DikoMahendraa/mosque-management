import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tahsinService } from '@/services/tahsin.service';
import { TahsinFormData } from '@/types';

export const TAHSIN_KEY = 'tahsin';

export function useTahsinList(params?: { page?: number; limit?: number; search?: string }) {
  return useQuery({
    queryKey: [TAHSIN_KEY, params],
    queryFn: () => tahsinService.getAll(params),
  });
}

export function useTahsinById(id: string) {
  return useQuery({
    queryKey: [TAHSIN_KEY, id],
    queryFn: () => tahsinService.getById(id),
    enabled: !!id,
  });
}

export function useCreateTahsin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TahsinFormData) => tahsinService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TAHSIN_KEY] }),
  });
}

export function useUpdateTahsin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TahsinFormData> }) =>
      tahsinService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TAHSIN_KEY] }),
  });
}

export function useDeleteTahsin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tahsinService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TAHSIN_KEY] }),
  });
}
