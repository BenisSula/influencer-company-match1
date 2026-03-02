import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';

interface SettingChange {
  key: string;
  value: any;
  category: string;
  timestamp: string;
}

export const useSettingsSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = io(`${import.meta.env.VITE_API_URL}/settings`, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('🔗 Connected to settings socket');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('❌ Disconnected from settings socket');
    });

    socket.on('connect_error', (error) => {
      console.error('Settings socket connection error:', error);
    });

    // Handle single setting change
    socket.on('setting-changed', (data: SettingChange) => {
      console.log('⚙️ Setting changed:', data);
      handleSettingChange(data);
      setLastUpdate(data.timestamp);
    });

    // Handle bulk settings change
    socket.on('settings-changed', (data: { settings: SettingChange[], timestamp: string }) => {
      console.log('⚙️ Multiple settings changed:', data.settings.length);
      data.settings.forEach(handleSettingChange);
      setLastUpdate(data.timestamp);
    });

    // Handle branding changes
    socket.on('branding-changed', (data: { branding: any, timestamp: string }) => {
      console.log('🎨 Branding changed:', data);
      handleBrandingChange(data.branding);
      setLastUpdate(data.timestamp);
    });

    // Handle feature flag changes
    socket.on('feature-flag-changed', (data: { flagKey: string, enabled: boolean, timestamp: string }) => {
      console.log('🚩 Feature flag changed:', data);
      handleFeatureFlagChange(data.flagKey, data.enabled);
      setLastUpdate(data.timestamp);
    });

    // Handle maintenance mode
    socket.on('maintenance-mode-changed', (data: { enabled: boolean, message?: string, timestamp: string }) => {
      console.log('🚧 Maintenance mode changed:', data);
      handleMaintenanceModeChange(data.enabled, data.message);
      setLastUpdate(data.timestamp);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSettingChange = (data: SettingChange) => {
    // Update React Query cache
    queryClient.setQueryData(['settings'], (oldData: any) => {
      if (!oldData) return oldData;
      
      return oldData.map((setting: any) => 
        setting.key === data.key 
          ? { ...setting, value: data.value }
          : setting
      );
    });

    // Invalidate related queries
    queryClient.invalidateQueries({ queryKey: ['settings', data.category.toLowerCase()] });
  };

  const handleBrandingChange = (brandingData: any) => {
    // Apply branding changes immediately
    import('../utils/applyBranding').then(({ applyBranding }) => {
      applyBranding(brandingData);
    });

    // Update branding cache
    queryClient.setQueryData(['branding'], brandingData);
  };

  const handleFeatureFlagChange = (flagKey: string, enabled: boolean) => {
    // Update feature flags cache
    queryClient.setQueryData(['feature-flags'], (oldData: any) => {
      if (!oldData) return oldData;
      
      return {
        ...oldData,
        [flagKey]: enabled,
      };
    });

    // Dispatch custom event for FeatureGuard components
    const event = new CustomEvent('feature-flag-changed', {
      detail: { flagKey, enabled },
    });
    window.dispatchEvent(event);

    // Force re-render of FeatureGuard components
    queryClient.invalidateQueries({ queryKey: ['features'] });
  };

  const handleMaintenanceModeChange = (enabled: boolean, message?: string) => {
    // Show/hide maintenance banner
    const event = new CustomEvent('maintenance-mode-changed', {
      detail: { enabled, message },
    });
    window.dispatchEvent(event);
  };

  return {
    isConnected,
    lastUpdate,
    socket: socketRef.current,
  };
};
