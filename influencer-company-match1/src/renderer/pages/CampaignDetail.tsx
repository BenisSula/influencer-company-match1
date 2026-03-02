import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { campaignsService } from '../services/campaigns.service';
import { Campaign, CampaignStatus, ApplicationStatus } from '../types/campaign.types';
import { Avatar } from '../components/Avatar/Avatar';
import { Button } from '../components/Button/Button';
import { ApplicationModal } from '../components/ApplicationModal/ApplicationModal';
import { HiMail } from 'react-icons/hi';
import './CampaignDetail.css';

export const CampaignDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [userApplication, setUserApplication] = useState<any>(null);

  const isOwner = campaign?.companyId === user?.id;
  const isCompany = user?.role === 'COMPANY';

  useEffect(() => {
    if (id) {
      loadCampaign();
      if (!isCompany) {
        checkApplicationStatus();
      }
    }
  }, [id]);

  useEffect(() => {
    if (searchParams.get('apply') === 'true' && campaign && !hasApplied) {
      setShowApplicationModal(true);
    }
  }, [searchParams, campaign, hasApplied]);

  const loadCampaign = async () => {
    try {
      setLoading(true);
      const data = await campaignsService.getCampaignById(id!);
      setCampaign(data);
    } catch (error: any) {
      console.error('Failed to load campaign:', error);
      showToast(error.message || 'Failed to load campaign', 'error');
      navigate('/campaigns');
    } finally {
      setLoading(false);
    }
  };

  const checkApplicationStatus = async () => {
    try {
      const applications = await campaignsService.getMyApplications();
      const application = applications.find(app => app.campaignId === id);
      if (application) {
        setHasApplied(true);
        setUserApplication(application);
      }
    } catch (error) {
      console.error('Failed to check application status:', error);
    }
  };

  const handleApplicationSubmit = async () => {
    setShowApplicationModal(false);
    await checkApplicationStatus();
    showToast('Application submitted successfully!', 'success');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatBudget = () => {
    if (!campaign) return '';
    if (!campaign.budgetMin && !campaign.budgetMax) return 'Budget not specified';
    if (campaign.budgetMin && campaign.budgetMax) {
      return `$${campaign.budgetMin.toLocaleString()} - $${campaign.budgetMax.toLocaleString()}`;
    }
    if (campaign.budgetMin) return `From $${campaign.budgetMin.toLocaleString()}`;
    if (campaign.budgetMax) return `Up to $${campaign.budgetMax.toLocaleString()}`;
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

  const getApplicationStatusBadge = (status: ApplicationStatus) => {
    const badges = {
      [ApplicationStatus.PENDING]: { label: 'Pending Review', className: 'app-status-pending' },
      [ApplicationStatus.ACCEPTED]: { label: 'Accepted', className: 'app-status-accepted' },
      [ApplicationStatus.REJECTED]: { label: 'Rejected', className: 'app-status-rejected' },
      [ApplicationStatus.WITHDRAWN]: { label: 'Withdrawn', className: 'app-status-withdrawn' },
    };
    return badges[status];
  };

  if (loading) {
    return (
      <div className="campaign-detail-loading">
        <div className="spinner" />
        <p>Loading campaign...</p>
      </div>
    );
  }

  if (!campaign) {
    return null;
  }

  const statusBadge = getStatusBadge(campaign.status);

  return (
    <div className="campaign-detail-page">
      <div className="campaign-detail-container">
        {/* Header */}
        <div className="campaign-detail-header">
          <button className="back-button" onClick={() => navigate('/campaigns')}>
            ← Back to Campaigns
          </button>
          <div className="campaign-header-content">
            <div className="campaign-header-left">
              <h1>{campaign.title}</h1>
              <span className={`campaign-status-badge ${statusBadge.className}`}>
                {statusBadge.label}
              </span>
            </div>
            <div className="campaign-header-actions">
              {isOwner ? (
                <>
                  <Button
                    variant="secondary"
                    onClick={() => navigate(`/campaigns/${id}/edit`)}
                  >
                    Edit Campaign
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => navigate(`/campaigns/${id}/applications`)}
                  >
                    View Applications ({campaign.applications?.length || 0})
                  </Button>
                </>
              ) : hasApplied ? (
                <div className="application-status">
                  <span className={`app-status-badge ${getApplicationStatusBadge(userApplication.status).className}`}>
                    {getApplicationStatusBadge(userApplication.status).label}
                  </span>
                  {userApplication.status === ApplicationStatus.PENDING && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        // TODO: Implement withdraw
                      }}
                    >
                      Withdraw Application
                    </Button>
                  )}
                </div>
              ) : campaign.status === CampaignStatus.ACTIVE ? (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setShowApplicationModal(true)}
                >
                  Apply Now
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        {/* Company Info */}
        <div className="campaign-company-section">
          <Avatar
            src={campaign.company?.companyProfile?.avatarUrl}
            alt={campaign.company?.companyProfile?.companyName || 'Company'}
            size="lg"
          />
          <div className="company-info">
            <h3>{campaign.company?.companyProfile?.companyName || 'Company'}</h3>
            <p>{campaign.company?.companyProfile?.industry}</p>
          </div>
          <div className="company-actions">
            <Button
              variant="secondary"
              onClick={() => navigate(`/profile/${campaign.companyId}`)}
            >
              View Profile
            </Button>
            {!isOwner && (
              <Button
                variant="secondary"
                onClick={() => navigate('/messages', {
                  state: {
                    recipientId: campaign.companyId,
                    recipientName: campaign.company?.companyProfile?.companyName,
                    context: 'campaign',
                    contextData: {
                      campaignId: campaign.id,
                      campaignTitle: campaign.title
                    }
                  }
                })}
              >
                <HiMail size={18} />
                Message
              </Button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="campaign-detail-content">
          {/* Description */}
          <section className="campaign-section">
            <h2>About This Campaign</h2>
            <p className="campaign-description">{campaign.description}</p>
          </section>

          {/* Requirements */}
          {campaign.requirements && (
            <section className="campaign-section">
              <h2>Requirements & Goals</h2>
              <p className="campaign-requirements">{campaign.requirements}</p>
            </section>
          )}

          {/* Details Grid */}
          <section className="campaign-section">
            <h2>Campaign Details</h2>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Budget</span>
                <span className="detail-value">{formatBudget()}</span>
              </div>
              {campaign.niche && (
                <div className="detail-item">
                  <span className="detail-label">Niche</span>
                  <span className="detail-value">{campaign.niche}</span>
                </div>
              )}
              {campaign.platforms && campaign.platforms.length > 0 && (
                <div className="detail-item">
                  <span className="detail-label">Platforms</span>
                  <div className="platforms-list">
                    {campaign.platforms.map(platform => (
                      <span key={platform} className="platform-tag">{platform}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="detail-item">
                <span className="detail-label">Start Date</span>
                <span className="detail-value">{formatDate(campaign.startDate)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">End Date</span>
                <span className="detail-value">{formatDate(campaign.endDate)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Application Deadline</span>
                <span className="detail-value">{formatDate(campaign.applicationDeadline)}</span>
              </div>
            </div>
          </section>

          {/* Deliverables */}
          {campaign.deliverables && (
            <section className="campaign-section">
              <h2>Expected Deliverables</h2>
              <p className="campaign-deliverables">{campaign.deliverables}</p>
            </section>
          )}
        </div>
      </div>

      {/* Application Modal */}
      {showApplicationModal && (
        <ApplicationModal
          campaign={campaign}
          onClose={() => setShowApplicationModal(false)}
          onSubmit={handleApplicationSubmit}
        />
      )}
    </div>
  );
};
