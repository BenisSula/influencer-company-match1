import { useState } from 'react';
import { ArrowLeft, Sparkles, MapPin } from 'lucide-react';
import {
  NICHE_OPTIONS,
  PLATFORM_OPTIONS,
  AUDIENCE_SIZE_OPTIONS,
  INDUSTRY_OPTIONS,
  COMPANY_SIZE_OPTIONS,
  BUDGET_OPTIONS,
} from '../../constants/registration-options';
import './Step2RoleSpecific.css';

interface RegistrationFormData {
  role: 'INFLUENCER' | 'COMPANY';
  niche: string;
  primaryPlatform: string;
  audienceSizeRange: string;
  industry: string;
  companySize: string;
  budgetRange: string;
  location: string;
  [key: string]: any;
}

interface Step2Props {
  role: 'INFLUENCER' | 'COMPANY';
  data: RegistrationFormData;
  onChange: (data: RegistrationFormData) => void;
  onBack: () => void;
  onSubmit: () => void;
  onSkip: () => void;
}

export const Step2RoleSpecific = ({ role, data, onChange, onBack, onSubmit, onSkip }: Step2Props) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit();
    setLoading(false);
  };

  const handleSkip = async () => {
    setLoading(true);
    await onSkip();
    setLoading(false);
  };

  if (role === 'INFLUENCER') {
    return (
      <div className="auth-form-container">
        <div className="auth-form-header">
          <h2 className="auth-form-title">
            <Sparkles size={24} className="title-icon" />
            Tell us about yourself
          </h2>
          <p className="auth-form-subtitle">
            Help us find the perfect brand partnerships for you
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Niche */}
          <div className="form-group">
            <label htmlFor="niche" className="form-label">
              What's your niche? <span className="required">*</span>
            </label>
            <select
              id="niche"
              className="form-select"
              value={data.niche}
              onChange={(e) => onChange({ ...data, niche: e.target.value })}
              required
            >
              <option value="">Select your niche</option>
              {NICHE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Primary Platform */}
          <div className="form-group">
            <label htmlFor="primaryPlatform" className="form-label">
              Primary platform <span className="required">*</span>
            </label>
            <select
              id="primaryPlatform"
              className="form-select"
              value={data.primaryPlatform}
              onChange={(e) => onChange({ ...data, primaryPlatform: e.target.value })}
              required
            >
              <option value="">Select your main platform</option>
              {PLATFORM_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Audience Size */}
          <div className="form-group">
            <label htmlFor="audienceSizeRange" className="form-label">
              Audience size <span className="required">*</span>
            </label>
            <select
              id="audienceSizeRange"
              className="form-select"
              value={data.audienceSizeRange}
              onChange={(e) => onChange({ ...data, audienceSizeRange: e.target.value })}
              required
            >
              <option value="">Select your audience size</option>
              {AUDIENCE_SIZE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div className="form-group">
            <label htmlFor="location" className="form-label">
              Location <span className="optional">(optional)</span>
            </label>
            <div className="input-wrapper">
              <MapPin className="input-icon" size={20} />
              <input
                id="location"
                type="text"
                className="form-input with-icon"
                placeholder="City, Country"
                value={data.location}
                onChange={(e) => onChange({ ...data, location: e.target.value })}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="step-actions">
            <button type="button" className="back-button" onClick={onBack}>
              <ArrowLeft size={20} />
              Back
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={loading || !data.niche || !data.primaryPlatform || !data.audienceSizeRange}
            >
              {loading ? 'Creating account...' : 'Get Started'}
            </button>
          </div>

          {/* Skip Option */}
          <div className="form-footer">
            <button type="button" className="skip-button" onClick={handleSkip} disabled={loading}>
              Skip for now
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Company Form
  return (
    <div className="auth-form-container">
      <div className="auth-form-header">
        <h2 className="auth-form-title">
          <Sparkles size={24} className="title-icon" />
          Tell us about your company
        </h2>
        <p className="auth-form-subtitle">
          Help us find the perfect influencers for your campaigns
        </p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        {/* Industry */}
        <div className="form-group">
          <label htmlFor="industry" className="form-label">
            Industry <span className="required">*</span>
          </label>
          <select
            id="industry"
            className="form-select"
            value={data.industry}
            onChange={(e) => onChange({ ...data, industry: e.target.value })}
            required
          >
            <option value="">Select your industry</option>
            {INDUSTRY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Company Size */}
        <div className="form-group">
          <label htmlFor="companySize" className="form-label">
            Company size <span className="required">*</span>
          </label>
          <select
            id="companySize"
            className="form-select"
            value={data.companySize}
            onChange={(e) => onChange({ ...data, companySize: e.target.value })}
            required
          >
            <option value="">Select company size</option>
            {COMPANY_SIZE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Marketing Budget */}
        <div className="form-group">
          <label htmlFor="budgetRange" className="form-label">
            Marketing budget <span className="required">*</span>
          </label>
          <select
            id="budgetRange"
            className="form-select"
            value={data.budgetRange}
            onChange={(e) => onChange({ ...data, budgetRange: e.target.value })}
            required
          >
            <option value="">Select budget range</option>
            {BUDGET_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div className="form-group">
          <label htmlFor="location" className="form-label">
            Location <span className="optional">(optional)</span>
          </label>
          <div className="input-wrapper">
            <MapPin className="input-icon" size={20} />
            <input
              id="location"
              type="text"
              className="form-input with-icon"
              placeholder="City, Country"
              value={data.location}
              onChange={(e) => onChange({ ...data, location: e.target.value })}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="step-actions">
          <button type="button" className="back-button" onClick={onBack}>
            <ArrowLeft size={20} />
            Back
          </button>
          <button
            type="submit"
            className="submit-button"
            disabled={loading || !data.industry || !data.companySize || !data.budgetRange}
          >
            {loading ? 'Creating account...' : 'Get Started'}
          </button>
        </div>

        {/* Skip Option */}
        <div className="form-footer">
          <button type="button" className="skip-button" onClick={handleSkip} disabled={loading}>
            Skip for now
          </button>
        </div>
      </form>
    </div>
  );
};
