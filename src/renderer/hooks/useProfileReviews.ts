import { useState, useEffect, useCallback } from 'react';
import profileReviewService, {
  Review,
  ProfileRatings,
  ReviewData,
} from '../services/profile-review.service';

export const useProfileReviews = (profileId: string) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ratings, setRatings] = useState<ProfileRatings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    if (!profileId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await profileReviewService.getProfileReviews(profileId);
      setReviews(data);
    } catch (err: any) {
      // Don't set error for 401 (user will be logged out automatically)
      if (err.status !== 401) {
        setError(err.message || 'Failed to fetch reviews');
      }
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  const fetchRatings = useCallback(async () => {
    if (!profileId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await profileReviewService.getProfileRatings(profileId);
      setRatings(data);
    } catch (err: any) {
      // Don't set error for 401 (user will be logged out automatically)
      if (err.status !== 401) {
        setError(err.message || 'Failed to fetch ratings');
      }
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  const submitReview = useCallback(async (data: Omit<ReviewData, 'profileId'>) => {
    if (!profileId) {
      throw new Error('Profile ID is required');
    }

    setLoading(true);
    setError(null);
    try {
      const review = await profileReviewService.createReview({
        ...data,
        profileId,
      });
      setReviews(prev => [review, ...prev]);
      // Refresh ratings after submitting
      await fetchRatings();
      return review;
    } catch (err: any) {
      setError(err.message || 'Failed to submit review');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [profileId, fetchRatings]);

  const markHelpful = useCallback(async (reviewId: string) => {
    try {
      await profileReviewService.markHelpful(reviewId);
      // Update local state optimistically
      setReviews(prev =>
        prev.map(review =>
          review.id === reviewId
            ? { ...review, helpfulCount: review.helpfulCount + 1 }
            : review
        )
      );
    } catch (err: any) {
      console.error('Failed to mark review as helpful:', err);
      throw err;
    }
  }, []);

  const checkExistingReview = useCallback(async (connectionId: string) => {
    if (!profileId) return null;
    
    try {
      const review = await profileReviewService.checkExistingReview(profileId, connectionId);
      return review;
    } catch (err: any) {
      console.error('Failed to check existing review:', err);
      return null;
    }
  }, [profileId]);

  useEffect(() => {
    fetchReviews();
    fetchRatings();
  }, [fetchReviews, fetchRatings]);

  return {
    reviews,
    ratings,
    loading,
    error,
    submitReview,
    markHelpful,
    checkExistingReview,
    refreshReviews: fetchReviews,
    refreshRatings: fetchRatings,
  };
};
