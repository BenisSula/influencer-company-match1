import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { PaymentForm } from '../components/Payments/PaymentForm';
import './PaymentCheckout.css';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

export const PaymentCheckout = () => {
  const { collaborationId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(0);

  useEffect(() => {
    const loadPayment = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // 1. Fetch payment by collaboration ID
        const paymentResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/payments/collaboration/${collaborationId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (!paymentResponse.ok) {
          if (paymentResponse.status === 404) {
            setError('Payment not found. Please contact support.');
          } else {
            const errorData = await paymentResponse.json();
            setError(errorData.message || 'Failed to load payment information.');
          }
          setLoading(false);
          return;
        }

        const payment = await paymentResponse.json();
        setPaymentId(payment.id);
        setAmount(payment.amountTotal / 100); // Convert cents to dollars

        // 2. Fetch client secret
        const secretResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/payments/${payment.id}/client-secret`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (!secretResponse.ok) {
          const errorData = await secretResponse.json();
          setError(errorData.message || 'Failed to initialize payment.');
          setLoading(false);
          return;
        }

        const secretData = await secretResponse.json();
        setClientSecret(secretData.clientSecret);
      } catch (err: any) {
        console.error('Payment loading error:', err);
        setError(err.message || 'Failed to load payment information.');
      } finally {
        setLoading(false);
      }
    };

    loadPayment();
  }, [collaborationId, navigate]);

  const handlePaymentSuccess = () => {
    navigate(`/payments/success?collaboration=${collaborationId}`);
  };

  if (loading) {
    return (
      <div className="checkout-loading">
        <div className="spinner"></div>
        <p>Loading payment details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="checkout-error">
        <div className="error-icon">⚠️</div>
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/connections')} className="btn-back">
          Back to Connections
        </button>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="checkout-error">
        <div className="error-icon">⚠️</div>
        <h2>Configuration Error</h2>
        <p>Missing payment configuration. Please try again.</p>
        <button onClick={() => navigate('/connections')} className="btn-back">
          Back to Connections
        </button>
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#667eea',
        colorBackground: '#ffffff',
        colorText: '#1a1a1a',
        colorDanger: '#e74c3c',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        borderRadius: '8px',
      },
    },
  };

  return (
    <div className="payment-checkout-container">
      <div className="checkout-header">
        <button onClick={() => navigate(-1)} className="back-link">
          ← Back
        </button>
        <h1>Complete Payment</h1>
        <p className="amount-display">${amount.toFixed(2)}</p>
      </div>

      <Elements stripe={stripePromise} options={options}>
        <PaymentForm onSuccess={handlePaymentSuccess} paymentId={paymentId!} />
      </Elements>

      <div className="payment-info">
        <div className="info-item">
          <span className="icon">🔒</span>
          <span>Secured by Stripe</span>
        </div>
        <div className="info-item">
          <span className="icon">💰</span>
          <span>Funds held in escrow</span>
        </div>
        <div className="info-item">
          <span className="icon">✓</span>
          <span>Released upon completion</span>
        </div>
      </div>
    </div>
  );
};
