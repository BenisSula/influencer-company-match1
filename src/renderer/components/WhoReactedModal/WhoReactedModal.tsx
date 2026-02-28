import { useState, useEffect } from 'react';
import { feedService } from '../../services/feed.service';
import { Avatar } from '../Avatar';
import { REACTIONS } from '../ReactionPicker/ReactionPicker';
import './WhoReactedModal.css';

interface WhoReactedModalProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const WhoReactedModal: React.FC<WhoReactedModalProps> = ({
  postId,
  isOpen,
  onClose,
}) => {
  const [reactions, setReactions] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (isOpen) {
      loadReactions();
    }
  }, [isOpen, postId]);

  const loadReactions = async () => {
    try {
      setLoading(true);
      const data = await feedService.getPostReactions(postId);
      setReactions(data);
    } catch (error) {
      console.error('Failed to load reactions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredReactors = reactions?.recentReactors?.filter(
    (r: any) => filter === 'all' || r.reactionType === filter
  ) || [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="who-reacted-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Reactions</h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="reaction-filters">
          <button
            className={`reaction-filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All {reactions?.total || 0}
          </button>
          {Object.entries(reactions?.byType || {}).map(([type, count]) => {
            const reactionData = REACTIONS.find(r => r.type === type);
            const countNum = Number(count);
            return countNum > 0 && reactionData ? (
              <button
                key={type}
                className={`reaction-filter-btn ${filter === type ? 'active' : ''}`}
                onClick={() => setFilter(type)}
              >
                <span className="filter-emoji">{reactionData.emoji}</span>
                <span className="filter-count">{countNum}</span>
              </button>
            ) : null;
          })}
        </div>

        <div className="reactors-list">
          {loading ? (
            <div className="reactors-loading">
              <div className="spinner"></div>
              <p>Loading reactions...</p>
            </div>
          ) : filteredReactors.length === 0 ? (
            <div className="reactors-empty">
              <p>No reactions yet</p>
            </div>
          ) : (
            filteredReactors.map((reactor: any) => {
              const reactionData = REACTIONS.find(r => r.type === reactor.reactionType);
              return (
                <div key={reactor.userId} className="reactor-item">
                  <Avatar
                    src={reactor.avatarUrl}
                    name={reactor.userName}
                    size="md"
                    userId={reactor.userId}
                    clickable={true}
                    trackingContext="who_reacted_modal"
                  />
                  <span className="reactor-name">{reactor.userName}</span>
                  <span className="reactor-reaction" title={reactionData?.label}>
                    {reactionData?.emoji}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
