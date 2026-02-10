import { NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { HiHome, HiUsers, HiUserCircle, HiChatAlt2, HiCog, HiBell, HiSearch, HiMenu, HiX } from 'react-icons/hi';
import { useAuth } from '../../contexts/AuthContext';
import { matchingService, Match } from '../../services/matching.service';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useDebounce } from '../../hooks/useDebounce';
import './AppLayout.css';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Match[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [suggestedMatches, setSuggestedMatches] = useState<Match[]>([]);
  
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Close user menu when clicking outside
  useClickOutside(userMenuRef, () => setShowUserMenu(false), showUserMenu);
  
  // Close search results when clicking outside
  useClickOutside(searchRef, () => setShowSearchResults(false), showSearchResults);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowUserMenu(false);
  };

  // Load suggested matches
  useEffect(() => {
    matchingService.getMatches().then(response => {
      setSuggestedMatches(response.data.slice(0, 3));
    }).catch(err => {
      console.error('Failed to load suggested matches:', err);
    });
  }, []);

  // Handle search
  useEffect(() => {
    if (debouncedSearch.trim()) {
      matchingService.getMatches().then(response => {
        const filtered = response.data.filter(match => {
          const searchLower = debouncedSearch.toLowerCase();
          return (
            match.profile.name.toLowerCase().includes(searchLower) ||
            (match.profile.niche && match.profile.niche.toLowerCase().includes(searchLower)) ||
            (match.profile.industry && match.profile.industry.toLowerCase().includes(searchLower)) ||
            (match.profile.location && match.profile.location.toLowerCase().includes(searchLower))
          );
        });
        setSearchResults(filtered.slice(0, 5));
        setShowSearchResults(true);
      }).catch(err => {
        console.error('Search failed:', err);
      });
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [debouncedSearch]);

  const handleSearchSelect = (matchId: string) => {
    navigate(`/profile/${matchId}`);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const userName = user?.profile?.name || user?.email || 'User';
  const userInitial = userName.charAt(0).toUpperCase();

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
          <div className="search-bar" ref={searchRef}>
            <HiSearch className="search-icon" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search matches..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search matches"
              aria-autocomplete="list"
              aria-controls="search-results"
              aria-expanded={showSearchResults}
            />
            {searchQuery && (
              <button
                className="search-clear"
                onClick={() => {
                  setSearchQuery('');
                  setShowSearchResults(false);
                }}
                aria-label="Clear search"
              >
                <HiX size={16} />
              </button>
            )}
            
            {showSearchResults && (
              <div id="search-results" className="search-results" role="listbox">
                {searchResults.length > 0 ? (
                  searchResults.map((match) => (
                    <button
                      key={match.id}
                      className="search-result-item"
                      onClick={() => handleSearchSelect(match.profile.id)}
                      role="option"
                    >
                      <div className="search-result-avatar">
                        {match.profile.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="search-result-info">
                        <div className="search-result-name">{match.profile.name}</div>
                        <div className="search-result-meta">
                          {match.profile.type === 'influencer' ? match.profile.niche : match.profile.industry}
                        </div>
                      </div>
                      <div className="search-result-score">{match.score}</div>
                    </button>
                  ))
                ) : (
                  <div className="search-no-results">No matches found</div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="header-center">
          <NavLink
            to="/"
            className={({ isActive }) => `header-nav-btn ${isActive ? 'active' : ''}`}
            aria-label="Dashboard"
          >
            <HiHome size={24} aria-hidden="true" />
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
          </NavLink>
        </div>
        
        <div className="header-right">
          <button className="header-icon-btn" aria-label="Notifications">
            <HiBell size={20} aria-hidden="true" />
            <span className="notification-badge" aria-label="0 notifications">0</span>
          </button>
          <div className="user-profile-btn" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              aria-label="User menu"
              aria-expanded={showUserMenu}
              aria-haspopup="true"
            >
              <div className="user-avatar-small">
                {userInitial}
              </div>
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

      <div className="app-body">
        {/* Left Sidebar - Facebook Style */}
        <aside className={`left-sidebar ${sidebarOpen ? 'open' : ''}`} aria-label="Main navigation">
          <nav className="sidebar-nav">
            <NavLink
              to="/"
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
              onClick={closeSidebar}
            >
              <HiHome className="sidebar-icon" aria-hidden="true" />
              <span>Dashboard</span>
            </NavLink>
            <NavLink
              to="/matches"
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
              onClick={closeSidebar}
            >
              <HiUsers className="sidebar-icon" aria-hidden="true" />
              <span>Matches</span>
            </NavLink>
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
        <aside className="right-sidebar" aria-label="Suggested matches">
          <div className="sidebar-section">
            <h3 className="sidebar-title">Suggested Matches</h3>
            <div className="suggested-list">
              {suggestedMatches.length > 0 ? (
                suggestedMatches.map((match) => (
                  <NavLink 
                    key={match.id} 
                    to={`/profile/${match.profile.id}`}
                    className="suggested-item"
                  >
                    <div className="suggested-avatar" aria-hidden="true">
                      {match.profile.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="suggested-info">
                      <div className="suggested-name">{match.profile.name}</div>
                      <div className="suggested-meta">
                        {match.profile.type === 'influencer' ? match.profile.niche : match.profile.industry}
                      </div>
                    </div>
                  </NavLink>
                ))
              ) : (
                <div style={{ padding: '1rem', textAlign: 'center', color: '#65676B', fontSize: '0.875rem' }}>
                  No suggestions yet
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
