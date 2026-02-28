import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { campaignsService } from '../services/campaigns.service';
import { Campaign, CampaignFilters, CollaborationStatus } from '../types/campaign.types';
import { CampaignCard } from '../components/CampaignCard/CampaignCard';
import { Button } from '../components/Button/Button';
import {
  HiSearch,
  HiClipboardList,
  HiLightningBolt,
  HiBookmark,
  HiUserGroup,
  HiPlus,
} from 'react-icons/hi';
import './Campaigns.css';

type TabType = 'discover' | 'my-campaigns' | 'my-applications' | 'active' | 'saved';

interface TabConfig {
  id: TabType;
  label: string;
  icon: React.ReactNode;
}

export const Campaigns: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const isCompany = user?.role === 'COMPANY';

  // Define role-specific tabs
  const influencerTabs: TabConfig[] = [
    { id: 'discover', label: 'Discover', icon: <HiSearch size={18} /> },
    { id: 'my-applications', label: 'My Applications', icon: <HiClipboardList size={18} /> },
    { id: 'active', label: 'Active', icon: <HiLightningBolt size={18} /> },
    { id: 'saved', label: 'Saved', icon: <HiBookmark size={18} /> },
  ];

  const companyTabs: TabConfig[] = [
    { id: 'my-campaigns', label: 'My Campaigns', icon: <HiClipboardList size={18} /> },
    { id: 'my-applications', label: 'Applications', icon: <HiUserGroup size={18} /> },
    { id: 'active', label: 'Active', icon: <HiLightningBolt size={18} /> },
    { id: 'discover', label: 'Discover', icon: <HiSearch size={18} /> },
  ];

  const tabs = isCompany ? companyTabs : influencerTabs;
  const defaultTab = isCompany ? 'my-campaigns' : 'discover';

  const [activeTab, setActiveTab] = useState<TabType>(defaultTab);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<CampaignFilters>({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadCampaigns();
  }, [activeTab, filters]);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      let data: Campaign[];

      switch (activeTab) {
        case 'discover':
          data = await campaignsService.getCampaigns(filters);
          break;
        case 'my-campaigns':
          data = await campaignsService.getMyCampaigns();
          break;
        case 'my-applications':
          if (isCompany) {
            // For companies: show applications received
            const applications = await campaignsService.getReceivedApplications();
            data = applications.map((app) => app.campaign!).filter(Boolean);
          } else {
            // For influencers: show applications sent
            const applications = await campaignsService.getMyApplications();
            data = applications.map((app) => app.campaign!).filter(Boolean);
          }
          break;
        case 'active':
          // Get active collaborations
          const collaborations = await campaignsService.getMyCollaborations();
          const activeCollabs = collaborations.filter(
            (c) => c.status === CollaborationStatus.ACTIVE,
          );
          data = activeCollabs.map((c) => c.campaign!).filter(Boolean);
          break;
        case 'saved':
          // TODO: Implement saved campaigns
          data = [];
          break;
        default:
          data = await campaignsService.getCampaigns(filters);
      }

      setCampaigns(data);
    } catch (error: any) {
      console.error('Failed to load campaigns:', error);
      showToast(error.message || 'Failed to load campaigns', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (campaignId: string) => {
    navigate(`/campaigns/${campaignId}?apply=true`);
  };

  const handleEdit = (campaignId: string) => {
    navigate(`/campaigns/${campaignId}/edit`);
  };

  const handleFilterChange = (key: keyof CampaignFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  const getEmptyStateContent = () => {
    if (isCompany) {
      switch (activeTab) {
        case 'my-campaigns':
          return (
            <>
              <div className="empty-icon">
                <HiClipboardList size={64} />
              </div>
              <h3>No campaigns yet</h3>
              <p>Create your first campaign to find influencers</p>
              <Button variant="primary" size="lg" onClick={() => navigate('/campaigns/create')}>
                <HiPlus size={20} />
                Create Campaign
              </Button>
            </>
          );
        case 'my-applications':
          return (
            <>
              <div className="empty-icon">
                <HiUserGroup size={64} />
              </div>
              <h3>No applications yet</h3>
              <p>Create campaigns to receive applications from influencers</p>
              <Button variant="primary" size="lg" onClick={() => navigate('/campaigns/create')}>
                <HiPlus size={20} />
                Create Campaign
              </Button>
            </>
          );
        case 'active':
          return (
            <>
              <div className="empty-icon">
                <HiLightningBolt size={64} />
              </div>
              <h3>No active collaborations</h3>
              <p>Accept applications to start collaborations</p>
            </>
          );
        case 'discover':
          return (
            <>
              <div className="empty-icon">
                <HiSearch size={64} />
              </div>
              <h3>No campaigns found</h3>
              <p>Try adjusting your search criteria</p>
              <Button variant="secondary" size="md" onClick={clearFilters}>
                Clear Filters
              </Button>
            </>
          );
        default:
          return <p>No campaigns found</p>;
      }
    } else {
      // Influencer empty states
      switch (activeTab) {
        case 'discover':
          return (
            <>
              <div className="empty-icon">
                <HiSearch size={64} />
              </div>
              <h3>No campaigns match your filters</h3>
              <p>Try adjusting your search criteria</p>
              <Button variant="secondary" size="md" onClick={clearFilters}>
                Clear Filters
              </Button>
            </>
          );
        case 'my-applications':
          return (
            <>
              <div className="empty-icon">
                <HiClipboardList size={64} />
              </div>
              <h3>You haven't applied to any campaigns yet</h3>
              <p>Browse campaigns and start applying!</p>
              <Button variant="primary" size="lg" onClick={() => setActiveTab('discover')}>
                Discover Campaigns
              </Button>
            </>
          );
        case 'active':
          return (
            <>
              <div className="empty-icon">
                <HiLightningBolt size={64} />
              </div>
              <h3>No active collaborations</h3>
              <p>Apply to campaigns to start collaborations</p>
              <Button variant="primary" size="lg" onClick={() => setActiveTab('discover')}>
                Discover Campaigns
              </Button>
            </>
          );
        case 'saved':
          return (
            <>
              <div className="empty-icon">
                <HiBookmark size={64} />
              </div>
              <h3>No saved campaigns</h3>
              <p>Save campaigns to review them later</p>
              <Button variant="primary" size="lg" onClick={() => setActiveTab('discover')}>
                Discover Campaigns
              </Button>
            </>
          );
        default:
          return <p>No campaigns found</p>;
      }
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      campaign.title.toLowerCase().includes(query) ||
      campaign.description.toLowerCase().includes(query) ||
      campaign.company?.companyProfile?.companyName?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="campaigns-page">
      <div className="campaigns-header">
        <div className="campaigns-header-content">
          <h1>Campaigns</h1>
          {isCompany && (
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/campaigns/create')}
            >
              <HiPlus size={20} />
              Create Campaign
            </Button>
          )}
        </div>

        <div className="campaigns-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="campaigns-content">
        <aside className="campaigns-sidebar">
          <div className="filter-section">
            <h3>Filters</h3>

            <div className="filter-group">
              <label>Search</label>
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <label>Niche</label>
              <select
                value={filters.niche || ''}
                onChange={(e) => handleFilterChange('niche', e.target.value || undefined)}
                className="filter-select"
              >
                <option value="">All Niches</option>
                <option value="Fashion">Fashion</option>
                <option value="Beauty">Beauty</option>
                <option value="Fitness">Fitness</option>
                <option value="Food">Food</option>
                <option value="Travel">Travel</option>
                <option value="Tech">Tech</option>
                <option value="Gaming">Gaming</option>
                <option value="Lifestyle">Lifestyle</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Budget Range</label>
              <div className="budget-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.budgetMin || ''}
                  onChange={(e) => handleFilterChange('budgetMin', e.target.value ? Number(e.target.value) : undefined)}
                  className="filter-input"
                />
                <span>to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.budgetMax || ''}
                  onChange={(e) => handleFilterChange('budgetMax', e.target.value ? Number(e.target.value) : undefined)}
                  className="filter-input"
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Platforms</label>
              <div className="platform-checkboxes">
                {['Instagram', 'TikTok', 'YouTube', 'Twitter', 'Facebook'].map(platform => (
                  <label key={platform} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={filters.platforms?.includes(platform) || false}
                      onChange={(e) => {
                        const current = filters.platforms || [];
                        const updated = e.target.checked
                          ? [...current, platform]
                          : current.filter(p => p !== platform);
                        handleFilterChange('platforms', updated.length > 0 ? updated : undefined);
                      }}
                    />
                    {platform}
                  </label>
                ))}
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={clearFilters}
              style={{ width: '100%', marginTop: '16px' }}
            >
              Clear Filters
            </Button>
          </div>
        </aside>

        <main className="campaigns-main">
          {loading ? (
            <div className="campaigns-loading">
              <div className="spinner" />
              <p>Loading campaigns...</p>
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <div className="campaigns-empty">
              {getEmptyStateContent()}
            </div>
          ) : (
            <div className="campaigns-grid">
              {filteredCampaigns.map(campaign => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  onApply={handleApply}
                  onEdit={handleEdit}
                  isOwner={campaign.companyId === user?.id}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
