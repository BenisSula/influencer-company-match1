import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiSearch, HiX } from 'react-icons/hi';
import { useDebounce } from '../../hooks/useDebounce';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useSearchHistory } from '../../hooks/useSearchHistory';
import { searchService, SearchResult } from '../../services/search.service';
import { isFeatureEnabled } from '../../config/features';
import { SearchDropdown } from './SearchDropdown';
import './GlobalSearch.css';

interface GlobalSearchProps {
  placeholder?: string;
  autoFocus?: boolean;
  onResultClick?: (result: SearchResult) => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  placeholder = 'Search users, posts...',
  autoFocus = false,
  onResultClick,
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [trending, setTrending] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const debouncedQuery = useDebounce(query, 300);
  const { history, addToHistory, removeFromHistory, clearHistory } = useSearchHistory();

  // Close dropdown when clicking outside
  useClickOutside(searchRef, () => setShowDropdown(false), showDropdown);

  // Load trending searches on mount
  useEffect(() => {
    searchService.getTrending(5).then(data => {
      setTrending(data.map(item => item.query));
    }).catch(err => {
      console.error('Failed to load trending searches:', err);
    });
  }, []);

  // Perform search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim()) {
      performSearch(debouncedQuery);
    } else {
      setResults([]);
      setLoading(false);
    }
  }, [debouncedQuery]);

  // Auto-focus on mount if requested
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setShowDropdown(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    try {
      const response = await searchService.searchAll(searchQuery, { limit: 10 });
      setResults(response.results);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setShowDropdown(true);
    setSelectedIndex(-1);
  };

  const handleInputFocus = () => {
    setShowDropdown(true);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const handleResultClick = (result: SearchResult) => {
    addToHistory(result);
    setShowDropdown(false);
    setQuery('');
    
    // Track click
    searchService.trackSearchClick(query, result.id);
    
    // Navigate based on type
    if (result.type === 'user') {
      navigate(`/profile/${result.id}`);
    } else if (result.type === 'post') {
      navigate(`/feed`); // Could scroll to specific post
    } else if (result.type === 'campaign') {
      // Only navigate to campaigns if feature is enabled
      if (isFeatureEnabled('CAMPAIGNS_ENABLED')) {
        navigate(`/campaigns/${result.id}`);
      } else {
        // Redirect to matches instead
        navigate('/matches');
      }
    }
    
    onResultClick?.(result);
  };

  const handleTrendingClick = (trendingQuery: string) => {
    setQuery(trendingQuery);
    inputRef.current?.focus();
  };

  const handleSeeAllResults = () => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setShowDropdown(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;

    const totalItems = results.length + history.length + trending.length;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < totalItems - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleResultClick(results[selectedIndex]);
        } else if (query.trim()) {
          handleSeeAllResults();
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowDropdown(false);
        inputRef.current?.blur();
        break;
    }
  };

  return (
    <div className="global-search" ref={searchRef}>
      <div className="search-input-wrapper">
        <HiSearch className="search-icon" />
        <input
          ref={inputRef}
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          aria-label="Search"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
        />
        {query && (
          <button
            className="search-clear"
            onClick={handleClear}
            aria-label="Clear search"
          >
            <HiX />
          </button>
        )}
      </div>

      {showDropdown && (
        <SearchDropdown
          query={query}
          results={results}
          history={history}
          trending={trending}
          loading={loading}
          selectedIndex={selectedIndex}
          onResultClick={handleResultClick}
          onTrendingClick={handleTrendingClick}
          onHistoryRemove={removeFromHistory}
          onHistoryClear={clearHistory}
          onSeeAllResults={handleSeeAllResults}
        />
      )}
    </div>
  );
};
