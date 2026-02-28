import { HiUser, HiNewspaper, HiClipboardList, HiX } from 'react-icons/hi';
import { SearchResult } from '../../services/search.service';
import { Avatar } from '../Avatar';
import './SearchResultItem.css';

interface SearchResultItemProps {
  result: SearchResult;
  selected?: boolean;
  onClick: () => void;
  onRemove?: () => void;
  showRemove?: boolean;
}

export const SearchResultItem: React.FC<SearchResultItemProps> = ({
  result,
  selected = false,
  onClick,
  onRemove,
  showRemove = false,
}) => {
  const getTypeIcon = () => {
    switch (result.type) {
      case 'user':
        return <HiUser />;
      case 'post':
        return <HiNewspaper />;
      case 'campaign':
        return <HiClipboardList />;
      default:
        return null;
    }
  };

  const getTypeLabel = () => {
    switch (result.type) {
      case 'user':
        return result.metadata?.role === 'influencer' ? 'Influencer' : 'Company';
      case 'post':
        return 'Post';
      case 'campaign':
        return 'Campaign';
      default:
        return '';
    }
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove?.();
  };

  return (
    <button
      className={`search-result-item ${selected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="search-result-avatar">
        {result.avatarUrl ? (
          <Avatar
            src={result.avatarUrl}
            name={result.title}
            size="md"
          />
        ) : (
          <div className="search-result-icon">
            {getTypeIcon()}
          </div>
        )}
      </div>

      <div className="search-result-content">
        <div className="search-result-title">{result.title}</div>
        {result.subtitle && (
          <div className="search-result-subtitle">{result.subtitle}</div>
        )}
      </div>

      <div className="search-result-meta">
        <span className="search-result-type">{getTypeLabel()}</span>
      </div>

      {showRemove && onRemove && (
        <button
          className="search-result-remove"
          onClick={handleRemoveClick}
          aria-label="Remove from history"
        >
          <HiX />
        </button>
      )}
    </button>
  );
};
