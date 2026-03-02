import { useQuery } from '@tanstack/react-query';
import { adminApiClient } from '../../services/admin-api-client';

// Query keys
export const adminDashboardKeys = {
  all: ['admin', 'dashboard'] as const,
  stats: () => [...adminDashboardKeys.all, 'stats'] as const,
  recentActivity: () => [...adminDashboardKeys.all, 'recentActivity'] as const,
};

// Fetch dashboard stats
export const useAdminDashboardStats = () => {
  return useQuery({
    queryKey: adminDashboardKeys.stats(),
    queryFn: async () => {
      return await adminApiClient.get<any>('/admin/dashboard/stats');
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - dashboard needs fresher data
  });
};

// Fetch recent activity
export const useAdminRecentActivity = () => {
  return useQuery({
    queryKey: adminDashboardKeys.recentActivity(),
    queryFn: async () => {
      return await adminApiClient.get<any>('/admin/dashboard/activity');
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};
