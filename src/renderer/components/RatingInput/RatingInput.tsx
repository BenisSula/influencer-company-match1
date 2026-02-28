import React, { useState } from 'react';
import { Star } from 'lucide-react';
import './RatingInput.css';

interface RatingInputProps {
  value: number;
  onChange: (rating: number) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  className?: string;
}

const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

export const RatingInput: React.FC<RatingInputProps> = ({
  value,
  onChange,
  label,
  required = false,
  disabled = false,
  size = 'medium',
  showLabel = true,
  className = '',
}) => {
  const [hover, setHover] = useState(0);

  const starSize = size === 'small' ? 20 : size === 'medium' ? 24 : 28;
  const displayRating = hover || value;

  const handleClick = (rating: number) => {
    if (!disabled) {
      onChange(rating);
    }
  };

  const handleMouseEnter = (rating: number) => {
    if (!disabled) {
      setHover(rating);
    }
  };

  const handleMouseLeave = () => {
    if (!disabled) {
      setHover(0);
    }
  };

  return (
    <div className={`rating-input rating-input--${size} ${disabled ? 'rating-input--disabled' : ''} ${className}`}>
      {label && (
        <label className="rating-input__label">
          {label}
          {required && <span className="rating-input__required">*</span>}
        </label>
      )}
      
      <div className="rating-input__container">
        <div className="rating-input__stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleClick(star)}
              onMouseEnter={() => handleMouseEnter(star)}
              onMouseLeave={handleMouseLeave}
              className={`rating-input__star-btn ${displayRating >= star ? 'rating-input__star-btn--active' : ''}`}
              disabled={disabled}
              aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
            >
              <Star
                size={starSize}
                fill={displayRating >= star ? 'var(--color-warning, #FBBF24)' : 'none'}
                color={displayRating >= star ? 'var(--color-warning, #FBBF24)' : '#D1D5DB'}
                className="rating-input__star-icon"
              />
            </button>
          ))}
        </div>
        
        {showLabel && displayRating > 0 && (
          <span className="rating-input__rating-label">
            {RATING_LABELS[displayRating]}
          </span>
        )}
      </div>
    </div>
  );
};
