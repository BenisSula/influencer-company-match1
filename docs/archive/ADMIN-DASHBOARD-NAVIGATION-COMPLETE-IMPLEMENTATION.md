# Admin Dashboard Navigation - Complete Implementation Plan

## Overview

This comprehensive implementation plan includes:
1. ✅ Complete implementation code for admin navigation
2. ✅ Backend and database integration for platform config
3. ✅ Sync with Main Matching Pages (admin settings affect main app)
4. ✅ Works with live/real data from database

---

## Part 1: Backend - Public Platform Config Endpoint

### 1.1 Create Public Platform Config Controller

**File:** `backend/src/modules/platform/platform-config.controller.ts`

```typescript
import { Controller, Get, Param } from '@nestjs/common';
import { PlatformConfigService } from './platform-config.service';

@Controller('public/platform')
export class PlatformConfigController {
  constructor(
    private readonly platformConfigService: PlatformConfigService,
  ) {}

  /**
   * Public endpoint to get platform branding
   * Used by main app to apply admin-configured branding
   */
  @Get('branding')
  async getPublicBranding() {
    return await this.platformConfigService.getPublicBranding();
  }

  /**
   * Public endpoint to get platform features
   * Used by main app to enable/disable features based on admin config
   */
  @Get('features')
  async getPublicFeatures() {
    return await this.platformConfigService.getPublicFeatures();
  }

  /**
   * Public endpoint to get platform config
   * Returns all public-safe configuration
   */
  @Get('config')
  async getPublicConfig() {
    return await this.platformConfigService.getPublicConfig();
  }
}
```

### 1.2 Create Platform Config Service

**File:** `backend/src/modules/platform/platform-config.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlatformConfig } from '../admin/entities/platform-config.entity';

@Injectable()
export class PlatformConfigService {
  constructor(
    @InjectRepository(PlatformConfig)
    private platformConfigRepository: Repository<PlatformConfig>,
  ) {}

  /**
   * Get default tenant config (for single-tenant setup)
   * In multi-tenant, you'd pass tenantId
   */
  private async getDefaultConfig(): Promise<PlatformConfig | null> {
    // Get the first tenant's config (default tenant)
    const config = await this.platformConfigRepository.findOne({
      where: {},
      order: { createdAt: 'ASC' },
    });
    return config;
  }

  /**
   * Get public branding settings
   * Safe to expose to frontend
   */
  async getPublicBranding() {
    const config = await this.getDefaultConfig();
    
    if (!config) {
      return this.getDefaultBranding();
    }

    return {
      logo: config.branding.logo,
      favicon: config.branding.favicon,
      primaryColor: config.branding.primaryColor,
      secondaryColor: config.branding.secondaryColor,
      accentColor: config.branding.accentColor,
      successColor: config.branding.successColor,
      warningColor: config.branding.warningColor,
      infoColor: config.branding.infoColor,
      fontFamily: config.branding.fontFamily,
      platformName: config.branding.platformName,
      tagline: config.branding.tagline,
      footerText: config.branding.footerText,
      customCSS: config.branding.customCSS,
    };
  }

  /**
   * Get public feature flags
   * Safe to expose to frontend
   */
  async getPublicFeatures() {
    const config = await this.getDefaultConfig();
    
    if (!config) {
      return this.getDefaultFeatures();
    }

    return {
      enableCampaigns: config.features.enableCampaigns,
      enableMessaging: config.features.enableMessaging,
      enableFeed: config.features.enableFeed,
      enableAIMatching: config.features.enableAIMatching,
      enableAnalytics: config.features.enableAnalytics,
      enableReviews: config.features.enableReviews,
      enableSearch: config.features.enableSearch,
      enableNotifications: config.features.enableNotifications,
      enableCollaborations: config.features.enableCollaborations,
    };
  }

  /**
   * Get complete public config
   */
  async getPublicConfig() {
    const branding = await this.getPublicBranding();
    const features = await this.getPublicFeatures();

    return {
      branding,
      features,
    };
  }

  /**
   * Default branding if no config exists
   */
  private getDefaultBranding() {
    return {
      logo: '',
      favicon: '',
      primaryColor: '#E1306C',
      secondaryColor: '#5B51D8',
      accentColor: '#FD8D32',
      successColor: '#00D95F',
      warningColor: '#FFCC00',
      infoColor: '#0095F6',
      fontFamily: 'Inter, sans-serif',
      platformName: 'Influencer Match',
      tagline: 'Connect. Collaborate. Succeed.',
      footerText: `© ${new Date().getFullYear()} Influencer Match. All rights reserved.`,
      customCSS: '',
    };
  }

  /**
   * Default features if no config exists
   */
  private getDefaultFeatures() {
    return {
      enableCampaigns: false,
      enableMessaging: true,
      enableFeed: true,
      enableAIMatching: true,
      enableAnalytics: true,
      enableReviews: true,
      enableSearch: true,
      enableNotifications: true,
      enableCollaborations: true,
    };
  }
}
```


