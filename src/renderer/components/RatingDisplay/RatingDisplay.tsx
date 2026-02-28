import React from 'react';
import { Star } from 'lucide-react';
import './RatingDisplay.css';

interface RatingDisplayProps {
  rating: number; // 0-5, supports decimals
  size?: 'small' | 'medium' | 'large';
  showValue?: boolean;
  className?: string;
}

export const RatingDisplay: React.FC<RatingDisplayProps> = ({
  rating,
  size = 'medium',
  showValue = false,
  className = '',
}) => {
  const starSize = size === 'small' ? 16 : size === 'medium' ? 20 : 24;
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;

  return (
    <div className={`rating-display rating-display--${size} ${className}`}>
      <div className="rating-display__stars">
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            // Full star
            return (
              <Star
                key={i}
                size={starSize}
                fill="var(--color-warning, #FBBF24)"
                color="var(--color-warning, #FBBF24)"
                className="rating-display__star rating-display__star--filled"
              />
            );
          } else if (i === fullStars && hasHalf) {
            // Half star
            return (
              <div key={i} className="rating-display__star-container">
                <Star
                  size={starSize}
                  color="#D1D5DB"
                  className="rating-display__star rating-display__star--empty"
                />
                <Star
                  size={starSize}
                  fill="var(--color-warning, #FBBF24)"
                  color="var(--color-warning, #FBBF24)"
                  className="rating-display__star rating-display__star--half"
                  style={{ clipPath: 'inset(0 50% 0 0)' }}
                />
              </div>
            );
          } else {
            // Empty star
            return (
              <Star
                key={i}
                size={starSize}
                color="#D1D5DB"
                className="rating-display__star rating-display__star--empty"
              />
            );
          }
        })}
      </div>
      {showValue && (
        <span className="rating-display__value">{rating.toFixed(1)}</span>
      )}
    </div>
  );
};
