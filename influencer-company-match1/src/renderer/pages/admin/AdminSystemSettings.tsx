import React, { useState, useEffect } from 'react';
import AdminPageHeader from '../../components/AdminPageHeader';
import { useToast } from '../../hooks/useToast';
import adminSystemSettingsService, { SystemSetting } from '../../services/admin-system-settings.service';
import './AdminSystemSettings.css';

const AdminSystemSettings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'email' | 'storage' | 'security' | 'api' | 'general'>('general');
  const { showToast } = useToast();
  
  // General Settings
  const [platformName, setPlatformName] = useState('');
  const [platformUrl, setPlatformUrl] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  
  // Email Settings
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPassword, setSmtpPassword] = useState('');
  const [smtpSecure, setSmtpSecure] = useState(true);
  const [emailFrom, setEmailFrom] = useState('');
  
  // Storage Settings
  const [storageProvider, setStorageProvider] = useState<'local' | 's3'>('local');
  const [s3Bucket, setS3Bucket] = useState('');
  const [s3Region, setS3Region] = useState('');
  const [s3AccessKey, setS3AccessKey] = useState('');
  const [s3SecretKey, setS3SecretKey] = useState('');
  const [maxFileSize, setMaxFileSize] = useState('10');
  
  // Security Settings
  const [jwtSecret, setJwtSecret] = useState('');
  const [jwtExpiry, setJwtExpiry] = useState('7d');
  const [passwordMinLength, setPasswordMinLength] = useState('8');
  const [requireSpecialChar, setRequireSpecialChar] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [maxLoginAttempts, setMaxLoginAttempts] = useState('5');
  
  // API Settings
  const [apiRateLimit, setApiRateLimit] = useState('100');
  const [apiRateLimitWindow, setApiRateLimitWindow] = useState('15');
  const [corsOrigins, setCorsOrigins] = useState('');
  const [apiVersion, setApiVersion] = useState('v1');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      // Load all settings by category
      const [general, email, storage, security, api] = await Promise.all([
        adminSystemSettingsService.getAllSettings(),
        adminSystemSettingsService.getEmailSettings(),
        adminSystemSettingsService.getStorageSettings(),
        adminSystemSettingsService.getSecuritySettings(),
        adminSystemSettingsService.getAPISettings(),
      ]);
      
      // Helper function to find setting value
      const findValue = (settings: any, key: string) => {
        const setting = settings.find((s: SystemSetting) => s.key === key);
        return setting?.value || '';
      };
      
      // General
      setPlatformName(findValue(general, 'platform_name'));
      setPlatformUrl(findValue(general, 'platform_url'));
      setSupportEmail(findValue(general, 'support_email'));
      setMaintenanceMode(findValue(general, 'maintenance_mode') === 'true');
      
      // Email
      setSmtpHost(findValue(email, 'smtp_host'));
      setSmtpPort(findValue(email, 'smtp_port') || '587');
      setSmtpUser(findValue(email, 'smtp_user'));
      setSmtpSecure(findValue(email, 'smtp_secure') === 'true');
      setEmailFrom(findValue(email, 'email_from'));
      
      // Storage
      setStorageProvider(findValue(storage, 'storage_provider') as 'local' | 's3' || 'local');
      setS3Bucket(findValue(storage, 's3_bucket'));
      setS3Region(findValue(storage, 's3_region'));
      setMaxFileSize(findValue(storage, 'max_file_size') || '10');
      
      // Security
      setJwtExpiry(findValue(security, 'jwt_expiry') || '7d');
      setPasswordMinLength(findValue(security, 'password_min_length') || '8');
      setRequireSpecialChar(findValue(security, 'require_special_char') === 'true');
      setSessionTimeout(findValue(security, 'session_timeout') || '30');
      setMaxLoginAttempts(findValue(security, 'max_login_attempts') || '5');
      
      // API
      setApiRateLimit(findValue(api, 'api_rate_limit') || '100');
      setApiRateLimitWindow(findValue(api, 'api_rate_limit_window') || '15');
      setCorsOrigins(findValue(api, 'cors_origins'));
      setApiVersion(findValue(api, 'api_version') || 'v1');
      
    } catch (error: any) {
      console.error('Failed to load settings:', error);
      // Don't navigate on error - adminApiClient handles 401 automatically
      showToast('Failed to load settings: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      
      const settings: Array<{ key: string; value: string; isEncrypted?: boolean }> = [];
      
      if (activeTab === 'general') {
        settings.push(
          { key: 'platform_name', value: platformName },
          { key: 'platform_url', value: platformUrl },
          { key: 'support_email', value: supportEmail },
          { key: 'maintenance_mode', value: maintenanceMode.toString() }
        );
      } else if (activeTab === 'email') {
        settings.push(
          { key: 'smtp_host', value: smtpHost },
          { key: 'smtp_port', value: smtpPort },
          { key: 'smtp_user', value: smtpUser },
          { key: 'smtp_password', value: smtpPassword, isEncrypted: true },
          { key: 'smtp_secure', value: smtpSecure.toString() },
          { key: 'email_from', value: emailFrom }
        );
      } else if (activeTab === 'storage') {
        settings.push(
          { key: 'storage_provider', value: storageProvider },
          { key: 's3_bucket', value: s3Bucket },
          { key: 's3_region', value: s3Region },
          { key: 's3_access_key', value: s3AccessKey, isEncrypted: true },
          { key: 's3_secret_key', value: s3SecretKey, isEncrypted: true },
          { key: 'max_file_size', value: maxFileSize }
        );
      } else if (activeTab === 'security') {
        settings.push(
          { key: 'jwt_secret', value: jwtSecret, isEncrypted: true },
          { key: 'jwt_expiry', value: jwtExpiry },
          { key: 'password_min_length', value: passwordMinLength },
          { key: 'require_special_char', value: requireSpecialChar.toString() },
          { key: 'session_timeout', value: sessionTimeout },
          { key: 'max_login_attempts', value: maxLoginAttempts }
        );
      } else if (activeTab === 'api') {
        settings.push(
          { key: 'api_rate_limit', value: apiRateLimit },
          { key: 'api_rate_limit_window', value: apiRateLimitWindow },
          { key: 'cors_origins', value: corsOrigins },
          { key: 'api_version', value: apiVersion }
        );
      }
      
      // Save all settings using bulk update
      await adminSystemSettingsService.updateMultipleSettings(settings);
      
      showToast('Settings saved successfully!', 'success');
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      showToast('Failed to save settings: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    try {
      setSaving(true);
      const response = await adminSystemSettingsService.testEmail({
        smtpHost,
        smtpPort: parseInt(smtpPort),
        smtpUser,
        smtpPassword,
        smtpSecure,
        emailFrom,
        testRecipient: supportEmail || smtpUser,
      });
      
      if (response.success) {
        showToast('Test email sent successfully! Check your inbox.', 'success');
      } else {
        showToast(`Email test failed: ${response.message}`, 'error');
      }
    } catch (error: any) {
      console.error('Email test failed:', error);
      showToast('Email test failed: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleTestStorage = async () => {
    try {
      setSaving(true);
      const response = await adminSystemSettingsService.testStorage({
        storageProvider,
        s3Bucket,
        s3Region,
        s3AccessKey,
        s3SecretKey,
      });
      
      if (response.success) {
        showToast(`Storage test passed! ${response.message}`, 'success');
      } else {
        showToast(`Storage test failed: ${response.message}`, 'error');
      }
    } catch (error: any) {
      console.error('Storage test failed:', error);
      showToast('Storage test failed: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-system-settings">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading system settings...</p>
        </div>
      </div>
    );
  }

  const headerActions = (
    <>
      <button
        className="admin-action-button secondary"
        onClick={loadSettings}
        disabled={saving}
      >
        Reset
      </button>
      <button
        className="admin-action-button primary"
        onClick={handleSaveSettings}
        disabled={saving}
      >
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </>
  );

  return (
    <div className="admin-system-settings">
      <AdminPageHeader
        title="System Settings"
        subtitle="Configure platform-wide system settings"
        actions={headerActions}
        loading={loading}
      />

      <div className="settings-tabs">
        <button
          className={`tab-button ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          General
        </button>
        <button
          className={`tab-button ${activeTab === 'email' ? 'active' : ''}`}
          onClick={() => setActiveTab('email')}
        >
          Email
        </button>
        <button
          className={`tab-button ${activeTab === 'storage' ? 'active' : ''}`}
          onClick={() => setActiveTab('storage')}
        >
          Storage
        </button>
        <button
          className={`tab-button ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          Security
        </button>
        <button
          className={`tab-button ${activeTab === 'api' ? 'active' : ''}`}
          onClick={() => setActiveTab('api')}
        >
          API
        </button>
      </div>

      <div className="settings-content">
        {activeTab === 'general' && (
          <div className="settings-section">
            <h2>General Settings</h2>
            
            <div className="form-group">
              <label>Platform Name</label>
              <input
                type="text"
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                placeholder="My Platform"
              />
            </div>

            <div className="form-group">
              <label>Platform URL</label>
              <input
                type="url"
                value={platformUrl}
                onChange={(e) => setPlatformUrl(e.target.value)}
                placeholder="https://myplatform.com"
              />
            </div>

            <div className="form-group">
              <label>Support Email</label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                placeholder="support@myplatform.com"
              />
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={maintenanceMode}
                  onChange={(e) => setMaintenanceMode(e.target.checked)}
                />
                <span>Maintenance Mode</span>
              </label>
              <p className="help-text">Enable to show maintenance page to users</p>
            </div>
          </div>
        )}

        {activeTab === 'email' && (
          <div className="settings-section">
            <h2>Email Settings (SMTP)</h2>
            
            <div className="form-group">
              <label>SMTP Host</label>
              <input
                type="text"
                value={smtpHost}
                onChange={(e) => setSmtpHost(e.target.value)}
                placeholder="smtp.gmail.com"
              />
            </div>

            <div className="form-group">
              <label>SMTP Port</label>
              <input
                type="number"
                value={smtpPort}
                onChange={(e) => setSmtpPort(e.target.value)}
                placeholder="587"
              />
            </div>

            <div className="form-group">
              <label>SMTP Username</label>
              <input
                type="text"
                value={smtpUser}
                onChange={(e) => setSmtpUser(e.target.value)}
                placeholder="user@gmail.com"
              />
            </div>

            <div className="form-group">
              <label>SMTP Password</label>
              <input
                type="password"
                value={smtpPassword}
                onChange={(e) => setSmtpPassword(e.target.value)}
                placeholder="••••••••"
              />
              <p className="help-text">Password is encrypted before storage</p>
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={smtpSecure}
                  onChange={(e) => setSmtpSecure(e.target.checked)}
                />
                <span>Use TLS/SSL</span>
              </label>
            </div>

            <div className="form-group">
              <label>From Email Address</label>
              <input
                type="email"
                value={emailFrom}
                onChange={(e) => setEmailFrom(e.target.value)}
                placeholder="noreply@myplatform.com"
              />
            </div>

            <button className="test-button" onClick={handleTestEmail}>
              Test Email Configuration
            </button>
          </div>
        )}

        {activeTab === 'storage' && (
          <div className="settings-section">
            <h2>Storage Settings</h2>
            
            <div className="form-group">
              <label>Storage Provider</label>
              <select
                value={storageProvider}
                onChange={(e) => setStorageProvider(e.target.value as 'local' | 's3')}
              >
                <option value="local">Local Storage</option>
                <option value="s3">Amazon S3</option>
              </select>
            </div>

            {storageProvider === 's3' && (
              <>
                <div className="form-group">
                  <label>S3 Bucket Name</label>
                  <input
                    type="text"
                    value={s3Bucket}
                    onChange={(e) => setS3Bucket(e.target.value)}
                    placeholder="my-bucket"
                  />
                </div>

                <div className="form-group">
                  <label>S3 Region</label>
                  <input
                    type="text"
                    value={s3Region}
                    onChange={(e) => setS3Region(e.target.value)}
                    placeholder="us-east-1"
                  />
                </div>

                <div className="form-group">
                  <label>S3 Access Key</label>
                  <input
                    type="text"
                    value={s3AccessKey}
                    onChange={(e) => setS3AccessKey(e.target.value)}
                    placeholder="AKIAIOSFODNN7EXAMPLE"
                  />
                </div>

                <div className="form-group">
                  <label>S3 Secret Key</label>
                  <input
                    type="password"
                    value={s3SecretKey}
                    onChange={(e) => setS3SecretKey(e.target.value)}
                    placeholder="••••••••"
                  />
                  <p className="help-text">Secret key is encrypted before storage</p>
                </div>
              </>
            )}

            <div className="form-group">
              <label>Max File Size (MB)</label>
              <input
                type="number"
                value={maxFileSize}
                onChange={(e) => setMaxFileSize(e.target.value)}
                placeholder="10"
              />
            </div>

            <button className="test-button" onClick={handleTestStorage}>
              Test Storage Configuration
            </button>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="settings-section">
            <h2>Security Settings</h2>
            
            <div className="form-group">
              <label>JWT Secret Key</label>
              <input
                type="password"
                value={jwtSecret}
                onChange={(e) => setJwtSecret(e.target.value)}
                placeholder="••••••••"
              />
              <p className="help-text">Leave empty to keep current secret. Encrypted before storage.</p>
            </div>

            <div className="form-group">
              <label>JWT Token Expiry</label>
              <input
                type="text"
                value={jwtExpiry}
                onChange={(e) => setJwtExpiry(e.target.value)}
                placeholder="7d"
              />
              <p className="help-text">Examples: 1h, 7d, 30d</p>
            </div>

            <div className="form-group">
              <label>Minimum Password Length</label>
              <input
                type="number"
                value={passwordMinLength}
                onChange={(e) => setPasswordMinLength(e.target.value)}
                min="6"
                max="32"
              />
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={requireSpecialChar}
                  onChange={(e) => setRequireSpecialChar(e.target.checked)}
                />
                <span>Require Special Characters in Password</span>
              </label>
            </div>

            <div className="form-group">
              <label>Session Timeout (minutes)</label>
              <input
                type="number"
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(e.target.value)}
                placeholder="30"
              />
            </div>

            <div className="form-group">
              <label>Max Login Attempts</label>
              <input
                type="number"
                value={maxLoginAttempts}
                onChange={(e) => setMaxLoginAttempts(e.target.value)}
                placeholder="5"
              />
              <p className="help-text">Account locked after this many failed attempts</p>
            </div>
          </div>
        )}

        {activeTab === 'api' && (
          <div className="settings-section">
            <h2>API Settings</h2>
            
            <div className="form-group">
              <label>API Rate Limit (requests)</label>
              <input
                type="number"
                value={apiRateLimit}
                onChange={(e) => setApiRateLimit(e.target.value)}
                placeholder="100"
              />
            </div>

            <div className="form-group">
              <label>Rate Limit Window (minutes)</label>
              <input
                type="number"
                value={apiRateLimitWindow}
                onChange={(e) => setApiRateLimitWindow(e.target.value)}
                placeholder="15"
              />
              <p className="help-text">Rate limit resets after this duration</p>
            </div>

            <div className="form-group">
              <label>CORS Allowed Origins</label>
              <textarea
                value={corsOrigins}
                onChange={(e) => setCorsOrigins(e.target.value)}
                placeholder="https://example.com&#10;https://app.example.com"
                rows={4}
              />
              <p className="help-text">One origin per line. Use * for all origins (not recommended for production)</p>
            </div>

            <div className="form-group">
              <label>API Version</label>
              <input
                type="text"
                value={apiVersion}
                onChange={(e) => setApiVersion(e.target.value)}
                placeholder="v1"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSystemSettings;
