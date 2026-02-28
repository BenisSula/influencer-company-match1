import React, { useState, useEffect } from 'react';
import { Megaphone, MessageCircle, Activity, Sparkles, BarChart3, Star, Search, Bell, Handshake, LucideIcon } from 'lucide-react';
import AdminPageHeader from '../../components/AdminPageHeader';
import adminBrandingService, { FeatureFlags } from '../../services/admin-branding.service';
import './AdminFeatureFlags.css';

interface FeatureInfo {
  key: keyof FeatureFlags;
  label: string;
  description: string;
  icon: LucideIcon;
}

const FEATURES: FeatureInfo[] = [
  {
    key: 'enableCampaigns',
    label: 'Campaigns',
    description: 'Allow companies to create and manage campaigns',
    icon: Megaphone,
  },
  {
    key: 'enableMessaging',
    label: 'Messaging',
    description: 'Enable direct messaging between users',
    icon: MessageCircle,
  },
  {
    key: 'enableFeed',
    label: 'Social Feed',
    description: 'Show social feed with posts and interactions',
    icon: Activity,
  },
  {
    key: 'enableAIMatching',
    label: 'AI Matching',
    description: 'Use AI-powered matching algorithm',
    icon: Sparkles,
  },
  {
    key: 'enableAnalytics',
    label: 'Analytics',
    description: 'Display analytics and insights dashboard',
    icon: BarChart3,
  },
  {
    key: 'enableReviews',
    label: 'Reviews & Ratings',
    description: 'Allow users to leave reviews and ratings',
    icon: Star,
  },
  {
    key: 'enableSearch',
    label: 'Global Search',
    description: 'Enable platform-wide search functionality',
    icon: Search,
  },
  {
    key: 'enableNotifications',
    label: 'Notifications',
    description: 'Send real-time notifications to users',
    icon: Bell,
  },
  {
    key: 'enableCollaborations',
    label: 'Collaborations',
    description: 'Enable collaboration requests and tracking',
    icon: Handshake,
  },
];

const AdminFeatureFlags: React.FC = () => {
  const [features, setFeatures] = useState<FeatureFlags | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadFeatures();
  }, []);

  const loadFeatures = async () => {
    try {
      setLoading(true);
      const data = await adminBrandingService.getFeatures();
      setFeatures(data);
    } catch (error: any) {
      showMessage('error', error.response?.data?.message || 'Failed to load feature flags');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key: keyof FeatureFlags) => {
    if (!features) return;

    const newValue = !features[key];
    const updatedFeatures = { ...features, [key]: newValue };
    setFeatures(updatedFeatures);

    try {
      setSaving(true);
      await adminBrandingService.updateFeatures({ [key]: newValue });
      showMessage('success', `${FEATURES.find(f => f.key === key)?.label} ${newValue ? 'enabled' : 'disabled'} successfully!`);
    } catch (error: any) {
      // Revert on error
      setFeatures(features);
      showMessage('error', error.response?.data?.message || 'Failed to update feature flag');
    } finally {
      setSaving(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  if (loading) {
    return (
      <div className="admin-feature-flags">
        <div className="loading-spinner">Loading feature flags...</div>
      </div>
    );
  }

  if (!features) {
    return (
      <div className="admin-feature-flags">
        <div className="error-message">Failed to load feature flags</div>
      </div>
    );
  }

  const enabledCount = Object.values(features).filter(Boolean).length;

  return (
    <div className="admin-feature-flags">
      <AdminPageHeader
        title="Feature Flags"
        subtitle={`Enable or disable platform features • ${enabledCount} of ${FEATURES.length} enabled`}
        loading={loading}
      />

      {message && (
        <div className={`message-banner ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="features-grid">
        {FEATURES.map((feature) => {
          const IconComponent = feature.icon;
          return (
            <div key={feature.key} className={`feature-card ${features[feature.key] ? 'enabled' : 'disabled'}`}>
              <div className="feature-icon">
                <IconComponent size={24} />
              </div>
              <div className="feature-content">
                <h3>{feature.label}</h3>
                <p>{feature.description}</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={features[feature.key]}
                  onChange={() => handleToggle(feature.key)}
                  disabled={saving}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminFeatureFlags;
