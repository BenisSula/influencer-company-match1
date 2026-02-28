import React, { useState } from 'react';
import { X } from 'lucide-react';
import { adminUserService } from '../../services/admin-user.service';
import './AdminUserModal.css';

interface AdminUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user?: any;
}

export const AdminUserModal: React.FC<AdminUserModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  user 
}) => {
  const isEditMode = !!user;
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    role: user?.role || 'INFLUENCER',
    isActive: user?.isActive ?? true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      setLoading(true);
      if (isEditMode) {
        await adminUserService.updateUser(user.id, formData);
      } else {
        await adminUserService.createUser(formData);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content admin-user-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditMode ? 'Edit User' : 'Add New User'}</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="admin-message admin-message-error">
                {error}
              </div>
            )}

            <div className="admin-form-group">
              <label className="admin-form-label">Full Name *</label>
              <input
                className="admin-form-input"
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
                placeholder="John Doe"
              />
            </div>
            
            <div className="admin-form-group">
              <label className="admin-form-label">Email *</label>
              <input
                className="admin-form-input"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={isEditMode}
                placeholder="john@example.com"
              />
              {isEditMode && (
                <p className="admin-form-help">Email cannot be changed</p>
              )}
            </div>
            
            <div className="admin-form-group">
              <label className="admin-form-label">Role *</label>
              <select
                className="admin-form-select"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="INFLUENCER">Influencer</option>
                <option value="COMPANY">Company</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            
            <div className="admin-form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <span>Active</span>
              </label>
              <p className="admin-form-help">Inactive users cannot log in</p>
            </div>
          </div>
          
          <div className="modal-actions">
            <button 
              type="button" 
              className="admin-btn admin-btn-outline" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="admin-btn admin-btn-primary" 
              disabled={loading}
            >
              {loading ? 'Saving...' : (isEditMode ? 'Update User' : 'Create User')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
