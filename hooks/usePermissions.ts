import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { permissionsService } from '@/services/permissions.service';
import { UserAccessFormData } from '@/types';

export const PERMISSIONS_KEY = 'permissions';

export function useUsersAccessList() {
  return useQuery({
    queryKey: [PERMISSIONS_KEY, 'users'],
    queryFn: () => permissionsService.listUsers(),
  });
}

export function useUpdateUserAccess() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UserAccessFormData }) =>
      permissionsService.updateUserAccess(userId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PERMISSIONS_KEY] }),
  });
}

export function useInviteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UserAccessFormData) => permissionsService.inviteUser(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PERMISSIONS_KEY] }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => permissionsService.deleteUser(userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PERMISSIONS_KEY] }),
  });
}
