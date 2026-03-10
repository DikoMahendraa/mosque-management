import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { berbagiService } from '@/services/berbagi.service';
import { BerbagiFormData } from '@/types';

export const BERBAGI_KEY = 'berbagi';

export function useBerbagiList(params?: { page?: number; limit?: number; search?: string; status?: string }) {
  return useQuery({
    queryKey: [BERBAGI_KEY, params],
    queryFn: () => berbagiService.getAll(params),
  });
}

export function useBerbagiById(id: string) {
  return useQuery({
    queryKey: [BERBAGI_KEY, id],
    queryFn: () => berbagiService.getById(id),
    enabled: !!id,
  });
}

export function useCreateBerbagi() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BerbagiFormData) => berbagiService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [BERBAGI_KEY] }),
  });
}

export function useUpdateBerbagi() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BerbagiFormData> }) =>
      berbagiService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [BERBAGI_KEY] }),
  });
}

export function useDeleteBerbagi() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => berbagiService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [BERBAGI_KEY] }),
  });
}
