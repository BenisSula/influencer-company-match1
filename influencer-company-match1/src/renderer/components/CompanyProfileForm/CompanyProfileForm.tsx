import React, { useState } from 'react';
import { Input } from '../Input/Input';
import { Button } from '../Button/Button';
import { Card, CardHeader, CardBody } from '../Card/Card';
import './CompanyProfileForm.css';

export interface CompanyProfileFormData {
  companyName?: string;
  industry?: string;
  location?: string;
  website?: string;
  description?: string;
  budget?: number;
  targetAudience?: string;
  companySize?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  campaignType?: string[];
  preferredInfluencerNiches?: string[];
  collaborationDuration?: 'short-term' | 'medium-term' | 'long-term';
}

export interface CompanyProfileFormProps {
  initialData?: CompanyProfileFormData;
  onSubmit: (data: CompanyProfileFormData) => void;
  onCancel?: () => void;
  loading?: boolean;
}

const COMPANY_SIZE_OPTIONS = [
  { value: 'startup', label: 'Startup (1-10 employees)' },
  { value: 'small', label: 'Small (11-50 employees)' },
  { value: 'medium', label: 'Medium (51-250 employees)' },
  { value: 'large', label: 'Large (251-1000 employees)' },
  { value: 'enterprise', label: 'Enterprise (1000+ employees)' },
];

const CAMPAIGN_TYPE_OPTIONS = [
  { value: 'product-launch', label: 'Product Launch' },
  { value: 'brand-awareness', label: 'Brand Awareness' },
  { value: 'event', label: 'Event Promotion' },
  { value: 'sponsored-content', label: 'Sponsored Content' },
  { value: 'affiliate', label: 'Affiliate Marketing' },
  { value: 'ugc', label: 'User-Generated Content' },
];

const NICHE_OPTIONS = [
  { value: 'fashion', label: 'Fashion' },
  { value: 'beauty', label: 'Beauty' },
  { value: 'tech', label: 'Technology' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'food', label: 'Food & Beverage' },
  { value: 'travel', label: 'Travel' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'finance', label: 'Finance' },
  { value: 'education', label: 'Education' },
];

const COLLABORATION_DURATION_OPTIONS = [
  { value: 'short-term', label: 'Short-Term (1-3 months)' },
  { value: 'medium-term', label: 'Medium-Term (3-6 months)' },
  { value: 'long-term', label: 'Long-Term (6+ months)' },
];

export const CompanyProfileForm: React.FC<CompanyProfileFormProps> = ({
  initialData = {},
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState<CompanyProfileFormData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof CompanyProfileFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleCampaignTypeToggle = (campaignType: string) => {
    const currentTypes = formData.campaignType || [];
    const newTypes = currentTypes.includes(campaignType)
      ? currentTypes.filter((t) => t !== campaignType)
      : [...currentTypes, campaignType];
    handleInputChange('campaignType', newTypes);
  };

  const handleNicheToggle = (niche: string) => {
    const currentNiches = formData.preferredInfluencerNiches || [];
    const newNiches = currentNiches.includes(niche)
      ? currentNiches.filter((n) => n !== niche)
      : [...currentNiches, niche];
    handleInputChange('preferredInfluencerNiches', newNiches);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.campaignType && formData.campaignType.length === 0) {
      newErrors.campaignType = 'Please select at least one campaign type';
    }

    if (formData.preferredInfluencerNiches && formData.preferredInfluencerNiches.length === 0) {
      newErrors.preferredInfluencerNiches = 'Please select at least one preferred niche';
    }

    if (formData.budget && formData.budget < 0) {
      newErrors.budget = 'Budget cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="company-profile-form">
      <Card>
        <CardHeader>
          <h2>Company Profile</h2>
        </CardHeader>
        <CardBody>
          {/* Basic Information */}
          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="form-row">
              <Input
                label="Company Name"
                value={formData.companyName || ''}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                placeholder="Your company name"
                fullWidth
              />
            </div>

            <div className="form-row">
              <Input
                label="Industry"
                value={formData.industry || ''}
                onChange={(e) => handleInputChange('industry', e.target.value)}
                placeholder="e.g., E-commerce, SaaS, Consumer Goods"
                fullWidth
              />
            </div>

            <div className="form-row">
              <Input
                label="Location"
                value={formData.location || ''}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="e.g., San Francisco, USA"
                fullWidth
              />
            </div>

            <div className="form-row">
              <Input
                label="Website"
                type="url"
                value={formData.website || ''}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://your-company.com"
                fullWidth
              />
            </div>

            <div className="form-row">
              <Input
                label="Description"
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Tell us about your company"
                fullWidth
              />
            </div>
          </div>

          {/* Company Size */}
          <div className="form-section">
            <h3>Company Size</h3>
            <p className="form-section-description">Select your company size</p>
            <div className="dropdown-wrapper">
              <select
                className="form-select"
                value={formData.companySize || ''}
                onChange={(e) => handleInputChange('companySize', e.target.value)}
              >
                <option value="">Select company size</option>
                {COMPANY_SIZE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Campaign Types */}
          <div className="form-section">
            <h3>Campaign Types</h3>
            <p className="form-section-description">Select the types of campaigns you run</p>
            <div className="checkbox-grid">
              {CAMPAIGN_TYPE_OPTIONS.map((option) => (
                <label key={option.value} className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={(formData.campaignType || []).includes(option.value)}
                    onChange={() => handleCampaignTypeToggle(option.value)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
            {errors.campaignType && <span className="error-text">{errors.campaignType}</span>}
          </div>

          {/* Preferred Influencer Niches */}
          <div className="form-section">
            <h3>Preferred Influencer Niches</h3>
            <p className="form-section-description">Select the niches you're interested in</p>
            <div className="checkbox-grid">
              {NICHE_OPTIONS.map((option) => (
                <label key={option.value} className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={(formData.preferredInfluencerNiches || []).includes(option.value)}
                    onChange={() => handleNicheToggle(option.value)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
            {errors.preferredInfluencerNiches && (
              <span className="error-text">{errors.preferredInfluencerNiches}</span>
            )}
          </div>

          {/* Collaboration Duration */}
          <div className="form-section">
            <h3>Collaboration Duration</h3>
            <p className="form-section-description">What is your preferred collaboration duration?</p>
            <div className="radio-group">
              {COLLABORATION_DURATION_OPTIONS.map((option) => (
                <label key={option.value} className="radio-option">
                  <input
                    type="radio"
                    name="collaborationDuration"
                    value={option.value}
                    checked={formData.collaborationDuration === option.value}
                    onChange={(e) => handleInputChange('collaborationDuration', e.target.value)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Budget & Target Audience */}
          <div className="form-section">
            <h3>Campaign Details</h3>
            <div className="form-row">
              <Input
                label="Budget ($)"
                type="number"
                value={formData.budget || ''}
                onChange={(e) => handleInputChange('budget', parseInt(e.target.value) || 0)}
                placeholder="Average campaign budget"
                error={errors.budget}
                fullWidth
              />
            </div>

            <div className="form-row">
              <Input
                label="Target Audience"
                value={formData.targetAudience || ''}
                onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                placeholder="e.g., Young professionals, 25-35, tech-savvy"
                fullWidth
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            {onCancel && (
              <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
                Cancel
              </Button>
            )}
            <Button type="submit" variant="primary" loading={loading}>
              Save Profile
            </Button>
          </div>
        </CardBody>
      </Card>
    </form>
  );
};