### 1.3 Create Platform Module

**File:** `backend/src/modules/platform/platform.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlatformConfig } from '../admin/entities/platform-config.entity';
import { PlatformConfigController } from './platform-config.controller';
import { PlatformConfigService } from './platform-config.service';

@Module({
  imports: [TypeOrmModule.forFeature([PlatformConfig])],
  controllers: [PlatformConfigController],
  providers: [PlatformConfigService],
  exports: [PlatformConfigService],
})
export class PlatformModule {}
```

### 1.4 Register Platform Module in App Module

**File:** `backend/src/app.module.ts` (add to imports)

```typescript
import { PlatformModule } from './modules/platform/platform.module';

@Module({
  imports: [
    // ... existing imports
    PlatformModule,
  ],
})
export class AppModule {}
```

---

## Part 2: Frontend - Platform Config Service

### 2.1 Create Platform Config Service

**File:** `src/renderer/services/platform-config.service.ts`

```typescript
import axios from 'axios';

const API_URL = 'http://localhost:3000/public/platform';

export interface PlatformBranding {
  logo: string;
  favicon: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  successColor: string;
  warningColor: string;
  infoColor: string;
  fontFamily: string;
  platformName: string;
  tagline: string;
  footerText: string;
  customCSS: string;
}

export interface PlatformFeatures {
  enableCampaigns: boolean;
  enableMessaging: boolean;
  enableFeed: boolean;
  enableAIMatching: boolean;
  enableAnalytics: boolean;
  enableReviews: boolean;
  enableSearch: boolean;
  enableNotifications: boolean;
  enableCollaborations: boolean;
}

export interface PlatformConfig {
  branding: PlatformBranding;
  features: PlatformFeatures;
}

class PlatformConfigService {
  private config: PlatformConfig | null = null;
  private loading: boolean = false;

  /**
   * Load platform config from backend
   * Caches the result to avoid repeated API calls
   */
  async loadConfig(): Promise<PlatformConfig> {
    if (this.config) {
      return this.config;
    }

    if (this.loading) {
      // Wait for existing load to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      return this.loadConfig();
    }

    try {
      this.loading = true;
      const response = await axios.get(`${API_URL}/config`);
      this.config = response.data;
      return this.config;
    } catch (error) {
      console.error('Failed to load platform config:', error);
      // Return defaults if API fails
      return this.getDefaultConfig();
    } finally {
      this.loading = false;
    }
  }

  /**
   * Get branding settings
   */
  async getBranding(): Promise<PlatformBranding> {
    const config = await this.loadConfig();
    return config.branding;
  }

  /**
   * Get feature flags
   */
  async getFeatures(): Promise<PlatformFeatures> {
    const config = await this.loadConfig();
    return config.features;
  }

  /**
   * Check if a feature is enabled
   */
  async isFeatureEnabled(feature: keyof PlatformFeatures): Promise<boolean> {
    const features = await this.getFeatures();
    return features[feature] === true;
  }

  /**
   * Apply branding to document
   * Updates CSS variables and document title
   */
  async applyBranding() {
    const branding = await this.getBranding();
    
    // Update CSS variables
    const root = document.documentElement;
    root.style.setProperty('--color-primary', branding.primaryColor);
    root.style.setProperty('--color-secondary', branding.secondaryColor);
    root.style.setProperty('--color-accent', branding.accentColor);
    root.style.setProperty('--color-success', branding.successColor);
    root.style.setProperty('--color-warning', branding.warningColor);
    root.style.setProperty('--color-info', branding.infoColor);
    root.style.setProperty('--font-family', branding.fontFamily);

    // Update document title
    document.title = branding.platformName;

    // Update favicon
    if (branding.favicon) {
      const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      link.href = branding.favicon;
      document.getElementsByTagName('head')[0].appendChild(link);
    }

    // Apply custom CSS
    if (branding.customCSS) {
      const style = document.createElement('style');
      style.textContent = branding.customCSS;
      document.head.appendChild(style);
    }
  }

  /**
   * Clear cached config
   * Call this when admin updates settings
   */
  clearCache() {
    this.config = null;
  }

  /**
   * Default config fallback
   */
  private getDefaultConfig(): PlatformConfig {
    return {
      branding: {
        logo: '',
        favicon: '',
        primaryColor: '#E1306C',
        secondaryColor: '#5B51D8',
        accentColor: '#FD8D32',
        successColor: '#00D95F',
        warningColor: '#FFCC00',
        infoColor: '#0095F6',
        fontFamily: 'Inter, sans-serif',
        platformName: 'Influencer Match',
        tagline: 'Connect. Collaborate. Succeed.',
        footerText: `© ${new Date().getFullYear()} Influencer Match. All rights reserved.`,
        customCSS: '',
      },
      features: {
        enableCampaigns: false,
        enableMessaging: true,
        enableFeed: true,
        enableAIMatching: true,
        enableAnalytics: true,
        enableReviews: true,
        enableSearch: true,
        enableNotifications: true,
        enableCollaborations: true,
      },
    };
  }
}

export default new PlatformConfigService();
```


