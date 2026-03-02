import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HiCreditCard, HiExclamationCircle } from 'react-icons/hi';
import './PaymentSetupModal.css';

interface PaymentSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: 'company' | 'influencer';
  collaborationId: string;
  partnerName?: string;
}

export const PaymentSetupModal: React.FC<PaymentSetupModalProps> = ({
  isOpen,
  onClose,
  userRole,
  collaborationId,
  partnerName,
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSetupPayment = () => {
    // Redirect to payment setup in settings
    navigate('/settings?tab=payments&return=/connections');
  };

  const handleSkipForNow = () => {
    onClose();
    // Navigate to messages to start collaboration without payment
    navigate('/messages');
  };

  return (
    <div className="payment-setup-modal-overlay" onClick={onClose}>
      <div className="payment-setup-modal" onClick={(e) => e.stopPropagation()}>
        <div className="payment-setup-modal-header">
          <HiCreditCard size={48} className="payment-setup-icon" />
          <h2>Payment Setup Required</h2>
        </div>

        <div className="payment-setup-modal-content">
          {userRole === 'company' ? (
            <>
              <p className="payment-setup-message">
                To complete this collaboration with <strong>{partnerName}</strong>, 
                you need to set up your payment method.
              </p>
              <div className="payment-setup-benefits">
                <h3>Why set up payments?</h3>
                <ul>
                  <li>✅ Secure escrow protection</li>
                  <li>✅ Automatic payment processing</li>
                  <li>✅ Professional invoicing</li>
                  <li>✅ Track all transactions</li>
                </ul>
              </div>
            </>
          ) : (
            <>
              <p className="payment-setup-message">
                Great news! <strong>{partnerName}</strong> accepted your collaboration request.
                Set up your payout account to receive payment.
              </p>
              <div className="payment-setup-benefits">
                <h3>Why set up payouts?</h3>
                <ul>
                  <li>✅ Receive payments securely</li>
                  <li>✅ Fast bank transfers</li>
                  <li>✅ Track your earnings</li>
                  <li>✅ Professional payment history</li>
                </ul>
              </div>
            </>
          )}

          <div className="payment-setup-note">
            <HiExclamationCircle size={20} />
            <span>
              You can still message and collaborate. Payment setup can be completed later.
            </span>
          </div>
        </div>

        <div className="payment-setup-modal-actions">
          <button 
            className="btn-secondary" 
            onClick={handleSkipForNow}
          >
            Skip for Now
          </button>
          <button 
            className="btn-primary" 
            onClick={handleSetupPayment}
          >
            <HiCreditCard size={20} />
            Set Up {userRole === 'company' ? 'Payment' : 'Payout'}
          </button>
        </div>
      </div>
    </div>
  );
};
