import { useQuery } from '@tanstack/react-query';
import { kajianRegistrationService } from '@/services/kajian-registration.service';

export const KAJIAN_REGISTRATIONS_KEY = 'kajian-registrations';

export function useKajianRegistrations(kajianId: string | null) {
  return useQuery({
    queryKey: [KAJIAN_REGISTRATIONS_KEY, kajianId],
    queryFn: () => kajianRegistrationService.getByKajianId(kajianId!),
    enabled: !!kajianId,
  });
}
