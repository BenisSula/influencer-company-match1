import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Button, Toggle } from '../components';
import { settingsService, UserSettings, defaultUserSettings } from '../services/settings.service';
import { useToast } from '../contexts/ToastContext';
import { HiSave, HiX, HiExclamation } from 'react-icons/hi';
import './Settings.css';

export const Settings = () => {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<UserSettings | null>(defaultUserSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await settingsService.getSettings();
      setSettings(data);
    } catch (error: any) {
      console.error('Failed to load settings:', error);
      // Use default settings instead of showing error
      setSettings(defaultUserSettings);
      // Optionally show a non-blocking toast
      // showToast('Using default settings', 'info');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key: keyof UserSettings, value: any) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      await settingsService.updateSettings(settings);
      setHasChanges(false);
      showToast('Settings saved successfully!', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    loadSettings();
    setHasChanges(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    try {
      setChangingPassword(true);
      await settingsService.changePassword(currentPassword, newPassword);
      showToast('Password changed successfully!', 'success');
      setShowPasswordForm(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      showToast(error.message || 'Failed to change password', 'error');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeactivateAccount = async () => {
    const password = prompt('Enter your password to deactivate your account:');
    if (!password) return;

    if (!confirm('Are you sure you want to deactivate your account? You can reactivate it anytime by logging in.')) {
      return;
    }

    try {
      await settingsService.deactivateAccount(password);
      showToast('Account deactivated. Logging out...', 'info');
      setTimeout(() => {
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
      }, 2000);
    } catch (error: any) {
      showToast(error.message || 'Failed to deactivate account', 'error');
    }
  };

  const handleDeleteAccount = async () => {
    const password = prompt('Enter your password to permanently delete your account:');
    if (!password) return;

    if (!confirm('⚠️ WARNING: This will permanently delete your account and all data. This action cannot be undone. Are you absolutely sure?')) {
      return;
    }

    try {
      await settingsService.deleteAccount(password);
      showToast('Account deleted. Goodbye...', 'info');
      setTimeout(() => {
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
      }, 2000);
    } catch (error: any) {
      showToast(error.message || 'Failed to delete account', 'error');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardBody>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="spinner" style={{ margin: '0 auto' }}></div>
            <p style={{ marginTop: '1rem', color: '#65676B' }}>Loading settings...</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (!settings) {
    return (
      <Card>
        <CardBody>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: '#EF4444' }}>Failed to load settings</p>
            <Button variant="primary" onClick={loadSettings} style={{ marginTop: '1rem' }}>
              Retry
            </Button>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="settings-page">
      <Card style={{ marginBottom: '1rem' }}>
        <CardHeader>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#050505', margin: 0 }}>
            Settings
          </h2>
        </CardHeader>
        <CardBody>
          <p style={{ fontSize: '0.9375rem', color: '#65676B' }}>
            Manage your account settings and preferences
          </p>
        </CardBody>
      </Card>

      {/* Account Settings */}
      <Card className="settings-section">
        <CardHeader>
          <h3 className="settings-section-title">Account Settings</h3>
        </CardHeader>
        <CardBody>
          <p className="settings-section-description">
            Manage your account security and password
          </p>

          <div className="settings-group">
            <div className="settings-item">
              <div className="settings-item-label">Change Password</div>
              <div className="settings-item-description">
                Update your password to keep your account secure
              </div>
              {!showPasswordForm ? (
                <Button variant="secondary" size="sm" onClick={() => setShowPasswordForm(true)}>
                  Change Password
                </Button>
              ) : (
                <form onSubmit={handleChangePassword} className="password-form">
                  <div className="form-group">
                    <label className="form-label">Current Password</label>
                    <input
                      type="password"
                      className="settings-input"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      className="settings-input"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      className="settings-input"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button type="submit" variant="primary" size="sm" disabled={changingPassword}>
                      {changingPassword ? 'Changing...' : 'Change Password'}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowPasswordForm(false);
                        setCurrentPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Privacy Settings */}
      <Card className="settings-section">
        <CardHeader>
          <h3 className="settings-section-title">Privacy Settings</h3>
        </CardHeader>
        <CardBody>
          <p className="settings-section-description">
            Control who can see your profile and contact you
          </p>

          <div className="settings-group">
            <div className="settings-item">
              <div className="settings-item-label">Profile Visibility</div>
              <div className="settings-item-description">
                Choose who can view your profile
              </div>
              <select
                className="settings-select"
                value={settings.profileVisibility}
                onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
              >
                <option value="public">Public - Anyone can view</option>
                <option value="connections">Connections Only</option>
                <option value="private">Private - Hidden from everyone</option>
              </select>
            </div>

            <Toggle
              checked={settings.showInSearch}
              onChange={(checked) => handleSettingChange('showInSearch', checked)}
              label="Show in Search Results"
              description="Allow others to find you in search"
            />

            <Toggle
              checked={settings.showActivityStatus}
              onChange={(checked) => handleSettingChange('showActivityStatus', checked)}
              label="Show Activity Status"
              description="Let others see when you're online"
            />

            <div className="settings-item">
              <div className="settings-item-label">Who Can Message You</div>
              <div className="settings-item-description">
                Control who can send you messages
              </div>
              <select
                className="settings-select"
                value={settings.messagePermission}
                onChange={(e) => handleSettingChange('messagePermission', e.target.value)}
              >
                <option value="everyone">Everyone</option>
                <option value="connections">Connections Only</option>
                <option value="none">No One</option>
              </select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Notification Settings */}
      <Card className="settings-section">
        <CardHeader>
          <h3 className="settings-section-title">Notification Preferences</h3>
        </CardHeader>
        <CardBody>
          <p className="settings-section-description">
            Choose what notifications you want to receive
          </p>

          <div className="settings-group">
            <Toggle
              checked={settings.emailNewMatch}
              onChange={(checked) => handleSettingChange('emailNewMatch', checked)}
              label="New Match Notifications"
              description="Get notified when you have a new match"
            />

            <Toggle
              checked={settings.emailNewMessage}
              onChange={(checked) => handleSettingChange('emailNewMessage', checked)}
              label="New Message Notifications"
              description="Get notified when you receive a message"
            />

            <Toggle
              checked={settings.emailConnectionRequest}
              onChange={(checked) => handleSettingChange('emailConnectionRequest', checked)}
              label="Connection Request Notifications"
              description="Get notified when someone wants to connect"
            />

            <Toggle
              checked={settings.emailPostInteractions}
              onChange={(checked) => handleSettingChange('emailPostInteractions', checked)}
              label="Post Interaction Notifications"
              description="Get notified about likes and comments on your posts"
            />

            <Toggle
              checked={settings.emailWeeklySummary}
              onChange={(checked) => handleSettingChange('emailWeeklySummary', checked)}
              label="Weekly Summary"
              description="Receive a weekly summary of your activity"
            />

            <Toggle
              checked={settings.emailMarketing}
              onChange={(checked) => handleSettingChange('emailMarketing', checked)}
              label="Marketing Emails"
              description="Receive updates about new features and tips"
            />
          </div>
        </CardBody>
      </Card>

      {/* Communication Settings */}
      <Card className="settings-section">
        <CardHeader>
          <h3 className="settings-section-title">Communication Settings</h3>
        </CardHeader>
        <CardBody>
          <p className="settings-section-description">
            Customize your messaging experience
          </p>

          <div className="settings-group">
            <Toggle
              checked={settings.readReceipts}
              onChange={(checked) => handleSettingChange('readReceipts', checked)}
              label="Read Receipts"
              description="Let others know when you've read their messages"
            />

            <Toggle
              checked={settings.typingIndicators}
              onChange={(checked) => handleSettingChange('typingIndicators', checked)}
              label="Typing Indicators"
              description="Show when you're typing a message"
            />
          </div>
        </CardBody>
      </Card>

      {/* Danger Zone */}
      <Card className="settings-section settings-danger-zone">
        <CardHeader>
          <h3 className="settings-section-title">
            <HiExclamation style={{ display: 'inline', marginRight: '0.5rem' }} />
            Danger Zone
          </h3>
        </CardHeader>
        <CardBody>
          <p className="settings-section-description">
            Irreversible actions that affect your account
          </p>

          <div className="settings-group">
            <div className="settings-item">
              <div className="settings-item-label">Deactivate Account</div>
              <div className="settings-item-description">
                Temporarily disable your account. You can reactivate it anytime by logging in.
              </div>
              <Button variant="secondary" size="sm" onClick={handleDeactivateAccount}>
                Deactivate Account
              </Button>
            </div>

            <div className="settings-item">
              <div className="settings-item-label">Delete Account</div>
              <div className="settings-item-description">
                Permanently delete your account and all data. This action cannot be undone.
              </div>
              <Button variant="secondary" size="sm" onClick={handleDeleteAccount}>
                Delete Account
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Save Actions */}
      {hasChanges && (
        <div className="settings-actions">
          <Button variant="ghost" onClick={handleCancel} disabled={saving}>
            <HiX size={18} />
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            <HiSave size={18} />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      )}
    </div>
  );
};
