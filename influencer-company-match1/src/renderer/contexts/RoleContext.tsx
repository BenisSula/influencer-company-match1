/**
 * RoleContext
 * Manages user role selection for personalized landing page experience
 * Phase 3.2: Personalization
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type UserRole = 'INFLUENCER' | 'COMPANY' | null;

interface RoleContextValue {
  selectedRole: UserRole;
  setRole: (role: 'INFLUENCER' | 'COMPANY') => void;
  clearRole: () => void;
  isRoleSelected: boolean;
}

const RoleContext = createContext<RoleContextValue | undefined>(undefined);

const ROLE_STORAGE_KEY = 'userRolePreference';

interface RoleProviderProps {
  children: ReactNode;
}

export const RoleProvider: React.FC<RoleProviderProps> = ({ children }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(() => {
    // Initialize from localStorage
    try {
      const stored = localStorage.getItem(ROLE_STORAGE_KEY);
      return stored as UserRole;
    } catch (error) {
      console.warn('Error reading role from localStorage:', error);
      return null;
    }
  });

  // Persist role to localStorage
  useEffect(() => {
    try {
      if (selectedRole) {
        localStorage.setItem(ROLE_STORAGE_KEY, selectedRole);
      } else {
        localStorage.removeItem(ROLE_STORAGE_KEY);
      }
    } catch (error) {
      console.warn('Error saving role to localStorage:', error);
    }
  }, [selectedRole]);

  const setRole = (role: 'INFLUENCER' | 'COMPANY') => {
    setSelectedRole(role);
  };

  const clearRole = () => {
    setSelectedRole(null);
    try {
      localStorage.removeItem(ROLE_STORAGE_KEY);
    } catch (error) {
      console.warn('Error clearing role from localStorage:', error);
    }
  };

  const value: RoleContextValue = {
    selectedRole,
    setRole,
    clearRole,
    isRoleSelected: selectedRole !== null
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
};

// Custom hook to use role context
export const useRole = (): RoleContextValue => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};
