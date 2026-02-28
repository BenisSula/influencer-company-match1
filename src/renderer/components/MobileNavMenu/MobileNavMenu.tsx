import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiUsers, 
  FiMessageSquare, 
  FiUser, 
  FiSettings,
  FiLogOut 
} from 'react-icons/fi';
import './MobileNavMenu.css';

interface MobileNavMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export const MobileNavMenu: React.FC<MobileNavMenuProps> = ({ 
  isOpen, 
  onClose,
  onLogout 
}) => {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/matches', icon: FiUsers, label: 'Matches' },
    { path: '/messages', icon: FiMessageSquare, label: 'Messages' },
    { path: '/profile', icon: FiUser, label: 'Profile' },
    { path: '/settings', icon: FiSettings, label: 'Settings' },
  ];

  const handleNavClick = () => {
    onClose();
  };

  const handleLogout = () => {
    onLogout();
    onClose();
  };

  return (
    <div className={`mobile-nav-menu ${isOpen ? 'open' : ''}`}>
      <nav className="mobile-nav-content">
        <ul className="mobile-nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path} className="mobile-nav-item">
                <Link
                  to={item.path}
                  className={`mobile-nav-link ${isActive ? 'active' : ''}`}
                  onClick={handleNavClick}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mobile-nav-footer">
          <button 
            className="mobile-nav-logout"
            onClick={handleLogout}
          >
            <FiLogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
