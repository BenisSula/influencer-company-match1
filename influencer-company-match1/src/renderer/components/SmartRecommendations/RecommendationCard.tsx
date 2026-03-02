import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '../Avatar/Avatar';
import './RecommendationCard.css';

interface RecommendationCardProps {
  recommendation: {
    id: string;
    user: any;
    score: number;
    type: string;
    reasoning: string[];
  };
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation }) => {
  const navigate = useNavigate();
  const { user, score, reasoning } = recommendation;

  const handleViewProfile = () => {
    navigate(`/profile/${user.id}`);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#3b82f6';
    return '#f59e0b';
  };

  return (
    <div className="recommendation-card" onClick={handleViewProfile}>
      <div className="card-header">
        <Avatar
          src={user.avatarUrl}
          alt={user.name || user.email}
          size="xl"
        />
        <div className="recommendation-badge" style={{ backgroundColor: getScoreColor(score) }}>
          {score}%
        </div>
      </div>

      <div className="card-body">
        <h4 className="user-name">{user.name || 'User'}</h4>
        <p className="user-niche">{user.niche || user.industry || 'Professional'}</p>

        {user.location && (
          <p className="user-location">
            <span className="icon">📍</span>
            {user.location}
          </p>
        )}

        {user.audienceSize && (
          <p className="user-audience">
            <span className="icon">👥</span>
            {user.audienceSize.toLocaleString()} followers
          </p>
        )}

        {user.budget && (
          <p className="user-budget">
            <span className="icon">💰</span>
            ${user.budget.toLocaleString()} budget
          </p>
        )}

        <div className="reasoning">
          {reasoning.slice(0, 2).map((reason, index) => (
            <div key={index} className="reason-item">
              <span className="check-icon">✓</span>
              {reason}
            </div>
          ))}
        </div>
      </div>

      <div className="card-footer">
        <button className="view-profile-btn">
          View Profile
        </button>
      </div>
    </div>
  );
};
