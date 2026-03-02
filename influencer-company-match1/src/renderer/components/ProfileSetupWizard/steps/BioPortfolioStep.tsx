import React from 'react';
import { Input } from '../../Input/Input';

interface BioPortfolioStepProps {
  data: {
    bio: string;
    website?: string;
    portfolioUrl?: string;
  };
  onChange: (field: string, value: string) => void;
  errors: Record<string, string>;
}

export const BioPortfolioStep: React.FC<BioPortfolioStepProps> = ({
  data,
  onChange,
  errors,
}) => {
  return (
    <>
      <div className="form-group">
        <label className="form-label">Bio / Description</label>
        <textarea
          className="form-textarea"
          placeholder="Tell us about yourself or your company..."
          value={data.bio}
          onChange={(e) => onChange('bio', e.target.value)}
          rows={5}
          maxLength={500}
        />
        {errors.bio && <span className="input-error-text">{errors.bio}</span>}
        <span className="form-helper-text">
          {data.bio.length}/500 characters
        </span>
      </div>

      <div className="form-group">
        <Input
          label="Website"
          type="url"
          placeholder="https://yourwebsite.com"
          value={data.website || ''}
          onChange={(e) => onChange('website', e.target.value)}
          error={errors.website}
          helperText="Your personal or company website"
          fullWidth
        />
      </div>

      <div className="form-group">
        <Input
          label="Portfolio / Media Kit URL"
          type="url"
          placeholder="https://portfolio.com/yourname"
          value={data.portfolioUrl || ''}
          onChange={(e) => onChange('portfolioUrl', e.target.value)}
          error={errors.portfolioUrl}
          helperText="Link to your portfolio or media kit"
          fullWidth
        />
      </div>

      <div className="form-info-box">
        <p>
          <strong>📸 Coming Soon:</strong> You'll be able to upload images and
          create a portfolio gallery directly on the platform!
        </p>
      </div>
    </>
  );
};
