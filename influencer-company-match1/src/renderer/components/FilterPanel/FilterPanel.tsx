import { useState } from 'react';
import { Card, CardBody, Button } from '../';
import { HiFilter, HiX, HiChevronDown, HiChevronUp } from 'react-icons/hi';
import { MatchFilters } from '../../services/matching.service';
import { ScoreThresholdSlider } from '../ScoreThresholdSlider/ScoreThresholdSlider';
import './FilterPanel.css';

interface FilterPanelProps {
  filters: MatchFilters;
  onFiltersChange: (filters: Partial<MatchFilters>) => void;
  onClearFilters: () => void;
  userRole: 'influencer' | 'company';
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  userRole,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSortChange = (sortBy: string) => {
    onFiltersChange({ sortBy: sortBy as any });
  };

  const handleSortOrderToggle = () => {
    onFiltersChange({ sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' });
  };

  return (
    <Card className="filter-panel" style={{ marginBottom: '1rem' }}>
      <CardBody>
        <div className="filter-header">
          <div className="filter-title">
            <HiFilter size={20} />
            <span>Filters & Sorting</span>
          </div>
          <div className="filter-actions">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <HiChevronUp size={20} /> : <HiChevronDown size={20} />}
              {isExpanded ? 'Hide' : 'Show'} Filters
            </Button>
          </div>
        </div>

        <div className="filter-quick-sort">
          <label className="filter-label">Sort by:</label>
          <div className="sort-controls">
            <select
              value={filters.sortBy || 'score'}
              onChange={(e) => handleSortChange(e.target.value)}
              className="sort-select"
            >
              <optgroup label="Overall">
                <option value="score">Match Score</option>
                {userRole === 'company' && (
                  <>
                    <option value="audienceSize">Audience Size</option>
                    <option value="engagementRate">Engagement Rate</option>
                  </>
                )}
                <option value="recentActivity">Recent Activity</option>
              </optgroup>
              <optgroup label="Match Factors">
                <option value="nicheCompatibility">Niche Match</option>
                <option value="budgetAlignment">Budget Alignment</option>
                <option value="platformOverlap">Platform Overlap</option>
                <option value="audienceSizeMatch">Audience Size Match</option>
                <option value="engagementTierMatch">Engagement Quality</option>
                <option value="locationCompatibility">Location Proximity</option>
              </optgroup>
            </select>
            <button
              className="sort-order-button"
              onClick={handleSortOrderToggle}
              title={filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              type="button"
            >
              {filters.sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        <div className="filter-score-threshold">
          <ScoreThresholdSlider
            value={filters.minScore || 0}
            onChange={(value) => onFiltersChange({ minScore: value === 0 ? undefined : value })}
          />
        </div>

        {isExpanded && (
          <div className="filter-expanded">
            <div className="filter-section">
              <h4 className="filter-section-title">Advanced Filters</h4>
              <p className="filter-section-description">
                More filtering options coming soon! For now, use the sort options above.
              </p>
              {/* TODO: Add advanced filters based on user role */}
              {/* - Location multi-select */}
              {/* - Budget/Audience range sliders */}
              {/* - Platform checkboxes */}
              {/* - Verified only toggle */}
            </div>

            <div className="filter-footer">
              <Button variant="ghost" size="sm" onClick={onClearFilters}>
                <HiX size={16} />
                Clear All Filters
              </Button>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
};