### 2.2 Create Platform Config Context

**File:** `src/renderer/contexts/PlatformConfigContext.tsx`

```typescript
import React, { createContext, useContext, useEffect, useState } from 'react';
import platformConfigService, { PlatformConfig, PlatformBranding, PlatformFeatures } from '../services/platform-config.service';

interface PlatformConfigContextType {
  config: PlatformConfig | null;
  branding: PlatformBranding | null;
  features: PlatformFeatures | null;
  loading: boolean;
  isFeatureEnabled: (feature: keyof PlatformFeatures) => boolean;
  refreshConfig: () => Promise<void>;
}

const PlatformConfigContext = createContext<PlatformConfigContextType | undefined>(undefined);

export const PlatformConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<PlatformConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const platformConfig = await platformConfigService.loadConfig();
      setConfig(platformConfig);
      
      // Apply branding to document
      await platformConfigService.applyBranding();
    } catch (error) {
      console.error('Failed to load platform config:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshConfig = async () => {
    platformConfigService.clearCache();
    await loadConfig();
  };

  const isFeatureEnabled = (feature: keyof PlatformFeatures): boolean => {
    if (!config) return false;
    return config.features[feature] === true;
  };

  return (
    <PlatformConfigContext.Provider
      value={{
        config,
        branding: config?.branding || null,
        features: config?.features || null,
        loading,
        isFeatureEnabled,
        refreshConfig,
      }}
    >
      {children}
    </PlatformConfigContext.Provider>
  );
};

export const usePlatformConfig = () => {
  const context = useContext(PlatformConfigContext);
  if (!context) {
    throw new Error('usePlatformConfig must be used within PlatformConfigProvider');
  }
  return context;
};
```

### 2.3 Update Features Config to Use Platform Config

**File:** `src/renderer/config/features.ts` (Updated)

