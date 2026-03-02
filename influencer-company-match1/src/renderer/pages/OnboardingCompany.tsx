import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './OnboardingCompany.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const OnboardingCompany = () => {
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
          `${API_URL}/payments/onboarding/company`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (data.message) {
          setMessage(data.message);
        }
      } catch (err: any) {
        console.error('Onboarding error:', err);
        setError(err.response?.data?.message || 'Onboarding failed. Please try again.');
      } finally {
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
          <h2>Setting up payment account...</h2>
          <p>Please wait while we configure your payment settings.</p>
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

  return (
    <div className="onboarding-container">
      <div className="onboarding-card success">
        <div className="success-icon">✓</div>
        <h2>Company Payment Setup Complete</h2>
        <p>{message}</p>
        {message === 'Already onboarded' && (
          <p className="info-text">Your payment account is already configured.</p>
        )}
        <p className="info-text">You can now send collaboration requests and make payments.</p>
        <button onClick={() => navigate('/dashboard')} className="btn-primary">
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};
