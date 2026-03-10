import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postService } from '@/services/post.service';
import { PostFormData } from '@/types';

export const POSTS_KEY = 'posts';

export function usePostList(params?: { page?: number; limit?: number; search?: string; status?: string }) {
  return useQuery({
    queryKey: [POSTS_KEY, params],
    queryFn: () => postService.getAll(params),
  });
}

export function usePostById(id: string) {
  return useQuery({
    queryKey: [POSTS_KEY, id],
    queryFn: () => postService.getById(id),
    enabled: !!id,
  });
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PostFormData) => postService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [POSTS_KEY] }),
  });
}

export function useUpdatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PostFormData> }) =>
      postService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [POSTS_KEY] }),
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => postService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [POSTS_KEY] }),
  });
}