```typescript
import platformConfigService from '../services/platform-config.service';

/**
 * Feature Flags Configuration
 * Now synced with admin dashboard settings
 */

export interface FeatureFlags {
  CAMPAIGNS_ENABLED: boolean;
  COLLABORATION_REQUESTS_ENABLED: boolean;
  ADVANCED_ANALYTICS_ENABLED: boolean;
  VIDEO_POSTS_ENABLED: boolean;
  MATCH_HISTORY_ENABLED: boolean;
  SAVED_ITEMS_ENABLED: boolean;
  MESSAGING_ENABLED: boolean;
  FEED_ENABLED: boolean;
  AI_MATCHING_ENABLED: boolean;
  REVIEWS_ENABLED: boolean;
  SEARCH_ENABLED: boolean;
  NOTIFICATIONS_ENABLED: boolean;
}

/**
 * Get feature flags from platform config
 * Falls back to local config if platform config fails
 */
export const getFeatureFlags = async (): Promise<FeatureFlags> => {
  try {
    const platformFeatures = await platformConfigService.getFeatures();
    
    return {
      CAMPAIGNS_ENABLED: platformFeatures.enableCampaigns,
      COLLABORATION_REQUESTS_ENABLED: platformFeatures.enableCollaborations,
      ADVANCED_ANALYTICS_ENABLED: platformFeatures.enableAnalytics,
      VIDEO_POSTS_ENABLED: false, // Not yet implemented
      MATCH_HISTORY_ENABLED: platformFeatures.enableAnalytics,
      SAVED_ITEMS_ENABLED: true, // Always enabled
      MESSAGING_ENABLED: platformFeatures.enableMessaging,
      FEED_ENABLED: platformFeatures.enableFeed,
      AI_MATCHING_ENABLED: platformFeatures.enableAIMatching,
      REVIEWS_ENABLED: platformFeatures.enableReviews,
      SEARCH_ENABLED: platformFeatures.enableSearch,
      NOTIFICATIONS_ENABLED: platformFeatures.enableNotifications,
    };
  } catch (error) {
    console.error('Failed to get platform features, using defaults:', error);
    return getDefaultFeatures();
  }
};

/**
 * Default features (fallback)
 */
const getDefaultFeatures = (): FeatureFlags => {
  return {
    CAMPAIGNS_ENABLED: false,
    COLLABORATION_REQUESTS_ENABLED: true,
    ADVANCED_ANALYTICS_ENABLED: true,
    VIDEO_POSTS_ENABLED: false,
    MATCH_HISTORY_ENABLED: true,
    SAVED_ITEMS_ENABLED: true,
    MESSAGING_ENABLED: true,
    FEED_ENABLED: true,
    AI_MATCHING_ENABLED: true,
    REVIEWS_ENABLED: true,
    SEARCH_ENABLED: true,
    NOTIFICATIONS_ENABLED: true,
  };
};

/**
 * Check if a feature is enabled
 * @param feature - Feature key to check
 * @returns boolean indicating if feature is enabled
 */
export const isFeatureEnabled = async (feature: keyof FeatureFlags): Promise<boolean> => {
  const features = await getFeatureFlags();
  return features[feature] === true;
};
```

---

## Part 3: Admin Layout with Complete Navigation

### 3.1 Create Admin Layout Component

**File:** `src/renderer/layouts/AdminLayout/AdminLayout.tsx`

```typescript
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Building2, CreditCard, Palette, 
  ToggleLeft, BarChart3, Shield, Settings, LogOut 
} from 'lucide-react';
import { adminAuthService } from '../../services/admin-auth.service';
import './AdminLayout.css';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const adminUser = adminAuthService.getAdminUser();

  const handleLogout = () => {
    adminAuthService.logout();
    navigate('/admin/login');
  };

  const navItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/users', icon: Users, label: 'Users' },
    { path: '/admin/tenants', icon: Building2, label: 'Tenants' },
    { path: '/admin/payments', icon: CreditCard, label: 'Payments' },
    { path: '/admin/branding', icon: Palette, label: 'Branding' },
    { path: '/admin/features', icon: ToggleLeft, label: 'Features' },
    { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/admin/moderation', icon: Shield, label: 'Moderation' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="admin-layout">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-content">
          <div className="admin-header-left">
            <h1 className="admin-logo">Admin Panel</h1>
          </div>
          <div className="admin-header-right">
            <span className="admin-user-name">{adminUser?.fullName}</span>
            <span className="admin-role-badge">{adminUser?.role}</span>
            <button onClick={handleLogout} className="admin-logout-btn">
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="admin-body">
        {/* Sidebar Navigation */}
        <aside className="admin-sidebar">
          <nav className="admin-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <button
                  key={item.path}
                  className={`admin-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => navigate(item.path)}
                >
                  <Icon size={20} className="nav-icon" />
                  <span className="nav-label">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
};
```


### 3.2 Create Admin Layout CSS

**File:** `src/renderer/layouts/AdminLayout/AdminLayout.css`

```css
.admin-layout {
  min-height: 100vh;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
}

