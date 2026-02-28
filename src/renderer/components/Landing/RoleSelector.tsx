/**
 * RoleSelector Component
 * Allows users to select their role (Influencer or Company) for personalized experience
 * Phase 3.2: Personalization
 */

import React from 'react';
import { FaUserAlt, FaBuilding } from 'react-icons/fa';
import { useRole } from '../../contexts/RoleContext';
import './RoleSelector.css';

interface RoleSelectorProps {
  onRoleSelect?: (role: 'INFLUENCER' | 'COMPANY') => void;
  showDismiss?: boolean;
  onDismiss?: () => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  onRoleSelect,
  showDismiss = false,
  onDismiss
}) => {
  const { selectedRole, setRole } = useRole();

  const handleRoleSelect = (role: 'INFLUENCER' | 'COMPANY') => {
    setRole(role);
    onRoleSelect?.(role);
  };

  return (
    <div className="role-selector">
      <div className="role-selector-container">
        <div className="role-selector-header">
          <h2>I am a...</h2>
          <p>Choose your role to see personalized content</p>
        </div>

        <div className="role-selector-cards">
          <button
            className={`role-card ${selectedRole === 'INFLUENCER' ? 'selected' : ''}`}
            onClick={() => handleRoleSelect('INFLUENCER')}
            aria-pressed={selectedRole === 'INFLUENCER'}
            aria-label="Select Influencer role"
          >
            <div className="role-card-icon">
              <FaUserAlt />
            </div>
            <h3>Influencer</h3>
            <p>Find brand partnerships that match your niche and values</p>
            <div className="role-card-check">
              {selectedRole === 'INFLUENCER' && (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 6L9 17L4 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
          </button>

          <button
            className={`role-card ${selectedRole === 'COMPANY' ? 'selected' : ''}`}
            onClick={() => handleRoleSelect('COMPANY')}
            aria-pressed={selectedRole === 'COMPANY'}
            aria-label="Select Company role"
          >
            <div className="role-card-icon">
              <FaBuilding />
            </div>
            <h3>Company</h3>
            <p>Discover authentic influencers for your brand campaigns</p>
            <div className="role-card-check">
              {selectedRole === 'COMPANY' && (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 6L9 17L4 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
          </button>
        </div>

        {showDismiss && selectedRole && (
          <button
            className="role-selector-dismiss"
            onClick={onDismiss}
            aria-label="Dismiss role selector"
          >
            Continue with {selectedRole === 'INFLUENCER' ? 'Influencer' : 'Company'} view
          </button>
        )}
      </div>
    </div>
  );
};
