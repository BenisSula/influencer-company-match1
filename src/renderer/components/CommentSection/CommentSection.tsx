import { useState, useEffect } from 'react';
import { PostComment, feedService } from '../../services/feed.service';
import { Button } from '../Button/Button';
import { Avatar } from '../Avatar';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { HiTrash } from 'react-icons/hi';
import './CommentSection.css';

interface CommentSectionProps {
  postId: string;
  initialCommentCount: number;
  onCommentCountChange?: (count: number) => void;
}

export const CommentSection = ({ postId, initialCommentCount, onCommentCountChange }: CommentSectionProps) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [comments, setComments] = useState<PostComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    if (initialCommentCount > 0) {
      loadComments();
    }
  }, [postId]);

  const loadComments = async (pageNum: number = 1) => {
    try {
      setLoading(true);
      const response = await feedService.getComments(postId, pageNum, 10);
      
      if (pageNum === 1) {
        setComments(response.data);
      } else {
        setComments(prev => [...prev, ...response.data]);
      }
      
      setHasMore(response.meta.page < response.meta.totalPages);
      setPage(pageNum);
    } catch (error: any) {
      showToast(error.message || 'Failed to load comments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!commentText.trim()) {
      showToast('Please write a comment', 'error');
      return;
    }

    if (commentText.length > 500) {
      showToast('Comment is too long (max 500 characters)', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const newComment = await feedService.createComment(postId, {
        content: commentText.trim(),
      });

      // Add new comment to the top
      setComments(prev => {
        const updated = [newComment, ...prev];
        // Update count with the new length
        onCommentCountChange?.(updated.length);
        return updated;
      });
      setCommentText('');
      showToast('Comment added!', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to add comment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return;

    try {
      await feedService.deleteComment(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
      onCommentCountChange?.(comments.length - 1);
      showToast('Comment deleted', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to delete comment', 'error');
    }
  };

  const getAuthorName = (comment: PostComment) => {
    return comment.author.email.split('@')[0];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  return (
    <div className="comment-section">
      <form onSubmit={handleSubmit} className="comment-input-form">
        <div className="comment-input-wrapper">
          <Avatar
            src={user?.avatarUrl}
            email={user?.email}
            size="sm"
            className="comment-avatar"
          />
          <input
            type="text"
            className="comment-input"
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            maxLength={500}
            disabled={submitting}
          />
          <Button
            type="submit"
            size="sm"
            variant="primary"
            disabled={submitting || !commentText.trim()}
          >
            {submitting ? 'Posting...' : 'Post'}
          </Button>
        </div>
        {commentText.length > 400 && (
          <div className="comment-char-count">
            {500 - commentText.length} characters remaining
          </div>
        )}
      </form>

      <div className="comments-list">
        {loading && comments.length === 0 ? (
          <div className="comments-loading">
            <div className="spinner"></div>
            <span>Loading comments...</span>
          </div>
        ) : comments.length === 0 ? (
          <div className="comments-empty">
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          <>
            {comments.map((comment) => (
              <div key={comment.id} className="comment-item">
                <Avatar
                  src={comment.author.avatarUrl}
                  name={getAuthorName(comment)}
                  email={comment.author.email}
                  size="sm"
                  className="comment-avatar"
                  userId={comment.authorId}
                  clickable={true}
                  trackingContext="comment_section"
                />
                <div className="comment-content-wrapper">
                  <div className="comment-bubble">
                    <div className="comment-author">{getAuthorName(comment)}</div>
                    <div className="comment-text">{comment.content}</div>
                  </div>
                  <div className="comment-meta">
                    <span className="comment-time">{formatDate(comment.createdAt)}</span>
                    {user?.id === comment.authorId && (
                      <>
                        <span className="comment-separator">•</span>
                        <button
                          className="comment-delete"
                          onClick={() => handleDelete(comment.id)}
                          aria-label="Delete comment"
                        >
                          <HiTrash size={12} />
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {hasMore && (
              <button
                className="load-more-comments"
                onClick={() => loadComments(page + 1)}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load more comments'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
