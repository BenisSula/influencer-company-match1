import { useState } from 'react';
import { HiFilter, HiX } from 'react-icons/hi';
import './FeedFilters.css';

export interface FeedFilterOptions {
  tab: 'all' | 'connections' | 'matches';
  postTypes: string[];
  dateRange: 'all' | 'today' | 'week' | 'month';
}

interface FeedFiltersProps {
  filters: FeedFilterOptions;
  onFilterChange: (filters: FeedFilterOptions) => void;
  onClearFilters: () => void;
}

export const FeedFilters = ({ filters, onFilterChange, onClearFilters }: FeedFiltersProps) => {
  const [showFilters, setShowFilters] = useState(false);

  const postTypeOptions = [
    { value: 'update', label: '📝 Updates' },
    { value: 'collaboration_story', label: '🤝 Collaborations' },
    { value: 'campaign_announcement', label: '📢 Campaigns' },
    { value: 'portfolio', label: '🎨 Portfolio' },
  ];

  const dateRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
  ];

  const handleTabChange = (tab: 'all' | 'connections' | 'matches') => {
    onFilterChange({ ...filters, tab });
  };

  const handlePostTypeToggle = (postType: string) => {
    const newPostTypes = filters.postTypes.includes(postType)
      ? filters.postTypes.filter(t => t !== postType)
      : [...filters.postTypes, postType];
    onFilterChange({ ...filters, postTypes: newPostTypes });
  };

  const handleDateRangeChange = (dateRange: 'all' | 'today' | 'week' | 'month') => {
    onFilterChange({ ...filters, dateRange });
  };

  const hasActiveFilters = 
    filters.tab !== 'all' || 
    filters.postTypes.length > 0 || 
    filters.dateRange !== 'all';

  return (
    <div className="feed-filters">
      {/* Feed Tabs */}
      <div className="feed-tabs">
        <button
          className={`feed-tab ${filters.tab === 'all' ? 'active' : ''}`}
          onClick={() => handleTabChange('all')}
        >
          All Posts
        </button>
        <button
          className={`feed-tab ${filters.tab === 'connections' ? 'active' : ''}`}
          onClick={() => handleTabChange('connections')}
        >
          Connections
        </button>
        <button
          className={`feed-tab ${filters.tab === 'matches' ? 'active' : ''}`}
          onClick={() => handleTabChange('matches')}
        >
          Matches
        </button>
      </div>

      {/* Filter Toggle Button */}
      <div className="feed-filter-actions">
        <button
          className={`filter-toggle-btn ${hasActiveFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <HiFilter size={18} />
          Filters
          {hasActiveFilters && <span className="filter-badge">{
            (filters.postTypes.length > 0 ? 1 : 0) + 
            (filters.dateRange !== 'all' ? 1 : 0)
          }</span>}
        </button>
        {hasActiveFilters && (
          <button className="clear-filters-btn" onClick={onClearFilters}>
            <HiX size={16} />
            Clear
          </button>
        )}
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="feed-filters-panel">
          {/* Post Type Filters */}
          <div className="filter-section">
            <h4 className="filter-section-title">Post Types</h4>
            <div className="filter-options">
              {postTypeOptions.map(option => (
                <label key={option.value} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={filters.postTypes.includes(option.value)}
                    onChange={() => handlePostTypeToggle(option.value)}
                  />
                  <span className="filter-checkbox-label">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="filter-section">
            <h4 className="filter-section-title">Date Range</h4>
            <div className="filter-options">
              {dateRangeOptions.map(option => (
                <label key={option.value} className="filter-radio">
                  <input
                    type="radio"
                    name="dateRange"
                    value={option.value}
                    checked={filters.dateRange === option.value}
                    onChange={() => handleDateRangeChange(option.value as any)}
                  />
                  <span className="filter-radio-label">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
