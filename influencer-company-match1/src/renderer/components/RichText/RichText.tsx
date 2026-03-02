import React from 'react';
import './RichText.css';

interface RichTextProps {
  text: string;
  className?: string;
  onMentionClick?: (username: string) => void;
  onHashtagClick?: (hashtag: string) => void;
  onLinkClick?: (url: string) => void;
  maxLines?: number;
  expandable?: boolean;
}

export const RichText: React.FC<RichTextProps> = ({
  text,
  className = '',
  onMentionClick,
  onHashtagClick,
  onLinkClick,
  maxLines,
  expandable = false,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const parseText = (inputText: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    // Combined regex for mentions, hashtags, and URLs
    const regex = /(@\w+)|(#\w+)|(https?:\/\/[^\s]+)/g;
    let match;

    while ((match = regex.exec(inputText)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(inputText.substring(lastIndex, match.index));
      }

      const fullMatch = match[0];
      
      if (match[1]) {
        // Mention
        const username = fullMatch.substring(1);
        parts.push(
          <span
            key={`mention-${match.index}`}
            className="rich-text-mention"
            onClick={() => onMentionClick?.(username)}
          >
            {fullMatch}
          </span>
        );
      } else if (match[2]) {
        // Hashtag
        const hashtag = fullMatch.substring(1);
        parts.push(
          <span
            key={`hashtag-${match.index}`}
            className="rich-text-hashtag"
            onClick={() => onHashtagClick?.(hashtag)}
          >
            {fullMatch}
          </span>
        );
      } else if (match[3]) {
        // URL
        parts.push(
          <a
            key={`link-${match.index}`}
            href={fullMatch}
            className="rich-text-link"
            onClick={(e) => {
              if (onLinkClick) {
                e.preventDefault();
                onLinkClick(fullMatch);
              }
            }}
            target="_blank"
            rel="noopener noreferrer"
          >
            {fullMatch}
          </a>
        );
      }

      lastIndex = regex.lastIndex;
    }

    // Add remaining text
    if (lastIndex < inputText.length) {
      parts.push(inputText.substring(lastIndex));
    }

    return parts;
  };

  const shouldTruncate = maxLines && !isExpanded;
  const richTextClasses = [
    'rich-text',
    shouldTruncate ? `rich-text-truncate-${maxLines}` : '',
    className
  ].filter(Boolean).join(' ');

  const parsedContent = parseText(text);
  const needsExpansion = expandable && maxLines && text.split('\n').length > maxLines;

  return (
    <div className="rich-text-container">
      <div className={richTextClasses}>
        {parsedContent}
      </div>
      {needsExpansion && (
        <button
          className="rich-text-expand-button"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  );
};
