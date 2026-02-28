import React, { useState } from 'react';
import './ProfileTabs.css';

export interface ProfileTab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

interface ProfileTabsProps {
  tabs: ProfileTab[];
  defaultTab?: string;
}

export const ProfileTabs: React.FC<ProfileTabsProps> = ({ tabs, defaultTab }) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className="profile-tabs">
      <div className="profile-tabs-header">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`profile-tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon && <span className="profile-tab-icon">{tab.icon}</span>}
            <span className="profile-tab-label">{tab.label}</span>
          </button>
        ))}
      </div>
      <div className="profile-tabs-content">
        {activeTabContent}
      </div>
    </div>
  );
};
