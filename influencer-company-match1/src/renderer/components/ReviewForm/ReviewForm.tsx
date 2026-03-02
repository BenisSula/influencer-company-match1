import { useState } from 'react';
import { RatingInput } from '../RatingInput/RatingInput';
import { apiClient } from '../../services/api-client';
import './ReviewForm.css';

interface ReviewFormProps {
  profileId: string;
  connectionId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  profileId,
  connectionId,
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    overallRating: 0,
    communicationRating: 0,
    professionalismRating: 0,
    qualityRating: 0,
    timelinessRating: 0,
    comment: '',
    projectName: '',
    collaborationType: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRatingChange = (field: string) => (rating: number) => {
    setFormData((prev) => ({ ...prev, [field]: rating }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await apiClient.post('/profiles/reviews', {
        ...formData,
        profileId,
        connectionId,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const allRated =
    formData.overallRating > 0 &&
    formData.communicationRating > 0 &&
    formData.professionalismRating > 0 &&
    formData.qualityRating > 0 &&
    formData.timelinessRating > 0;

  return (
    <div className="review-form-modal">
      <div className="review-form-container">
        <h2>Leave a Review</h2>
        <form onSubmit={handleSubmit}>
          <div className="rating-group">
            <RatingInput
              label="Overall Rating"
              value={formData.overallRating}
              onChange={handleRatingChange('overallRating')}
            />
            <RatingInput
              label="Communication"
              value={formData.communicationRating}
              onChange={handleRatingChange('communicationRating')}
            />
            <RatingInput
              label="Professionalism"
              value={formData.professionalismRating}
              onChange={handleRatingChange('professionalismRating')}
            />
            <RatingInput
              label="Quality of Work"
              value={formData.qualityRating}
              onChange={handleRatingChange('qualityRating')}
            />
            <RatingInput
              label="Timeliness"
              value={formData.timelinessRating}
              onChange={handleRatingChange('timelinessRating')}
            />
          </div>

          <div className="form-fields">
            <input
              type="text"
              placeholder="Project Name (optional)"
              value={formData.projectName}
              onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
            />
            <input
              type="text"
              placeholder="Collaboration Type (e.g., sponsored post)"
              value={formData.collaborationType}
              onChange={(e) => setFormData({ ...formData, collaborationType: e.target.value })}
            />
            <textarea
              placeholder="Write your review..."
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              rows={4}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button type="button" onClick={onCancel} disabled={loading}>
              Cancel
            </button>
            <button type="submit" disabled={loading || !allRated}>
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
