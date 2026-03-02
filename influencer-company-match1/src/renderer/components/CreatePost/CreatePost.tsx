import { useState } from 'react';
import { Card, CardBody, Button, FileUpload, Avatar } from '../';
import { HiX, HiPhotograph } from 'react-icons/hi';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { feedService } from '../../services/feed.service';
import type { MediaFile } from '../../services/media.service';
import { getMediaUrl } from '../../utils/media.utils';
import './CreatePost.css';

interface CreatePostProps {
  onClose: () => void;
  onPostCreated?: () => void;
}

export const CreatePost = ({ onClose, onPostCreated }: CreatePostProps) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<'update' | 'collaboration_story' | 'campaign_announcement' | 'portfolio'>('update');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMediaUpload, setShowMediaUpload] = useState(false);
  const [uploadedMedia, setUploadedMedia] = useState<MediaFile[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const maxLength = 2000;
  const remainingChars = maxLength - content.length;

  const handleMediaUploadComplete = (files: MediaFile[]) => {
    setUploadedMedia(files);
    // Convert relative URLs to absolute URLs for preview
    setPreviewUrls(files.map(f => getMediaUrl(f.fileUrl)));
    showToast(`${files.length} image(s) uploaded successfully!`, 'success');
  };

  const handleMediaUploadError = (error: string) => {
    showToast(error, 'error');
  };

  const removePreviewImage = (index: number) => {
    setUploadedMedia(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      showToast('Please write something', 'error');
      return;
    }

    if (content.length > maxLength) {
      showToast(`Post is too long (max ${maxLength} characters)`, 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      await feedService.createPost({
        content: content.trim(),
        postType,
        mediaUrls: uploadedMedia.map(m => m.fileUrl),
      });
      showToast('Post created successfully!', 'success');
      onClose();
      // Call onPostCreated after closing to refresh feed
      onPostCreated?.();
    } catch (error: any) {
      showToast(error.message || 'Failed to create post', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAuthorName = () => {
    if (!user) return 'User';
    return user.email.split('@')[0];
  };

  return (
    <div className="create-post-overlay" onClick={onClose}>
      <div className="create-post-modal" onClick={(e) => e.stopPropagation()}>
        <Card>
          <div className="create-post-header">
            <h3>Create Post</h3>
            <button
              className="create-post-close"
              onClick={onClose}
              aria-label="Close"
            >
              <HiX size={24} />
            </button>
          </div>

          <CardBody>
            <form onSubmit={handleSubmit}>
              <div className="create-post-author">
                <Avatar
                  src={user?.avatarUrl}
                  name={getAuthorName()}
                  email={user?.email}
                  size="md"
                />
                <div className="create-post-author-info">
                  <div className="create-post-author-name">{getAuthorName()}</div>
                  <select
                    value={postType}
                    onChange={(e) => setPostType(e.target.value as any)}
                    className="create-post-type-select"
                  >
                    <option value="update">📝 Update</option>
                    <option value="collaboration_story">🤝 Collaboration Story</option>
                    <option value="campaign_announcement">📢 Campaign Announcement</option>
                    <option value="portfolio">🎨 Portfolio</option>
                  </select>
                </div>
              </div>

              <textarea
                className="create-post-textarea"
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={maxLength}
                rows={6}
                autoFocus
              />

              <div className="create-post-char-count">
                <span className={remainingChars < 100 ? 'warning' : ''}>
                  {remainingChars} characters remaining
                </span>
              </div>

              <div className="create-post-media-button">
                <button
                  type="button"
                  className="media-upload-button"
                  onClick={() => setShowMediaUpload(!showMediaUpload)}
                >
                  <HiPhotograph size={20} />
                  <span>Add Photos</span>
                  {uploadedMedia.length > 0 && (
                    <span className="badge badge-primary" style={{ marginLeft: 'auto' }}>
                      {uploadedMedia.length}
                    </span>
                  )}
                </button>
              </div>

              {showMediaUpload && (
                <div className="create-post-media-upload">
                  <FileUpload
                    fileType="post"
                    maxFiles={10}
                    onUploadComplete={handleMediaUploadComplete}
                    onUploadError={handleMediaUploadError}
                    disabled={isSubmitting}
                  />
                </div>
              )}

              {previewUrls.length > 0 && (
                <div className="create-post-preview-grid">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="preview-image-container">
                      <img src={url} alt={`Preview ${index + 1}`} className="preview-image" />
                      <button
                        type="button"
                        className="remove-preview-button"
                        onClick={() => removePreviewImage(index)}
                        disabled={isSubmitting}
                        aria-label="Remove image"
                      >
                        <HiX size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="create-post-actions">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting || !content.trim()}
                >
                  {isSubmitting ? 'Posting...' : 'Post'}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
