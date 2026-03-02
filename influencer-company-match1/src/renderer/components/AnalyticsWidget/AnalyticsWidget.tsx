import React from 'react';
import { Eye, Users, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { DashboardWidget } from '../DashboardWidget/DashboardWidget';
import './AnalyticsWidget.css';

interface AnalyticsData {
  profileViews: number;
  matchImpressions: number;
  responseRate: number;
  trend: 'up' | 'down' | 'stable';
}

interface AnalyticsWidgetProps {
  data: AnalyticsData;
  loading?: boolean;
  error?: string;
}

export const AnalyticsWidget: React.FC<AnalyticsWidgetProps> = ({
  data,
  loading,
  error,
}) => {
  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp size={16} style={{ color: '#2E7D32' }} />;
    if (trend === 'down') return <TrendingDown size={16} style={{ color: '#EF4444' }} />;
    return null;
  };

  return (
    <DashboardWidget
      title="Your Analytics"
      icon={<BarChart3 size={20} />}
      loading={loading}
      error={error}
    >
      <div className="analytics-grid">
        <div className="analytics-stat">
          <div className="analytics-stat-icon">
            <Eye size={24} style={{ color: '#1877F2' }} />
          </div>
          <div className="analytics-stat-content">
            <div className="analytics-stat-value">{data.profileViews}</div>
            <div className="analytics-stat-label">Profile Views</div>
          </div>
        </div>

        <div className="analytics-stat">
          <div className="analytics-stat-icon">
            <Users size={24} style={{ color: '#14B8A6' }} />
          </div>
          <div className="analytics-stat-content">
            <div className="analytics-stat-value">{data.matchImpressions}</div>
            <div className="analytics-stat-label">Match Impressions</div>
          </div>
        </div>

        <div className="analytics-stat">
          <div className="analytics-stat-icon">
            <BarChart3 size={24} style={{ color: '#F59E0B' }} />
          </div>
          <div className="analytics-stat-content">
            <div className="analytics-stat-value">
              {data.responseRate}%
              {getTrendIcon(data.trend)}
            </div>
            <div className="analytics-stat-label">Response Rate</div>
          </div>
        </div>
      </div>
    </DashboardWidget>
  );
};
