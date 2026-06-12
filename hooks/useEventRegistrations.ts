import { useQuery } from '@tanstack/react-query';
import { eventRegistrationService } from '@/services/event-registration.service';

export const EVENT_REGISTRATIONS_KEY = 'event-registrations';

export function useEventRegistrations(eventId: string | null) {
  return useQuery({
    queryKey: [EVENT_REGISTRATIONS_KEY, eventId],
    queryFn: () => eventRegistrationService.getByEventId(eventId!),
    enabled: !!eventId,
  });
}
