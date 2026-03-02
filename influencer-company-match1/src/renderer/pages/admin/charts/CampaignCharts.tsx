import React from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { CampaignAnalytics } from '../../../services/admin-analytics.service';

const COLORS = ['#405cf5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

interface CampaignChartsProps {
  data: CampaignAnalytics;
}

const CampaignCharts: React.FC<CampaignChartsProps> = ({ data }) => {
  return (
    <div className="campaigns-tab">
      <div className="stats-row">
        <div className="stat-box">
          <div className="stat-label">Total Campaigns</div>
          <div className="stat-value">{data.total}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Active Campaigns</div>
          <div className="stat-value">{data.active}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Completed Campaigns</div>
          <div className="stat-value">{data.completed}</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Campaigns by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.byStatus}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {data.byStatus.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Campaigns Created Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.byDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#FD8D32" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default CampaignCharts;
