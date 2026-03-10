import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { galleryService } from '@/services/gallery.service';
import { GalleryFormData } from '@/types';

export const GALLERY_KEY = 'gallery';

export function useGalleryList(params?: { page?: number; limit?: number; search?: string; category?: string }) {
  return useQuery({
    queryKey: [GALLERY_KEY, params],
    queryFn: () => galleryService.getAll(params),
  });
}

export function useGalleryById(id: string) {
  return useQuery({
    queryKey: [GALLERY_KEY, id],
    queryFn: () => galleryService.getById(id),
    enabled: !!id,
  });
}

export function useCreateGallery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: GalleryFormData) => galleryService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [GALLERY_KEY] }),
  });
}

export function useUpdateGallery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<GalleryFormData> }) =>
      galleryService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [GALLERY_KEY] }),
  });
}

export function useDeleteGallery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => galleryService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [GALLERY_KEY] }),
  });
}
