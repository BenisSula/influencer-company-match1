import React, { useState } from 'react';
import { HiX, HiChat, HiBriefcase, HiCalendar, HiCurrencyDollar, HiClipboardList } from 'react-icons/hi';
import { Button } from '../Button/Button';
import { useToast } from '../../contexts/ToastContext';
import { matchingService } from '../../services/matching.service';
import './CollaborationRequestModal.css';

export interface CollaborationRequestModalProps {
  recipientId: string;
  recipientName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const DELIVERABLES_OPTIONS = [
  'Instagram Post',
  'Instagram Story',
  'Instagram Reel',
  'TikTok Video',
  'YouTube Video',
  'YouTube Short',
  'Blog Post',
  'Product Review',
  'Unboxing Video',
  'Tutorial/How-To',
];

const PLATFORMS_OPTIONS = [
  'Instagram',
  'TikTok',
  'YouTube',
  'Twitter',
  'Facebook',
  'LinkedIn',
  'Pinterest',
  'Snapchat',
];

export const CollaborationRequestModal: React.FC<CollaborationRequestModalProps> = ({
  recipientId,
  recipientName,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [projectTitle, setProjectTitle] = useState('');
  const [message, setMessage] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [collaborationType, setCollaborationType] = useState('sponsored_post');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [timeline, setTimeline] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [deliverables, setDeliverables] = useState<string[]>([]);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [additionalNotes, setAdditionalNotes] = useState('');

  const toggleDeliverable = (item: string) => {
    if (deliverables.includes(item)) {
      setDeliverables(deliverables.filter(d => d !== item));
    } else {
      setDeliverables([...deliverables, item]);
    }
  };

  const togglePlatform = (platform: string) => {
    if (platforms.includes(platform)) {
      setPlatforms(platforms.filter(p => p !== platform));
    } else {
      setPlatforms([...platforms, platform]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('[CollaborationRequestModal] Submit triggered');
    console.log('[CollaborationRequestModal] Recipient:', { recipientId, recipientName });
    
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
        projectTitle: projectTitle.trim() || undefined,
        projectDescription: projectDescription.trim() || undefined,
        collaborationType,
        budgetMin: budgetMin ? parseFloat(budgetMin) : undefined,
        budgetMax: budgetMax ? parseFloat(budgetMax) : undefined,
        timeline: timeline.trim() || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        deliverables: deliverables.length > 0 ? deliverables : undefined,
        platforms: platforms.length > 0 ? platforms : undefined,
        additionalNotes: additionalNotes.trim() || undefined,
      };

      console.log('[CollaborationRequestModal] Sending request:', requestData);
      const response = await matchingService.createCollaborationRequest(requestData);
      console.log('[CollaborationRequestModal] Response received:', response);

      showToast(`Collaboration request sent to ${recipientName}!`, 'success');
      
      // Reset form
      setProjectTitle('');
      setMessage('');
      setProjectDescription('');
      setBudgetMin('');
      setBudgetMax('');
      setTimeline('');
      setStartDate('');
      setEndDate('');
      setDeliverables([]);
      setPlatforms([]);
      setAdditionalNotes('');
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
      <div className="collaboration-request-modal collaboration-request-modal-enhanced" onClick={(e) => e.stopPropagation()}>
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
          {/* Project Title */}
          <div className="form-section">
            <div className="form-section-title">
              <HiBriefcase size={20} />
              Project Information
            </div>
            
            <div className="form-group">
              <label htmlFor="projectTitle">
                Project Title (Optional)
              </label>
              <input
                type="text"
                id="projectTitle"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="e.g., Summer Product Launch Campaign"
              />
            </div>

            <div className="form-group">
              <label htmlFor="projectDescription">
                Project Description (Optional)
              </label>
              <textarea
                id="projectDescription"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Describe the project goals, target audience, and expected outcomes..."
                rows={3}
              />
            </div>
          </div>

          {/* Collaboration Type */}
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

          {/* Budget */}
          <div className="form-section">
            <div className="form-section-title">
              <HiCurrencyDollar size={20} />
              Budget & Timeline
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

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startDate">
                  <HiCalendar size={16} />
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="endDate">
                  <HiCalendar size={16} />
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Deliverables */}
          <div className="form-section">
            <div className="form-section-title">
              <HiClipboardList size={20} />
              Deliverables & Platforms
            </div>
            
            <div className="form-group">
              <label>Deliverables (Select all that apply)</label>
              <div className="checkbox-grid">
                {DELIVERABLES_OPTIONS.map(item => (
                  <label key={item} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={deliverables.includes(item)}
                      onChange={() => toggleDeliverable(item)}
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Platforms (Select all that apply)</label>
              <div className="checkbox-grid">
                {PLATFORMS_OPTIONS.map(platform => (
                  <label key={platform} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={platforms.includes(platform)}
                      onChange={() => togglePlatform(platform)}
                    />
                    <span>{platform}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Message */}
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
              rows={4}
              required
              autoFocus
            />
          </div>

          {/* Additional Notes */}
          <div className="form-group">
            <label htmlFor="additionalNotes">
              Additional Notes (Optional)
            </label>
            <textarea
              id="additionalNotes"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Any other requirements, brand guidelines, or information..."
              rows={2}
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
