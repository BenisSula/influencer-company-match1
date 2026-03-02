import React, { useState, lazy, Suspense } from 'react';
import { Download, Calendar, FileText } from 'lucide-react';
import AdminPageHeader from '../../components/AdminPageHeader';
import {
  useAdminAnalyticsOverview,
  useAdminUserGrowth,
  useAdminRevenue,
  useAdminEngagement,
} from '../../hooks/admin/useAdminAnalytics';
import { useToast } from '../../hooks/useToast';
import './AdminAnalytics.css';

// Lazy load heavy chart components
const OverviewCharts = lazy(() => import('./charts/OverviewCharts'));
const UserCharts = lazy(() => import('./charts/UserCharts'));
const EngagementCharts = lazy(() => import('./charts/EngagementCharts'));
const CampaignCharts = lazy(() => import('./charts/CampaignCharts'));
const MatchCharts = lazy(() => import('./charts/MatchCharts'));

// Loading fallback for charts
const ChartLoader = () => (
  <div className="chart-loader">
    <div className="chart-skeleton"></div>
    <p>Loading charts...</p>
  </div>
);

const AdminAnalytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'revenue' | 'engagement' | 'campaigns' | 'matches'>('overview');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { showToast } = useToast();
  
  // Use React Query hooks for data fetching
  const { data: overviewStats, isLoading: overviewLoading } = useAdminAnalyticsOverview();
  const { data: userAnalytics, isLoading: userLoading } = useAdminUserGrowth();
  const { data: revenueData, isLoading: revenueLoading } = useAdminRevenue();
  const { data: engagementMetrics, isLoading: engagementLoading } = useAdminEngagement();
  
  const loading = overviewLoading || userLoading || revenueLoading || engagementLoading;

  const handleExport = async (format: 'json' | 'csv' | 'pdf') => {
    try {
      setIsExporting(true);
      
      // Get current tab data
      const dataToExport = activeTab === 'overview' ? overviewStats :
                          activeTab === 'users' ? userAnalytics :
                          activeTab === 'revenue' ? revenueData :
                          engagementMetrics;
      
      if (!dataToExport) {
        showToast('No data available to export', 'error');
        return;
      }

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `analytics-${activeTab}-${timestamp}`;

      if (format === 'json') {
        const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
        downloadFile(blob, `${filename}.json`);
      } else if (format === 'csv') {
        const csv = convertToCSV(dataToExport);
        const blob = new Blob([csv], { type: 'text/csv' });
        downloadFile(blob, `${filename}.csv`);
      } else if (format === 'pdf') {
        showToast('PDF export coming soon', 'info');
      }

      showToast(`Data exported successfully as ${format.toUpperCase()}`, 'success');
    } catch (error) {
      console.error('Failed to export data:', error);
      showToast('Failed to export data', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const convertToCSV = (data: any): string => {
    if (!data || typeof data !== 'object') return '';
    
    // Simple CSV conversion
    const headers = Object.keys(data);
    const values = Object.values(data).map(v => 
      typeof v === 'object' ? JSON.stringify(v) : v
    );
    
    return `${headers.join(',')}\n${values.join(',')}`;
  };

  const applyCustomDateRange = () => {
    if (!customDateRange.start || !customDateRange.end) {
      showToast('Please select both start and end dates', 'error');
      return;
    }
    setShowCustomDatePicker(false);
    showToast('Custom date range applied', 'success');
    // TODO: Refetch data with custom date range
  };

  const headerActions = (
    <>
      <div className="date-range-selector">
        <button
          className={`admin-btn admin-btn-small ${dateRange === '7d' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
          onClick={() => setDateRange('7d')}
        >
          7 Days
        </button>
        <button
          className={`admin-btn admin-btn-small ${dateRange === '30d' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
          onClick={() => setDateRange('30d')}
        >
          30 Days
        </button>
        <button
          className={`admin-btn admin-btn-small ${dateRange === '90d' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
          onClick={() => setDateRange('90d')}
        >
          90 Days
        </button>
        <button
          className={`admin-btn admin-btn-small ${dateRange === 'all' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
          onClick={() => setDateRange('all')}
        >
          All Time
        </button>
        <button
          className="admin-btn admin-btn-small admin-btn-outline"
          onClick={() => setShowCustomDatePicker(!showCustomDatePicker)}
        >
          <Calendar size={16} />
          Custom
        </button>
      </div>
      <div className="export-buttons">
        <button 
          className="admin-btn admin-btn-secondary"
          onClick={() => handleExport('json')}
          disabled={isExporting || loading}
        >
          <Download size={20} />
          JSON
        </button>
        <button 
          className="admin-btn admin-btn-secondary"
          onClick={() => handleExport('csv')}
          disabled={isExporting || loading}
        >
          <FileText size={20} />
          CSV
        </button>
        <button 
          className="admin-btn admin-btn-primary"
          onClick={() => handleExport('pdf')}
          disabled={isExporting || loading}
        >
          <Download size={20} />
          Export PDF
        </button>
      </div>
    </>
  );

  if (loading) {
    return (
      <div className="admin-analytics">
        <AdminPageHeader
          title="Analytics & Reports"
          subtitle="Platform insights and performance metrics"
          actions={headerActions}
          loading={true}
        />
        <div className="analytics-loading">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="admin-analytics">
      <AdminPageHeader
        title="Analytics & Reports"
        subtitle="Platform insights and performance metrics"
        actions={headerActions}
        loading={loading}
      />

      {showCustomDatePicker && (
        <div className="custom-date-picker">
          <div className="date-inputs">
            <div className="date-input-group">
              <label>Start Date:</label>
              <input
                type="date"
                value={customDateRange.start}
                onChange={(e) => setCustomDateRange({ ...customDateRange, start: e.target.value })}
              />
            </div>
            <div className="date-input-group">
              <label>End Date:</label>
              <input
                type="date"
                value={customDateRange.end}
                onChange={(e) => setCustomDateRange({ ...customDateRange, end: e.target.value })}
              />
            </div>
            <button 
              className="admin-btn admin-btn-primary"
              onClick={applyCustomDateRange}
            >
              Apply
            </button>
            <button 
              className="admin-btn admin-btn-secondary"
              onClick={() => setShowCustomDatePicker(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="analytics-tabs">
        <button
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button
          className={activeTab === 'revenue' ? 'active' : ''}
          onClick={() => setActiveTab('revenue')}
        >
          Revenue
        </button>
        <button
          className={activeTab === 'engagement' ? 'active' : ''}
          onClick={() => setActiveTab('engagement')}
        >
          Engagement
        </button>
        <button
          className={activeTab === 'campaigns' ? 'active' : ''}
          onClick={() => setActiveTab('campaigns')}
        >
          Campaigns
        </button>
        <button
          className={activeTab === 'matches' ? 'active' : ''}
          onClick={() => setActiveTab('matches')}
        >
          Matches
        </button>
      </div>

      <div className="analytics-content">
        {activeTab === 'overview' && overviewStats && (
          <Suspense fallback={<ChartLoader />}>
            <OverviewCharts data={overviewStats} />
          </Suspense>
        )}

        {activeTab === 'users' && userAnalytics && (
          <Suspense fallback={<ChartLoader />}>
            <UserCharts data={userAnalytics} />
          </Suspense>
        )}

        {activeTab === 'engagement' && engagementMetrics && (
          <Suspense fallback={<ChartLoader />}>
            <EngagementCharts data={engagementMetrics} />
          </Suspense>
        )}

        {activeTab === 'campaigns' && (
          <Suspense fallback={<ChartLoader />}>
            <CampaignCharts data={{ 
              total: 0, 
              active: 0, 
              completed: 0, 
              byStatus: [], 
              byDay: [] 
            }} />
          </Suspense>
        )}

        {activeTab === 'matches' && (
          <Suspense fallback={<ChartLoader />}>
            <MatchCharts data={{ 
              total: 0, 
              new: 0, 
              byScore: [], 
              averageScore: '0' 
            }} />
          </Suspense>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;
