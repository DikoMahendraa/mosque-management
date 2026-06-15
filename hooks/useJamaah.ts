import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jamaahService } from '@/services/jamaah.service';
import { JamaahFormData } from '@/types';

export const JAMAAH_KEY = 'jamaah';

export function useJamaahList(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: [JAMAAH_KEY, params],
    queryFn: () => jamaahService.getAll(params),
  });
}

export function useJamaahById(id: string) {
  return useQuery({
    queryKey: [JAMAAH_KEY, id],
    queryFn: () => jamaahService.getById(id),
    enabled: !!id,
  });
}

export function useCreateJamaah() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: JamaahFormData) => jamaahService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [JAMAAH_KEY] }),
  });
}

export function useUpdateJamaah() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<JamaahFormData> }) =>
      jamaahService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [JAMAAH_KEY] }),
  });
}

export function useDeleteJamaah() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => jamaahService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [JAMAAH_KEY] }),
  });
}
