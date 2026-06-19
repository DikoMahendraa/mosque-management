import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeService } from '@/services/finance.service';
import { FinanceFormData } from '@/types';

export const FINANCE_KEY = 'finance';

export function useFinanceList(params?: { page?: number; limit?: number; search?: string; type?: string; category?: string; month?: string; start_date?: string; end_date?: string }) {
  return useQuery({
    queryKey: [FINANCE_KEY, params],
    queryFn: () => financeService.getAll(params),
  });
}

export function useFinanceSummary(params?: { start_date?: string; end_date?: string }) {
  return useQuery({
    queryKey: [FINANCE_KEY, 'summary', params],
    queryFn: () => financeService.getSummary(params),
  });
}

export function useFinanceById(id: string) {
  return useQuery({
    queryKey: [FINANCE_KEY, id],
    queryFn: () => financeService.getById(id),
    enabled: !!id,
  });
}

export function useCreateFinance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: FinanceFormData) => financeService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [FINANCE_KEY] }),
  });
}

export function useUpdateFinance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FinanceFormData> }) =>
      financeService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [FINANCE_KEY] }),
  });
}

export function useDeleteFinance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financeService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [FINANCE_KEY] }),
  });
}

export function useDeleteManyFinance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => financeService.deleteMany(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: [FINANCE_KEY] }),
  });
}
