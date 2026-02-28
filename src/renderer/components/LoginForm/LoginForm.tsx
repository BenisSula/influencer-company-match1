import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import './LoginForm.css';

export const LoginForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      
      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }
      
      showToast('Welcome back!', 'success');
      
      // Call onSuccess if provided (for modal), otherwise navigate
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Login failed. Please check your credentials.';
      setError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    
    try {
      setLoading(true);
      await login(demoEmail, 'password123');
      showToast('Welcome! Using demo account', 'success');
      
      // Call onSuccess if provided (for modal), otherwise navigate
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Demo login failed';
      setError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form-header">
        <h2 className="auth-form-title">Welcome Back</h2>
        <p className="auth-form-subtitle">Sign in to continue your journey</p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        {error && (
          <div className="form-error-banner">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <div className="form-input-wrapper">
            <Mail className="input-icon" size={20} />
            <input
              id="email"
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
          <label htmlFor="password">Password</label>
          <div className="form-input-wrapper">
            <Lock className="input-icon" size={20} />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className="form-input with-icon with-action"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
              autoComplete="current-password"
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
        </div>

        <div className="form-options">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={loading}
            />
            <span>Remember me</span>
          </label>
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign In'}
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

      <div className="demo-accounts-section">
        <p className="demo-accounts-title">Try Demo Accounts:</p>
        <div className="demo-account-list">
          <button
            type="button"
            className="demo-account-button"
            onClick={() => handleDemoLogin('sarah.fashion@example.com')}
            disabled={loading}
          >
            <div className="demo-account-info">
              <span className="demo-account-label">Influencer</span>
              <span className="demo-account-email">sarah.fashion@example.com</span>
            </div>
            <span className="demo-account-arrow">→</span>
          </button>
          <button
            type="button"
            className="demo-account-button"
            onClick={() => handleDemoLogin('contact@techstartup.com')}
            disabled={loading}
          >
            <div className="demo-account-info">
              <span className="demo-account-label">Company</span>
              <span className="demo-account-email">contact@techstartup.com</span>
            </div>
            <span className="demo-account-arrow">→</span>
          </button>
        </div>
        <p className="demo-password-hint">Password: password123</p>
      </div>
    </div>
  );
};
