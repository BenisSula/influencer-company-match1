import React, { useState, useEffect } from 'react';
import { Building2 } from 'lucide-react';
import { getCurrentTenantId, setCurrentTenant } from '../../utils/applyBranding';
import { adminApiClient } from '../../services/admin-api-client';
import './TenantSwitcher.css';

interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  isActive: boolean;
}

export const TenantSwitcher: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [currentTenant] = useState<string>(getCurrentTenantId());
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      setLoading(true);
      const response: any = await adminApiClient.get('/admin/tenants');
      setTenants(response.data || []);
    } catch (error) {
      console.error('Failed to load tenants');
    } finally {
      setLoading(false);
    }
  };

  const handleTenantSwitch = (tenantId: string) => {
    setCurrentTenant(tenantId);
    setIsOpen(false);
  };

  const currentTenantName = tenants.find(t => t.id === currentTenant)?.name || 'Default';

  return (
    <div className="tenant-switcher">
      <button 
        className="tenant-switcher-button"
        onClick={() => setIsOpen(!isOpen)}
        title="Switch Tenant"
      >
        <Building2 size={18} />
        <span>{currentTenantName}</span>
      </button>

      {isOpen && (
        <>
          <div className="tenant-switcher-overlay" onClick={() => setIsOpen(false)} />
          <div className="tenant-switcher-dropdown">
            <div className="tenant-switcher-header">
              <h3>Switch Tenant</h3>
              <p>Select a tenant to view their branding</p>
            </div>
            
            {loading ? (
              <div className="tenant-switcher-loading">Loading tenants...</div>
            ) : (
              <div className="tenant-list">
                <button
                  className={`tenant-item ${currentTenant === 'default' ? 'active' : ''}`}
                  onClick={() => handleTenantSwitch('default')}
                >
                  <Building2 size={16} />
                  <span>Default Platform</span>
                </button>
                
                {tenants.map(tenant => (
                  <button
                    key={tenant.id}
                    className={`tenant-item ${currentTenant === tenant.id ? 'active' : ''}`}
                    onClick={() => handleTenantSwitch(tenant.id)}
                    disabled={!tenant.isActive}
                  >
                    <Building2 size={16} />
                    <span>{tenant.name}</span>
                    {!tenant.isActive && <span className="inactive-badge">Inactive</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
