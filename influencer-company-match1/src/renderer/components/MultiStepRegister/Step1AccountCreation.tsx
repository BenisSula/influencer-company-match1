import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, AlertCircle, User, Building } from 'lucide-react';
import { PasswordStrengthMeter } from '../PasswordStrengthMeter/PasswordStrengthMeter';
import './Step1AccountCreation.css';

interface RegistrationFormData {
  role: 'INFLUENCER' | 'COMPANY';
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
  [key: string]: any;
}

interface Step1Props {
  data: RegistrationFormData;
  onChange: (data: RegistrationFormData) => void;
  onNext: () => void;
}

export const Step1AccountCreation = ({ data, onChange, onNext }: Step1Props) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!/[A-Z]/.test(pwd)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(pwd)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(pwd)) {
      return 'Password must contain at least one number';
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) {
      return 'Password must contain at least one special character';
    }
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!data.fullName.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (data.fullName.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    if (!data.email || !data.password || !data.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (!data.agreeToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    const passwordError = validatePassword(data.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (data.password !== data.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    onNext();
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form-header">
        <h2 className="auth-form-title">Create Your Account</h2>
        <p className="auth-form-subtitle">Join thousands of successful partnerships</p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        {/* Role Selection */}
        <div className="role-selector">
          <button
            type="button"
            className={`role-option ${data.role === 'INFLUENCER' ? 'active' : ''}`}
            onClick={() => onChange({ ...data, role: 'INFLUENCER' })}
          >
            <User size={24} />
            <div>
              <div className="role-title">Influencer</div>
              <div className="role-subtitle">Find brand partnerships</div>
            </div>
          </button>
          <button
            type="button"
            className={`role-option ${data.role === 'COMPANY' ? 'active' : ''}`}
            onClick={() => onChange({ ...data, role: 'COMPANY' })}
          >
            <Building size={24} />
            <div>
              <div className="role-title">Company</div>
              <div className="role-subtitle">Find influencers</div>
            </div>
          </button>
        </div>

        {/* Full Name */}
        <div className="form-group">
          <label htmlFor="fullName" className="form-label">
            Full Name
          </label>
          <div className="input-wrapper">
            <User className="input-icon" size={20} />
            <input
              id="fullName"
              type="text"
              className="form-input with-icon"
              placeholder="Enter your full name"
              value={data.fullName}
              onChange={(e) => onChange({ ...data, fullName: e.target.value })}
              required
            />
          </div>
        </div>

        {/* Email */}
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email Address
          </label>
          <div className="input-wrapper">
            <Mail className="input-icon" size={20} />
            <input
              id="email"
              type="email"
              className="form-input with-icon"
              placeholder="Enter your email"
              value={data.email}
              onChange={(e) => onChange({ ...data, email: e.target.value })}
              required
            />
          </div>
        </div>

        {/* Password */}
        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <div className="input-wrapper">
            <Lock className="input-icon" size={20} />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className="form-input with-icon with-action"
              placeholder="Create a strong password"
              value={data.password}
              onChange={(e) => onChange({ ...data, password: e.target.value })}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {data.password && <PasswordStrengthMeter password={data.password} />}
        </div>

        {/* Confirm Password */}
        <div className="form-group">
          <label htmlFor="confirmPassword" className="form-label">
            Confirm Password
          </label>
          <div className="input-wrapper">
            <Lock className="input-icon" size={20} />
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              className="form-input with-icon with-action"
              placeholder="Confirm your password"
              value={data.confirmPassword}
              onChange={(e) => onChange({ ...data, confirmPassword: e.target.value })}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Terms Agreement */}
        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={data.agreeToTerms}
              onChange={(e) => onChange({ ...data, agreeToTerms: e.target.checked })}
              required
            />
            <span>
              I agree to the{' '}
              <a href="/terms" target="_blank" rel="noopener noreferrer">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </a>
            </span>
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <button type="submit" className="submit-button">
          Continue
        </button>

        {/* Login Link */}
        <div className="form-footer">
          <p>
            Already have an account?{' '}
            <a href="/login" className="link">
              Sign in
            </a>
          </p>
        </div>
      </form>
    </div>
  );
};
