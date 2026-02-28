import React from 'react';
import { Input } from '../../Input/Input';

interface RoleSpecificStepProps {
  role: 'INFLUENCER' | 'COMPANY';
  data: {
    // Influencer fields
    niche?: string;
    audienceSize?: number;
    engagementRate?: number;
    platforms?: string[];
    // Company fields
    industry?: string;
    budget?: number;
    companySize?: string;
    website?: string;
    campaignType?: string[];
    preferredInfluencerNiches?: string;
    collaborationDuration?: string;
  };
  onChange: (field: string, value: any) => void;
  errors: Record<string, string>;
}

const PLATFORM_OPTIONS = [
  'Instagram',
  'TikTok',
  'YouTube',
  'Twitter',
  'Facebook',
  'LinkedIn',
  'Twitch',
  'Pinterest',
];

const COMPANY_SIZE_OPTIONS = [
  { value: '1-10 employees', label: '1-10 employees' },
  { value: '10-50 employees', label: '10-50 employees' },
  { value: '50-200 employees', label: '50-200 employees' },
  { value: '200-1000 employees', label: '200-1000 employees' },
  { value: '1000+ employees', label: '1000+ employees' },
];

const CAMPAIGN_TYPE_OPTIONS = [
  'Sponsored Posts',
  'Product Reviews',
  'Brand Partnerships',
  'Affiliate Marketing',
  'Event Coverage',
  'Content Creation',
  'Brand Ambassador',
  'Giveaways',
];

const COLLABORATION_DURATION_OPTIONS = [
  { value: '1-3 months', label: '1-3 months' },
  { value: '3-6 months', label: '3-6 months' },
  { value: '6-12 months', label: '6-12 months' },
  { value: '12+ months', label: '12+ months' },
  { value: 'Project-based', label: 'Project-based' },
];

export const RoleSpecificStep: React.FC<RoleSpecificStepProps> = ({
  role,
  data,
  onChange,
  errors,
}) => {
  const togglePlatform = (platform: string) => {
    const current = data.platforms || [];
    const updated = current.includes(platform)
      ? current.filter((p) => p !== platform)
      : [...current, platform];
    onChange('platforms', updated);
  };

  const toggleCampaignType = (type: string) => {
    const current = data.campaignType || [];
    const updated = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    onChange('campaignType', updated);
  };

  if (role === 'INFLUENCER') {
    return (
      <>
        <div className="form-group">
          <Input
            label="Niche / Category"
            placeholder="e.g., Fashion, Tech, Fitness"
            value={data.niche || ''}
            onChange={(e) => onChange('niche', e.target.value)}
            error={errors.niche}
            helperText="What type of content do you create?"
            fullWidth
            required
          />
        </div>

        <div className="form-group">
          <Input
            label="Audience Size"
            type="number"
            placeholder="e.g., 50000"
            value={data.audienceSize || ''}
            onChange={(e) => onChange('audienceSize', parseInt(e.target.value) || 0)}
            error={errors.audienceSize}
            helperText="Total followers across all platforms"
            fullWidth
          />
        </div>

        <div className="form-group">
          <Input
            label="Engagement Rate (%)"
            type="number"
            step="0.1"
            placeholder="e.g., 4.5"
            value={data.engagementRate || ''}
            onChange={(e) => onChange('engagementRate', parseFloat(e.target.value) || 0)}
            error={errors.engagementRate}
            helperText="Average engagement rate"
            fullWidth
          />
        </div>

        <div className="form-group">
          <label className="form-label">Platforms</label>
          <p className="form-helper-text">Select all platforms you're active on</p>
          <div className="platform-grid">
            {PLATFORM_OPTIONS.map((platform) => (
              <label key={platform} className="checkbox-option">
                <input
                  type="checkbox"
                  checked={(data.platforms || []).includes(platform)}
                  onChange={() => togglePlatform(platform)}
                />
                <span>{platform}</span>
              </label>
            ))}
          </div>
        </div>
      </>
    );
  }

  // Company fields
  return (
    <>
      <div className="form-group">
        <Input
          label="Industry"
          placeholder="e.g., E-commerce, SaaS, Fashion"
          value={data.industry || ''}
          onChange={(e) => onChange('industry', e.target.value)}
          error={errors.industry}
          helperText="What industry is your company in?"
          fullWidth
          required
        />
      </div>

      <div className="form-group">
        <Input
          label="Company Website"
          type="url"
          placeholder="e.g., www.yourcompany.com"
          value={data.website || ''}
          onChange={(e) => onChange('website', e.target.value)}
          error={errors.website}
          helperText="Your company website URL"
          fullWidth
        />
      </div>

      <div className="form-group">
        <Input
          label="Campaign Budget ($)"
          type="number"
          placeholder="e.g., 10000"
          value={data.budget || ''}
          onChange={(e) => onChange('budget', parseInt(e.target.value) || 0)}
          error={errors.budget}
          helperText="Average budget per campaign"
          fullWidth
        />
      </div>

      <div className="form-group">
        <label className="form-label">Company Size</label>
        <select
          className="form-select"
          value={data.companySize || ''}
          onChange={(e) => onChange('companySize', e.target.value)}
        >
          <option value="">Select company size</option>
          {COMPANY_SIZE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Campaign Types</label>
        <p className="form-helper-text">Select all types of campaigns you run</p>
        <div className="platform-grid">
          {CAMPAIGN_TYPE_OPTIONS.map((type) => (
            <label key={type} className="checkbox-option">
              <input
                type="checkbox"
                checked={(data.campaignType || []).includes(type)}
                onChange={() => toggleCampaignType(type)}
              />
              <span>{type}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Typical Collaboration Duration</label>
        <select
          className="form-select"
          value={data.collaborationDuration || ''}
          onChange={(e) => onChange('collaborationDuration', e.target.value)}
        >
          <option value="">Select duration</option>
          {COLLABORATION_DURATION_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <p className="form-helper-text">How long do your collaborations typically last?</p>
      </div>
    </>
  );
};
