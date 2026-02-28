import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { MatchAnalytics } from '../../../services/admin-analytics.service';

interface MatchChartsProps {
  data: MatchAnalytics;
}

const MatchCharts: React.FC<MatchChartsProps> = ({ data }) => {
  return (
    <div className="matches-tab">
      <div className="stats-row">
        <div className="stat-box">
          <div className="stat-label">Total Matches</div>
          <div className="stat-value">{data.total}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">New Matches</div>
          <div className="stat-value">{data.new}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Average Score</div>
          <div className="stat-value">{data.averageScore}</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card full-width">
          <h3>Matches by Score Range</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.byScore}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="scoreRange" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#5B51D8" name="Number of Matches" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default MatchCharts;
