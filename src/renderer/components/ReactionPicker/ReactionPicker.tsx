import React, { useState, useRef, useEffect } from 'react';
import './ReactionPicker.css';

export type ReactionType = 'like' | 'love' | 'wow' | 'haha' | 'sad' | 'angry';

export interface Reaction {
  type: ReactionType;
  emoji: string;
  label: string;
}

export const REACTIONS: Reaction[] = [
  { type: 'like', emoji: '👍', label: 'Like' },
  { type: 'love', emoji: '❤️', label: 'Love' },
  { type: 'wow', emoji: '😮', label: 'Wow' },
  { type: 'haha', emoji: '😂', label: 'Haha' },
  { type: 'sad', emoji: '😢', label: 'Sad' },
  { type: 'angry', emoji: '😠', label: 'Angry' },
];

interface ReactionPickerProps {
  onReact: (reaction: ReactionType) => void;
  currentReaction?: ReactionType | null;
  show: boolean;
  onClose: () => void;
}

export const ReactionPicker: React.FC<ReactionPickerProps> = ({
  onReact,
  currentReaction,
  show,
  onClose,
}) => {
  const [hoveredReaction, setHoveredReaction] = useState<ReactionType | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (show) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [show, onClose]);

  if (!show) {
    return null;
  }

  const handleReactionClick = (reactionType: ReactionType) => {
    onReact(reactionType);
    onClose();
  };

  return (
    <div className="reaction-picker" ref={pickerRef}>
      <div className="reaction-picker-content">
        {REACTIONS.map((reaction) => (
          <button
            key={reaction.type}
            className={`reaction-button ${
              currentReaction === reaction.type ? 'reaction-button-active' : ''
            } ${hoveredReaction === reaction.type ? 'reaction-button-hovered' : ''}`}
            onClick={() => handleReactionClick(reaction.type)}
            onMouseEnter={() => setHoveredReaction(reaction.type)}
            onMouseLeave={() => setHoveredReaction(null)}
            title={reaction.label}
          >
            <span className="reaction-emoji">{reaction.emoji}</span>
          </button>
        ))}
      </div>
      {hoveredReaction && (
        <div className="reaction-label">
          {REACTIONS.find((r) => r.type === hoveredReaction)?.label}
        </div>
      )}
    </div>
  );
};
