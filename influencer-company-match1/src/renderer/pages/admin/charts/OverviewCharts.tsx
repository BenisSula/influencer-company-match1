import React from 'react';
import {
  LineChart,
  Line,
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
import { OverviewStats } from '../../../services/admin-analytics.service';

const COLORS = ['#405cf5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

interface OverviewChartsProps {
  data: OverviewStats;
}

const OverviewCharts: React.FC<OverviewChartsProps> = ({ data }) => {
  return (
    <div className="overview-tab">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <div className="stat-label">Total Users</div>
            <div className="stat-value">{data.users.total.toLocaleString()}</div>
            <div className="stat-change positive">+{data.users.growth}% growth</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✨</div>
          <div className="stat-info">
            <div className="stat-label">Active Users</div>
            <div className="stat-value">{data.users.active.toLocaleString()}</div>
            <div className="stat-subtext">{data.users.new} new this period</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🤝</div>
          <div className="stat-info">
            <div className="stat-label">Total Matches</div>
            <div className="stat-value">{data.matches.total.toLocaleString()}</div>
            <div className="stat-subtext">{data.matches.successRate}% success rate</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <div className="stat-label">Total Revenue</div>
            <div className="stat-value">${data.revenue.totalRevenue}</div>
            <div className="stat-subtext">MRR: ${data.revenue.mrr}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📢</div>
          <div className="stat-info">
            <div className="stat-label">Active Campaigns</div>
            <div className="stat-value">{data.campaigns.active}</div>
            <div className="stat-subtext">{data.campaigns.total} total</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💬</div>
          <div className="stat-info">
            <div className="stat-label">Messages</div>
            <div className="stat-value">{data.messages.total.toLocaleString()}</div>
            <div className="stat-subtext">{data.messages.new} new</div>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Revenue Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.revenue.revenueByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#E1306C" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Revenue by Plan</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.revenue.revenueByPlan}
                dataKey="revenue"
                nameKey="plan"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {data.revenue.revenueByPlan.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default OverviewCharts;
