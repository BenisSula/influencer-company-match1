import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Campaign, CampaignStatus } from '../../types/campaign.types';
import { Avatar } from '../Avatar/Avatar';
import { Button } from '../Button/Button';
import { HiMail } from 'react-icons/hi';
import './CampaignCard.css';

interface CampaignCardProps {
  campaign: Campaign;
  onApply?: (campaignId: string) => void;
  onEdit?: (campaignId: string) => void;
  showActions?: boolean;
  isOwner?: boolean;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  onApply,
  onEdit,
  showActions = true,
  isOwner = false,
}) => {
  const navigate = useNavigate();

  const handleMessageCompany = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/messages', {
      state: {
        recipientId: campaign.companyId,
        recipientName: campaign.company?.companyProfile?.companyName || 'Company',
        context: 'campaign',
        contextData: {
          campaignId: campaign.id,
          campaignTitle: campaign.title
        }
      }
    });
  };

  const getStatusBadge = (status: CampaignStatus) => {
    const badges = {
      [CampaignStatus.DRAFT]: { label: 'Draft', className: 'status-draft' },
      [CampaignStatus.ACTIVE]: { label: 'Active', className: 'status-active' },
      [CampaignStatus.CLOSED]: { label: 'Closed', className: 'status-closed' },
      [CampaignStatus.COMPLETED]: { label: 'Completed', className: 'status-completed' },
    };
    return badges[status];
  };

  const formatBudget = () => {
    if (!campaign.budgetMin && !campaign.budgetMax) return 'Budget not specified';
    if (campaign.budgetMin && campaign.budgetMax) {
      return `$${campaign.budgetMin.toLocaleString()} - $${campaign.budgetMax.toLocaleString()}`;
    }
    if (campaign.budgetMin) return `From $${campaign.budgetMin.toLocaleString()}`;
    if (campaign.budgetMax) return `Up to $${campaign.budgetMax.toLocaleString()}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isDeadlineSoon = () => {
    if (!campaign.applicationDeadline) return false;
    const deadline = new Date(campaign.applicationDeadline);
    const now = new Date();
    const daysUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil <= 7 && daysUntil > 0;
  };

  const statusBadge = getStatusBadge(campaign.status);

  return (
    <div className="campaign-card" onClick={() => navigate(`/campaigns/${campaign.id}`)}>
      <div className="campaign-card-header">
        <div className="campaign-company-info">
          <Avatar
            src={campaign.company?.companyProfile?.avatarUrl}
            alt={campaign.company?.companyProfile?.companyName || 'Company'}
            size="md"
          />
          <div className="campaign-company-details">
            <h4>{campaign.company?.companyProfile?.companyName || 'Company'}</h4>
            <span className="campaign-company-industry">
              {campaign.company?.companyProfile?.industry}
            </span>
          </div>
        </div>
        <span className={`campaign-status-badge ${statusBadge.className}`}>
          {statusBadge.label}
        </span>
      </div>

      <div className="campaign-card-body">
        <h3 className="campaign-title">{campaign.title}</h3>
        <p className="campaign-description">
          {campaign.description.length > 150
            ? `${campaign.description.substring(0, 150)}...`
            : campaign.description}
        </p>

        <div className="campaign-meta">
          {campaign.niche && (
            <div className="campaign-meta-item">
              <span className="meta-label">Niche:</span>
              <span className="meta-value">{campaign.niche}</span>
            </div>
          )}

          {campaign.platforms && campaign.platforms.length > 0 && (
            <div className="campaign-meta-item">
              <span className="meta-label">Platforms:</span>
              <div className="campaign-platforms">
                {campaign.platforms.map((platform) => (
                  <span key={platform} className="platform-tag">
                    {platform}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="campaign-meta-item">
            <span className="meta-label">Budget:</span>
            <span className="meta-value budget">{formatBudget()}</span>
          </div>

          {campaign.applicationDeadline && (
            <div className="campaign-meta-item">
              <span className="meta-label">Apply by:</span>
              <span className={`meta-value ${isDeadlineSoon() ? 'deadline-soon' : ''}`}>
                {formatDate(campaign.applicationDeadline)}
                {isDeadlineSoon() && ' ⚠️'}
              </span>
            </div>
          )}
        </div>
      </div>

      {showActions && (
        <div className="campaign-card-actions" onClick={(e) => e.stopPropagation()}>
          {isOwner ? (
            <>
              <Button
                variant="secondary"
                size="md"
                onClick={() => onEdit?.(campaign.id)}
              >
                Edit Campaign
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate(`/campaigns/${campaign.id}/applications`)}
              >
                View Applications
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="secondary"
                size="md"
                onClick={handleMessageCompany}
              >
                <HiMail size={18} />
                Message Company
              </Button>
              {campaign.status === CampaignStatus.ACTIVE && (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => onApply?.(campaign.id)}
                >
                  Apply Now
                </Button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
