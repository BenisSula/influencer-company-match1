import { HiClock, HiTrendingUp, HiArrowRight } from 'react-icons/hi';
import { SearchResult } from '../../services/search.service';
import { SearchResultItem } from './SearchResultItem';
import { Skeleton } from '../Skeleton/Skeleton';
import './SearchDropdown.css';

interface SearchDropdownProps {
  query: string;
  results: SearchResult[];
  history: SearchResult[];
  trending: string[];
  loading: boolean;
  selectedIndex: number;
  onResultClick: (result: SearchResult) => void;
  onTrendingClick: (query: string) => void;
  onHistoryRemove: (id: string) => void;
  onHistoryClear: () => void;
  onSeeAllResults: () => void;
}

export const SearchDropdown: React.FC<SearchDropdownProps> = ({
  query,
  results,
  history,
  trending,
  loading,
  selectedIndex,
  onResultClick,
  onTrendingClick,
  onHistoryRemove,
  onHistoryClear,
  onSeeAllResults,
}) => {
  const hasQuery = query.trim().length > 0;
  const hasResults = results.length > 0;
  const hasHistory = history.length > 0;
  const hasTrending = trending.length > 0;

  return (
    <div className="search-dropdown">
      {loading && (
        <div className="search-dropdown-section">
          <Skeleton height={60} />
          <Skeleton height={60} />
          <Skeleton height={60} />
        </div>
      )}

      {!loading && hasQuery && hasResults && (
        <>
          <div className="search-dropdown-section">
            <div className="search-dropdown-header">
              <span>Results</span>
            </div>
            {results.map((result, index) => (
              <SearchResultItem
                key={result.id}
                result={result}
                selected={index === selectedIndex}
                onClick={() => onResultClick(result)}
              />
            ))}
          </div>

          {results.length >= 5 && (
            <div className="search-dropdown-footer">
              <button
                className="search-see-all"
                onClick={onSeeAllResults}
              >
                See all results for "{query}"
                <HiArrowRight />
              </button>
            </div>
          )}
        </>
      )}

      {!loading && hasQuery && !hasResults && (
        <div className="search-dropdown-empty">
          <p>No results found for "{query}"</p>
          <span>Try different keywords</span>
        </div>
      )}

      {!loading && !hasQuery && hasHistory && (
        <div className="search-dropdown-section">
          <div className="search-dropdown-header">
            <span>
              <HiClock /> Recent
            </span>
            <button
              className="search-clear-history"
              onClick={onHistoryClear}
            >
              Clear
            </button>
          </div>
          {history.map((result, index) => (
            <SearchResultItem
              key={result.id}
              result={result}
              selected={index + results.length === selectedIndex}
              onClick={() => onResultClick(result)}
              onRemove={() => onHistoryRemove(result.id)}
              showRemove
            />
          ))}
        </div>
      )}

      {!loading && !hasQuery && hasTrending && (
        <div className="search-dropdown-section">
          <div className="search-dropdown-header">
            <span>
              <HiTrendingUp /> Trending
            </span>
          </div>
          {trending.map((trendingQuery, index) => (
            <button
              key={trendingQuery}
              className={`search-trending-item ${
                index + results.length + history.length === selectedIndex ? 'selected' : ''
              }`}
              onClick={() => onTrendingClick(trendingQuery)}
            >
              <HiTrendingUp className="trending-icon" />
              <span>{trendingQuery}</span>
            </button>
          ))}
        </div>
      )}

      {!loading && !hasQuery && !hasHistory && !hasTrending && (
        <div className="search-dropdown-empty">
          <p>Start typing to search</p>
          <span>Search for users and posts</span>
        </div>
      )}
    </div>
  );
};
