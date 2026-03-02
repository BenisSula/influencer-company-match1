import React from 'react';
import { ReviewCard } from '../ReviewCard/ReviewCard';
import './ReviewList.css';

interface ReviewListProps {
  reviews: any[];
  onMarkHelpful?: (reviewId: string) => void;
}

export const ReviewList: React.FC<ReviewListProps> = ({ reviews, onMarkHelpful }) => {
  if (reviews.length === 0) {
    return <p className="no-reviews">No reviews yet.</p>;
  }

  return (
    <div className="review-list">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} onMarkHelpful={onMarkHelpful} />
      ))}
    </div>
  );
};
