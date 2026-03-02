import React, { useState } from 'react';
import { Star, CheckCircle, XCircle, RefreshCw, Trash2, Filter } from 'lucide-react';
import AdminPageHeader from '../../components/AdminPageHeader';
import { Pagination } from '../../components/Pagination/Pagination';
import { useAdminReviews, useToggleReviewFeatured, useDeleteAdminReview } from '../../hooks/admin/useAdminReviews';
import { useToast } from '../../hooks/useToast';
import { ConfirmationModal } from '../../components/ConfirmationModal/ConfirmationModal';
import './AdminReviews.css';

const ITEMS_PER_PAGE = 20;

export const AdminReviews: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReviews, setSelectedReviews] = useState<string[]>([]);
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const { showToast } = useToast();

  // Use React Query hooks
  const { data, isLoading: loading, error, refetch } = useAdminReviews();
  const toggleFeaturedMutation = useToggleReviewFeatured();
  const deleteReviewMutation = useDeleteAdminReview();

  const allReviews = data?.data || [];
  
  // Apply rating filter
  const reviews = ratingFilter === 'all' 
    ? allReviews 
    : allReviews.filter(r => r.overallRating === ratingFilter);
  
  const stats = {
    total: data?.total || 0,
    featured: data?.featured || 0,
    averageRating: data?.averageRating || 0,
  };

  const toggleFeature = async (id: string, currentStatus: boolean) => {
    try {
      await toggleFeaturedMutation.mutateAsync({ id, isFeatured: !currentStatus });
      showToast(`Review ${!currentStatus ? 'featured' : 'unfeatured'} successfully`, 'success');
    } catch (err: any) {
      showToast('Failed to update review: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const handleBulkFeature = async () => {
    if (selectedReviews.length === 0) {
      showToast('Please select reviews to feature', 'error');
      return;
    }

    try {
      await Promise.all(
        selectedReviews.map(id => {
          const review = reviews.find(r => r.id === id);
          if (review && !review.isFeatured) {
            return toggleFeaturedMutation.mutateAsync({ id, isFeatured: true });
          }
          return Promise.resolve();
        })
      );
      setSelectedReviews([]);
      showToast(`${selectedReviews.length} reviews featured`, 'success');
    } catch (err: any) {
      showToast('Failed to bulk feature reviews', 'error');
    }
  };

  const handleBulkUnfeature = async () => {
    if (selectedReviews.length === 0) {
      showToast('Please select reviews to unfeature', 'error');
      return;
    }

    try {
      await Promise.all(
        selectedReviews.map(id => {
          const review = reviews.find(r => r.id === id);
          if (review && review.isFeatured) {
            return toggleFeaturedMutation.mutateAsync({ id, isFeatured: false });
          }
          return Promise.resolve();
        })
      );
      setSelectedReviews([]);
      showToast(`${selectedReviews.length} reviews unfeatured`, 'success');
    } catch (err: any) {
      showToast('Failed to bulk unfeature reviews', 'error');
    }
  };

  const handleDeleteClick = (id: string) => {
    setReviewToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!reviewToDelete) return;

    try {
      await deleteReviewMutation.mutateAsync(reviewToDelete);
      showToast('Review deleted successfully', 'success');
      setDeleteModalOpen(false);
      setReviewToDelete(null);
    } catch (err: any) {
      showToast('Failed to delete review: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const toggleReviewSelection = (id: string) => {
    setSelectedReviews(prev =>
      prev.includes(id) ? prev.filter(reviewId => reviewId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedReviews.length === paginatedReviews.length) {
      setSelectedReviews([]);
    } else {
      setSelectedReviews(paginatedReviews.map(r => r.id));
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="admin-review-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= rating ? 'star-filled' : 'star-empty'}
            fill={star <= rating ? 'currentColor' : 'none'}
          />
        ))}
      </div>
    );
  };

  // Pagination logic
  const totalPages = Math.ceil(reviews.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedReviews = reviews.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedReviews([]); // Clear selection on page change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="admin-reviews-container">
        <div className="admin-reviews-loading">Loading reviews...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-reviews-container">
        <AdminPageHeader
          title="Manage Reviews"
          subtitle="Feature reviews to display them on the landing page testimonials section"
          loading={false}
        />
        <div className="admin-reviews-error">
          {error instanceof Error ? error.message : 'Failed to load reviews'}
        </div>
        <button className="admin-btn admin-btn-primary" onClick={() => refetch()}>
          <RefreshCw size={20} /> Retry
        </button>
      </div>
    );
  }

  const headerActions = (
    <>
      {selectedReviews.length > 0 && (
        <div className="bulk-actions">
          <span className="selected-count">{selectedReviews.length} selected</span>
          <button className="admin-btn admin-btn-success admin-btn-small" onClick={handleBulkFeature}>
            <CheckCircle size={16} />
            Feature Selected
          </button>
          <button className="admin-btn admin-btn-secondary admin-btn-small" onClick={handleBulkUnfeature}>
            <XCircle size={16} />
            Unfeature Selected
          </button>
        </div>
      )}
      <button className="admin-btn admin-btn-secondary" onClick={() => refetch()}>
        <RefreshCw size={20} className={loading ? 'spinning' : ''} />
        Refresh
      </button>
    </>
  );

  return (
    <div className="admin-reviews-container">
      <AdminPageHeader
        title="Manage Reviews"
        subtitle="Feature reviews to display them on the landing page testimonials section"
        actions={headerActions}
        loading={loading}
      />

      <div className="admin-reviews-stats">
        <div className="admin-stat-card">
          <div className="admin-stat-value">{stats.total}</div>
          <div className="admin-stat-label">Total Reviews</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value">{stats.featured}</div>
          <div className="admin-stat-label">Featured Reviews</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value">{stats.averageRating.toFixed(1)}</div>
          <div className="admin-stat-label">Average Rating</div>
        </div>
      </div>

      {/* Rating Filter */}
      <div className="admin-reviews-filters">
        <div className="filter-group">
          <Filter size={18} />
          <label>Filter by Rating:</label>
          <div className="rating-filter-buttons">
            <button
              className={`admin-btn admin-btn-small ${ratingFilter === 'all' ? 'admin-btn-primary' : 'admin-btn-outline'}`}
              onClick={() => setRatingFilter('all')}
            >
              All
            </button>
            {[5, 4, 3, 2, 1].map(rating => (
              <button
                key={rating}
                className={`admin-btn admin-btn-small ${ratingFilter === rating ? 'admin-btn-primary' : 'admin-btn-outline'}`}
                onClick={() => setRatingFilter(rating)}
              >
                {rating} <Star size={14} fill="currentColor" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="admin-reviews-table-container">
        <table className="admin-reviews-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedReviews.length === paginatedReviews.length && paginatedReviews.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th>Review</th>
              <th>Overall Rating</th>
              <th>Detailed Ratings</th>
              <th>Helpful</th>
              <th>Featured</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedReviews.map((review) => (
              <tr key={review.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedReviews.includes(review.id)}
                    onChange={() => toggleReviewSelection(review.id)}
                  />
                </td>
                <td>
                  <div className="admin-review-comment">
                    {review.comment || 'No comment provided'}
                  </div>
                  <div className="admin-review-meta">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td>
                  <div className="admin-review-rating">
                    {renderStars(review.overallRating)}
                    <span className="admin-rating-number">{review.overallRating}/5</span>
                  </div>
                </td>
                <td>
                  <div className="admin-detailed-ratings">
                    <div className="admin-rating-item">
                      <span>Communication:</span>
                      <span>{review.communicationRating}/5</span>
                    </div>
                    <div className="admin-rating-item">
                      <span>Professionalism:</span>
                      <span>{review.professionalismRating}/5</span>
                    </div>
                    <div className="admin-rating-item">
                      <span>Quality:</span>
                      <span>{review.qualityRating}/5</span>
                    </div>
                    <div className="admin-rating-item">
                      <span>Timeliness:</span>
                      <span>{review.timelinessRating}/5</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="admin-helpful-count">
                    {review.helpfulCount} {review.helpfulCount === 1 ? 'person' : 'people'}
                  </div>
                </td>
                <td>
                  <div className="admin-featured-status">
                    {review.isFeatured ? (
                      <span className="admin-badge admin-badge-success">
                        <CheckCircle size={16} /> Yes
                      </span>
                    ) : (
                      <span className="admin-badge admin-badge-default">
                        <XCircle size={16} /> No
                      </span>
                    )}
                  </div>
                </td>
                <td>
                  <div className="admin-review-actions">
                    <button
                      className={`admin-btn admin-btn-small ${
                        review.isFeatured ? 'admin-btn-secondary' : 'admin-btn-primary'
                      }`}
                      onClick={() => toggleFeature(review.id, review.isFeatured)}
                    >
                      {review.isFeatured ? 'Unfeature' : 'Feature'}
                    </button>
                    <button
                      className="admin-btn admin-btn-danger admin-btn-small"
                      onClick={() => handleDeleteClick(review.id)}
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {reviews.length === 0 && (
          <div className="admin-reviews-empty">
            <p>No reviews found{ratingFilter !== 'all' ? ` with ${ratingFilter} star rating` : ''}</p>
          </div>
        )}
      </div>

      {reviews.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          itemsPerPage={ITEMS_PER_PAGE}
          totalItems={reviews.length}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <ConfirmationModal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setReviewToDelete(null);
          }}
          onConfirm={handleDeleteConfirm}
          title="Delete Review"
          message="Are you sure you want to delete this review? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
        />
      )}
    </div>
  );
};
