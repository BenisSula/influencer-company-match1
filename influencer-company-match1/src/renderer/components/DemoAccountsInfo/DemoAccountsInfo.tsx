import { useState } from 'react';
import { Users, Building2, ChevronDown, ChevronUp, Info } from 'lucide-react';
import './DemoAccountsInfo.css';

interface DemoAccount {
  email: string;
  name: string;
  role: 'INFLUENCER' | 'COMPANY';
  category: string;
  followers?: string;
  budget?: string;
}

const demoAccounts: DemoAccount[] = [
  // Influencers
  { email: 'mike.tech@example.com', name: 'Mike Chen', role: 'INFLUENCER', category: 'Technology', followers: '200K' },
  { email: 'sarah.fashion@example.com', name: 'Sarah Johnson', role: 'INFLUENCER', category: 'Fashion & Lifestyle', followers: '150K' },
  { email: 'emma.fitness@example.com', name: 'Emma Rodriguez', role: 'INFLUENCER', category: 'Fitness & Wellness', followers: '180K' },
  { email: 'lisa.foodtravel@example.com', name: 'Lisa Wang', role: 'INFLUENCER', category: 'Food & Travel', followers: '175K' },
  { email: 'alex.gaming@example.com', name: 'Alex Martinez', role: 'INFLUENCER', category: 'Gaming & Esports', followers: '250K' },
  // Companies
  { email: 'contact@techstartup.com', name: 'TechStartup Inc', role: 'COMPANY', category: 'Technology', budget: '$50K' },
  { email: 'marketing@fashionbrand.com', name: 'Fashion Brand Co', role: 'COMPANY', category: 'Fashion', budget: '$45K' },
  { email: 'partnerships@fitnessapp.com', name: 'FitnessApp', role: 'COMPANY', category: 'Health & Fitness', budget: '$40K' },
  { email: 'sales@gaminggear.com', name: 'GamingGear Pro', role: 'COMPANY', category: 'Gaming & Electronics', budget: '$55K' },
  { email: 'partnerships@travelworld.com', name: 'TravelWorld Agency', role: 'COMPANY', category: 'Travel & Tourism', budget: '$60K' },
];

interface DemoAccountsInfoProps {
  onSelectAccount?: (email: string) => void;
  compact?: boolean;
}

export const DemoAccountsInfo = ({ onSelectAccount, compact = false }: DemoAccountsInfoProps) => {
  const [expanded, setExpanded] = useState(!compact);
  const [selectedRole, setSelectedRole] = useState<'ALL' | 'INFLUENCER' | 'COMPANY'>('ALL');

  const filteredAccounts = selectedRole === 'ALL' 
    ? demoAccounts 
    : demoAccounts.filter(acc => acc.role === selectedRole);

  const influencerCount = demoAccounts.filter(acc => acc.role === 'INFLUENCER').length;
  const companyCount = demoAccounts.filter(acc => acc.role === 'COMPANY').length;

  if (compact && !expanded) {
    return (
      <div className="demo-accounts-compact">
        <button 
          className="demo-accounts-expand-button"
          onClick={() => setExpanded(true)}
        >
          <Info size={16} />
          <span>View All {demoAccounts.length} Demo Accounts</span>
          <ChevronDown size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="demo-accounts-info">
      <div className="demo-accounts-header">
        <div className="demo-accounts-title-row">
          <h3 className="demo-accounts-heading">
            <Users size={20} />
            Demo Accounts
          </h3>
          {compact && (
            <button 
              className="demo-accounts-collapse-button"
              onClick={() => setExpanded(false)}
            >
              <ChevronUp size={16} />
            </button>
          )}
        </div>
        <p className="demo-accounts-description">
          Try any of these {demoAccounts.length} pre-configured accounts. Password: <strong>password123</strong>
        </p>
      </div>

      <div className="demo-accounts-filters">
        <button
          className={`filter-button ${selectedRole === 'ALL' ? 'active' : ''}`}
          onClick={() => setSelectedRole('ALL')}
        >
          All ({demoAccounts.length})
        </button>
        <button
          className={`filter-button ${selectedRole === 'INFLUENCER' ? 'active' : ''}`}
          onClick={() => setSelectedRole('INFLUENCER')}
        >
          <Users size={14} />
          Influencers ({influencerCount})
        </button>
        <button
          className={`filter-button ${selectedRole === 'COMPANY' ? 'active' : ''}`}
          onClick={() => setSelectedRole('COMPANY')}
        >
          <Building2 size={14} />
          Companies ({companyCount})
        </button>
      </div>

      <div className="demo-accounts-grid">
        {filteredAccounts.map((account) => (
          <div 
            key={account.email} 
            className={`demo-account-card ${account.role.toLowerCase()}`}
            onClick={() => onSelectAccount?.(account.email)}
            role={onSelectAccount ? 'button' : undefined}
            tabIndex={onSelectAccount ? 0 : undefined}
          >
            <div className="demo-account-card-header">
              <div className="demo-account-icon">
                {account.role === 'INFLUENCER' ? (
                  <Users size={18} />
                ) : (
                  <Building2 size={18} />
                )}
              </div>
              <span className="demo-account-role-badge">
                {account.role === 'INFLUENCER' ? 'Influencer' : 'Company'}
              </span>
            </div>
            
            <div className="demo-account-card-body">
              <h4 className="demo-account-name">{account.name}</h4>
              <p className="demo-account-category">{account.category}</p>
              <p className="demo-account-email">{account.email}</p>
              
              {account.followers && (
                <div className="demo-account-stat">
                  <span className="stat-label">Followers:</span>
                  <span className="stat-value">{account.followers}</span>
                </div>
              )}
              
              {account.budget && (
                <div className="demo-account-stat">
                  <span className="stat-label">Budget:</span>
                  <span className="stat-value">{account.budget}</span>
                </div>
              )}
            </div>

            {onSelectAccount && (
              <div className="demo-account-card-footer">
                <span className="demo-account-login-hint">Click to login →</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="demo-accounts-footer">
        <p className="demo-accounts-note">
          <Info size={14} />
          All accounts use the same password: <code>password123</code>
        </p>
      </div>
    </div>
  );
};
