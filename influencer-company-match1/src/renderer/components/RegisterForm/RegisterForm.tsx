import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, AlertCircle, User, Building } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { PasswordStrengthMeter } from '../PasswordStrengthMeter/PasswordStrengthMeter';
import { MultiStepRegister } from '../MultiStepRegister/MultiStepRegister';
import './RegisterForm.css';

// Feature flag for multi-step registration
const USE_MULTI_STEP_REGISTRATION = true;

export const RegisterForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  // If multi-step registration is enabled, use the new component
  if (USE_MULTI_STEP_REGISTRATION) {
    return <MultiStepRegister onSuccess={onSuccess} />;
  }

  // Otherwise, use the legacy single-page registration
  return <LegacyRegisterForm onSuccess={onSuccess} />;
};

const LegacyRegisterForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'INFLUENCER' | 'COMPANY'>('INFLUENCER');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!fullName.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (fullName.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (!agreeToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await register(email, password, role, fullName.trim());
      showToast(`Welcome, ${fullName}! 🎉`, 'success');
      
      // Call onSuccess if provided (for modal), otherwise navigate
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Registration failed. Please try again.';
      setError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form-header">
        <h2 className="auth-form-title">Create Your Account</h2>
        <p className="auth-form-subtitle">Join thousands of successful partnerships</p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        {error && (
          <div className="form-error-banner">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className="form-group">
          <label>I am a...</label>
          <div className="role-selector">
            <button
              type="button"
              className={`role-option ${role === 'INFLUENCER' ? 'active' : ''}`}
              onClick={() => setRole('INFLUENCER')}
              disabled={loading}
            >
              <User className="role-icon" size={24} />
              <div className="role-content">
                <div className="role-label">Influencer</div>
                <div className="role-description">Content creator</div>
              </div>
            </button>
            <button
              type="button"
              className={`role-option ${role === 'COMPANY' ? 'active' : ''}`}
              onClick={() => setRole('COMPANY')}
              disabled={loading}
            >
              <Building className="role-icon" size={24} />
              <div className="role-content">
                <div className="role-label">Company</div>
                <div className="role-description">Brand partner</div>
              </div>
            </button>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="register-fullname">Full Name</label>
          <div className="form-input-wrapper">
            <User className="input-icon" size={20} />
            <input
              id="register-fullname"
              type="text"
              className="form-input with-icon"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={loading}
              required
              autoComplete="name"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="register-email">Email Address</label>
          <div className="form-input-wrapper">
            <Mail className="input-icon" size={20} />
            <input
              id="register-email"
              type="email"
              className="form-input with-icon"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
              autoComplete="email"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="register-password">Password</label>
          <div className="form-input-wrapper">
            <Lock className="input-icon" size={20} />
            <input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              className="form-input with-icon with-action"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {password && <PasswordStrengthMeter password={password} />}
        </div>

        <div className="form-group">
          <label htmlFor="confirm-password">Confirm Password</label>
          <div className="form-input-wrapper">
            <Lock className="input-icon" size={20} />
            <input
              id="confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              className="form-input with-icon with-action"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              disabled={loading}
            />
            <span>
              I agree to the <a href="#" className="terms-link">Terms of Service</a> and{' '}
              <a href="#" className="terms-link">Privacy Policy</a>
            </span>
          </label>
        </div>

        <button
          type="submit"
          className="auth-submit-button"
          disabled={loading || !agreeToTerms}
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <div className="auth-divider">
        <span>OR</span>
      </div>

      <div className="social-login-buttons">
        <button type="button" className="social-login-button" disabled>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>
      </div>
    </div>
  );
};
