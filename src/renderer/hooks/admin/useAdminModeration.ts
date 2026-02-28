import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminModerationService from '../../services/admin-moderation.service';

// Query keys
export const adminModerationKeys = {
  all: ['admin', 'moderation'] as const,
  flags: () => [...adminModerationKeys.all, 'flags'] as const,
  bans: () => [...adminModerationKeys.all, 'bans'] as const,
  stats: () => [...adminModerationKeys.all, 'stats'] as const,
};

// Fetch flagged content
export const useAdminFlaggedContent = (filters?: {
  status?: string;
  contentType?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: [...adminModerationKeys.flags(), filters],
    queryFn: async () => {
      return await adminModerationService.getFlaggedContent(filters);
    },
  });
};

// Fetch banned users
export const useAdminBannedUsers = (page?: number, limit?: number) => {
  return useQuery({
    queryKey: [...adminModerationKeys.bans(), { page, limit }],
    queryFn: async () => {
      return await adminModerationService.getBannedUsers(page, limit);
    },
  });
};

// Fetch moderation stats
export const useAdminModerationStats = () => {
  return useQuery({
    queryKey: adminModerationKeys.stats(),
    queryFn: async () => {
      return await adminModerationService.getModerationStats();
    },
  });
};

// Ban user
export const useBanUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      userId: string;
      reason: string;
      type: 'TEMPORARY' | 'PERMANENT';
      expiresAt?: string;
      notes?: string;
    }) => {
      return await adminModerationService.banUser(
        data.userId,
        data.reason,
        data.type,
        data.expiresAt,
        data.notes
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminModerationKeys.bans() });
    },
  });
};

// Review flag
export const useReviewFlag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      flagId: string;
      decision: 'APPROVED' | 'REJECTED' | 'REMOVED';
      notes?: string;
    }) => {
      return await adminModerationService.reviewFlag(data.flagId, data.decision, data.notes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminModerationKeys.flags() });
    },
  });
};

// Unban user
export const useUnbanUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      return await adminModerationService.unbanUser(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminModerationKeys.bans() });
    },
  });
};
