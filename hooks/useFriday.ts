import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fridayService } from '@/services/friday.service';
import { FridayFormData } from '@/types';

export const FRIDAY_KEY = 'friday';

export function useFridayList(params?: { page?: number; limit?: number; search?: string; month?: string }) {
  return useQuery({
    queryKey: [FRIDAY_KEY, params],
    queryFn: () => fridayService.getAll(params),
  });
}

export function useFridayById(id: string) {
  return useQuery({
    queryKey: [FRIDAY_KEY, id],
    queryFn: () => fridayService.getById(id),
    enabled: !!id,
  });
}

export function useCreateFriday() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: FridayFormData) => fridayService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [FRIDAY_KEY] }),
  });
}

export function useUpdateFriday() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FridayFormData> }) =>
      fridayService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [FRIDAY_KEY] }),
  });
}

export function useDeleteFriday() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fridayService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [FRIDAY_KEY] }),
  });
}
