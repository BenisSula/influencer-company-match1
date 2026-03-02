import { useQuery } from '@tanstack/react-query';
import adminAnalyticsService from '../../services/admin-analytics.service';

// Query keys
export const adminAnalyticsKeys = {
  all: ['admin', 'analytics'] as const,
  overview: () => [...adminAnalyticsKeys.all, 'overview'] as const,
  userGrowth: () => [...adminAnalyticsKeys.all, 'userGrowth'] as const,
  revenue: () => [...adminAnalyticsKeys.all, 'revenue'] as const,
  engagement: () => [...adminAnalyticsKeys.all, 'engagement'] as const,
};

// Fetch analytics overview
export const useAdminAnalyticsOverview = () => {
  return useQuery({
    queryKey: adminAnalyticsKeys.overview(),
    queryFn: async () => {
      return await adminAnalyticsService.getOverview();
    },
  });
};

// Fetch user growth data
export const useAdminUserGrowth = () => {
  return useQuery({
    queryKey: adminAnalyticsKeys.userGrowth(),
    queryFn: async () => {
      return await adminAnalyticsService.getUserAnalytics();
    },
  });
};

// Fetch revenue data
export const useAdminRevenue = () => {
  return useQuery({
    queryKey: adminAnalyticsKeys.revenue(),
    queryFn: async () => {
      return await adminAnalyticsService.getRevenueStats();
    },
  });
};

// Fetch engagement metrics
export const useAdminEngagement = () => {
  return useQuery({
    queryKey: adminAnalyticsKeys.engagement(),
    queryFn: async () => {
      return await adminAnalyticsService.getEngagementMetrics();
    },
  });
};
