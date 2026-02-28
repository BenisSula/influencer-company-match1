import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { EngagementMetrics } from '../../../services/admin-analytics.service';

interface EngagementChartsProps {
  data: EngagementMetrics;
}

const EngagementCharts: React.FC<EngagementChartsProps> = ({ data }) => {
  return (
    <div className="engagement-tab">
      <div className="charts-grid">
        <div className="chart-card">
          <h3>Messages Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.messagesByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#E1306C" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Posts Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.postsByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#5B51D8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Matches Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.matchesByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#FD8D32" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Connections Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.connectionsByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#00D95F" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default EngagementCharts;
