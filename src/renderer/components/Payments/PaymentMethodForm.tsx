import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';
import './PaymentMethodForm.css';

interface PaymentMethodFormProps {
  paymentId: string;
  amount: number;
  collaborationId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const PaymentMethodForm: React.FC<PaymentMethodFormProps> = ({
  paymentId,
  amount,
  collaborationId,
  onSuccess,
  onError,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardComplete, setCardComplete] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);
      
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Step 1: Create payment method with Stripe
      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (pmError) {
        throw new Error(pmError.message);
      }

      if (!paymentMethod) {
        throw new Error('Failed to create payment method');
      }

      // Step 2: Call backend to confirm payment with payment method
      const response = await fetch(`${import.meta.env.VITE_API_URL}/payments/${paymentId}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Payment confirmation failed');
      }

      const payment = await response.json();

      // Step 3: Check payment status
      if (payment.status === 'held' || payment.status === 'completed') {
        if (onSuccess) {
          onSuccess();
        } else {
          navigate(`/payments/success?collaboration=${collaborationId}`);
        }
      } else {
        throw new Error(`Payment status: ${payment.status}`);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Payment failed. Please try again.';
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#1a1a1a',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        '::placeholder': {
          color: '#999',
        },
        padding: '12px',
      },
      invalid: {
        color: '#e74c3c',
        iconColor: '#e74c3c',
      },
    },
    hidePostalCode: false,
  };

  return (
    <div className="payment-method-form">
      <div className="payment-summary">
        <h3>Payment Summary</h3>
        <div className="amount-display">
          <span className="label">Total Amount:</span>
          <span className="amount">${amount.toFixed(2)}</span>
        </div>
        <p className="payment-note">
          This payment will be held in escrow until the collaboration is completed.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="payment-form">
        <div className="form-group">
          <label htmlFor="card-element">Card Information</label>
          <div className="card-element-wrapper">
            <CardElement
              id="card-element"
              options={cardElementOptions}
              onChange={(e) => setCardComplete(e.complete)}
            />
          </div>
        </div>

        {error && (
          <div className="error-message">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0a8 8 0 100 16A8 8 0 008 0zM7 4h2v5H7V4zm0 6h2v2H7v-2z"/>
            </svg>
            {error}
          </div>
        )}

        <button
          type="submit"
          className="submit-button"
          disabled={!stripe || loading || !cardComplete}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Processing...
            </>
          ) : (
            `Pay $${amount.toFixed(2)}`
          )}
        </button>

        <div className="secure-notice">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0L2 3v4c0 3.5 2.5 6.5 6 7 3.5-.5 6-3.5 6-7V3L8 0zm0 10H6V6h2v4z"/>
          </svg>
          <span>Secured by Stripe. Your payment information is encrypted.</span>
        </div>
      </form>
    </div>
  );
};

export default PaymentMethodForm;
