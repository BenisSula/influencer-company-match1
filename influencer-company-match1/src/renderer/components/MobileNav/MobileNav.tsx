import React from 'react';
import { NavLink } from 'react-router-dom';
import { HiHome } from 'react-icons/hi';
import { FaHandshake } from 'react-icons/fa';
import { MdDynamicFeed } from 'react-icons/md';
import { IoChatbubbles } from 'react-icons/io5';
import { FaUser } from 'react-icons/fa';
import { UnreadBadge } from '../UnreadBadge/UnreadBadge';
import './MobileNav.css';

export const MobileNav: React.FC = () => {

  const navItems = [
    { path: '/dashboard', icon: HiHome, label: 'Home' },
    { path: '/matches', icon: FaHandshake, label: 'Matches' },
    { path: '/feed', icon: MdDynamicFeed, label: 'Feed' },
    { path: '/messages', icon: IoChatbubbles, label: 'Messages' },
    { path: '/profile', icon: FaUser, label: 'Profile' },
  ];

  return (
    <nav className="mobile-nav">
      {navItems.map((item) => {
        const IconComponent = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `mobile-nav-item touch-target touch-feedback ${isActive ? 'active' : ''}`
            }
          >
            <span className="mobile-nav-icon">
              <IconComponent />
            </span>
            {item.path === '/messages' && <UnreadBadge />}
            <span className="mobile-nav-label">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
