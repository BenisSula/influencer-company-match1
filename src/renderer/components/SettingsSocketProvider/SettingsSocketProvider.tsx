import React from 'react';
import { useSettingsSocket } from '../../hooks/useSettingsSocket';
import { MaintenanceBanner } from '../MaintenanceBanner/MaintenanceBanner';

interface SettingsSocketProviderProps {
  children: React.ReactNode;
}

export const SettingsSocketProvider: React.FC<SettingsSocketProviderProps> = ({ children }) => {
  // Initialize the settings socket connection (handles real-time updates)
  useSettingsSocket();

  return (
    <>
      <MaintenanceBanner />
      {children}
    </>
  );
};
