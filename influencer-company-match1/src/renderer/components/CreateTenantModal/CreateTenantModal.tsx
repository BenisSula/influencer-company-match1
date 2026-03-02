import React, { useState } from 'react';
import { X, Building2, Mail, Lock, User, Globe, CreditCard, Info } from 'lucide-react';
import adminTenantService from '../../services/admin-tenant.service';
import './CreateTenantModal.css';

interface CreateTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tenant?: any;
}

export const CreateTenantModal: React.FC<CreateTenantModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  tenant 
}) => {
  const isEditMode = !!tenant;
  const [formData, setFormData] = useState({
    name: tenant?.name || '',
    subdomain: tenant?.subdomain || '',
    subscriptionTier: tenant?.subscriptionTier || 'TRIAL',
    adminEmail: tenant?.adminEmail || '',
    adminPassword: '',
    adminFullName: tenant?.adminFullName || '',
    branding: {
      primaryColor: tenant?.branding?.primaryColor || '#3b82f6',
      secondaryColor: tenant?.branding?.secondaryColor || '#10b981',
      logoUrl: tenant?.branding?.logoUrl || '',
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  const handleClose = () => {
    // Reset form and step when closing
    setFormData({
      name: '',
      subdomain: '',
      subscriptionTier: 'TRIAL',
      adminEmail: '',
      adminPassword: '',
      adminFullName: '',
      branding: {
        primaryColor: '#3b82f6',
        secondaryColor: '#10b981',
        logoUrl: '',
      }
    });
    setStep(1);
    setError('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!isEditMode) {
      if (!formData.adminPassword || formData.adminPassword.length < 8) {
        setError('Password must be at least 8 characters long');
        return;
      }
      if (!/^[a-z0-9-]+$/.test(formData.subdomain)) {
        setError('Subdomain must contain only lowercase letters, numbers, and hyphens');
        return;
      }
    }
    
    try {
      setLoading(true);
      if (isEditMode) {
        await adminTenantService.updateTenant(tenant.id, {
          name: formData.name,
          subscriptionTier: formData.subscriptionTier as any,
          branding: formData.branding,
        });
      } else {
        await adminTenantService.createTenant({
          name: formData.name,
          subdomain: formData.subdomain.toLowerCase(),
          subscriptionTier: formData.subscriptionTier as any,
          adminEmail: formData.adminEmail,
          adminPassword: formData.adminPassword,
          adminFullName: formData.adminFullName,
          branding: formData.branding,
        });
      }
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        name: '',
        subdomain: '',
        subscriptionTier: 'TRIAL',
        adminEmail: '',
        adminPassword: '',
        adminFullName: '',
        branding: {
          primaryColor: '#3b82f6',
          secondaryColor: '#10b981',
          logoUrl: '',
        }
      });
      setStep(1);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save tenant');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.name || !formData.subdomain) {
        setError('Please fill in all required fields');
        return;
      }
      if (!/^[a-z0-9-]+$/.test(formData.subdomain)) {
        setError('Subdomain must contain only lowercase letters, numbers, and hyphens');
        return;
      }
    }
    if (step === 2 && !isEditMode) {
      if (!formData.adminEmail || !formData.adminFullName || !formData.adminPassword) {
        setError('Please fill in all admin details');
        return;
      }
      if (formData.adminPassword.length < 8) {
        setError('Password must be at least 8 characters long');
        return;
      }
    }
    setError('');
    setStep(step + 1);
  };

  const handleBack = () => {
    setError('');
    setStep(step - 1);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content create-tenant-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <Building2 size={24} />
            {isEditMode ? 'Edit Tenant' : 'Create New Tenant'}
          </h2>
          <button className="modal-close" onClick={handleClose} type="button">
            <X size={24} />
          </button>
        </div>

        {!isEditMode && (
          <div className="tenant-modal-steps">
            <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
              <div className="step-number">1</div>
              <div className="step-label">Tenant Info</div>
            </div>
            <div className="step-divider"></div>
            <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
              <div className="step-number">2</div>
              <div className="step-label">Admin Account</div>
            </div>
            <div className="step-divider"></div>
            <div className={`step ${step >= 3 ? 'active' : ''}`}>
              <div className="step-number">3</div>
              <div className="step-label">Subscription</div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="admin-message admin-message-error">
                <Info size={18} />
                {error}
              </div>
            )}

            {/* Step 1: Tenant Information */}
            {step === 1 && (
              <div className="form-step">
                <h3 className="step-title">Tenant Information</h3>
                
                <div className="admin-form-group">
                  <label className="admin-form-label">
                    <Building2 size={16} />
                    Tenant Name *
                  </label>
                  <input
                    className="admin-form-input"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Acme Corporation"
                  />
                  <p className="admin-form-help">The official name of the organization</p>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">
                    <Globe size={16} />
                    Subdomain *
                  </label>
                  <input
                    className="admin-form-input"
                    type="text"
                    value={formData.subdomain}
                    onChange={(e) => setFormData({ ...formData, subdomain: e.target.value.toLowerCase() })}
                    required
                    disabled={isEditMode}
                    placeholder="acme"
                    pattern="[a-z0-9-]+"
                  />
                  <p className="admin-form-help">
                    {formData.subdomain ? (
                      <span className="subdomain-preview">
                        <strong>{formData.subdomain}</strong>.platform.com
                      </span>
                    ) : (
                      'Only lowercase letters, numbers, and hyphens'
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Admin Account */}
            {step === 2 && !isEditMode && (
              <div className="form-step">
                <h3 className="step-title">Admin Account Details</h3>
                <p className="step-description">Create the primary administrator account for this tenant</p>
                
                <div className="admin-form-group">
                  <label className="admin-form-label">
                    <User size={16} />
                    Admin Full Name *
                  </label>
                  <input
                    className="admin-form-input"
                    type="text"
                    value={formData.adminFullName}
                    onChange={(e) => setFormData({ ...formData, adminFullName: e.target.value })}
                    required
                    placeholder="John Doe"
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">
                    <Mail size={16} />
                    Admin Email *
                  </label>
                  <input
                    className="admin-form-input"
                    type="email"
                    value={formData.adminEmail}
                    onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                    required
                    placeholder="admin@acme.com"
                  />
                  <p className="admin-form-help">This will be used to login to the admin dashboard</p>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">
                    <Lock size={16} />
                    Admin Password *
                  </label>
                  <input
                    className="admin-form-input"
                    type="password"
                    value={formData.adminPassword}
                    onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                    required
                    minLength={8}
                    placeholder="••••••••"
                  />
                  <p className="admin-form-help">Minimum 8 characters</p>
                </div>
              </div>
            )}

            {/* Step 3: Subscription & Branding */}
            {(step === 3 || isEditMode) && (
              <div className="form-step">
                <h3 className="step-title">Subscription & Branding</h3>
                
                <div className="admin-form-group">
                  <label className="admin-form-label">
                    <CreditCard size={16} />
                    Subscription Tier *
                  </label>
                  <select
                    className="admin-form-select"
                    value={formData.subscriptionTier}
                    onChange={(e) => setFormData({ ...formData, subscriptionTier: e.target.value })}
                  >
                    <option value="TRIAL">Trial (14 days, 10 users, 50 matches)</option>
                    <option value="BASIC">Basic ($49/mo, 50 users, 500 matches)</option>
                    <option value="PRO">Pro ($149/mo, 200 users, 2000 matches)</option>
                    <option value="ENTERPRISE">Enterprise (Custom pricing, unlimited)</option>
                  </select>
                </div>

                <div className="branding-section">
                  <h4 className="subsection-title">Brand Colors (Optional)</h4>
                  
                  <div className="color-inputs">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Primary Color</label>
                      <div className="color-input-wrapper">
                        <input
                          className="admin-form-input"
                          type="text"
                          value={formData.branding.primaryColor}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            branding: { ...formData.branding, primaryColor: e.target.value }
                          })}
                          placeholder="#3b82f6"
                        />
                        <input
                          type="color"
                          value={formData.branding.primaryColor}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            branding: { ...formData.branding, primaryColor: e.target.value }
                          })}
                          className="color-picker"
                        />
                      </div>
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label">Secondary Color</label>
                      <div className="color-input-wrapper">
                        <input
                          className="admin-form-input"
                          type="text"
                          value={formData.branding.secondaryColor}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            branding: { ...formData.branding, secondaryColor: e.target.value }
                          })}
                          placeholder="#10b981"
                        />
                        <input
                          type="color"
                          value={formData.branding.secondaryColor}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            branding: { ...formData.branding, secondaryColor: e.target.value }
                          })}
                          className="color-picker"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Logo URL (Optional)</label>
                    <input
                      className="admin-form-input"
                      type="url"
                      value={formData.branding.logoUrl}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        branding: { ...formData.branding, logoUrl: e.target.value }
                      })}
                      placeholder="https://example.com/logo.png"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="modal-actions">
            {step > 1 && !isEditMode && (
              <button 
                type="button" 
                className="admin-btn admin-btn-outline" 
                onClick={handleBack}
                disabled={loading}
              >
                Back
              </button>
            )}
            <button 
              type="button" 
              className="admin-btn admin-btn-outline" 
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </button>
            {(step < 3 && !isEditMode) ? (
              <button 
                type="button" 
                className="admin-btn admin-btn-primary" 
                onClick={handleNext}
                disabled={loading}
              >
                Next
              </button>
            ) : (
              <button 
                type="submit" 
                className="admin-btn admin-btn-primary" 
                disabled={loading}
              >
                {loading ? 'Saving...' : (isEditMode ? 'Update Tenant' : 'Create Tenant')}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
