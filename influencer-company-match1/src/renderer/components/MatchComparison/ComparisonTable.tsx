import React from 'react';
import { Avatar } from '../Avatar/Avatar';
import './ComparisonTable.css';

interface ComparisonMatch {
  id: string;
  userId: string;
  name: string;
  role: string;
  avatarUrl?: string;
  matchScore: number;
  factors: {
    nicheCompatibility: number;
    budgetAlignment: number;
    platformOverlap: number;
    audienceMatch: number;
    engagementQuality: number;
  };
}

interface ComparisonTableProps {
  matches: ComparisonMatch[];
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({ matches }) => {
  const getScoreClass = (score: number) => {
    if (score >= 80) return 'score-excellent';
    if (score >= 60) return 'score-good';
    if (score >= 40) return 'score-fair';
    return 'score-poor';
  };

  const getBestScore = (factor: keyof ComparisonMatch['factors']) => {
    return Math.max(...matches.map(m => m.factors[factor]));
  };

  const renderFactorCell = (match: ComparisonMatch, factor: keyof ComparisonMatch['factors']) => {
    const score = match.factors[factor];
    const isBest = score === getBestScore(factor);
    
    return (
      <td className={`factor-cell ${getScoreClass(score)} ${isBest ? 'best-score' : ''}`}>
        <span className="score-value">{score}%</span>
        {isBest && <span className="best-badge">Best</span>}
      </td>
    );
  };

  const renderMobileCard = (match: ComparisonMatch) => {
    const factors = [
      { key: 'nicheCompatibility' as const, label: 'Niche Compatibility' },
      { key: 'budgetAlignment' as const, label: 'Budget Alignment' },
      { key: 'platformOverlap' as const, label: 'Platform Overlap' },
      { key: 'audienceMatch' as const, label: 'Audience Match' },
      { key: 'engagementQuality' as const, label: 'Engagement Quality' },
    ];

    return (
      <div key={match.id} className="mobile-comparison-card">
        <div className="mobile-card-header">
          <Avatar 
            src={match.avatarUrl} 
            alt={match.name}
            size="xs"
          />
          <div className="mobile-card-info">
            <h3 title={match.name}>{match.name}</h3>
            <div className="mobile-card-role" title={match.role}>{match.role}</div>
          </div>
          <div className="mobile-score-badge">
            <span className={`mobile-score-value ${getScoreClass(match.matchScore)}`}>
              {match.matchScore}%
            </span>
            <span className="mobile-score-label">Overall</span>
          </div>
        </div>
        
        <div className="mobile-factors">
          {factors.map(({ key, label }) => {
            const score = match.factors[key];
            const isBest = score === getBestScore(key);
            return (
              <div key={key} className="mobile-factor-item">
                <span className="mobile-factor-label">{label}</span>
                <span className={`mobile-factor-value ${getScoreClass(score)}`}>
                  {score}%
                  {isBest && <span className="mobile-best-badge">Best</span>}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="comparison-table-wrapper">
      {/* Mobile: Card Layout */}
      {matches.map(renderMobileCard)}
      
      {/* Desktop: Table Layout */}
      <table className="comparison-table">
        <thead>
          <tr>
            <th className="header-label">Criteria</th>
            {matches.map(match => (
              <th key={match.id} className="header-match">
                <div className="match-header">
                  <Avatar 
                    src={match.avatarUrl} 
                    alt={match.name}
                    size="xs"
                  />
                  <div className="match-info">
                    <div className="match-name" title={match.name}>{match.name}</div>
                    <div className="match-role" title={match.role}>{match.role}</div>
                  </div>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="overall-row">
            <td className="row-label">
              <strong>Overall Match Score</strong>
            </td>
            {matches.map(match => (
              <td key={match.id} className={`score-cell ${getScoreClass(match.matchScore)}`}>
                <span className="score-large">{match.matchScore}%</span>
              </td>
            ))}
          </tr>
          
          <tr>
            <td className="row-label">Niche Compatibility</td>
            {matches.map(match => renderFactorCell(match, 'nicheCompatibility'))}
          </tr>
          
          <tr>
            <td className="row-label">Budget Alignment</td>
            {matches.map(match => renderFactorCell(match, 'budgetAlignment'))}
          </tr>
          
          <tr>
            <td className="row-label">Platform Overlap</td>
            {matches.map(match => renderFactorCell(match, 'platformOverlap'))}
          </tr>
          
          <tr>
            <td className="row-label">Audience Match</td>
            {matches.map(match => renderFactorCell(match, 'audienceMatch'))}
          </tr>
          
          <tr>
            <td className="row-label">Engagement Quality</td>
            {matches.map(match => renderFactorCell(match, 'engagementQuality'))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};
