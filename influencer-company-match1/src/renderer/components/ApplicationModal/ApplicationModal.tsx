import React, { useState } from 'react';
import { Campaign } from '../../types/campaign.types';
import { campaignsService } from '../../services/campaigns.service';
import { Button } from '../Button/Button';
import './ApplicationModal.css';

interface ApplicationModalProps {
  campaign: Campaign;
  onClose: () => void;
  onSubmit: () => void;
}

export const ApplicationModal: React.FC<ApplicationModalProps> = ({
  campaign,
  onClose,
  onSubmit,
}) => {
  const [proposal, setProposal] = useState('');
  const [proposedRate, setProposedRate] = useState<number | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!proposal || proposal.length < 50) {
      newErrors.proposal = 'Proposal must be at least 50 characters';
    }

    if (proposedRate !== undefined && proposedRate < 0) {
      newErrors.proposedRate = 'Rate must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setSubmitting(true);
      await campaignsService.applyCampaign(campaign.id, {
        proposal,
        proposedRate,
      });
      onSubmit();
    } catch (error: any) {
      console.error('Failed to submit application:', error);
      setErrors({ submit: error.message || 'Failed to submit application' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="application-modal-overlay" onClick={handleOverlayClick}>
      <div className="application-modal">
        <div className="modal-header">
          <h2>Apply to Campaign</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="campaign-summary">
            <h3>{campaign.title}</h3>
            <p className="campaign-company">
              {campaign.company?.companyProfile?.companyName}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="proposal">
                Your Proposal *
                <span className="char-count">
                  {proposal.length} / 50 minimum
                </span>
              </label>
              <textarea
                id="proposal"
                value={proposal}
                onChange={(e) => {
                  setProposal(e.target.value);
                  if (errors.proposal) {
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.proposal;
                      return newErrors;
                    });
                  }
                }}
                placeholder="Explain why you're a great fit for this campaign. Include your relevant experience, audience demographics, and how you plan to deliver results..."
                rows={8}
                className={errors.proposal ? 'error' : ''}
              />
              {errors.proposal && (
                <span className="error-message">{errors.proposal}</span>
              )}
              <small>
                Share your ideas, relevant experience, and what makes you the perfect
                match for this campaign.
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="proposedRate">
                Your Rate (Optional)
              </label>
              <div className="rate-input-wrapper">
                <span className="currency-symbol">$</span>
                <input
                  id="proposedRate"
                  type="number"
                  value={proposedRate || ''}
                  onChange={(e) => {
                    setProposedRate(
                      e.target.value ? Number(e.target.value) : undefined
                    );
                    if (errors.proposedRate) {
                      setErrors((prev) => {
                        const newErrors = { ...prev };
                        delete newErrors.proposedRate;
                        return newErrors;
                      });
                    }
                  }}
                  placeholder="Enter your rate"
                  className={errors.proposedRate ? 'error' : ''}
                  min="0"
                />
              </div>
              {errors.proposedRate && (
                <span className="error-message">{errors.proposedRate}</span>
              )}
              <small>
                {campaign.budgetMin && campaign.budgetMax
                  ? `Campaign budget: $${campaign.budgetMin.toLocaleString()} - $${campaign.budgetMax.toLocaleString()}`
                  : 'Suggest your rate for this campaign'}
              </small>
            </div>

            {errors.submit && (
              <div className="submit-error">{errors.submit}</div>
            )}

            <div className="modal-actions">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
