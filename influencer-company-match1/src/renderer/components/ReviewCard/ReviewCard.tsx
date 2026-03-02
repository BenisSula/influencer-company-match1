import React from 'react';
import { RatingDisplay } from '../RatingDisplay/RatingDisplay';
import { formatDistanceToNow } from 'date-fns';
import './ReviewCard.css';

interface ReviewCardProps {
  review: {
    id: string;
    overallRating: number;
    comment: string;
    projectName?: string;
    collaborationType?: string;
    createdAt: string;
    reviewer: {
      name: string;
      avatarUrl?: string;
    };
    helpfulCount: number;
  };
  onMarkHelpful?: (reviewId: string) => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review, onMarkHelpful }) => {
  return (
    <div className="review-card">
      <div className="reviewer-info">
        <img
          src={review.reviewer.avatarUrl || '/default-avatar.png'}
          alt={review.reviewer.name}
          className="reviewer-avatar"
        />
        <div>
          <h4>{review.reviewer.name}</h4>
          <span className="review-date">
            {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
          </span>
        </div>
      </div>

      <RatingDisplay rating={review.overallRating} size="small" showValue />

      {review.projectName && <p className="project-name">Project: {review.projectName}</p>}
      {review.collaborationType && <p className="collab-type">{review.collaborationType}</p>}
      <p className="review-comment">{review.comment}</p>

      <div className="review-footer">
        <button onClick={() => onMarkHelpful?.(review.id)} className="helpful-btn">
          Helpful ({review.helpfulCount})
        </button>
      </div>
    </div>
  );
};
