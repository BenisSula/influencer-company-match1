import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardBody, Button, Input } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import './Auth.css';

export const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'INFLUENCER' | 'COMPANY'>('INFLUENCER');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    if (password.length < 8) {
      showToast('Password must be at least 8 characters', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    try {
      setLoading(true);
      await register(email, password, role);
      showToast('Account created successfully!', 'success');
      navigate('/');
    } catch (error: any) {
      showToast(error.message || 'Registration failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          <h1>Create Account</h1>
          <p>Join our platform to connect and collaborate</p>
        </div>

        <Card>
          <CardBody>
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label>I am a...</label>
                <div className="role-selector">
                  <button
                    type="button"
                    className={`role-option ${role === 'INFLUENCER' ? 'active' : ''}`}
                    onClick={() => setRole('INFLUENCER')}
                    disabled={loading}
                  >
                    <div className="role-icon">👤</div>
                    <div className="role-label">Influencer</div>
                    <div className="role-description">Content creator looking for brand partnerships</div>
                  </button>
                  <button
                    type="button"
                    className={`role-option ${role === 'COMPANY' ? 'active' : ''}`}
                    onClick={() => setRole('COMPANY')}
                    disabled={loading}
                  >
                    <div className="role-icon">🏢</div>
                    <div className="role-label">Company</div>
                    <div className="role-description">Brand seeking influencer collaborations</div>
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>

            <div className="auth-footer">
              <p>
                Already have an account?{' '}
                <Link to="/login" className="auth-link">
                  Sign in
                </Link>
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
