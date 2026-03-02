import { useState, useRef } from 'react';
import { mockDataService } from '../../services/mock-data.service';
import { useClickOutside } from '../../hooks/useClickOutside';
import { HiUser, HiOfficeBuilding, HiChevronDown, HiChevronUp } from 'react-icons/hi';
import './UserSwitcher.css';

interface UserSwitcherProps {
  onUserChange: () => void;
}

export const UserSwitcher: React.FC<UserSwitcherProps> = ({ onUserChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const currentUser = mockDataService.getCurrentUser();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const influencers = mockDataService.getAllInfluencers();
  const companies = mockDataService.getAllCompanies();

  useClickOutside(dropdownRef, () => setIsOpen(false), isOpen);

  const handleUserSwitch = (userId: string, type: 'influencer' | 'company') => {
    mockDataService.setCurrentUser(userId, type);
    setIsOpen(false);
    onUserChange();
  };

  return (
    <div className="user-switcher" ref={dropdownRef}>
      <button 
        className="user-switcher-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Switch user"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="user-info">
          {currentUser.type === 'influencer' ? (
            <HiUser className="user-type-icon" aria-hidden="true" />
          ) : (
            <HiOfficeBuilding className="user-type-icon" aria-hidden="true" />
          )}
          <span className="user-name">{currentUser.profile.name}</span>
        </div>
        {isOpen ? (
          <HiChevronUp className="dropdown-arrow" aria-hidden="true" />
        ) : (
          <HiChevronDown className="dropdown-arrow" aria-hidden="true" />
        )}
      </button>

      {isOpen && (
        <div className="user-switcher-dropdown" role="menu">
          <div className="dropdown-section">
            <div className="dropdown-header">Influencers</div>
            {influencers.map(influencer => (
              <button
                key={influencer.id}
                className={`dropdown-item ${currentUser.profile.id === influencer.id ? 'active' : ''}`}
                onClick={() => handleUserSwitch(influencer.id, 'influencer')}
                role="menuitem"
              >
                <HiUser className="item-icon" aria-hidden="true" />
                <div className="item-info">
                  <div className="item-name">{influencer.name}</div>
                  <div className="item-detail">{influencer.niche} • {influencer.location}</div>
                </div>
              </button>
            ))}
          </div>

          <div className="dropdown-divider" role="separator"></div>

          <div className="dropdown-section">
            <div className="dropdown-header">Companies</div>
            {companies.map(company => (
              <button
                key={company.id}
                className={`dropdown-item ${currentUser.profile.id === company.id ? 'active' : ''}`}
                onClick={() => handleUserSwitch(company.id, 'company')}
                role="menuitem"
              >
                <HiOfficeBuilding className="item-icon" aria-hidden="true" />
                <div className="item-info">
                  <div className="item-name">{company.name}</div>
                  <div className="item-detail">{company.industry} • {company.location}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
