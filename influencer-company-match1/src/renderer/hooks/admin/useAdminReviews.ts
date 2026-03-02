import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminReviewsService from '../../services/admin-reviews.service';

// Query keys
export const adminReviewsKeys = {
  all: ['admin', 'reviews'] as const,
  lists: () => [...adminReviewsKeys.all, 'list'] as const,
  stats: () => [...adminReviewsKeys.all, 'stats'] as const,
};

// Fetch all reviews with stats
export const useAdminReviews = () => {
  return useQuery({
    queryKey: adminReviewsKeys.lists(),
    queryFn: async () => {
      return await adminReviewsService.getAllReviews();
    },
  });
};

// Toggle featured status
export const useToggleReviewFeatured = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isFeatured }: { id: string; isFeatured: boolean }) => {
      return await adminReviewsService.toggleFeatured(id, isFeatured);
    },
    onSuccess: () => {
      // Invalidate and refetch reviews list
      queryClient.invalidateQueries({ queryKey: adminReviewsKeys.lists() });
    },
  });
};

// Delete review
export const useDeleteAdminReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await adminReviewsService.deleteReview(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminReviewsKeys.lists() });
    },
  });
};
