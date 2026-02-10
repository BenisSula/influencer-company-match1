import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardBody, Button, Input } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import './Auth.css';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      showToast('Welcome back!', 'success');
      navigate('/');
    } catch (error: any) {
      showToast(error.message || 'Login failed. Please check your credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your account to continue</p>
        </div>

        <Card>
          <CardBody>
            <form onSubmit={handleSubmit} className="auth-form">
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
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="auth-footer">
              <p>
                Don't have an account?{' '}
                <Link to="/register" className="auth-link">
                  Sign up
                </Link>
              </p>
            </div>

            <div className="auth-demo">
              <p className="demo-title">Demo Accounts:</p>
              <div className="demo-accounts">
                <div className="demo-account">
                  <strong>Influencer:</strong>
                  <span>sarah.johnson@example.com</span>
                </div>
                <div className="demo-account">
                  <strong>Company:</strong>
                  <span>contact@styleco.com</span>
                </div>
                <div className="demo-password">
                  <strong>Password:</strong> password123
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
