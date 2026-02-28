/**
 * RatingWidget Component
 * Display dynamic platform ratings from profile_reviews table
 */

import React from 'react';
import { Star, ExternalLink } from 'lucide-react';
import { platformRatings } from '../../data/landing/ratings';
import { AnimatedStatCounter } from './AnimatedStatCounter';
import { usePlatformRatings } from '../../hooks/useLandingData';
import './RatingWidget.css';

export const RatingWidget: React.FC = () => {
  const { ratings, loading } = usePlatformRatings();

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} size={16} fill="currentColor" className="rating-star rating-star--filled" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Star key={i} size={16} fill="currentColor" className="rating-star rating-star--half" />
        );
      } else {
        stars.push(
          <Star key={i} size={16} className="rating-star rating-star--empty" />
        );
      }
    }

    return stars;
  };

  // Use dynamic ratings if available, otherwise fallback to static
  const averageRating = ratings?.averageRating || 4.8;
  const totalReviews = ratings?.totalReviews || 1087;

  return (
    <div className="rating-widget">
      <div className="rating-widget__header">
        <h3 className="rating-widget__title">Trusted by Thousands</h3>
        <p className="rating-widget__subtitle">See what our users say</p>
      </div>

      <div className="rating-widget__list">
        {platformRatings.map((rating, index) => (
          <a
            key={rating.platform}
            href={rating.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rating-card"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="rating-card__header">
              <div className="rating-card__platform">{rating.platform.toUpperCase()}</div>
              {rating.badge && (
                <div className="rating-card__badge">{rating.badge}</div>
              )}
            </div>

            <div className="rating-card__rating">
              <div className="rating-card__score">
                {rating.rating.toFixed(1)}
              </div>
              <div className="rating-card__stars">
                {renderStars(rating.rating)}
              </div>
            </div>

            <div className="rating-card__reviews">
              Based on <strong><AnimatedStatCounter end={rating.reviewCount} /></strong> reviews
            </div>

            <div className="rating-card__link">
              View Reviews <ExternalLink size={14} />
            </div>
          </a>
        ))}
      </div>

      <div className="rating-widget__summary">
        <div className="rating-widget__summary-stat">
          <div className="rating-widget__summary-value">
            {loading ? '...' : averageRating.toFixed(1)}
          </div>
          <div className="rating-widget__summary-label">Average Rating</div>
        </div>
        <div className="rating-widget__summary-stat">
          <div className="rating-widget__summary-value">
            {loading ? '...' : <AnimatedStatCounter end={totalReviews} suffix="+" />}
          </div>
          <div className="rating-widget__summary-label">Total Reviews</div>
        </div>
      </div>

      {/* Distribution Chart (if ratings available) */}
      {ratings && ratings.distribution && (
        <div className="rating-widget__distribution">
          <h4 className="rating-widget__distribution-title">Rating Distribution</h4>
          {Object.entries(ratings.distribution).reverse().map(([rating, count]: [string, any]) => {
            const total = ratings.totalReviews || 1;
            const percentage = (count / total) * 100;
            return (
              <div key={rating} className="distribution-row">
                <span className="distribution-label">{rating} ★</span>
                <div className="distribution-bar-container">
                  <div
                    className="distribution-bar"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="distribution-count">{count}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