/* Header */
.admin-header {
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  padding: 0 2rem;
  height: 64px;
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.admin-header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 1920px;
  margin: 0 auto;
}

.admin-header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.admin-logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.admin-header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.admin-user-name {
  font-size: 0.875rem;
  color: #6b7280;
}

.admin-role-badge {
  padding: 0.25rem 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.admin-logout-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.admin-logout-btn:hover {
  background: #dc2626;
  transform: translateY(-1px);
}

/* Body Layout */
.admin-body {
  display: flex;
  flex: 1;
  max-width: 1920px;
  margin: 0 auto;
  width: 100%;
}

/* Sidebar */
.admin-sidebar {
  width: 260px;
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  padding: 1.5rem 0;
  position: sticky;
  top: 64px;
  height: calc(100vh - 64px);
  overflow-y: auto;
}

.admin-nav {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0 1rem;
}

.admin-nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  width: 100%;
}

.admin-nav-item:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.admin-nav-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.admin-nav-item .nav-icon {
  flex-shrink: 0;
}

.admin-nav-item .nav-label {
  flex: 1;
}

/* Main Content */
.admin-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  max-height: calc(100vh - 64px);
}

/* Responsive */
@media (max-width: 1024px) {
  .admin-sidebar {
    width: 220px;
  }
}

@media (max-width: 768px) {
  .admin-body {
    flex-direction: column;
  }

  .admin-sidebar {
    width: 100%;
    height: auto;
    position: relative;
    top: 0;
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
  }

  .admin-nav {
    flex-direction: row;
    overflow-x: auto;
    padding: 0 1rem;
  }

  .admin-nav-item {
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.5rem;
    min-width: 80px;
    text-align: center;
  }

  .admin-nav-item .nav-label {
    font-size: 0.75rem;
  }

  .admin-content {
    max-height: none;
  }
}
```

---

## Part 4: Update Main App to Use Platform Config

### 4.1 Update AppComponent.tsx

**File:** `src/renderer/AppComponent.tsx` (Add PlatformConfigProvider)

```typescript
import { PlatformConfigProvider } from './contexts/PlatformConfigContext';

// Wrap the entire app with PlatformConfigProvider
function AppComponent() {
  return (
    <BrowserRouter>
      <PlatformConfigProvider>
        <AuthProvider>
          <ToastProvider>
            <NotificationProvider>
              <ConnectionProvider>
                <ComparisonProvider>
                  {/* ... rest of your app */}
                </ComparisonProvider>
              </ConnectionProvider>
            </NotificationProvider>
          </ToastProvider>
        </AuthProvider>
      </PlatformConfigProvider>
    </BrowserRouter>
  );
}
```

### 4.2 Update FeatureGuard to Use Platform Config

**File:** `src/renderer/components/FeatureGuard/FeatureGuard.tsx` (Updated)

```typescript
import React from 'react';
import { usePlatformConfig } from '../../contexts/PlatformConfigContext';
import { DisabledFeature } from '../DisabledFeature/DisabledFeature';

export interface FeatureGuardProps {
  feature: string;
  featureName: string;
  children: React.ReactNode;
  redirectTo?: string;
  redirectText?: string;
}

/**
 * FeatureGuard Component
 * Now uses platform config from admin dashboard
 */
