import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FeedPost as FeedPostType } from '../../services/feed.service';
import { Card } from '../Card/Card';
import { Avatar } from '../Avatar';
import { CommentSection } from '../CommentSection/CommentSection';
import { MediaGrid } from '../MediaGrid';
import { ReactionPicker, ReactionType } from '../ReactionPicker';
import { WhoReactedModal } from '../WhoReactedModal/WhoReactedModal';
import { ShareModal } from '../ShareModal/ShareModal';
import { CollaborationRequestModal } from '../CollaborationRequestModal/CollaborationRequestModal';
import { ActionBar, ActionBarItem } from '../ActionBar';
import { RichText } from '../RichText';
import { HiHeart, HiOutlineHeart, HiChat, HiDotsVertical, HiTrash, HiShare, HiBookmark, HiOutlineBookmark, HiMail, HiUserAdd, HiCheckCircle } from 'react-icons/hi';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { feedService } from '../../services/feed.service';
import { matchingService } from '../../services/matching.service';
import { getMediaUrl } from '../../utils/media.utils';
import './FeedPost.css';

interface FeedPostProps {
  post: FeedPostType;
  onDelete?: () => void;
  onLikeChange?: () => void;
}

export const FeedPost = ({ post, onDelete, onLikeChange }: FeedPostProps) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [reaction, setReaction] = useState<ReactionType | null>(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [commentCount, setCommentCount] = useState(post.commentCount);
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loadingInteraction, setLoadingInteraction] = useState(true);
  const [showWhoReacted, setShowWhoReacted] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareCount, setShareCount] = useState(0);
  const [showCollaborationModal, setShowCollaborationModal] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('none');
  const [compatibilityScore, setCompatibilityScore] = useState<number | null>(null);

  // Check if this is the current user's own post
  // Check both authorId and author.id for maximum compatibility
  const isOwnPost = !!(user && (user.id === post.authorId || user.id === post.author?.id));

  // Load interaction status on mount
  useEffect(() => {
    const loadInteractionStatus = async () => {
      try {
        const [status, reactions, shareData] = await Promise.all([
          feedService.getPostInteractionStatus(post.id),
          feedService.getPostReactions(post.id),
          feedService.getShareCount(post.id),
        ]);
        setLiked(status.liked);
        setSaved(status.saved);
        setShareCount(shareData.count);
        if (reactions.userReaction) {
          setReaction(reactions.userReaction as ReactionType);
        }
      } catch (error) {
        console.error('Failed to load interaction status:', error);
      } finally {
        setLoadingInteraction(false);
      }
    };

    loadInteractionStatus();
  }, [post.id]);

  // Load connection status
  useEffect(() => {
    const loadConnectionInfo = async () => {
      if (!user || isOwnPost) return;
      
      try {
        // Check connection status
        const response: any = await matchingService.getConnectionStatus(post.authorId);
        setConnectionStatus(response?.status || 'none');
        
        // Try to get connection details which may include compatibility score
        if (response?.status === 'connected') {
          try {
            const connection: any = await matchingService.getConnectionByUserId(post.authorId);
            if (connection?.compatibilityScore) {
              setCompatibilityScore(connection.compatibilityScore);
            }
          } catch (error) {
            // Ignore error - compatibility score is optional
            console.debug('Could not load compatibility score:', error);
          }
        }
      } catch (error) {
        console.error('Failed to load connection info:', error);
      }
    };
    
    loadConnectionInfo();
  }, [post.authorId, user, isOwnPost]);

  const handleReaction = async (reactionType: ReactionType) => {
    try {
      if (reaction === reactionType) {
        // Remove reaction if clicking same type
        await feedService.removeReaction(post.id);
        setReaction(null);
        setLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
      } else {
        // Add or change reaction
        await feedService.reactToPost(post.id, reactionType);
        if (!reaction) {
          // New reaction, increment count
          setLikeCount(prev => prev + 1);
        }
        setReaction(reactionType);
        setLiked(true);
      }
      setShowReactionPicker(false);
      onLikeChange?.();
    } catch (error: any) {
      showToast(error.message || 'Failed to update reaction', 'error');
    }
  };

  const handleSave = async () => {
    try {
      if (saved) {
        await feedService.unsavePost(post.id);
        setSaved(false);
        showToast('Post unsaved', 'success');
      } else {
        await feedService.savePost(post.id);
        setSaved(true);
        showToast('Post saved', 'success');
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to save post', 'error');
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      setIsDeleting(true);
      await feedService.deletePost(post.id);
      showToast('Post deleted successfully', 'success');
      onDelete?.();
    } catch (error: any) {
      showToast(error.message || 'Failed to delete post', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getPostTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      update: '📝 Update',
      collaboration_story: '🤝 Collaboration Story',
      campaign_announcement: '📢 Campaign',
      portfolio: '🎨 Portfolio',
    };
    return labels[type] || type;
  };

  const getPostTypeClass = (type: string) => {
    const classes: Record<string, string> = {
      update: 'post-type-update',
      collaboration_story: 'post-type-collaboration',
      campaign_announcement: 'post-type-campaign',
      portfolio: 'post-type-portfolio',
    };
    return classes[type] || 'post-type-default';
  };

  const getAuthorName = () => {
    return post.author.email.split('@')[0];
  };

  const actionBarItems: ActionBarItem[] = [
    {
      id: 'like',
      icon: liked ? <HiHeart /> : <HiOutlineHeart />,
      label: 'Like',
      count: likeCount,
      active: liked,
      onClick: () => setShowReactionPicker(!showReactionPicker),
      disabled: loadingInteraction,
    },
    {
      id: 'comment',
      icon: <HiChat />,
      label: 'Comment',
      count: commentCount,
      active: showComments,
      onClick: () => setShowComments(!showComments),
    },
    {
      id: 'message',
      icon: <HiMail />,
      label: 'Message',
      onClick: () => {
        // Defensive checks
        if (!user) {
          showToast('Please log in to send messages', 'error');
          return;
        }
        
        if (isOwnPost) {
          showToast("You can't message yourself", 'info');
          return;
        }
        
        if (!post.authorId) {
          showToast('Unable to identify post author', 'error');
          return;
        }
        
        navigate('/messages', {
          state: {
            recipientId: post.authorId,
            recipientName: getAuthorName(),
            context: 'post',
            contextData: {
              postId: post.id,
              postType: post.postType
            }
          }
        });
      },
      disabled: isOwnPost || !user,
      disabledTooltip: isOwnPost ? "You can't message yourself" : !user ? "Please log in to message" : undefined,
    },
    {
      id: 'collaborate',
      icon: <HiUserAdd />,
      label: 'Collaborate',
      onClick: () => {
        if (!user) {
          showToast('Please log in to request collaboration', 'error');
          return;
        }
        
        if (isOwnPost) {
          showToast("You can't collaborate with yourself", 'info');
          return;
        }
        
        setShowCollaborationModal(true);
      },
      disabled: isOwnPost || !user || connectionStatus === 'pending',
      disabledTooltip: isOwnPost 
        ? "You can't collaborate with yourself" 
        : !user 
        ? "Please log in to collaborate" 
        : connectionStatus === 'pending'
        ? "Connection request pending"
        : undefined,
    },
    {
      id: 'share',
      icon: <HiShare />,
      label: 'Share',
      count: shareCount > 0 ? shareCount : undefined,
      onClick: handleShare,
    },
    {
      id: 'save',
      icon: saved ? <HiBookmark /> : <HiOutlineBookmark />,
      label: 'Save',
      active: saved,
      onClick: handleSave,
      disabled: loadingInteraction,
    },
  ];

  // Convert relative URLs to absolute URLs for display
  const mediaItems = post.mediaUrls?.map((url, index) => ({
    id: `${post.id}-media-${index}`,
    url: getMediaUrl(url),
    alt: `Post media ${index + 1}`,
    type: 'image' as const,
  })) || [];

  return (
    <Card className="feed-post" size="lg" hover={false} shadow="md">
      <div className="feed-post-header">
        <div className="feed-post-author">
          <Avatar
            src={post.author.avatarUrl}
            name={getAuthorName()}
            email={post.author.email}
            size="md"
            userId={post.authorId}
            clickable={true}
            trackingContext="feed_post"
          />
          <div className="feed-post-author-info">
            <div 
              className="feed-post-author-name feed-post-author-name-clickable"
              onClick={() => {
                if (isOwnPost) {
                  navigate('/profile');
                } else {
                  navigate(`/profile/${post.authorId}`);
                }
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  if (isOwnPost) {
                    navigate('/profile');
                  } else {
                    navigate(`/profile/${post.authorId}`);
                  }
                }
              }}
            >
              {getAuthorName()}
            </div>
            <div className="feed-post-meta">
              <span className={`feed-post-type ${getPostTypeClass(post.postType)}`}>
                {getPostTypeLabel(post.postType)}
              </span>
              <span className="feed-post-separator">•</span>
              <span className="feed-post-time">{formatDate(post.createdAt)}</span>
              {!isOwnPost && connectionStatus === 'accepted' && (
                <>
                  <span className="feed-post-separator">•</span>
                  <span className="connection-badge">
                    <HiCheckCircle size={14} />
                    Connected
                  </span>
                </>
              )}
              {!isOwnPost && connectionStatus === 'none' && compatibilityScore && compatibilityScore >= 75 && (
                <>
                  <span className="feed-post-separator">•</span>
                  <span className="compatibility-badge">
                    🔥 {compatibilityScore}% Match
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        {isOwnPost && (
          <div className="feed-post-menu">
            <button
              className="feed-post-menu-button"
              onClick={() => setShowMenu(!showMenu)}
              aria-label="Post options"
            >
              <HiDotsVertical size={20} />
            </button>
            {showMenu && (
              <div className="feed-post-menu-dropdown">
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="feed-post-menu-item danger"
                >
                  <HiTrash size={16} />
                  {isDeleting ? 'Deleting...' : 'Delete Post'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="feed-post-content">
        <RichText 
          text={post.content} 
          maxLines={5}
          expandable={true}
        />
      </div>

      {mediaItems.length > 0 && (
        <div className="feed-post-media">
          <MediaGrid items={mediaItems} maxDisplay={6} />
        </div>
      )}

      <div className="feed-post-actions-container">
        <div className="feed-post-stats">
          {likeCount > 0 && (
            <button 
              className="feed-post-stat-btn"
              onClick={() => setShowWhoReacted(true)}
            >
              {likeCount} {likeCount === 1 ? 'reaction' : 'reactions'}
            </button>
          )}
          {commentCount > 0 && (
            <span className="feed-post-stat">{commentCount} {commentCount === 1 ? 'comment' : 'comments'}</span>
          )}
        </div>

        <div className="feed-post-action-bar-wrapper">
          {showReactionPicker && (
            <ReactionPicker
              onReact={handleReaction}
              currentReaction={reaction}
              show={showReactionPicker}
              onClose={() => setShowReactionPicker(false)}
            />
          )}
          <ActionBar items={actionBarItems} size="lg" />
        </div>
      </div>

      {showComments && (
        <div className="feed-post-comments">
          <CommentSection
            postId={post.id}
            initialCommentCount={commentCount}
            onCommentCountChange={setCommentCount}
          />
        </div>
      )}

      {showWhoReacted && (
        <WhoReactedModal
          postId={post.id}
          isOpen={showWhoReacted}
          onClose={() => setShowWhoReacted(false)}
        />
      )}

      {showShareModal && (
        <ShareModal
          itemType="post"
          itemId={post.id}
          itemTitle={post.content.substring(0, 100)}
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {showCollaborationModal && (
        <CollaborationRequestModal
          recipientId={post.authorId}
          recipientName={getAuthorName()}
          isOpen={showCollaborationModal}
          onClose={() => setShowCollaborationModal(false)}
          onSuccess={() => {
            setShowCollaborationModal(false);
            showToast('Collaboration request sent!', 'success');
            // Refresh connection status
            setConnectionStatus('pending');
          }}
        />
      )}
    </Card>
  );
};
