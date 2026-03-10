import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { landingService } from '@/services/landing.service';
import { HeroSection, AboutSection, VisionMission, FeaturedProgram, ContactInfo } from '@/types';

export const LANDING_KEY = 'landing';

export function useHero() {
  return useQuery({ queryKey: [LANDING_KEY, 'hero'], queryFn: () => landingService.getHero() });
}
export function useUpdateHero() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<HeroSection>) => landingService.updateHero(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [LANDING_KEY, 'hero'] }),
  });
}

export function useAbout() {
  return useQuery({ queryKey: [LANDING_KEY, 'about'], queryFn: () => landingService.getAbout() });
}
export function useUpdateAbout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<AboutSection>) => landingService.updateAbout(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [LANDING_KEY, 'about'] }),
  });
}

export function useVisionMission() {
  return useQuery({ queryKey: [LANDING_KEY, 'vision'], queryFn: () => landingService.getVisionMission() });
}
export function useUpdateVisionMission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<VisionMission>) => landingService.updateVisionMission(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [LANDING_KEY, 'vision'] }),
  });
}

export function useFeaturedPrograms() {
  return useQuery({ queryKey: [LANDING_KEY, 'programs'], queryFn: () => landingService.getFeaturedPrograms() });
}
export function useCreateFeaturedProgram() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<FeaturedProgram, 'id'>) => landingService.createFeaturedProgram(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [LANDING_KEY, 'programs'] }),
  });
}
export function useUpdateFeaturedProgram() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FeaturedProgram> }) =>
      landingService.updateFeaturedProgram(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [LANDING_KEY, 'programs'] }),
  });
}
export function useDeleteFeaturedProgram() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => landingService.deleteFeaturedProgram(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [LANDING_KEY, 'programs'] }),
  });
}

export function useContact() {
  return useQuery({ queryKey: [LANDING_KEY, 'contact'], queryFn: () => landingService.getContact() });
}
export function useUpdateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ContactInfo>) => landingService.updateContact(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [LANDING_KEY, 'contact'] }),
  });
}
