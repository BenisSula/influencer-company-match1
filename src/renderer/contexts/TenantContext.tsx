import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { applyBranding, getCurrentTenantId, BrandingSettings } from '../utils/applyBranding';
import adminBrandingService from '../services/admin-branding.service';

interface TenantContextType {
  tenantId: string;
  branding: BrandingSettings | null;
  loading: boolean;
  refreshBranding: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tenantId] = useState<string>(getCurrentTenantId());
  const [branding, setBranding] = useState<BrandingSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshBranding = async () => {
    try {
      setLoading(true);
      const fetchedBranding = await adminBrandingService.getBranding();
      if (fetchedBranding) {
        setBranding(fetchedBranding);
        applyBranding(fetchedBranding);
      }
    } catch (error) {
      console.log('Failed to load branding, using defaults');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshBranding();
  }, [tenantId]);

  return (
    <TenantContext.Provider value={{ tenantId, branding, loading, refreshBranding }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within TenantProvider');
  }
  return context;
};
