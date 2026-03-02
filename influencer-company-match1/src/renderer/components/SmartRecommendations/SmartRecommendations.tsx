import React, { useState, useEffect } from 'react';
import { useRecommendations } from '../../hooks/useAIMatching';
import { RecommendationCard } from './RecommendationCard';
import './SmartRecommendations.css';

interface SmartRecommendationsProps {
  limit?: number;
}

export const SmartRecommendations: React.FC<SmartRecommendationsProps> = ({ limit = 10 }) => {
  const { recommendations, loading, error, loadRecommendations } = useRecommendations();
  const [activeTab, setActiveTab] = useState<'personalized' | 'trending' | 'similar' | 'collaborative'>('personalized');

  useEffect(() => {
    loadRecommendations(limit);
  }, [limit]);

  if (loading) {
    return (
      <div className="smart-recommendations-loading">
        <div className="loading-spinner"></div>
        <p>Finding perfect matches for you...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="smart-recommendations-error">
        <p>Unable to load recommendations</p>
        <button onClick={() => loadRecommendations(limit)}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="smart-recommendations">
      <div className="recommendations-header">
        <h2>🎯 Smart Recommendations</h2>
        <p>Discover your perfect collaboration partners</p>
      </div>

      <div className="recommendations-tabs">
        <button
          className={`tab ${activeTab === 'personalized' ? 'active' : ''}`}
          onClick={() => setActiveTab('personalized')}
        >
          <span className="tab-icon">✨</span>
          For You
        </button>
        <button
          className={`tab ${activeTab === 'trending' ? 'active' : ''}`}
          onClick={() => setActiveTab('trending')}
        >
          <span className="tab-icon">🔥</span>
          Trending
        </button>
        <button
          className={`tab ${activeTab === 'similar' ? 'active' : ''}`}
          onClick={() => setActiveTab('similar')}
        >
          <span className="tab-icon">👥</span>
          Similar
        </button>
        <button
          className={`tab ${activeTab === 'collaborative' ? 'active' : ''}`}
          onClick={() => setActiveTab('collaborative')}
        >
          <span className="tab-icon">🤝</span>
          Community
        </button>
      </div>

      <div className="recommendations-content">
        {activeTab === 'personalized' && (
          <div className="recommendation-section">
            <div className="section-header">
              <h3>Recommended for You</h3>
              <p>Based on your profile and preferences</p>
            </div>
            <div className="recommendations-grid">
              {recommendations.length > 0 ? (
                recommendations.map((rec) => (
                  <RecommendationCard key={rec.id} recommendation={rec} />
                ))
              ) : (
                <div className="no-recommendations">
                  <p>No recommendations available yet</p>
                  <p className="hint">Complete your profile to get better recommendations</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'trending' && (
          <div className="recommendation-section">
            <div className="section-header">
              <h3>Trending This Week</h3>
              <p>Popular matches in your niche</p>
            </div>
            <div className="recommendations-grid">
              <div className="coming-soon">
                <span className="icon">🚀</span>
                <p>Trending recommendations coming soon!</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'similar' && (
          <div className="recommendation-section">
            <div className="section-header">
              <h3>Similar to Your Matches</h3>
              <p>Profiles similar to your successful connections</p>
            </div>
            <div className="recommendations-grid">
              <div className="coming-soon">
                <span className="icon">🎯</span>
                <p>Similar profile recommendations coming soon!</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'collaborative' && (
          <div className="recommendation-section">
            <div className="section-header">
              <h3>Community Recommendations</h3>
              <p>Based on what users like you connected with</p>
            </div>
            <div className="recommendations-grid">
              <div className="coming-soon">
                <span className="icon">🌟</span>
                <p>Collaborative filtering coming soon!</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
