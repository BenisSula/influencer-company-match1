import React, { useEffect, useState } from 'react';
import { FiCheckCircle, FiXCircle, FiAlertCircle, FiDollarSign } from 'react-icons/fi';
import { usePaymentUpdates } from '../../hooks/usePaymentUpdates';
import './PaymentStatusToast.css';

export const PaymentStatusToast: React.FC = () => {
  const {
    paymentUpdate,
    walletUpdate,
    payoutUpdate,
    clearPaymentUpdate,
    clearWalletUpdate,
    clearPayoutUpdate,
  } = usePaymentUpdates();

  const [visible, setVisible] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<{
    title: string;
    message: string;
    type: 'success' | 'error' | 'info';
    icon: React.ReactNode;
  } | null>(null);

  useEffect(() => {
    if (paymentUpdate) {
      const icon = paymentUpdate.status === 'held' ? (
        <FiCheckCircle />
      ) : paymentUpdate.status === 'failed' ? (
        <FiXCircle />
      ) : (
        <FiAlertCircle />
      );

      setCurrentMessage({
        title: 'Payment Update',
        message: paymentUpdate.message || `Payment ${paymentUpdate.status}`,
        type: paymentUpdate.status === 'failed' ? 'error' : 'success',
        icon,
      });
      setVisible(true);

      setTimeout(() => {
        setVisible(false);
        setTimeout(clearPaymentUpdate, 300);
      }, 5000);
    }
  }, [paymentUpdate, clearPaymentUpdate]);

  useEffect(() => {
    if (walletUpdate) {
      setCurrentMessage({
        title: 'Wallet Updated',
        message: `Balance: $${walletUpdate.availableBalance.toFixed(2)}`,
        type: 'info',
        icon: <FiDollarSign />,
      });
      setVisible(true);

      setTimeout(() => {
        setVisible(false);
        setTimeout(clearWalletUpdate, 300);
      }, 5000);
    }
  }, [walletUpdate, clearWalletUpdate]);

  useEffect(() => {
    if (payoutUpdate) {
      const icon = payoutUpdate.status === 'completed' ? (
        <FiCheckCircle />
      ) : payoutUpdate.status === 'failed' ? (
        <FiXCircle />
      ) : (
        <FiAlertCircle />
      );

      setCurrentMessage({
        title: 'Payout Update',
        message: payoutUpdate.message || `Payout ${payoutUpdate.status}`,
        type: payoutUpdate.status === 'failed' ? 'error' : 'success',
        icon,
      });
      setVisible(true);

      setTimeout(() => {
        setVisible(false);
        setTimeout(clearPayoutUpdate, 300);
      }, 5000);
    }
  }, [payoutUpdate, clearPayoutUpdate]);

  if (!currentMessage) return null;

  return (
    <div className={`payment-status-toast ${visible ? 'visible' : ''} ${currentMessage.type}`}>
      <div className="toast-icon">{currentMessage.icon}</div>
      <div className="toast-content">
        <div className="toast-title">{currentMessage.title}</div>
        <div className="toast-message">{currentMessage.message}</div>
      </div>
      <button
        className="toast-close"
        onClick={() => {
          setVisible(false);
          setTimeout(() => {
            clearPaymentUpdate();
            clearWalletUpdate();
            clearPayoutUpdate();
          }, 300);
        }}
      >
        ×
      </button>
    </div>
  );
};
