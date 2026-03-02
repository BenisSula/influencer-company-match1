import React from 'react';
import './CompatibilityBreakdown.css';

export interface CompatibilityFactor {
  name: string;
  score: number;
  weight: number;
  description: string;
}

interface CompatibilityBreakdownProps {
  factors: CompatibilityFactor[];
  overallScore: number;
}

export const CompatibilityBreakdown: React.FC<CompatibilityBreakdownProps> = ({
  factors,
  overallScore
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#38A169';
    if (score >= 60) return '#D69E2E';
    return '#E53E3E';
  };

  return (
    <div className="compatibility-breakdown">
      <div className="breakdown-header">
        <h3>Compatibility Analysis</h3>
        <div className="overall-score">
          <span className="score-label">Overall Score:</span>
          <span className="score-value" style={{ color: getScoreColor(overallScore) }}>
            {overallScore}%
          </span>
        </div>
      </div>

      <div className="factors-list">
        {factors.map((factor, index) => (
          <div key={index} className="factor-item">
            <div className="factor-header">
              <div className="factor-info">
                <span className="factor-name">{factor.name}</span>
                <span className="factor-weight">Weight: {factor.weight}%</span>
              </div>
              <span 
                className="factor-score"
                style={{ color: getScoreColor(factor.score) }}
              >
                {factor.score}%
              </span>
            </div>
            
            <div className="factor-bar-container">
              <div 
                className="factor-bar"
                style={{ 
                  width: `${factor.score}%`,
                  backgroundColor: getScoreColor(factor.score)
                }}
              />
            </div>
            
            <p className="factor-description">{factor.description}</p>
          </div>
        ))}
      </div>

      <div className="breakdown-footer">
        <p className="breakdown-note">
          The overall compatibility score is calculated based on weighted factors that matter most for successful collaborations.
        </p>
      </div>
    </div>
  );
};
