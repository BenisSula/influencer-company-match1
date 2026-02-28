import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './OnboardingInfluencer.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const OnboardingInfluencer = () => {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const onboard = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/auth');
          return;
        }

        const { data } = await axios.post(
          `${API_URL}/payments/onboarding/influencer`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (data.url) {
          // Redirect to Stripe onboarding
          window.location.href = data.url;
        } else if (data.message) {
          // Already onboarded
          setMessage(data.message);
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Onboarding error:', err);
        setError(err.response?.data?.message || 'Onboarding failed. Please try again.');
        setLoading(false);
      }
    };

    onboard();
  }, [navigate]);

  if (loading) {
    return (
      <div className="onboarding-container">
        <div className="onboarding-card">
          <div className="loading-spinner"></div>
          <h2>Redirecting to Stripe onboarding...</h2>
          <p>Please wait while we set up your payout account.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="onboarding-container">
        <div className="onboarding-card error">
          <h2>Onboarding Failed</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (message) {
    return (
      <div className="onboarding-container">
        <div className="onboarding-card success">
          <div className="success-icon">✓</div>
          <h2>Already Onboarded</h2>
          <p>Your payout account is already configured.</p>
          <p className="info-text">You can now accept collaborations and receive payments.</p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        <div className="loading-spinner"></div>
        <h2>Redirecting...</h2>
      </div>
    </div>
  );
};
