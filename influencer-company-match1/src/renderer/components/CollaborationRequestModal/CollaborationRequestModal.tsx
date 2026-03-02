import React, { useState } from 'react';
import { HiX, HiChat } from 'react-icons/hi';
import { Button } from '../Button/Button';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { matchingService } from '../../services/matching.service';
import './CollaborationRequestModal.css';

export interface CollaborationRequestModalProps {
  recipientId: string;
  recipientName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CollaborationRequestModal: React.FC<CollaborationRequestModalProps> = ({
  recipientId,
  recipientName,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [timeline, setTimeline] = useState('');
  const [collaborationType, setCollaborationType] = useState('sponsored_post');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('[CollaborationRequestModal] Submit triggered');
    console.log('[CollaborationRequestModal] Recipient:', { recipientId, recipientName });
    console.log('[CollaborationRequestModal] Form data:', { message, collaborationType, budgetMin, budgetMax, timeline });
    
    if (!message.trim()) {
      console.error('[CollaborationRequestModal] Validation failed: Empty message');
      showToast('Please add a message', 'error');
      return;
    }

    try {
      setLoading(true);
      
      const requestData: any = {
        recipientId,
        message: message.trim(),
        collaborationType,
      };

      // Add optional budget fields if provided
      if (budgetMin) {
        requestData.budgetMin = parseFloat(budgetMin);
      }
      if (budgetMax) {
        requestData.budgetMax = parseFloat(budgetMax);
      }
      if (timeline) {
        requestData.timeline = timeline;
      }

      console.log('[CollaborationRequestModal] Sending request:', requestData);
      const response = await matchingService.createCollaborationRequest(requestData);
      console.log('[CollaborationRequestModal] Response received:', response);

      // Dispatch event to notify all components about the new connection
      if (response && typeof response === 'object' && 'id' in response && user) {
        window.dispatchEvent(new CustomEvent('connectionStatusChanged', {
          detail: { 
            userId: user.id, 
            otherUserId: recipientId, 
            status: 'pending',
            connectionId: (response as any).id
          }
        }));
      }

      showToast(`Collaboration request sent to ${recipientName}!`, 'success');
      setMessage('');
      setBudgetMin('');
      setBudgetMax('');
      setTimeline('');
      setCollaborationType('sponsored_post');
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('[CollaborationRequestModal] Error details:', {
        message: error.message,
        response: error.response,
        stack: error.stack
      });
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send request';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="collaboration-request-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>Request Collaboration</h3>
            <p className="modal-subtitle">with {recipientName}</p>
          </div>
          <button className="close-button" onClick={onClose} aria-label="Close">
            <HiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="collaboration-form">
          <div className="form-group">
            <label htmlFor="collaborationType">
              Collaboration Type *
            </label>
            <select
              id="collaborationType"
              value={collaborationType}
              onChange={(e) => setCollaborationType(e.target.value)}
              required
            >
              <option value="sponsored_post">Sponsored Post</option>
              <option value="brand_ambassador">Brand Ambassador</option>
              <option value="product_review">Product Review</option>
              <option value="event_coverage">Event Coverage</option>
              <option value="content_creation">Content Creation</option>
              <option value="affiliate">Affiliate Partnership</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="budgetMin">
                Budget Min ($)
              </label>
              <input
                type="number"
                id="budgetMin"
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
                placeholder="e.g., 500"
                min="0"
                step="50"
              />
            </div>
            <div className="form-group">
              <label htmlFor="budgetMax">
                Budget Max ($)
              </label>
              <input
                type="number"
                id="budgetMax"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                placeholder="e.g., 2000"
                min="0"
                step="50"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="timeline">
              Timeline
            </label>
            <input
              type="text"
              id="timeline"
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
              placeholder="e.g., 2-4 weeks, ASAP, Flexible"
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">
              <HiChat size={18} />
              Your Message *
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Introduce yourself and explain what collaboration you have in mind with ${recipientName}...`}
              rows={5}
              required
              autoFocus
            />
          </div>

          <div className="modal-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={loading || !message.trim()}
            >
              {loading ? 'Sending...' : 'Send Request'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
