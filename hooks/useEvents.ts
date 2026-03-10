import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventService } from '@/services/event.service';
import { EventFormData } from '@/types';

export const EVENTS_KEY = 'events';

export function useEventList(params?: { page?: number; limit?: number; search?: string; status?: string }) {
  return useQuery({
    queryKey: [EVENTS_KEY, params],
    queryFn: () => eventService.getAll(params),
  });
}

export function useEventById(id: string) {
  return useQuery({
    queryKey: [EVENTS_KEY, id],
    queryFn: () => eventService.getById(id),
    enabled: !!id,
  });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: EventFormData) => eventService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [EVENTS_KEY] }),
  });
}

export function useUpdateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EventFormData> }) =>
      eventService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [EVENTS_KEY] }),
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eventService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [EVENTS_KEY] }),
  });
}