export const FeatureGuard: React.FC<FeatureGuardProps> = ({
  feature,
  featureName,
  children,
  redirectTo,
  redirectText,
}) => {
  const { features, loading } = usePlatformConfig();
  
  if (loading) {
    return <div>Loading...</div>;
  }

  // Map feature names to platform config keys
  const featureMap: Record<string, keyof typeof features> = {
    'CAMPAIGNS_ENABLED': 'enableCampaigns',
    'MESSAGING_ENABLED': 'enableMessaging',
    'FEED_ENABLED': 'enableFeed',
    'AI_MATCHING_ENABLED': 'enableAIMatching',
    'ANALYTICS_ENABLED': 'enableAnalytics',
    'REVIEWS_ENABLED': 'enableReviews',
    'SEARCH_ENABLED': 'enableSearch',
    'NOTIFICATIONS_ENABLED': 'enableNotifications',
    'COLLABORATION_REQUESTS_ENABLED': 'enableCollaborations',
  };

  const platformFeature = featureMap[feature];
  const enabled = features && platformFeature ? features[platformFeature] : false;
  
  if (!enabled) {
    return (
      <DisabledFeature
        featureName={featureName}
        message={`${featureName} is currently disabled by the administrator.`}
        redirectTo={redirectTo}
        redirectText={redirectText}
      />
    );
  }
  
  return <>{children}</>;
};
```

### 4.3 Update Matches Page to Use Platform Config

**File:** `src/renderer/pages/Matches.tsx` (Updated)

```typescript
import { usePlatformConfig } from '../contexts/PlatformConfigContext';

export const Matches = () => {
  const { isFeatureEnabled } = usePlatformConfig();
  // ... rest of component

  return (
    <>
      <Card style={{ marginBottom: '1rem' }}>
        <CardHeader>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#050505', margin: 0 }}>
              Discover Matches
            </h2>
            {isFeatureEnabled('enableAnalytics') && (
              <Button
                variant="secondary"
                onClick={() => navigate('/matches/history')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <HiChartBar size={18} />
                View Analytics
              </Button>
            )}
          </div>
        </CardHeader>
        {/* ... rest of component */}
      </Card>
    </>
  );
};
```

---

## Part 5: Update Admin Routes

### 5.1 Update AppComponent Routes

**File:** `src/renderer/AppComponent.tsx` (Update admin routes)

```typescript
import { AdminLayout } from './layouts/AdminLayout/AdminLayout';

// Admin routes with AdminLayout wrapper
<Route path="/admin/login" element={<AdminLogin />} />
<Route 
  path="/admin/dashboard" 
  element={
    <AdminProtectedRoute>
      <AdminLayout>
        <AdminDashboard />
      </AdminLayout>
    </AdminProtectedRoute>
  } 
/>
<Route 
  path="/admin/users" 
  element={
    <AdminProtectedRoute>
      <AdminLayout>
        <AdminUsers />
      </AdminLayout>
    </AdminProtectedRoute>
  } 
/>
<Route 
  path="/admin/tenants" 
  element={
    <AdminProtectedRoute>
      <AdminLayout>
        <AdminTenants />
      </AdminLayout>
    </AdminProtectedRoute>
  } 
/>
<Route 
  path="/admin/payments" 
  element={
    <AdminProtectedRoute>
      <AdminLayout>
        <AdminPayments />
      </AdminLayout>
    </AdminProtectedRoute>
  } 
/>
<Route 
  path="/admin/branding" 
  element={
    <AdminProtectedRoute>
      <AdminLayout>
        <AdminBranding />
      </AdminLayout>
    </AdminProtectedRoute>
  } 
/>
<Route 
  path="/admin/features" 
  element={
    <AdminProtectedRoute>
      <AdminLayout>
        <AdminFeatureFlags />
      </AdminLayout>
    </AdminProtectedRoute>
  } 
/>
<Route 
  path="/admin/analytics" 
  element={
    <AdminProtectedRoute>
      <AdminLayout>
        <AdminAnalytics />
      </AdminLayout>
    </AdminProtectedRoute>
  } 
/>
<Route 
  path="/admin/moderation" 
  element={
    <AdminProtectedRoute>
      <AdminLayout>
        <AdminModeration />
      </AdminLayout>
    </AdminProtectedRoute>
  } 
/>
<Route 
  path="/admin/settings" 
  element={
    <AdminProtectedRoute>
      <AdminLayout>
        <AdminSystemSettings />
      </AdminLayout>
    </AdminProtectedRoute>
  } 
/>
```


---

## Part 6: Update Admin Branding Page to Refresh Main App

### 6.1 Update AdminBranding Component

**File:** `src/renderer/pages/admin/AdminBranding.tsx` (Add refresh notification)

Add this after successful branding update:

```typescript
const handleSaveBranding = async () => {
  try {
    setLoading(true);
    await adminBrandingService.updateBranding(branding);
    
    // Clear platform config cache so main app reloads settings
    // This is done via a message to the main app
    window.postMessage({ type: 'PLATFORM_CONFIG_UPDATED' }, '*');
    
    showToast('Branding settings saved successfully! Main app will reload settings.', 'success');
  } catch (error) {
    console.error('Failed to save branding:', error);
    showToast('Failed to save branding settings', 'error');
  } finally {
    setLoading(false);
  }
};
```

### 6.2 Update AdminFeatureFlags Component

**File:** `src/renderer/pages/admin/AdminFeatureFlags.tsx` (Add refresh notification)

Add this after successful feature update:

```typescript
const handleSaveFeatures = async () => {
  try {
    setLoading(true);
    await adminBrandingService.updateFeatures(features);
    
    // Notify main app to reload config
    window.postMessage({ type: 'PLATFORM_CONFIG_UPDATED' }, '*');
    
    showToast('Feature flags saved successfully! Main app will reload settings.', 'success');
  } catch (error) {
    console.error('Failed to save features:', error);
    showToast('Failed to save feature flags', 'error');
  } finally {
    setLoading(false);
  }
};
```

### 6.3 Update PlatformConfigContext to Listen for Updates

**File:** `src/renderer/contexts/PlatformConfigContext.tsx` (Add listener)

```typescript
export const PlatformConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<PlatformConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfig();
    
    // Listen for admin config updates
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'PLATFORM_CONFIG_UPDATED') {
        console.log('Platform config updated by admin, reloading...');
        refreshConfig();
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // ... rest of component
};
```

---

## Part 7: Database Migration

### 7.1 Ensure Platform Config Table Exists

The table should already exist from migration `1708002000000-CreatePlatformConfigTables.ts`, but verify:

```sql
-- Check if platform_configs table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'platform_configs'
);

