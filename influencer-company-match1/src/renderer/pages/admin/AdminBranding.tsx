import React, { useState, useEffect } from 'react';
import { Palette, FileText, Image as ImageIcon, Code } from 'lucide-react';
import AdminPageHeader from '../../components/AdminPageHeader';
import adminBrandingService, { BrandingSettings } from '../../services/admin-branding.service';
import './AdminBranding.css';

const AdminBranding: React.FC = () => {
  const [branding, setBranding] = useState<BrandingSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'colors' | 'content' | 'assets' | 'css'>('colors');

  useEffect(() => {
    loadBranding();
  }, []);

  const loadBranding = async () => {
    try {
      setLoading(true);
      const data = await adminBrandingService.getBranding();
      setBranding(data);
    } catch (error: any) {
      showMessage('error', error.response?.data?.message || 'Failed to load branding settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!branding) return;

    try {
      setSaving(true);
      await adminBrandingService.updateBranding(branding);
      showMessage('success', 'Branding settings saved successfully!');
    } catch (error: any) {
      showMessage('error', error.response?.data?.message || 'Failed to save branding settings');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (file: File, type: 'logo' | 'favicon') => {
    try {
      setSaving(true);
      const url = await adminBrandingService.uploadAsset(file, type);
      setBranding(prev => prev ? { ...prev, [type]: url } : null);
      showMessage('success', `${type === 'logo' ? 'Logo' : 'Favicon'} uploaded successfully!`);
    } catch (error: any) {
      showMessage('error', error.response?.data?.message || 'Failed to upload file');
    } finally {
      setSaving(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const updateBranding = (field: keyof BrandingSettings, value: string) => {
    setBranding(prev => prev ? { ...prev, [field]: value } : null);
  };

  if (loading) {
    return (
      <div className="admin-branding">
        <div className="loading-spinner">Loading branding settings...</div>
      </div>
    );
  }

  if (!branding) {
    return (
      <div className="admin-branding">
        <div className="error-message">Failed to load branding settings</div>
      </div>
    );
  }

  const headerActions = (
    <>
      <button
        className="admin-action-button secondary"
        onClick={loadBranding}
        disabled={saving}
      >
        Reset
      </button>
      <button
        className="admin-action-button primary"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </>
  );

  return (
    <div className="admin-branding">
      <AdminPageHeader
        title="White-Label Branding"
        subtitle="Customize your platform's look and feel"
        actions={headerActions}
        loading={loading}
      />

      {message && (
        <div className={`message-banner ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="branding-tabs">
        <button
          className={`tab-button ${activeTab === 'colors' ? 'active' : ''}`}
          onClick={() => setActiveTab('colors')}
        >
          <Palette className="tab-icon" size={18} />
          Colors
        </button>
        <button
          className={`tab-button ${activeTab === 'content' ? 'active' : ''}`}
          onClick={() => setActiveTab('content')}
        >
          <FileText className="tab-icon" size={18} />
          Content
        </button>
        <button
          className={`tab-button ${activeTab === 'assets' ? 'active' : ''}`}
          onClick={() => setActiveTab('assets')}
        >
          <ImageIcon className="tab-icon" size={18} />
          Assets
        </button>
        <button
          className={`tab-button ${activeTab === 'css' ? 'active' : ''}`}
          onClick={() => setActiveTab('css')}
        >
          <Code className="tab-icon" size={18} />
          Custom CSS
        </button>
      </div>

      <div className="branding-content">
        {activeTab === 'colors' && (
          <div className="tab-panel">
            <h2>Brand Colors</h2>
            <p className="tab-description">Define your brand's color palette</p>

            <div className="color-grid">
              <div className="color-input-group">
                <label>Primary Color</label>
                <div className="color-input-wrapper">
                  <input
                    type="color"
                    value={branding.primaryColor}
                    onChange={(e) => updateBranding('primaryColor', e.target.value)}
                  />
                  <input
                    type="text"
                    value={branding.primaryColor}
                    onChange={(e) => updateBranding('primaryColor', e.target.value)}
                    placeholder="#E1306C"
                  />
                </div>
                <div className="color-preview" style={{ backgroundColor: branding.primaryColor }} />
              </div>

              <div className="color-input-group">
                <label>Secondary Color</label>
                <div className="color-input-wrapper">
                  <input
                    type="color"
                    value={branding.secondaryColor}
                    onChange={(e) => updateBranding('secondaryColor', e.target.value)}
                  />
                  <input
                    type="text"
                    value={branding.secondaryColor}
                    onChange={(e) => updateBranding('secondaryColor', e.target.value)}
                    placeholder="#5B51D8"
                  />
                </div>
                <div className="color-preview" style={{ backgroundColor: branding.secondaryColor }} />
              </div>

              <div className="color-input-group">
                <label>Accent Color</label>
                <div className="color-input-wrapper">
                  <input
                    type="color"
                    value={branding.accentColor}
                    onChange={(e) => updateBranding('accentColor', e.target.value)}
                  />
                  <input
                    type="text"
                    value={branding.accentColor}
                    onChange={(e) => updateBranding('accentColor', e.target.value)}
                    placeholder="#FD8D32"
                  />
                </div>
                <div className="color-preview" style={{ backgroundColor: branding.accentColor }} />
              </div>

              <div className="color-input-group">
                <label>Success Color</label>
                <div className="color-input-wrapper">
                  <input
                    type="color"
                    value={branding.successColor}
                    onChange={(e) => updateBranding('successColor', e.target.value)}
                  />
                  <input
                    type="text"
                    value={branding.successColor}
                    onChange={(e) => updateBranding('successColor', e.target.value)}
                    placeholder="#00D95F"
                  />
                </div>
                <div className="color-preview" style={{ backgroundColor: branding.successColor }} />
              </div>

              <div className="color-input-group">
                <label>Warning Color</label>
                <div className="color-input-wrapper">
                  <input
                    type="color"
                    value={branding.warningColor}
                    onChange={(e) => updateBranding('warningColor', e.target.value)}
                  />
                  <input
                    type="text"
                    value={branding.warningColor}
                    onChange={(e) => updateBranding('warningColor', e.target.value)}
                    placeholder="#FFCC00"
                  />
                </div>
                <div className="color-preview" style={{ backgroundColor: branding.warningColor }} />
              </div>

              <div className="color-input-group">
                <label>Info Color</label>
                <div className="color-input-wrapper">
                  <input
                    type="color"
                    value={branding.infoColor}
                    onChange={(e) => updateBranding('infoColor', e.target.value)}
                  />
                  <input
                    type="text"
                    value={branding.infoColor}
                    onChange={(e) => updateBranding('infoColor', e.target.value)}
                    placeholder="#0095F6"
                  />
                </div>
                <div className="color-preview" style={{ backgroundColor: branding.infoColor }} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="tab-panel">
            <h2>Platform Content</h2>
            <p className="tab-description">Customize your platform's text content</p>

            <div className="form-group">
              <label>Platform Name</label>
              <input
                type="text"
                value={branding.platformName}
                onChange={(e) => updateBranding('platformName', e.target.value)}
                placeholder="My Platform"
              />
            </div>

            <div className="form-group">
              <label>Tagline</label>
              <input
                type="text"
                value={branding.tagline}
                onChange={(e) => updateBranding('tagline', e.target.value)}
                placeholder="Connect. Collaborate. Succeed."
              />
            </div>

            <div className="form-group">
              <label>Footer Text</label>
              <textarea
                value={branding.footerText}
                onChange={(e) => updateBranding('footerText', e.target.value)}
                placeholder="© 2024 My Platform. All rights reserved."
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Font Family</label>
              <select
                value={branding.fontFamily}
                onChange={(e) => updateBranding('fontFamily', e.target.value)}
              >
                <option value="Inter, sans-serif">Inter</option>
                <option value="Poppins, sans-serif">Poppins</option>
                <option value="Roboto, sans-serif">Roboto</option>
                <option value="Open Sans, sans-serif">Open Sans</option>
                <option value="Lato, sans-serif">Lato</option>
                <option value="Montserrat, sans-serif">Montserrat</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'assets' && (
          <div className="tab-panel">
            <h2>Brand Assets</h2>
            <p className="tab-description">Upload your logo and favicon</p>

            <div className="assets-grid">
              <div className="asset-upload-group">
                <label>Logo</label>
                <div className="asset-preview">
                  {branding.logo ? (
                    <img src={branding.logo} alt="Logo" />
                  ) : (
                    <div className="asset-placeholder">No logo uploaded</div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'logo');
                  }}
                  id="logo-upload"
                  style={{ display: 'none' }}
                />
                <label htmlFor="logo-upload" className="upload-button">
                  Upload Logo
                </label>
                <p className="upload-hint">Recommended: PNG or SVG, 200x50px</p>
              </div>

              <div className="asset-upload-group">
                <label>Favicon</label>
                <div className="asset-preview favicon">
                  {branding.favicon ? (
                    <img src={branding.favicon} alt="Favicon" />
                  ) : (
                    <div className="asset-placeholder">No favicon uploaded</div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'favicon');
                  }}
                  id="favicon-upload"
                  style={{ display: 'none' }}
                />
                <label htmlFor="favicon-upload" className="upload-button">
                  Upload Favicon
                </label>
                <p className="upload-hint">Recommended: ICO or PNG, 32x32px</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'css' && (
          <div className="tab-panel">
            <h2>Custom CSS</h2>
            <p className="tab-description">Add custom CSS to override default styles</p>

            <div className="form-group">
              <label>Custom CSS Code</label>
              <textarea
                value={branding.customCSS}
                onChange={(e) => updateBranding('customCSS', e.target.value)}
                placeholder="/* Add your custom CSS here */&#10;.custom-class {&#10;  color: #000;&#10;}"
                rows={15}
                className="code-editor"
              />
              <p className="form-hint">
                Use this to add custom styling. Changes will be applied globally.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="branding-actions">
        <button
          className="save-button"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          className="cancel-button"
          onClick={loadBranding}
          disabled={saving}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default AdminBranding;
