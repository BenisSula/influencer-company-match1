import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, Users, Building2, CreditCard, CheckCircle2, 
  PauseCircle, Sparkles, Target, Crown, Download, Plus 
} from 'lucide-react';
import { adminAuthService } from '../../services/admin-auth.service';
import { useAdminUserStats } from '../../hooks/admin/useAdminUsers';
import { CreateTenantModal } from '../../components/CreateTenantModal/CreateTenantModal';
import { adminUserService } from '../../services/admin-user.service';
import '../../styles/admin-common.css';
import './AdminDashboard.css';

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  influencers: number;
  companies: number;
  admins: number;
  newUsersThisMonth: number;
}

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const adminUser = adminAuthService.getAdminUser();
  const [showCreateTenantModal, setShowCreateTenantModal] = useState(false);

  // Use React Query hook
  const { data: stats, isLoading: loading, error } = useAdminUserStats();

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      adminAuthService.logout();
      navigate('/admin/login');
    }
  };

  const handleExportUsers = async () => {
    try {
      const response: any = await adminUserService.exportUsers();
      
      // Define CSV columns matching the Users page display
      const columns = [
        { key: 'id', label: 'User ID' },
        { key: 'email', label: 'Email' },
        { key: 'fullName', label: 'Full Name' },
        { key: 'role', label: 'Role' },
        { key: 'status', label: 'Status' },
        { key: 'profileCompleted', label: 'Profile Completed' },
        { key: 'emailVerified', label: 'Email Verified' },
        { key: 'location', label: 'Location' },
        { key: 'website', label: 'Website' },
        { key: 'bio', label: 'Bio/Description' },
        { key: 'platforms', label: 'Social Platforms' },
        { key: 'totalFollowers', label: 'Total Followers' },
        { key: 'industry', label: 'Industry' },
        { key: 'companySize', label: 'Company Size' },
        { key: 'budget', label: 'Budget' },
        { key: 'createdAt', label: 'Created Date' },
        { key: 'lastLoginAt', label: 'Last Login' },
        { key: 'updatedAt', label: 'Last Updated' },
      ];
      
      // Import CSV utility dynamically
      const { exportToCSV } = await import('../../utils/csvExport');
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `users-export-${timestamp}.csv`;
      
      // Export to CSV
      exportToCSV(response, columns, filename);
      
      alert(`Successfully exported ${response.length} users to ${filename}`);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export users. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard-loading">
        <p>Error loading dashboard. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-sticky-header">
        <header className="admin-header">
          <div className="admin-header-content">
            <div className="admin-header-left">
              <h1>Admin Dashboard</h1>
              <p className="admin-subtitle">Welcome back, {adminUser?.fullName}</p>
            </div>
            <div className="admin-header-right">
              <span className="admin-role-badge">{adminUser?.role}</span>
              <button onClick={handleLogout} className="admin-logout-btn">
                Logout
              </button>
            </div>
          </div>
        </header>

        <nav className="admin-nav">
          <button
            className="admin-nav-item active"
            onClick={() => navigate('/admin/dashboard')}
          >
          <span className="nav-icon"><BarChart3 size={20} /></span>
          <span className="nav-label">Dashboard</span>
        </button>
        <button
          className="admin-nav-item"
          onClick={() => navigate('/admin/users')}
        >
          <span className="nav-icon"><Users size={20} /></span>
          <span className="nav-label">Users</span>
        </button>
        <button
          className="admin-nav-item"
          onClick={() => navigate('/admin/tenants')}
        >
          <span className="nav-icon"><Building2 size={20} /></span>
          <span className="nav-label">Tenants</span>
        </button>
        <button
          className="admin-nav-item"
          onClick={() => navigate('/admin/payments')}
        >
          <span className="nav-icon"><CreditCard size={20} /></span>
          <span className="nav-label">Payments</span>
        </button>
        <button
          className="admin-nav-item"
          onClick={() => navigate('/admin/branding')}
        >
          <span className="nav-icon"><Sparkles size={20} /></span>
          <span className="nav-label">Branding</span>
        </button>
        <button
          className="admin-nav-item"
          onClick={() => navigate('/admin/features')}
        >
          <span className="nav-icon"><Target size={20} /></span>
          <span className="nav-label">Features</span>
        </button>
        <button
          className="admin-nav-item"
          onClick={() => navigate('/admin/analytics')}
        >
          <span className="nav-icon"><BarChart3 size={20} /></span>
          <span className="nav-label">Analytics</span>
        </button>
        <button
          className="admin-nav-item"
          onClick={() => navigate('/admin/moderation')}
        >
          <span className="nav-icon"><CheckCircle2 size={20} /></span>
          <span className="nav-label">Moderation</span>
        </button>
        <button
          className="admin-nav-item"
          onClick={() => navigate('/admin/reviews')}
        >
          <span className="nav-icon"><Crown size={20} /></span>
          <span className="nav-label">Reviews</span>
        </button>
        <button
          className="admin-nav-item"
          onClick={() => navigate('/admin/settings')}
        >
          <span className="nav-icon"><Target size={20} /></span>
          <span className="nav-label">Settings</span>
        </button>
      </nav>
      </div>

      <main className="admin-main">
        <div className="stats-grid">
          <div className="stat-card stat-card-primary">
            <div className="stat-icon"><Users size={32} /></div>
            <div className="stat-content">
              <h3 className="stat-value">{(stats as UserStats)?.totalUsers || 0}</h3>
              <p className="stat-label">Total Users</p>
            </div>
          </div>

          <div className="stat-card stat-card-success">
            <div className="stat-icon"><CheckCircle2 size={32} /></div>
            <div className="stat-content">
              <h3 className="stat-value">{(stats as UserStats)?.activeUsers || 0}</h3>
              <p className="stat-label">Active Users</p>
            </div>
          </div>

          <div className="stat-card stat-card-warning">
            <div className="stat-icon"><PauseCircle size={32} /></div>
            <div className="stat-content">
              <h3 className="stat-value">{(stats as UserStats)?.inactiveUsers || 0}</h3>
              <p className="stat-label">Inactive Users</p>
            </div>
          </div>

          <div className="stat-card stat-card-info">
            <div className="stat-icon"><Sparkles size={32} /></div>
            <div className="stat-content">
              <h3 className="stat-value">{(stats as UserStats)?.newUsersThisMonth || 0}</h3>
              <p className="stat-label">New This Month</p>
            </div>
          </div>
        </div>

        <div className="role-breakdown">
          <h2 className="section-title">User Breakdown by Role</h2>
          <div className="role-cards">
            <div className="role-card">
              <div className="role-card-header">
                <span className="role-icon"><Target size={24} /></span>
                <h3>Influencers</h3>
              </div>
              <p className="role-count">{(stats as UserStats)?.influencers || 0}</p>
              <div className="role-progress">
                <div
                  className="role-progress-bar role-progress-influencer"
                  style={{
                    width: `${(((stats as UserStats)?.influencers || 0) / ((stats as UserStats)?.totalUsers || 1)) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="role-card">
              <div className="role-card-header">
                <span className="role-icon"><Building2 size={24} /></span>
                <h3>Companies</h3>
              </div>
              <p className="role-count">{(stats as UserStats)?.companies || 0}</p>
              <div className="role-progress">
                <div
                  className="role-progress-bar role-progress-company"
                  style={{
                    width: `${(((stats as UserStats)?.companies || 0) / ((stats as UserStats)?.totalUsers || 1)) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="role-card">
              <div className="role-card-header">
                <span className="role-icon"><Crown size={24} /></span>
                <h3>Admins</h3>
              </div>
              <p className="role-count">{(stats as UserStats)?.admins || 0}</p>
              <div className="role-progress">
                <div
                  className="role-progress-bar role-progress-admin"
                  style={{
                    width: `${(((stats as UserStats)?.admins || 0) / ((stats as UserStats)?.totalUsers || 1)) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="quick-actions">
          <h2 className="section-title">Quick Actions</h2>
          <div className="action-buttons">
            <button
              className="admin-btn admin-btn-primary"
              onClick={() => navigate('/admin/users')}
            >
              <span className="action-icon"><Users size={20} /></span>
              <span>Manage Users</span>
            </button>
            <button
              className="admin-btn admin-btn-secondary"
              onClick={handleExportUsers}
            >
              <span className="action-icon"><Download size={20} /></span>
              <span>Export Users</span>
            </button>
            <button
              className="admin-btn admin-btn-secondary"
              onClick={() => setShowCreateTenantModal(true)}
            >
              <span className="action-icon"><Plus size={20} /></span>
              <span>Create Tenant</span>
            </button>
          </div>
        </div>
      </main>

      <CreateTenantModal
        isOpen={showCreateTenantModal}
        onClose={() => setShowCreateTenantModal(false)}
        onSuccess={() => {
          setShowCreateTenantModal(false);
          alert('Tenant created successfully!');
        }}
      />
    </div>
  );
};
