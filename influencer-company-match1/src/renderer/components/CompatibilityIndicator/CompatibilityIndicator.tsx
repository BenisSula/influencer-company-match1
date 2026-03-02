import React from 'react';
import { HiChartBar } from 'react-icons/hi';
import './CompatibilityIndicator.css';

interface CompatibilityIndicatorProps {
  score: number;
  onViewDetails?: () => void;
  compact?: boolean;
}

export const CompatibilityIndicator: React.FC<CompatibilityIndicatorProps> = ({
  score,
  onViewDetails,
  compact = false
}) => {
  const getCompatibilityLevel = (score: number) => {
    if (score >= 90) return { emoji: '🔥', label: 'Highly Compatible', color: '#E53E3E' };
    if (score >= 75) return { emoji: '⭐', label: 'Very Compatible', color: '#DD6B20' };
    if (score >= 60) return { emoji: '✨', label: 'Good Match', color: '#D69E2E' };
    if (score >= 45) return { emoji: '👍', label: 'Decent Match', color: '#38A169' };
    if (score >= 30) return { emoji: '🤝', label: 'Potential Match', color: '#3182CE' };
    return { emoji: '❓', label: 'Low Compatibility', color: '#718096' };
  };

  const level = getCompatibilityLevel(score);

  if (compact) {
    return (
      <div className="compatibility-indicator-compact">
        <span className="compatibility-emoji">{level.emoji}</span>
        <span className="compatibility-percentage" style={{ color: level.color }}>
          {score}%
        </span>
      </div>
    );
  }

  return (
    <div className="compatibility-indicator">
      <div className="compatibility-score">
        <span className="compatibility-emoji" role="img" aria-label={level.label}>
          {level.emoji}
        </span>
        <span className="compatibility-percentage" style={{ color: level.color }}>
          {score}%
        </span>
        <span className="compatibility-label" style={{ color: level.color }}>
          {level.label}
        </span>
      </div>
      {onViewDetails && (
        <button 
          className="compatibility-details-btn"
          onClick={onViewDetails}
          aria-label="View compatibility details"
        >
          <HiChartBar size={18} />
          View Details
        </button>
      )}
    </div>
  );
};
