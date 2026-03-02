import React from 'react';
import { CollaborationStats as StatsType } from '../../services/collaboration-outcome.service';
import './CollaborationStats.css';

interface CollaborationStatsProps {
  stats: StatsType | null;
  loading?: boolean;
}

export const CollaborationStats: React.FC<CollaborationStatsProps> = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="collaboration-stats loading">
        <div className="stats-skeleton"></div>
      </div>
    );
  }

  if (!stats || stats.totalCollaborations === 0) {
    return (
      <div className="collaboration-stats empty">
        <p>No collaboration data yet. Complete collaborations and rate them to see your statistics!</p>
      </div>
    );
  }

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 80) return '#4caf50';
    if (rate >= 60) return '#2196f3';
    if (rate >= 40) return '#ff9800';
    return '#f44336';
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return '#4caf50';
    if (rating >= 3.5) return '#2196f3';
    if (rating >= 2.5) return '#ff9800';
    return '#f44336';
  };

  return (
    <div className="collaboration-stats">
      <h3>Your Collaboration Performance</h3>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalCollaborations}</div>
            <div className="stat-label">Total Collaborations</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{stats.successfulCollaborations}</div>
            <div className="stat-label">Successful</div>
          </div>
        </div>

        <div className="stat-card highlight">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <div 
              className="stat-value" 
              style={{ color: getSuccessRateColor(stats.successRate) }}
            >
              {stats.successRate.toFixed(1)}%
            </div>
            <div className="stat-label">Success Rate</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <div 
              className="stat-value"
              style={{ color: getRatingColor(stats.averageRating) }}
            >
              {stats.averageRating.toFixed(1)}/5
            </div>
            <div className="stat-label">Average Rating</div>
          </div>
        </div>

        {stats.averageROI > 0 && (
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <div className="stat-value">{stats.averageROI.toFixed(1)}%</div>
              <div className="stat-label">Average ROI</div>
            </div>
          </div>
        )}

        <div className="stat-card">
          <div className="stat-icon">🔄</div>
          <div className="stat-content">
            <div className="stat-value">{stats.wouldCollaborateAgainRate.toFixed(0)}%</div>
            <div className="stat-label">Would Collaborate Again</div>
          </div>
        </div>
      </div>

      {stats.successRate >= 80 && (
        <div className="achievement-badge">
          <span className="badge-icon">🏆</span>
          <span className="badge-text">Top Performer!</span>
        </div>
      )}
    </div>
  );
};
