import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useState } from 'react';
import './PaymentForm.css';

interface PaymentFormProps {
  onSuccess: () => void;
  paymentId: string;
}

export const PaymentForm = ({ onSuccess, paymentId }: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Confirm payment with Stripe
      const { error: submitError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payments/success`,
        },
        redirect: 'if_required',
      });

      if (submitError) {
        setError(submitError.message || 'Payment failed');
        setLoading(false);
      } else {
        // Payment succeeded - notify backend
        try {
          const token = localStorage.getItem('token');
          await fetch(`${import.meta.env.VITE_API_URL}/payments/${paymentId}/confirm`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
        } catch (backendError) {
          console.error('Backend notification failed:', backendError);
          // Don't fail the payment if backend notification fails
        }
        
        onSuccess();
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <div className="payment-element-container">
        <PaymentElement />
      </div>
      
      {error && (
        <div className="payment-error">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0a8 8 0 100 16A8 8 0 008 0zM7 4h2v5H7V4zm0 6h2v2H7v-2z"/>
          </svg>
          {error}
        </div>
      )}
      
      <button 
        type="submit" 
        disabled={!stripe || loading} 
        className="payment-submit"
      >
        {loading ? (
          <>
            <span className="spinner"></span>
            Processing...
          </>
        ) : (
          'Pay Now'
        )}
      </button>

      <div className="secure-notice">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 0L2 3v4c0 3.5 2.5 6.5 6 7 3.5-.5 6-3.5 6-7V3L8 0z"/>
        </svg>
        <span>Secured by Stripe. Your payment information is encrypted.</span>
      </div>
    </form>
  );
};
