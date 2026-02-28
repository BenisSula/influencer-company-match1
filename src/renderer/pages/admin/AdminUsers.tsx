import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, Filter, Download, UserPlus } from 'lucide-react';
import { useAdminUsers } from '../../hooks/admin/useAdminUsers';
import { Pagination } from '../../components/Pagination/Pagination';
import { AdminUserModal } from '../../components/AdminUserModal/AdminUserModal';
import { AdminUserProfileModal } from '../../components/AdminUserProfileModal/AdminUserProfileModal';
import { UserDetailModal } from '../../components/UserDetailModal/UserDetailModal';
import { adminUserService } from '../../services/admin-user.service';
import './AdminUsers.css';

const ITEMS_PER_PAGE = 20;

export const AdminUsers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    role: '',
    status: '',
  });
  const navigate = useNavigate();

  // Use React Query hook
  const { data: users = [], isLoading: loading, error, refetch } = useAdminUsers();

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !filters.role || user.role === filters.role;
    const matchesStatus = !filters.status || 
      (filters.status === 'active' && user.isActive) ||
      (filters.status === 'inactive' && !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExport = async () => {
    try {
      // Include current filters in export
      const exportFilters: any = {};
      if (filters.role) exportFilters.role = filters.role;
      if (filters.status) exportFilters.isActive = filters.status === 'active';
      if (searchTerm) exportFilters.search = searchTerm;
      
      const response: any = await adminUserService.exportUsers(exportFilters);
      
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
      
      // Generate filename with timestamp and filters
      const timestamp = new Date().toISOString().split('T')[0];
      const filterSuffix = Object.values(exportFilters).some(v => v) ? '-filtered' : '';
      const filename = `users-export${filterSuffix}-${timestamp}.csv`;
      
      // Export to CSV
      exportToCSV(response, columns, filename);
      
      alert(`Successfully exported ${response.length} users to ${filename}`);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export users. Please try again.');
    }
  };

  const clearFilters = () => {
    setFilters({ role: '', status: '' });
  };

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);

  if (loading) {
    return (
      <div className="admin-page-loading">
        <div className="spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page-loading">
        <p>Error loading users. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="admin-users">
      <header className="admin-page-header">
        <div className="header-left">
          <button className="back-button" onClick={() => navigate('/admin/dashboard')}>
            ← Back to Dashboard
          </button>
          <h1><Users size={28} /> User Management</h1>
        </div>
        <div className="header-actions">
          <button 
            className="admin-btn admin-btn-primary"
            onClick={() => {
              setSelectedUser(null);
              setShowUserModal(true);
            }}
          >
            <UserPlus size={20} /> Add User
          </button>
          <button className="admin-btn admin-btn-secondary" onClick={handleExport}>
            <Download size={20} /> Export
          </button>
        </div>
      </header>

      <div className="admin-users-content">
        <div className="search-filter-bar">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            className="admin-btn admin-btn-outline admin-btn-small"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} /> Filters
          </button>
        </div>

        {showFilters && (
          <div className="filters-panel">
            <div className="filter-group">
              <label>Role</label>
              <select 
                value={filters.role} 
                onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                className="admin-form-select"
              >
                <option value="">All Roles</option>
                <option value="INFLUENCER">Influencer</option>
                <option value="COMPANY">Company</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Status</label>
              <select 
                value={filters.status} 
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="admin-form-select"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <button 
              className="admin-btn admin-btn-outline admin-btn-small" 
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          </div>
        )}

        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.fullName}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge role-${user.role.toLowerCase()}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${user.isActive ? 'status-active' : 'status-inactive'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button 
                      className="admin-btn admin-btn-small admin-btn-outline"
                      onClick={() => {
                        setSelectedUserId(user.id.toString());
                        setShowDetailModal(true);
                      }}
                    >
                      View
                    </button>
                    <button 
                      className="admin-btn admin-btn-small admin-btn-primary"
                      onClick={() => {
                        setSelectedUserId(user.id.toString());
                        setShowProfileModal(true);
                      }}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="no-results">
              <p>No users found matching your search.</p>
            </div>
          )}
        </div>

        {filteredUsers.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={ITEMS_PER_PAGE}
            totalItems={filteredUsers.length}
          />
        )}
      </div>

      <AdminUserModal
        isOpen={showUserModal}
        onClose={() => {
          setShowUserModal(false);
          setSelectedUser(null);
        }}
        onSuccess={() => {
          refetch();
          setShowUserModal(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
      />

      <AdminUserProfileModal
        isOpen={showProfileModal}
        onClose={() => {
          setShowProfileModal(false);
          setSelectedUserId(null);
        }}
        onSuccess={() => {
          refetch();
          setShowProfileModal(false);
          setSelectedUserId(null);
        }}
        userId={selectedUserId}
      />

      <UserDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedUserId(null);
        }}
        userId={selectedUserId}
      />
    </div>
  );
};

export default AdminUsers;