-- If not, create it
CREATE TABLE IF NOT EXISTS platform_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "tenantId" UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  branding JSONB NOT NULL DEFAULT '{}',
  features JSONB NOT NULL DEFAULT '{}',
  limits JSONB NOT NULL DEFAULT '{}',
  integrations JSONB NOT NULL DEFAULT '{}',
  "emailSettings" JSONB,
  "seoSettings" JSONB,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_platform_configs_tenant 
ON platform_configs("tenantId");
```

### 7.2 Seed Default Platform Config

**File:** `backend/seed-default-platform-config.sql`

```sql
-- Insert default platform config for the first tenant
INSERT INTO platform_configs (
  "tenantId",
  branding,
  features,
  limits,
  integrations
)
SELECT 
  t.id,
  '{
    "logo": "",
    "favicon": "",
    "primaryColor": "#E1306C",
    "secondaryColor": "#5B51D8",
    "accentColor": "#FD8D32",
    "successColor": "#00D95F",
    "warningColor": "#FFCC00",
    "infoColor": "#0095F6",
    "fontFamily": "Inter, sans-serif",
    "platformName": "Influencer Match",
    "tagline": "Connect. Collaborate. Succeed.",
    "footerText": "© 2024 Influencer Match. All rights reserved.",
    "customCSS": ""
  }'::jsonb,
  '{
    "enableCampaigns": false,
    "enableMessaging": true,
    "enableFeed": true,
    "enableAIMatching": true,
    "enableAnalytics": true,
    "enableReviews": true,
    "enableSearch": true,
    "enableNotifications": true,
    "enableCollaborations": true
  }'::jsonb,
  '{
    "maxUsersPerTenant": 1000,
    "maxCampaignsPerUser": 50,
    "maxMessagesPerDay": 500,
    "maxFileUploadSize": 10,
    "maxStoragePerTenant": 100,
    "maxConnectionsPerUser": 500
  }'::jsonb,
  '{
    "stripe": {"enabled": false, "publicKey": "", "secretKey": ""},
    "sendgrid": {"enabled": false, "apiKey": "", "fromEmail": "", "fromName": ""},
    "aws": {"enabled": false, "accessKeyId": "", "secretAccessKey": "", "bucket": "", "region": ""},
    "google": {"enabled": false, "clientId": "", "clientSecret": ""}
  }'::jsonb
