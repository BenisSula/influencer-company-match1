import React from 'react';
import { Input } from '../../Input/Input';

interface PreferencesStepProps {
  role: 'INFLUENCER' | 'COMPANY';
  data: {
    // Influencer preferences
    minBudget?: number;
    maxBudget?: number;
    collaborationPreference?: string;
    // Company preferences
    minAudienceSize?: number;
    maxAudienceSize?: number;
    preferredInfluencerNiches?: string;
  };
  onChange: (field: string, value: any) => void;
  errors: Record<string, string>;
}

const NICHE_OPTIONS = [
  'Fashion',
  'Beauty',
  'Technology',
  'Fitness',
  'Food',
  'Travel',
  'Lifestyle',
  'Gaming',
  'Finance',
  'Education',
  'Health',
  'Parenting',
];

export const PreferencesStep: React.FC<PreferencesStepProps> = ({
  role,
  data,
  onChange,
  errors,
}) => {
  const toggleNiche = (niche: string) => {
    const current = data.preferredInfluencerNiches 
      ? data.preferredInfluencerNiches.split(',').map(n => n.trim()).filter(n => n) 
      : [];
    const updated = current.includes(niche)
      ? current.filter((n) => n !== niche)
      : [...current, niche];
    onChange('preferredInfluencerNiches', updated.join(','));
  };

  if (role === 'INFLUENCER') {
    return (
      <>
        <div className="form-group">
          <label className="form-label">Budget Range</label>
          <p className="form-helper-text">
            What's your preferred budget range for collaborations?
          </p>
          <div className="form-row-group">
            <Input
              label="Minimum ($)"
              type="number"
              placeholder="e.g., 1000"
              value={data.minBudget || ''}
              onChange={(e) => onChange('minBudget', parseInt(e.target.value) || 0)}
              error={errors.minBudget}
            />
            <Input
              label="Maximum ($)"
              type="number"
              placeholder="e.g., 10000"
              value={data.maxBudget || ''}
              onChange={(e) => onChange('maxBudget', parseInt(e.target.value) || 0)}
              error={errors.maxBudget}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Collaboration Preference</label>
          <select
            className="form-select"
            value={data.collaborationPreference || ''}
            onChange={(e) => onChange('collaborationPreference', e.target.value)}
          >
            <option value="">Select preference</option>
            <option value="short-term">Short-term (1-3 months)</option>
            <option value="medium-term">Medium-term (3-6 months)</option>
            <option value="long-term">Long-term (6+ months)</option>
            <option value="flexible">Flexible</option>
          </select>
        </div>

        <div className="form-info-box">
          <p>
            <strong>✨ Perfect!</strong> We'll use these preferences to find the
            best brand matches for you.
          </p>
        </div>
      </>
    );
  }

  // Company preferences
  return (
    <>
      <div className="form-group">
        <label className="form-label">Preferred Audience Size</label>
        <p className="form-helper-text">
          What audience size are you looking for in influencers?
        </p>
        <div className="form-row-group">
          <Input
            label="Minimum"
            type="number"
            placeholder="e.g., 10000"
            value={data.minAudienceSize || ''}
            onChange={(e) => onChange('minAudienceSize', parseInt(e.target.value) || 0)}
            error={errors.minAudienceSize}
          />
          <Input
            label="Maximum"
            type="number"
            placeholder="e.g., 1000000"
            value={data.maxAudienceSize || ''}
            onChange={(e) => onChange('maxAudienceSize', parseInt(e.target.value) || 0)}
            error={errors.maxAudienceSize}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Preferred Influencer Niches</label>
        <p className="form-helper-text">
          Select the niches you're interested in
        </p>
        <div className="platform-grid">
          {NICHE_OPTIONS.map((niche) => (
            <label key={niche} className="checkbox-option">
              <input
                type="checkbox"
                checked={(data.preferredInfluencerNiches || '').split(',').map(n => n.trim()).includes(niche)}
                onChange={() => toggleNiche(niche)}
              />
              <span>{niche}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="form-info-box">
        <p>
          <strong>🎯 Great!</strong> We'll match you with influencers that fit
          your criteria.
        </p>
      </div>
    </>
  );
};
