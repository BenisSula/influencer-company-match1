import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './PaymentSuccess.css';

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const collaborationId = searchParams.get('collaboration');

  useEffect(() => {
    // Optional: Track payment success event
    console.log('Payment successful for collaboration:', collaborationId);
  }, [collaborationId]);

  return (
    <div className="payment-success-page">
      <div className="success-container">
        <div className="success-icon">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="32" fill="#00ba7c" fillOpacity="0.1"/>
            <circle cx="32" cy="32" r="28" fill="#00ba7c" fillOpacity="0.2"/>
            <path
              d="M20 32l8 8 16-16"
              stroke="#00ba7c"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1>Payment Successful!</h1>
        <p className="success-message">
          Your payment has been processed successfully. The funds are now held in escrow
          and will be released to the influencer upon completion of the collaboration.
        </p>

        <div className="next-steps">
          <h3>What happens next?</h3>
          <ul>
            <li>
              <span className="step-number">1</span>
              <span className="step-text">
                The influencer has been notified and can now begin work
              </span>
            </li>
            <li>
              <span className="step-number">2</span>
              <span className="step-text">
                Track progress through your collaboration dashboard
              </span>
            </li>
            <li>
              <span className="step-number">3</span>
              <span className="step-text">
                Funds will be released automatically when milestones are completed
              </span>
            </li>
          </ul>
        </div>

        <div className="action-buttons">
          <button
            onClick={() => navigate(`/collaborations/${collaborationId}`)}
            className="primary-button"
          >
            View Collaboration
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="secondary-button"
          >
            Go to Dashboard
          </button>
        </div>

        <div className="receipt-notice">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M2 2h12v12H2V2zm1 1v10h10V3H3zm2 2h6v1H5V5zm0 2h6v1H5V7zm0 2h4v1H5V9z"/>
          </svg>
          <span>A receipt has been sent to your email</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
