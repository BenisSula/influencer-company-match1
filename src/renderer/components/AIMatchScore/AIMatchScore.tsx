import React from 'react';
import './AIMatchScore.css';

interface AIMatchScoreProps {
  aiScore: number;
  confidence: number;
  factors: {
    nicheAlignment: number;
    audienceMatch: number;
    engagementPotential: number;
    brandFit: number;
    historicalSuccess: number;
  };
  reasoning: string[];
  successProbability: number;
  compact?: boolean;
}

export const AIMatchScore: React.FC<AIMatchScoreProps> = ({
  aiScore,
  confidence,
  factors,
  reasoning,
  successProbability,
  compact = false,
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#3b82f6';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const formatFactorName = (key: string) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  if (compact) {
    return (
      <div className="ai-match-score-compact">
        <div className="ai-badge">
          <span className="ai-icon">🤖</span>
          <span className="ai-label">AI</span>
        </div>
        <div className="score-value" style={{ color: getScoreColor(aiScore) }}>
          {Math.round(aiScore)}%
        </div>
        <div className="confidence-badge">{confidence}% confident</div>
      </div>
    );
  }

  return (
    <div className="ai-match-score">
      <div className="score-header">
        <div className="ai-badge-large">
          <span className="ai-icon">🤖</span>
          <span className="ai-label">AI Match Score</span>
        </div>
        <div className="score-main">
          <span className="score-value" style={{ color: getScoreColor(aiScore) }}>
            {Math.round(aiScore)}%
          </span>
          <span className="confidence">({confidence}% confidence)</span>
        </div>
      </div>

      <div className="success-probability">
        <div className="probability-label">Success Probability</div>
        <div className="probability-bar">
          <div
            className="probability-fill"
            style={{
              width: `${successProbability}%`,
              backgroundColor: getScoreColor(successProbability),
            }}
          />
        </div>
        <div className="probability-value">{Math.round(successProbability)}%</div>
      </div>

      <div className="ai-factors">
        <h4>Match Factors</h4>
        {Object.entries(factors).map(([key, value]) => (
          <div key={key} className="factor-item">
            <div className="factor-header">
              <span className="factor-name">{formatFactorName(key)}</span>
              <span className="factor-score">{Math.round(value)}%</span>
            </div>
            <div className="factor-bar">
              <div
                className="factor-fill"
                style={{
                  width: `${value}%`,
                  backgroundColor: getScoreColor(value),
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="ai-reasoning">
        <h4>Why This Match Works</h4>
        <ul>
          {reasoning.map((reason, index) => (
            <li key={index}>
              <span className="reason-icon">✓</span>
              {reason}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