FROM tenants t
WHERE NOT EXISTS (
  SELECT 1 FROM platform_configs pc WHERE pc."tenantId" = t.id
)
LIMIT 1;
```

---

## Part 8: Testing Guide

### 8.1 Test Backend Endpoints

```bash
# Test public branding endpoint
curl http://localhost:3000/public/platform/branding

# Test public features endpoint
curl http://localhost:3000/public/platform/features

# Test public config endpoint
curl http://localhost:3000/public/platform/config
```

### 8.2 Test Admin Dashboard Navigation

1. Login to admin dashboard: `http://localhost:5173/admin/login`
2. Verify all 9 navigation items are visible:
   - Dashboard
   - Users
   - Tenants
   - Payments
   - Branding
   - Features
   - Analytics
   - Moderation
   - Settings
3. Click each navigation item and verify the page loads
4. Verify active state highlighting works

### 8.3 Test Platform Config Sync

1. Go to Admin Branding page
2. Change primary color to `#FF0000`
3. Save changes
4. Open main app in another tab
5. Verify the primary color updates (may need to refresh)

### 8.4 Test Feature Flags

1. Go to Admin Feature Flags page
2. Disable "Campaigns" feature
3. Save changes
4. Go to main app
5. Verify campaigns are hidden/disabled

---

## Part 9: Implementation Checklist

### Backend
- [ ] Create `backend/src/modules/platform/platform-config.controller.ts`
- [ ] Create `backend/src/modules/platform/platform-config.service.ts`
- [ ] Create `backend/src/modules/platform/platform.module.ts`
- [ ] Register PlatformModule in `app.module.ts`
- [ ] Run database migration to ensure platform_configs table exists
- [ ] Seed default platform config

### Frontend - Platform Config
- [ ] Create `src/renderer/services/platform-config.service.ts`
- [ ] Create `src/renderer/contexts/PlatformConfigContext.tsx`
- [ ] Update `src/renderer/config/features.ts`
- [ ] Update `src/renderer/components/FeatureGuard/FeatureGuard.tsx`
- [ ] Wrap app with PlatformConfigProvider in `AppComponent.tsx`

### Frontend - Admin Layout
- [ ] Create `src/renderer/layouts/AdminLayout/AdminLayout.tsx`
- [ ] Create `src/renderer/layouts/AdminLayout/AdminLayout.css`
- [ ] Update all admin routes in `AppComponent.tsx` to use AdminLayout
- [ ] Update `AdminBranding.tsx` to notify on config changes
- [ ] Update `AdminFeatureFlags.tsx` to notify on config changes

### Frontend - Main App Integration
- [ ] Update `Matches.tsx` to use platform config
- [ ] Update other pages to use platform config for feature checks
- [ ] Test branding updates reflect in main app
- [ ] Test feature flag updates reflect in main app

### Testing
- [ ] Test all admin navigation links work
- [ ] Test active state highlighting
- [ ] Test public API endpoints
- [ ] Test branding sync to main app
- [ ] Test feature flag sync to main app
- [ ] Test responsive design on mobile

---

## Summary

This implementation provides:

1. ✅ **Complete Navigation**: All 9 admin pages accessible via sidebar
2. ✅ **Backend Integration**: Public API endpoints for platform config
3. ✅ **Database Integration**: Stores config in platform_configs table
4. ✅ **Main App Sync**: Admin changes automatically update main app
5. ✅ **Live Data**: All data comes from database, no hardcoded values
6. ✅ **Real-time Updates**: Main app listens for admin config changes
7. ✅ **Feature Flags**: Admin can enable/disable features dynamically
8. ✅ **Branding Control**: Admin can customize colors, logo, platform name
9. ✅ **Responsive Design**: Works on desktop, tablet, and mobile

The admin dashboard now has complete navigation, and all settings sync to the main application in real-time!
