import { CheckCircle } from 'lucide-react';
import './AuthLeftPanel.css';

interface AuthLeftPanelProps {
  mode: 'login' | 'register';
}

export const AuthLeftPanel = ({ mode }: AuthLeftPanelProps) => {
  const benefits = [
    'Connect with 1,000+ premium brands worldwide',
    'AI-powered perfect match recommendations',
    'Secure collaboration management',
    'Track performance and grow together'
  ];

  const trustMetrics = [
    { number: '10,000+', label: 'Active Users' },
    { number: '500+', label: 'Collaborations' },
    { number: '4.8/5', label: 'Rating' }
  ];

  return (
    <div className="auth-left-panel">
      <div className="auth-left-content">
        <div className="auth-logo">
          <div className="logo-text">InfluencerMatch</div>
        </div>
        
        <h1 className="auth-hero-title">
          Success starts here
        </h1>
        
        <p className="auth-hero-subtitle">
          {mode === 'login' 
            ? 'Welcome back! Continue your journey to meaningful partnerships'
            : 'Join thousands of successful collaborations between creators and brands'
          }
        </p>
        
        <ul className="auth-benefits-list">
          {benefits.map((benefit, index) => (
            <li key={index}>
              <CheckCircle className="benefit-icon" size={24} />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
        
        <div className="auth-trust-indicators">
          {trustMetrics.map((metric, index) => (
            <div key={index} className="trust-item">
              <span className="trust-number">{metric.number}</span>
              <span className="trust-label">{metric.label}</span>
            </div>
          ))}
        </div>
        
        <div className="auth-decorative-elements">
          <div className="floating-circle circle-1"></div>
          <div className="floating-circle circle-2"></div>
          <div className="floating-circle circle-3"></div>
        </div>
      </div>
    </div>
  );
};
