import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import matchHistoryService, { MatchAnalytics as AnalyticsData } from '../../services/match-history.service';
import './MatchAnalytics.css';

interface MatchAnalyticsProps {
  timeRange?: 'week' | 'month' | 'all';
}

const MatchAnalytics: React.FC<MatchAnalyticsProps> = ({ timeRange = 'month' }) => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState<'week' | 'month' | 'all'>(timeRange);

  useEffect(() => {
    loadAnalytics();
  }, [selectedRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await matchHistoryService.getAnalytics(selectedRange);
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="match-analytics-loading">Loading analytics...</div>;
  }

  if (!analytics) {
    return <div className="match-analytics-error">Failed to load analytics</div>;
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return '↑';
    if (trend === 'down') return '↓';
    return '→';
  };

  const getTrendClass = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return 'trend-up';
    if (trend === 'down') return 'trend-down';
    return 'trend-stable';
  };

  const handleMatchClick = (matchUserId: string) => {
    navigate(`/profile/${matchUserId}`);
  };

  return (
    <div className="match-analytics">
      <div className="analytics-header">
        <h2>Match Analytics</h2>
        <div className="time-range-selector">
          <button
            className={selectedRange === 'week' ? 'active' : ''}
            onClick={() => setSelectedRange('week')}
          >
            Week
          </button>
          <button
            className={selectedRange === 'month' ? 'active' : ''}
            onClick={() => setSelectedRange('month')}
          >
            Month
          </button>
          <button
            className={selectedRange === 'all' ? 'active' : ''}
            onClick={() => setSelectedRange('all')}
          >
            All Time
          </button>
        </div>
      </div>

      <div className="analytics-grid">
        {/* Average Score Card */}
        <div className="analytics-card">
          <h3>Average Match Score</h3>
          <div className="score-display">
            <span className="score-value">{analytics.averageScore.current.toFixed(1)}</span>
            <span className={`score-change ${analytics.averageScore.change >= 0 ? 'positive' : 'negative'}`}>
              {analytics.averageScore.change >= 0 ? '+' : ''}
              {analytics.averageScore.change.toFixed(1)}%
            </span>
          </div>
          <p className="score-subtitle">
            Previous: {analytics.averageScore.previous.toFixed(1)}
          </p>
        </div>

        {/* New Matches Card */}
        <div className="analytics-card">
          <h3>New Matches</h3>
          <div className="score-display">
            <span className="score-value">{analytics.newMatchesCount}</span>
          </div>
          <p className="score-subtitle">
            In selected period
          </p>
        </div>

        {/* Score Distribution */}
        <div className="analytics-card distribution-card">
          <h3>Score Distribution</h3>
          <div className="distribution-bars">
            <div className="distribution-item">
              <span className="distribution-label">Perfect (90-100)</span>
              <div className="distribution-bar">
                <div
                  className="distribution-fill perfect"
                  style={{ width: `${(analytics.scoreDistribution.perfect / analytics.newMatchesCount) * 100}%` }}
                />
              </div>
              <span className="distribution-count">{analytics.scoreDistribution.perfect}</span>
            </div>
            <div className="distribution-item">
              <span className="distribution-label">Excellent (75-89)</span>
              <div className="distribution-bar">
                <div
                  className="distribution-fill excellent"
                  style={{ width: `${(analytics.scoreDistribution.excellent / analytics.newMatchesCount) * 100}%` }}
                />
              </div>
              <span className="distribution-count">{analytics.scoreDistribution.excellent}</span>
            </div>
            <div className="distribution-item">
              <span className="distribution-label">Good (60-74)</span>
              <div className="distribution-bar">
                <div
                  className="distribution-fill good"
                  style={{ width: `${(analytics.scoreDistribution.good / analytics.newMatchesCount) * 100}%` }}
                />
              </div>
              <span className="distribution-count">{analytics.scoreDistribution.good}</span>
            </div>
            <div className="distribution-item">
              <span className="distribution-label">Fair (0-59)</span>
              <div className="distribution-bar">
                <div
                  className="distribution-fill fair"
                  style={{ width: `${(analytics.scoreDistribution.fair / analytics.newMatchesCount) * 100}%` }}
                />
              </div>
              <span className="distribution-count">{analytics.scoreDistribution.fair}</span>
            </div>
          </div>
        </div>

        {/* Factor Trends */}
        <div className="analytics-card factors-card">
          <h3>Match Factor Trends</h3>
          <div className="factors-list">
            {Object.entries(analytics.factorTrends).map(([factor, data]) => (
              <div key={factor} className="factor-item">
                <div className="factor-header">
                  <span className="factor-name">{formatFactorName(factor)}</span>
                  <span className={`factor-trend ${getTrendClass(data.trend)}`}>
                    {getTrendIcon(data.trend)} {data.change.toFixed(1)}%
                  </span>
                </div>
                <div className="factor-bar">
                  <div
                    className="factor-fill"
                    style={{ width: `${data.average}%` }}
                  />
                </div>
                <span className="factor-value">{data.average.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Matches */}
        <div className="analytics-card top-matches-card">
          <h3>Top Matches</h3>
          <div className="top-matches-list">
            {analytics.topMatches.map((match, index) => (
              <div 
                key={match.id} 
                className="top-match-item clickable"
                onClick={() => handleMatchClick(match.matchUser.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleMatchClick(match.matchUser.id);
                  }
                }}
              >
                <span className="match-rank">#{index + 1}</span>
                <div className="match-info">
                  <span className="match-email">{match.matchUser.email}</span>
                  <span className="match-role">{match.matchUser.role}</span>
                </div>
                <span className="match-score">{match.score.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

function formatFactorName(factor: string): string {
  return factor
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

export default MatchAnalytics;
