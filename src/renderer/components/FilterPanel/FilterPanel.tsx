import React, { useState } from 'react';
import './FilterPanel.css';

interface MatchFilters {
  niches?: string[];
  locations?: string[];
  minBudget?: number;
  maxBudget?: number;
  minAudienceSize?: number;
  maxAudienceSize?: number;
  platforms?: string[];
  minEngagementRate?: number;
  verifiedOnly?: boolean;
  contentTypes?: string[];
  collaborationPreferences?: string[];
  campaignTypes?: string[];
  companySizes?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface FilterPanelProps {
  filters: MatchFilters;
  onFiltersChange: (filters: MatchFilters) => void;
  onClearFilters: () => void;
  onSavePreset?: () => void;
  onLoadPreset?: (presetId: string) => void;
  presets?: Array<{ id: string; name: string; filters: MatchFilters }>;
  userRole: 'influencer' | 'company';
}

const NICHES = [
  'Fashion',
  'Beauty',
  'Technology',
  'Gaming',
  'Fitness',
  'Food',
  'Travel',
  'Lifestyle',
  'Business',
  'Entertainment',
];

const LOCATIONS = [
  'New York',
  'Los Angeles',
  'Chicago',
  'Houston',
  'Phoenix',
  'Philadelphia',
  'San Antonio',
  'San Diego',
  'Dallas',
  'San Jose',
];

const PLATFORMS = ['Instagram', 'YouTube', 'TikTok', 'Twitter', 'Facebook', 'LinkedIn'];

const CONTENT_TYPES = ['video', 'image', 'blog', 'podcast', 'story', 'reel'];

const COLLABORATION_PREFERENCES = ['one-time', 'long-term', 'flexible'];

const CAMPAIGN_TYPES = [
  'product-launch',
  'brand-awareness',
  'sponsored-content',
  'event',
  'ambassador',
  'affiliate',
  'ugc',
];

const COMPANY_SIZES = ['startup', 'small', 'medium', 'large', 'enterprise'];

const SORT_OPTIONS = [
  { value: 'score', label: 'Match Score' },
  { value: 'audienceSize', label: 'Audience Size' },
  { value: 'engagementRate', label: 'Engagement Rate' },
  { value: 'recentActivity', label: 'Recent Activity' },
];

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  onSavePreset,
  onLoadPreset,
  presets = [],
  userRole,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showPresetModal, setShowPresetModal] = useState(false);

  const handleMultiSelectChange = (field: keyof MatchFilters, value: string) => {
    const currentValues = (filters[field] as string[]) || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];
    
    onFiltersChange({ ...filters, [field]: newValues.length > 0 ? newValues : undefined });
  };

  const handleRangeChange = (field: keyof MatchFilters, value: string) => {
    const numValue = value === '' ? undefined : Number(value);
    onFiltersChange({ ...filters, [field]: numValue });
  };

  const handleToggleChange = (field: keyof MatchFilters) => {
    onFiltersChange({ ...filters, [field]: !filters[field] });
  };

  const handleSortChange = (sortBy: string) => {
    onFiltersChange({ ...filters, sortBy, sortOrder: filters.sortOrder || 'desc' });
  };

  const handleSortOrderToggle = () => {
    onFiltersChange({
      ...filters,
      sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc',
    });
  };

  const activeFilterCount = Object.keys(filters).filter(
    (key) => filters[key as keyof MatchFilters] !== undefined && key !== 'sortBy' && key !== 'sortOrder'
  ).length;

  return (
    <div className="filter-panel">
      <div className="filter-panel-header">
        <div className="filter-panel-title">
          <svg className="filter-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" />
          </svg>
          <h3>Filters</h3>
          {activeFilterCount > 0 && (
            <span className="filter-count-badge">{activeFilterCount}</span>
          )}
        </div>
        <div className="filter-panel-actions">
          <button
            className="filter-action-btn"
            onClick={onClearFilters}
            disabled={activeFilterCount === 0}
          >
            Clear All
          </button>
          <button
            className="filter-expand-btn"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? 'Collapse filters' : 'Expand filters'}
          >
            <svg
              className={`expand-icon ${isExpanded ? 'expanded' : ''}`}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M7 10l5 5 5-5z" />
            </svg>
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="filter-panel-content">
          {/* Preset Management */}
          {presets.length > 0 && (
            <div className="filter-section">
              <label className="filter-label">Saved Presets</label>
              <select
                className="filter-select"
                onChange={(e) => e.target.value && onLoadPreset?.(e.target.value)}
                value=""
              >
                <option value="">Load a preset...</option>
                {presets.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Niches */}
          <div className="filter-section">
            <label className="filter-label">Niches</label>
            <div className="filter-chips">
              {NICHES.map((niche) => (
                <button
                  key={niche}
                  className={`filter-chip ${
                    filters.niches?.includes(niche) ? 'active' : ''
                  }`}
                  onClick={() => handleMultiSelectChange('niches', niche)}
                >
                  {niche}
                </button>
              ))}
            </div>
          </div>

          {/* Locations */}
          <div className="filter-section">
            <label className="filter-label">Locations</label>
            <div className="filter-chips">
              {LOCATIONS.map((location) => (
                <button
                  key={location}
                  className={`filter-chip ${
                    filters.locations?.includes(location) ? 'active' : ''
                  }`}
                  onClick={() => handleMultiSelectChange('locations', location)}
                >
                  {location}
                </button>
              ))}
            </div>
          </div>

          {/* Budget Range */}
          <div className="filter-section">
            <label className="filter-label">Budget Range</label>
            <div className="filter-range">
              <input
                type="number"
                className="filter-input"
                placeholder="Min"
                value={filters.minBudget || ''}
                onChange={(e) => handleRangeChange('minBudget', e.target.value)}
              />
              <span className="range-separator">to</span>
              <input
                type="number"
                className="filter-input"
                placeholder="Max"
                value={filters.maxBudget || ''}
                onChange={(e) => handleRangeChange('maxBudget', e.target.value)}
              />
            </div>
          </div>

          {/* Audience Size Range */}
          {userRole === 'company' && (
            <div className="filter-section">
              <label className="filter-label">Audience Size</label>
              <div className="filter-range">
                <input
                  type="number"
                  className="filter-input"
                  placeholder="Min"
                  value={filters.minAudienceSize || ''}
                  onChange={(e) => handleRangeChange('minAudienceSize', e.target.value)}
                />
                <span className="range-separator">to</span>
                <input
                  type="number"
                  className="filter-input"
                  placeholder="Max"
                  value={filters.maxAudienceSize || ''}
                  onChange={(e) => handleRangeChange('maxAudienceSize', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Platforms */}
          <div className="filter-section">
            <label className="filter-label">Platforms</label>
            <div className="filter-chips">
              {PLATFORMS.map((platform) => (
                <button
                  key={platform}
                  className={`filter-chip ${
                    filters.platforms?.includes(platform) ? 'active' : ''
                  }`}
                  onClick={() => handleMultiSelectChange('platforms', platform)}
                >
                  {platform}
                </button>
              ))}
            </div>
          </div>

          {/* Engagement Rate (for companies) */}
          {userRole === 'company' && (
            <div className="filter-section">
              <label className="filter-label">Minimum Engagement Rate (%)</label>
              <input
                type="number"
                className="filter-input"
                placeholder="e.g., 3.5"
                step="0.1"
                min="0"
                max="100"
                value={filters.minEngagementRate || ''}
                onChange={(e) => handleRangeChange('minEngagementRate', e.target.value)}
              />
            </div>
          )}

          {/* Content Types (for companies) */}
          {userRole === 'company' && (
            <div className="filter-section">
              <label className="filter-label">Content Types</label>
              <div className="filter-chips">
                {CONTENT_TYPES.map((type) => (
                  <button
                    key={type}
                    className={`filter-chip ${
                      filters.contentTypes?.includes(type) ? 'active' : ''
                    }`}
                    onClick={() => handleMultiSelectChange('contentTypes', type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Collaboration Preferences (for companies) */}
          {userRole === 'company' && (
            <div className="filter-section">
              <label className="filter-label">Collaboration Preferences</label>
              <div className="filter-chips">
                {COLLABORATION_PREFERENCES.map((pref) => (
                  <button
                    key={pref}
                    className={`filter-chip ${
                      filters.collaborationPreferences?.includes(pref) ? 'active' : ''
                    }`}
                    onClick={() => handleMultiSelectChange('collaborationPreferences', pref)}
                  >
                    {pref}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Campaign Types (for influencers) */}
          {userRole === 'influencer' && (
            <div className="filter-section">
              <label className="filter-label">Campaign Types</label>
              <div className="filter-chips">
                {CAMPAIGN_TYPES.map((type) => (
                  <button
                    key={type}
                    className={`filter-chip ${
                      filters.campaignTypes?.includes(type) ? 'active' : ''
                    }`}
                    onClick={() => handleMultiSelectChange('campaignTypes', type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Company Sizes (for influencers) */}
          {userRole === 'influencer' && (
            <div className="filter-section">
              <label className="filter-label">Company Sizes</label>
              <div className="filter-chips">
                {COMPANY_SIZES.map((size) => (
                  <button
                    key={size}
                    className={`filter-chip ${
                      filters.companySizes?.includes(size) ? 'active' : ''
                    }`}
                    onClick={() => handleMultiSelectChange('companySizes', size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Verified Only */}
          <div className="filter-section">
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={filters.verifiedOnly || false}
                onChange={() => handleToggleChange('verifiedOnly')}
              />
              <span>Verified profiles only</span>
            </label>
          </div>

          {/* Sort Options */}
          <div className="filter-section">
            <label className="filter-label">Sort By</label>
            <div className="filter-sort">
              <select
                className="filter-select"
                value={filters.sortBy || 'score'}
                onChange={(e) => handleSortChange(e.target.value)}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                className="sort-order-btn"
                onClick={handleSortOrderToggle}
                title={filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  {filters.sortOrder === 'asc' ? (
                    <path d="M7 14l5-5 5 5z" />
                  ) : (
                    <path d="M7 10l5 5 5-5z" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Save Preset Button */}
          {onSavePreset && (
            <div className="filter-section">
              <button className="filter-save-btn" onClick={onSavePreset}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z" />
                </svg>
                Save as Preset
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
