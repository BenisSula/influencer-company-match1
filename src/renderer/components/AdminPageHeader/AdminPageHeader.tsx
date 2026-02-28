import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import './AdminPageHeader.css';

interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  backPath?: string;
  actions?: React.ReactNode;
  loading?: boolean;
}

const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({
  title,
  subtitle,
  showBackButton = true,
  backPath = '/admin/dashboard',
  actions,
  loading = false
}) => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate(backPath);
  };

  return (
    <div className={`admin-page-header ${loading ? 'loading' : ''}`}>
      <div className="admin-header-left">
        {showBackButton && (
          <button 
            className="admin-back-button"
            onClick={handleBackClick}
            type="button"
            aria-label="Back to Dashboard"
          >
            <FiArrowLeft />
            <span>Back to Dashboard</span>
          </button>
        )}
        <div className="admin-title-section">
          <h1 className="admin-page-title">{title}</h1>
          {subtitle && (
            <p className="admin-page-subtitle">{subtitle}</p>
          )}
        </div>
      </div>
      
      {actions && (
        <div className="admin-header-right">
          <div className="admin-header-actions">
            {actions}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPageHeader;
