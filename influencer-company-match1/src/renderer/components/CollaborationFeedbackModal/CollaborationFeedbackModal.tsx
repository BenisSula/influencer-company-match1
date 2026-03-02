import React, { useState } from 'react';
import './CollaborationFeedbackModal.css';

interface CollaborationFeedbackModalProps {
  connectionId: string;
  partnerName: string;
  onClose: () => void;
  onSubmit: (feedback: FeedbackData) => Promise<void>;
}

export interface FeedbackData {
  connectionId: string;
  successRating: number;
  completionStatus: string;
  userFeedback?: string;
  roiAchieved?: number;
  wouldCollaborateAgain: boolean;
}

export const CollaborationFeedbackModal: React.FC<CollaborationFeedbackModalProps> = ({
  connectionId,
  partnerName,
  onClose,
  onSubmit,
}) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [status, setStatus] = useState('completed');
  const [feedback, setFeedback] = useState('');
  const [roi, setRoi] = useState('');
  const [wouldCollaborate, setWouldCollaborate] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('Please provide a rating');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit({
        connectionId,
        successRating: rating,
        completionStatus: status,
        userFeedback: feedback || undefined,
        roiAchieved: roi ? parseFloat(roi) : undefined,
        wouldCollaborateAgain: wouldCollaborate,
      });
      onClose();
    } catch (error: any) {
      console.error('Failed to submit feedback:', error);
      
      // Show more detailed error message
      let errorMessage = 'Failed to submit feedback. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingLabel = (value: number) => {
    const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
    return labels[value] || '';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="collaboration-feedback-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Rate Your Collaboration</h2>
          <button className="close-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="modal-body">
          <p className="partner-name">How was your experience with <strong>{partnerName}</strong>?</p>

          <div className="rating-section">
            <label>Overall Rating *</label>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star ${(hoveredRating || rating) >= star ? 'filled' : ''}`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  aria-label={`Rate ${star} stars`}
                >
                  ★
                </button>
              ))}
            </div>
            {rating > 0 && (
              <span className="rating-label">{getRatingLabel(rating)}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="status">Collaboration Status *</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="form-select"
            >
              <option value="completed">Completed Successfully</option>
              <option value="ongoing">Still Ongoing</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="feedback">Your Feedback (Optional)</label>
            <textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your experience, what went well, what could be improved..."
              rows={4}
              className="form-textarea"
              maxLength={1000}
            />
            <span className="char-count">{feedback.length}/1000</span>
          </div>

          <div className="form-group">
            <label htmlFor="roi">ROI Achieved (Optional)</label>
            <div className="input-with-suffix">
              <input
                id="roi"
                type="number"
                value={roi}
                onChange={(e) => setRoi(e.target.value)}
                placeholder="e.g., 250"
                className="form-input"
                min="0"
                step="0.1"
              />
              <span className="input-suffix">%</span>
            </div>
            <small className="form-hint">Enter the return on investment as a percentage</small>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={wouldCollaborate}
                onChange={(e) => setWouldCollaborate(e.target.checked)}
                className="form-checkbox"
              />
              <span>I would collaborate with them again</span>
            </label>
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="btn-secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={rating === 0 || isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      </div>
    </div>
  );
};
