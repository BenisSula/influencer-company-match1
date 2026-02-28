import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import matchHistoryService, { ScoreTrend } from '../services/match-history.service';
import MatchAnalytics from '../components/MatchAnalytics/MatchAnalytics';
import { CollaborationStats } from '../components/CollaborationStats/CollaborationStats';
import { useCollaborationOutcomes } from '../hooks/useCollaborationOutcomes';
import './MatchHistory.css';

const MatchHistory: React.FC = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<any[]>([]);
  const [trends, setTrends] = useState<ScoreTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'analytics' | 'history' | 'trends'>('analytics');
  const { stats, loading: statsLoading } = useCollaborationOutcomes();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [pageSize] = useState(20);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const trendsData = await matchHistoryService.getScoreTrends(30);
      setTrends(trendsData);
      await loadHistoryPage(1);
    } catch (error) {
      console.error('Failed to load match history:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHistoryPage = async (page: number) => {
    try {
      const result = await matchHistoryService.getHistoryPaginated(page, pageSize);
      setHistory(result.data);
      setTotalPages(result.totalPages);
      setTotalRecords(result.total);
      setHasMore(result.hasMore);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to load history page:', error);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      loadHistoryPage(newPage);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#34a853';
    if (score >= 75) return '#1a73e8';
    if (score >= 60) return '#fbbc04';
    return '#ea4335';
  };

  const handleHistoryItemClick = (matchUserId: string) => {
    navigate(`/profile/${matchUserId}`);
  };

  return (
    <div className="match-history-page">
      <div className="page-header">
        <h1>Match History & Analytics</h1>
        <p>Track your matching performance and insights over time</p>
      </div>

      {/* Collaboration Performance Stats */}
      <div className="collaboration-stats-section">
        <h2>🤝 Collaboration Performance</h2>
        <CollaborationStats stats={stats} loading={statsLoading} />
      </div>

      <div className="tabs">
        <button
          className={activeTab === 'analytics' ? 'active' : ''}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
        <button
          className={activeTab === 'history' ? 'active' : ''}
          onClick={() => setActiveTab('history')}
        >
          History
        </button>
        <button
          className={activeTab === 'trends' ? 'active' : ''}
          onClick={() => setActiveTab('trends')}
        >
          Trends
        </button>
      </div>

      {loading ? (
        <div className="loading-state">Loading...</div>
      ) : (
        <>
          {activeTab === 'analytics' && <MatchAnalytics />}

          {activeTab === 'history' && (
            <div className="history-content">
              <div className="history-list">
                {history.length === 0 ? (
                  <div className="empty-state">
                    <p>No match history yet</p>
                    <p className="empty-subtitle">Start browsing matches to see your history</p>
                  </div>
                ) : (
                  history.map((record) => (
                    <div 
                      key={record.id} 
                      className="history-item clickable"
                      onClick={() => handleHistoryItemClick(record.matchUser?.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleHistoryItemClick(record.matchUser?.id);
                        }
                      }}
                    >
                      <div className="history-item-header">
                        <div className="match-user-info">
                          <span className="match-user-email">
                            {record.matchUser?.email || 'Unknown User'}
                          </span>
                          <span className="match-user-role">
                            {record.matchUser?.role || 'N/A'}
                          </span>
                        </div>
                        <div className="match-score-badge" style={{ background: getScoreColor(record.score) }}>
                          {record.score.toFixed(1)}
                        </div>
                      </div>
                      <div className="history-item-factors">
                        {Object.entries(record.factors).map(([key, value]: [string, any]) => (
                          <div key={key} className="factor-chip">
                            <span className="factor-name">{formatFactorName(key)}</span>
                            <span className="factor-value">{value.toFixed(0)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="history-item-date">
                        {formatDate(record.createdAt)}
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="pagination-controls">
                  <button
                    className="pagination-btn"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    aria-label="Previous page"
                  >
                    ← Previous
                  </button>
                  <div className="pagination-info">
                    <span className="page-numbers">
                      Page {currentPage} of {totalPages}
                    </span>
                    <span className="total-records">
                      ({totalRecords} total matches)
                    </span>
                  </div>
                  <button
                    className="pagination-btn"
                    disabled={!hasMore}
                    onClick={() => handlePageChange(currentPage + 1)}
                    aria-label="Next page"
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'trends' && (
            <div className="trends-content">
              <div className="trends-chart">
                {trends.length === 0 ? (
                  <div className="empty-state">
                    <p>No trend data available</p>
                    <p className="empty-subtitle">Match history will appear here over time</p>
                  </div>
                ) : (
                  <div className="chart-container">
                    <div className="chart-header">
                      <h3>Average Match Score Over Time</h3>
                    </div>
                    <div className="chart-area">
                      {trends.map((trend) => {
                        const maxScore = Math.max(...trends.map(t => t.averageScore));
                        const height = (trend.averageScore / maxScore) * 100;
                        return (
                          <div key={trend.date} className="chart-bar-container">
                            <div className="chart-bar-wrapper">
                              <div
                                className="chart-bar"
                                style={{ height: `${height}%` }}
                                title={`${trend.averageScore.toFixed(1)} (${trend.matchCount} matches)`}
                              >
                                <span className="bar-value">{trend.averageScore.toFixed(0)}</span>
                              </div>
                            </div>
                            <span className="chart-label">
                              {new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

function formatFactorName(factor: string): string {
  return factor
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

export default MatchHistory;
