import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, Search } from 'lucide-react';
import { useAdminTenants } from '../../hooks/admin/useAdminTenants';
import { CreateTenantModal } from '../../components/CreateTenantModal/CreateTenantModal';
import { TenantDetailModal } from '../../components/TenantDetailModal/TenantDetailModal';
import { useToast } from '../../hooks/useToast';
import './AdminTenants.css';

export const AdminTenants: React.FC = () => {
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Use React Query hook
  const { data, isLoading: loading, error, refetch } = useAdminTenants(page, 20);
  
  const allTenants = data?.data || [];
  const total = data?.total || 0;

  // Filter tenants based on search query
  const filteredTenants = useMemo(() => {
    if (!searchQuery.trim()) {
      return allTenants;
    }

    const query = searchQuery.toLowerCase().trim();
    return allTenants.filter(tenant => 
      tenant.name?.toLowerCase().includes(query) ||
      tenant.subdomain?.toLowerCase().includes(query) ||
      tenant.subscriptionTier?.toLowerCase().includes(query) ||
      tenant.status?.toLowerCase().includes(query)
    );
  }, [allTenants, searchQuery]);

  const tenants = filteredTenants;

  if (loading) {
    return (
      <div className="admin-page-loading">
        <div className="spinner"></div>
        <p>Loading tenants...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page-error">
        <p className="error-message">
          {error instanceof Error ? error.message : 'Failed to load tenants'}
        </p>
        <button onClick={() => refetch()} className="admin-btn admin-btn-primary">Retry</button>
      </div>
    );
  }

  return (
    <div className="admin-tenants">
      <header className="admin-page-header">
        <div className="header-left">
          <button className="back-button" onClick={() => navigate('/admin/dashboard')}>
            ← Back to Dashboard
          </button>
          <h1><Building2 size={28} /> Tenant Management</h1>
        </div>
        <div className="header-actions">
          <button className="admin-btn admin-btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={20} /> Add Tenant
          </button>
        </div>
      </header>

      <div className="admin-tenants-content">
        <div className="search-filter-bar">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search tenants by name, subdomain, tier, or status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                className="clear-search" 
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
          {searchQuery && (
            <div className="search-results-info">
              Found {tenants.length} of {allTenants.length} tenants
            </div>
          )}
        </div>

        <div className="tenants-grid">
          {tenants.length === 0 ? (
            <div className="empty-state">
              <Building2 size={48} />
              <p>No tenants found</p>
              <button className="admin-btn admin-btn-primary" onClick={() => setShowCreateModal(true)}>
                <Plus size={20} /> Create First Tenant
              </button>
            </div>
          ) : (
            tenants.map(tenant => (
              <div key={tenant.id} className="tenant-card">
                <div className="tenant-card-header">
                  <Building2 size={32} />
                  <span className={`status-badge status-${tenant.status}`}>
                    {tenant.status}
                  </span>
                </div>
                <h3>{tenant.name}</h3>
                <p className="tenant-domain">{tenant.subdomain}.platform.com</p>
                <div className="tenant-stats">
                  <div className="tenant-stat">
                    <span className="stat-label">Tier</span>
                    <span className="stat-value">{tenant.subscriptionTier}</span>
                  </div>
                  <div className="tenant-stat">
                    <span className="stat-label">Created</span>
                    <span className="stat-value">{new Date(tenant.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="tenant-actions">
                  <button 
                    className="admin-btn admin-btn-secondary admin-btn-small" 
                    onClick={() => {
                      setSelectedTenant(tenant);
                      setShowDetailModal(true);
                    }}
                  >
                    View
                  </button>
                  <button 
                    className="admin-btn admin-btn-primary admin-btn-small" 
                    onClick={() => {
                      setSelectedTenant(tenant);
                      setShowCreateModal(true);
                    }}
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {total > 20 && (
          <div className="pagination">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))} 
              disabled={page === 1}
              className="admin-btn admin-btn-secondary"
            >
              Previous
            </button>
            <span>Page {page} of {Math.ceil(total / 20)}</span>
            <button 
              onClick={() => setPage(p => p + 1)} 
              disabled={page >= Math.ceil(total / 20)}
              className="admin-btn admin-btn-secondary"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateTenantModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedTenant(null);
        }}
        onSuccess={() => {
          refetch();
          showToast('Tenant saved successfully', 'success');
        }}
        tenant={selectedTenant}
      />

      <TenantDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedTenant(null);
        }}
        tenant={selectedTenant}
      />
    </div>
  );
};

export default AdminTenants;
