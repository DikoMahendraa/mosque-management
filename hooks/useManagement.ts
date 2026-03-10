import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { managementService } from '@/services/management.service';
import { AdminFormData } from '@/types';

export const MANAGEMENT_KEY = 'management';

export function useManagementList(params?: { page?: number; limit?: number; search?: string }) {
  return useQuery({
    queryKey: [MANAGEMENT_KEY, params],
    queryFn: () => managementService.getAll(params),
  });
}

export function useManagementById(id: string) {
  return useQuery({
    queryKey: [MANAGEMENT_KEY, id],
    queryFn: () => managementService.getById(id),
    enabled: !!id,
  });
}

export function useCreateManagement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AdminFormData) => managementService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [MANAGEMENT_KEY] }),
  });
}

export function useUpdateManagement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AdminFormData> }) =>
      managementService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [MANAGEMENT_KEY] }),
  });
}

export function useDeleteManagement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => managementService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [MANAGEMENT_KEY] }),
  });
}
