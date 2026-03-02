import React from 'react';
import { Building2, X, Globe, Calendar, CreditCard } from 'lucide-react';
import './TenantDetailModal.css';

interface TenantDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: any;
}

export const TenantDetailModal: React.FC<TenantDetailModalProps> = ({ 
  isOpen, onClose, tenant 
}) => {
  if (!isOpen || !tenant) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content tenant-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2><Building2 size={24} /> Tenant Details</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <div className="tenant-detail-content">
          <div className="detail-section">
            <h3>Basic Information</h3>
            <div className="detail-row">
              <span className="detail-label"><Building2 size={16} /> Name:</span>
              <span className="detail-value">{tenant.name}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label"><Globe size={16} /> Subdomain:</span>
              <span className="detail-value">{tenant.subdomain}.platform.com</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Status:</span>
              <span className={`status-badge status-${tenant.status?.toLowerCase() || 'active'}`}>
                {tenant.status || 'ACTIVE'}
              </span>
            </div>
          </div>
          
          <div className="detail-section">
            <h3>Subscription</h3>
            <div className="detail-row">
              <span className="detail-label"><CreditCard size={16} /> Tier:</span>
              <span className="detail-value">{tenant.subscriptionTier || 'FREE'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label"><Calendar size={16} /> Created:</span>
              <span className="detail-value">{new Date(tenant.createdAt).toLocaleString()}</span>
            </div>
            {tenant.updatedAt && (
              <div className="detail-row">
                <span className="detail-label"><Calendar size={16} /> Last Updated:</span>
                <span className="detail-value">{new Date(tenant.updatedAt).toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="modal-actions">
          <button className="admin-btn-outline" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
