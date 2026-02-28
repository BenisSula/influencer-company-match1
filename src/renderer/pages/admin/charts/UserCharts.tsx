import React from 'react';
import {
  LineChart,
  Line,
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
import { UserAnalytics } from '../../../services/admin-analytics.service';

const COLORS = ['#405cf5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

interface UserChartsProps {
  data: UserAnalytics;
}

const UserCharts: React.FC<UserChartsProps> = ({ data }) => {
  return (
    <div className="users-tab">
      <div className="charts-grid">
        <div className="chart-card full-width">
          <h3>User Growth Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.userGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#5B51D8" strokeWidth={2} name="New Users" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Users by Role</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.roleBreakdown}
                dataKey="count"
                nameKey="role"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {data.roleBreakdown.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Active Users by Day</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.activeUsersByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#00D95F" name="Active Users" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default UserCharts;
