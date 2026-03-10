import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { kajianService } from '@/services/kajian.service';
import { KajianFormData } from '@/types';

export const KAJIAN_KEY = 'kajian';

export function useKajianList(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: [KAJIAN_KEY, params],
    queryFn: () => kajianService.getAll(params),
  });
}

export function useKajianById(id: string) {
  return useQuery({
    queryKey: [KAJIAN_KEY, id],
    queryFn: () => kajianService.getById(id),
    enabled: !!id,
  });
}

export function useCreateKajian() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: KajianFormData) => kajianService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KAJIAN_KEY] }),
  });
}

export function useUpdateKajian() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<KajianFormData> }) =>
      kajianService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KAJIAN_KEY] }),
  });
}

export function useDeleteKajian() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => kajianService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KAJIAN_KEY] }),
  });
}
