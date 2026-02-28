import React from 'react';
import { Input } from '../../Input/Input';
import { useAuth } from '../../../contexts/AuthContext';

interface BasicInfoStepProps {
  data: {
    name: string;
    location: string;
  };
  onChange: (field: string, value: string) => void;
  errors: Record<string, string>;
}

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  data,
  onChange,
  errors,
}) => {
  const { user } = useAuth();
  const isInfluencer = user?.role === 'INFLUENCER';
  
  return (
    <>
      <div className="form-group">
        <Input
          label={isInfluencer ? "Full Name" : "Company Name"}
          placeholder={isInfluencer ? "Enter your full name" : "Enter your company name"}
          value={data.name}
          onChange={(e) => onChange('name', e.target.value)}
          error={errors.name}
          helperText={isInfluencer ? "Your professional name" : "Your company's official name"}
          fullWidth
          required
        />
      </div>

      <div className="form-group">
        <Input
          label="Location"
          placeholder="e.g., Los Angeles, CA"
          value={data.location}
          onChange={(e) => onChange('location', e.target.value)}
          error={errors.location}
          helperText={isInfluencer ? "Where are you based?" : "Your company's location"}
          fullWidth
        />
      </div>

      <div className="form-info-box">
        <p>
          <strong>💡 Tip:</strong> A complete profile helps you get better matches!
          You can always update this information later in your settings.
        </p>
      </div>
    </>
  );
};
