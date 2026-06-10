import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ustadService } from '@/services/ustad.service';
import { UstadFormData } from '@/types';

export const USTAD_KEY = 'ustad';

export function useUstadList(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  return useQuery({
    queryKey: [USTAD_KEY, params],
    queryFn: () => ustadService.getAll(params),
  });
}

export function useUstadById(id: string) {
  return useQuery({
    queryKey: [USTAD_KEY, id],
    queryFn: () => ustadService.getById(id),
    enabled: !!id,
  });
}

export function useCreateUstad() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UstadFormData) => ustadService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [USTAD_KEY] }),
  });
}

export function useUpdateUstad() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UstadFormData> }) =>
      ustadService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [USTAD_KEY] }),
  });
}

export function useDeleteUstad() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ustadService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [USTAD_KEY] }),
  });
}
