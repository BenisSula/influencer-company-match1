import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminUserService } from '../../services/admin-user.service';

export interface AdminUser {
  id: number;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  profile?: {
    fullName?: string;
    name?: string;
    bio?: string;
    avatarUrl?: string;
  };
}

// Query keys
export const adminUsersKeys = {
  all: ['admin', 'users'] as const,
  lists: () => [...adminUsersKeys.all, 'list'] as const,
  list: (filters?: string) => [...adminUsersKeys.lists(), { filters }] as const,
  details: () => [...adminUsersKeys.all, 'detail'] as const,
  detail: (id: number) => [...adminUsersKeys.details(), id] as const,
};

// Fetch all users
export const useAdminUsers = () => {
  return useQuery({
    queryKey: adminUsersKeys.lists(),
    queryFn: async () => {
      const response: any = await adminUserService.getUsers();
      // Backend returns { data: [...], total, page, limit, totalPages }
      // Map to include fullName from profile
      return response.data.map((user: any) => ({
        ...user,
        fullName: user.profile?.fullName || user.profile?.name || user.email.split('@')[0]
      })) as AdminUser[];
    },
  });
};

// Update user
export const useUpdateAdminUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await adminUserService.updateUser(id, data);
    },
    onSuccess: () => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: adminUsersKeys.lists() });
    },
  });
};

// Delete user
export const useDeleteAdminUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await adminUserService.deleteUser(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminUsersKeys.lists() });
    },
  });
};

// Create user - Note: This would need a createUser method in the service
export const useCreateAdminUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_userData: Partial<AdminUser>) => {
      // This would need to be implemented in the service
      throw new Error('Create user not yet implemented in service');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminUsersKeys.lists() });
    },
  });
};

// Get user stats
export const useAdminUserStats = () => {
  return useQuery({
    queryKey: [...adminUsersKeys.all, 'stats'],
    queryFn: async () => {
      const response = await adminUserService.getStats();
      return response;
    },
  });
};
