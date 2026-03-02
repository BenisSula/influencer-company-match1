import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiNewspaper,
  HiMail,
  HiLink,
  HiX,
} from 'react-icons/hi';
import { FaTwitter, FaLinkedin, FaFacebook } from 'react-icons/fa';
import { feedService } from '../../services/feed.service';
import './ShareModal.css';

interface ShareModalProps {
  itemType: 'post' | 'campaign' | 'match';
  itemId: string;
  itemTitle?: string;
  itemUrl?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  itemType,
  itemId,
  itemTitle,
  itemUrl,
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const [shareCount, setShareCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadShareCount();
    }
  }, [isOpen, itemId]);

  const loadShareCount = async () => {
    try {
      const { count } = await feedService.getShareCount(itemId);
      setShareCount(count);
    } catch (error) {
      console.error('Failed to load share count:', error);
    }
  };

  const showToast = (message: string) => {
    // Simple toast notification
    console.log(message);
  };

  const handleCopyLink = async () => {
    try {
      setLoading(true);
      const url = itemUrl || `${window.location.origin}/${itemType}/${itemId}`;
      await navigator.clipboard.writeText(url);
      await feedService.trackShare(itemId, 'link');
      setShareCount(prev => prev + 1);
      setCopiedLink(true);
      showToast('Link copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (error) {
      showToast('Failed to copy link');
    } finally {
      setLoading(false);
    }
  };

  const handleShareToFeed = async () => {
    try {
      setLoading(true);
      await feedService.trackShare(itemId, 'feed');
      setShareCount(prev => prev + 1);
      navigate('/feed', {
        state: {
          sharedItem: { type: itemType, id: itemId, title: itemTitle },
        },
      });
      onClose();
    } catch (error) {
      showToast('Failed to share to feed');
    } finally {
      setLoading(false);
    }
  };

  const handleShareViaMessage = async () => {
    try {
      setLoading(true);
      await feedService.trackShare(itemId, 'message');
      setShareCount(prev => prev + 1);
      navigate('/messages', {
        state: {
          sharedItem: { type: itemType, id: itemId, title: itemTitle },
        },
      });
      onClose();
    } catch (error) {
      showToast('Failed to share via message');
    } finally {
      setLoading(false);
    }
  };

  const handleExternalShare = async (platform: 'twitter' | 'linkedin' | 'facebook') => {
    try {
      setLoading(true);
      const url = itemUrl || `${window.location.origin}/${itemType}/${itemId}`;
      const text = itemTitle || `Check out this ${itemType}`;

      let shareUrl = '';
      switch (platform) {
        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
          break;
        case 'linkedin':
          shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
          break;
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
          break;
      }

      window.open(shareUrl, '_blank', 'width=600,height=400');
      await feedService.trackShare(itemId, platform);
      setShareCount(prev => prev + 1);
      showToast(`Shared to ${platform}!`);
    } catch (error) {
      showToast(`Failed to share to ${platform}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="share-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Share</h3>
          <button className="close-button" onClick={onClose} aria-label="Close">
            <HiX size={24} />
          </button>
        </div>

        <div className="share-options">
          <button
            className="share-option"
            onClick={handleShareToFeed}
            disabled={loading}
          >
            <div className="share-option-icon">
              <HiNewspaper size={24} />
            </div>
            <span>Share to Feed</span>
          </button>

          <button
            className="share-option"
            onClick={handleShareViaMessage}
            disabled={loading}
          >
            <div className="share-option-icon">
              <HiMail size={24} />
            </div>
            <span>Send via Message</span>
          </button>

          <button
            className="share-option"
            onClick={handleCopyLink}
            disabled={loading}
          >
            <div className="share-option-icon">
              <HiLink size={24} />
            </div>
            <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
          </button>

          <div className="share-divider" />

          <button
            className="share-option external"
            onClick={() => handleExternalShare('twitter')}
            disabled={loading}
          >
            <div className="share-option-icon twitter">
              <FaTwitter size={24} />
            </div>
            <span>Share on Twitter</span>
          </button>

          <button
            className="share-option external"
            onClick={() => handleExternalShare('linkedin')}
            disabled={loading}
          >
            <div className="share-option-icon linkedin">
              <FaLinkedin size={24} />
            </div>
            <span>Share on LinkedIn</span>
          </button>

          <button
            className="share-option external"
            onClick={() => handleExternalShare('facebook')}
            disabled={loading}
          >
            <div className="share-option-icon facebook">
              <FaFacebook size={24} />
            </div>
            <span>Share on Facebook</span>
          </button>
        </div>

        {shareCount > 0 && (
          <div className="share-count">
            Shared {shareCount} {shareCount === 1 ? 'time' : 'times'}
          </div>
        )}
      </div>
    </div>
  );
};
