import { NavLink, useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';
import { HiHome, HiUsers, HiUserCircle, HiChatAlt2, HiCog, HiBell, HiMenu, HiX, HiNewspaper, HiChevronLeft, HiChevronRight, HiClipboardList, HiChartBar } from 'react-icons/hi';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useSidebarState } from '../../hooks/useSidebarState';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useProfileUpdates } from '../../hooks/useProfileUpdates';
import { UnreadBadge } from '../../components/UnreadBadge/UnreadBadge';
import { NotificationDropdown } from '../../components/NotificationDropdown/NotificationDropdown';
import { MessageToastContainer } from '../../components/MessageToastNotification/MessageToastContainer';
import { GlobalSearch } from '../../components/GlobalSearch';
import { Avatar } from '../../components/Avatar';
import { SuggestedMatchesList } from '../../components/SuggestedMatchesList/SuggestedMatchesList';
import { MobileNav } from '../../components/MobileNav/MobileNav';
import { ChatbotWidget } from '../../components/ChatbotWidget/ChatbotWidget';
import { isFeatureEnabled } from '../../config/features';
import './AppLayout.css';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // Real-time profile updates
  useProfileUpdates();
  
  const { 
    notifications, 
    removeNotification, 
    clearAllNotifications,
    generalNotifications,
    generalUnreadCount,
    messageToasts,
    removeMessageToast,
  } = useNotifications();
  
  // Check if mobile
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Sidebar collapse states using custom hook (DRY principle)
  const leftSidebar = useSidebarState({ storageKey: 'left-sidebar-collapsed', defaultCollapsed: false });
  const rightSidebar = useSidebarState({ storageKey: 'right-sidebar-collapsed', defaultCollapsed: false });
  
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useClickOutside(userMenuRef, () => setShowUserMenu(false), showUserMenu);
  
  // Close notifications when clicking outside
  useClickOutside(notificationRef, () => setShowNotifications(false), showNotifications);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowUserMenu(false);
  };

  const handleNotificationClick = (notification: any) => {
    navigate('/messages', {
      state: {
        openConversationId: notification.conversationId,
      },
    });
    removeNotification(notification.id);
    setShowNotifications(false);
  };

  const handleClearAllNotifications = () => {
    clearAllNotifications();
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const userName = user?.profile?.name || user?.email || 'User';

  return (
    <div className="app-layout">
      {/* Skip to content link for accessibility */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      {/* Top Header - Facebook Style */}
      <header className="app-header">
        <div className="header-left">
          <button
            className="mobile-menu-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? <HiX size={24} /> : <HiMenu size={24} />}
          </button>
          <h1 className="app-logo">InfluMatch</h1>
          
          {/* Enhanced Global Search */}
          <div className="header-search-wrapper">
            <GlobalSearch placeholder="Search users, posts..." />
          </div>
        </div>
        
        <div className="header-center">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `header-nav-btn ${isActive ? 'active' : ''}`}
            aria-label="Dashboard"
          >
            <HiHome size={24} aria-hidden="true" />
          </NavLink>
          <NavLink
            to="/feed"
            className={({ isActive }) => `header-nav-btn ${isActive ? 'active' : ''}`}
            aria-label="Feed"
          >
            <HiNewspaper size={24} aria-hidden="true" />
          </NavLink>
          <NavLink
            to="/matches"
            className={({ isActive }) => `header-nav-btn ${isActive ? 'active' : ''}`}
            aria-label="Matches"
          >
            <HiUsers size={24} aria-hidden="true" />
          </NavLink>
          <NavLink
            to="/messages"
            className={({ isActive }) => `header-nav-btn ${isActive ? 'active' : ''}`}
            aria-label="Messages"
          >
            <HiChatAlt2 size={24} aria-hidden="true" />
            <UnreadBadge />
          </NavLink>
        </div>
        
        <div className="header-right">
          <div className="notification-bell-wrapper" ref={notificationRef}>
            <button 
              className="header-icon-btn" 
              aria-label="Notifications"
              onClick={() => setShowNotifications(!showNotifications)}
              aria-expanded={showNotifications}
            >
              <HiBell size={20} aria-hidden="true" />
              {generalUnreadCount > 0 && (
                <span className="notification-badge" aria-label={`${generalUnreadCount} notifications`}>
                  {generalUnreadCount > 9 ? '9+' : generalUnreadCount}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <NotificationDropdown
                notifications={notifications}
                generalNotifications={generalNotifications}
                onNotificationClick={handleNotificationClick}
                onClearAll={handleClearAllNotifications}
                onClose={() => setShowNotifications(false)}
              />
            )}
          </div>
          
          <div className="user-profile-btn" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              aria-label="User menu"
              aria-expanded={showUserMenu}
              aria-haspopup="true"
            >
              <Avatar
                src={user?.avatarUrl}
                name={userName}
                email={user?.email}
                size="sm"
                className="user-avatar-small"
              />
            </button>
            
            {showUserMenu && (
              <div className="user-menu-dropdown" role="menu">
                <NavLink
                  to="/profile"
                  className="user-menu-item"
                  onClick={() => setShowUserMenu(false)}
                  role="menuitem"
                >
                  <HiUserCircle size={20} aria-hidden="true" />
                  <span>My Profile</span>
                </NavLink>
                <NavLink
                  to="/settings"
                  className="user-menu-item"
                  onClick={() => setShowUserMenu(false)}
                  role="menuitem"
                >
                  <HiCog size={20} aria-hidden="true" />
                  <span>Settings</span>
                </NavLink>
                <div className="user-menu-divider" />
                <button
                  className="user-menu-item logout-btn"
                  onClick={handleLogout}
                  role="menuitem"
                >
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <div className={`app-body ${leftSidebar.isCollapsed ? 'left-collapsed' : ''} ${rightSidebar.isCollapsed ? 'right-collapsed' : ''}`}>
        {/* Left Sidebar - Facebook Style */}
        <aside className={`left-sidebar ${sidebarOpen ? 'open' : ''} ${leftSidebar.isCollapsed ? 'collapsed' : ''}`} aria-label="Main navigation">
          {/* Collapse button for desktop */}
          <button
            className="sidebar-collapse-btn left-collapse-btn"
            onClick={leftSidebar.toggle}
            aria-label={leftSidebar.isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={leftSidebar.isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {leftSidebar.isCollapsed ? <HiChevronRight size={20} /> : <HiChevronLeft size={20} />}
          </button>
          
          <nav className="sidebar-nav">
            <NavLink
              to="/dashboard"
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
              onClick={closeSidebar}
            >
              <HiHome className="sidebar-icon" aria-hidden="true" />
              <span>Dashboard</span>
            </NavLink>
            <NavLink
              to="/feed"
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
              onClick={closeSidebar}
            >
              <HiNewspaper className="sidebar-icon" aria-hidden="true" />
              <span>Feed</span>
            </NavLink>
            <NavLink
              to="/matches"
              end
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
              onClick={closeSidebar}
            >
              <HiUsers className="sidebar-icon" aria-hidden="true" />
              <span>Matches</span>
            </NavLink>
            {isFeatureEnabled('MATCH_HISTORY_ENABLED') && (
              <NavLink
                to="/matches/history"
                className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
                onClick={closeSidebar}
              >
                <HiChartBar className="sidebar-icon" aria-hidden="true" />
                <span>Match Analytics</span>
              </NavLink>
            )}
            {isFeatureEnabled('CAMPAIGNS_ENABLED') && (
              <NavLink
                to="/campaigns"
                className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
                onClick={closeSidebar}
              >
                <HiClipboardList className="sidebar-icon" aria-hidden="true" />
                <span>Campaigns</span>
              </NavLink>
            )}
            <NavLink
              to="/profile"
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
              onClick={closeSidebar}
            >
              <HiUserCircle className="sidebar-icon" aria-hidden="true" />
              <span>Profile</span>
            </NavLink>
            <NavLink
              to="/messages"
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
              onClick={closeSidebar}
            >
              <HiChatAlt2 className="sidebar-icon" aria-hidden="true" />
              <span>Messages</span>
            </NavLink>
            <NavLink
              to="/settings"
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
              onClick={closeSidebar}
            >
              <HiCog className="sidebar-icon" aria-hidden="true" />
              <span>Settings</span>
            </NavLink>
          </nav>
        </aside>

        {/* Main Content */}
        <main id="main-content" className="main-feed" role="main">
          {children}
        </main>

        {/* Right Sidebar */}
        <aside className={`right-sidebar ${rightSidebar.isCollapsed ? 'collapsed' : ''}`} aria-label="Suggested matches">
          {/* Collapse button for desktop */}
          <button
            className="sidebar-collapse-btn right-collapse-btn"
            onClick={rightSidebar.toggle}
            aria-label={rightSidebar.isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={rightSidebar.isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {rightSidebar.isCollapsed ? <HiChevronLeft size={20} /> : <HiChevronRight size={20} />}
          </button>
          
          <div className="sidebar-content">
            <div className="sidebar-section">
              <SuggestedMatchesList limit={8} />
            </div>
          </div>
        </aside>
      </div>

      {/* Message Toast Notifications - Positioned near Messages icon */}
      <MessageToastContainer
        toasts={messageToasts}
        onToastClose={removeMessageToast}
      />

      {/* Mobile Bottom Navigation */}
      {isMobile && <MobileNav />}

      {/* AI Chatbot Widget - Floating button */}
      <ChatbotWidget />
    </div>
  );
};
