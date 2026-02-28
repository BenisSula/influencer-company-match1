import React from 'react';
import './MatchFactorTooltip.css';

interface MatchFactorTooltipProps {
  factor: 'niche' | 'location' | 'budget' | 'platform' | 'audience' | 'engagement';
  score: number;
  details?: {
    userValue?: string | number;
    matchValue?: string | number;
    explanation?: string;
  };
}

export const MatchFactorTooltip: React.FC<MatchFactorTooltipProps> = ({
  factor,
  score,
  details,
}) => {
  const getExplanation = () => {
    switch (factor) {
      case 'niche':
        if (score >= 80) return '🎯 Excellent niche alignment! Your industries are highly compatible.';
        if (score >= 60) return '✅ Good niche match. Related industries with overlap.';
        if (score >= 40) return '⚠️ Fair match. Some industry overlap but not ideal.';
        return '❌ Low niche compatibility. Consider different matches.';
      
      case 'location':
        if (score >= 80) return '📍 Great! You\'re in the same area for easy collaboration.';
        if (score >= 60) return '🗺️ Same region. Remote collaboration is feasible.';
        return '🌍 Different locations. Remote work recommended.';
      
      case 'budget':
        if (score >= 80) return '💰 Perfect budget alignment! Rate matches expectations.';
        if (score >= 60) return '💵 Good budget fit. Negotiation may be needed.';
        if (score >= 40) return '⚠️ Budget may be tight. Discuss expectations early.';
        return '❌ Budget mismatch. Consider adjusting your rates or budget.';
      
      case 'platform':
        if (score >= 80) return '📱 Excellent! You both use the same platforms.';
        if (score >= 50) return '✅ Some platform overlap. Good for cross-promotion.';
        return '⚠️ Limited platform overlap. May need to expand.';
      
      case 'audience':
        if (score >= 80) return '👥 Perfect audience size for this budget/campaign.';
        if (score >= 60) return '✅ Good audience match. Size aligns well.';
        return '⚠️ Audience size may not match budget expectations.';
      
      case 'engagement':
        if (score >= 80) return '🔥 Excellent engagement rate! Highly active audience.';
        if (score >= 60) return '✅ Good engagement. Quality audience interaction.';
        return '⚠️ Engagement could be improved. Focus on quality content.';
      
      default:
        return '';
    }
  };

  const getActionableTip = () => {
    if (score >= 70) return null;
    
    switch (factor) {
      case 'niche':
        return '💡 Tip: Update your niche tags to improve matches';
      case 'location':
        return '💡 Tip: Add "Open to remote work" to your profile';
      case 'budget':
        return '💡 Tip: Adjust your budget range or rates';
      case 'platform':
        return '💡 Tip: Add more platforms to increase overlap';
      case 'audience':
        return '💡 Tip: Target campaigns matching your audience size';
      case 'engagement':
        return '💡 Tip: Focus on quality content to boost engagement';
      default:
        return null;
    }
  };

  const getFactorLabel = () => {
    const labels = {
      niche: 'Niche/Industry Match',
      location: 'Location Compatibility',
      budget: 'Budget Alignment',
      platform: 'Platform Overlap',
      audience: 'Audience Size Match',
      engagement: 'Engagement Quality',
    };
    return labels[factor];
  };

  return (
    <div className="match-factor-tooltip">
      <div className="tooltip-header">
        <span className="tooltip-score">{score}%</span>
        <span className="tooltip-label">{getFactorLabel()}</span>
      </div>
      
      <div className="tooltip-explanation">
        {getExplanation()}
      </div>
      
      {details?.explanation && (
        <div className="tooltip-details">
          {details.explanation}
        </div>
      )}
      
      {getActionableTip() && (
        <div className="tooltip-tip">
          {getActionableTip()}
        </div>
      )}
    </div>
  );
};
