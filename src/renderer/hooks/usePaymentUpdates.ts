import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface PaymentUpdate {
  paymentId: string;
  status: string;
  amount: number;
  message?: string;
  timestamp: string;
}

interface WalletUpdate {
  availableBalance: number;
  pendingBalance: number;
  lastTransaction?: {
    type: string;
    amount: number;
    description: string;
  };
}

interface PayoutUpdate {
  payoutId: string;
  status: string;
  amount: number;
  message?: string;
  timestamp: string;
}

export const usePaymentUpdates = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [paymentUpdate, setPaymentUpdate] = useState<PaymentUpdate | null>(null);
  const [walletUpdate, setWalletUpdate] = useState<WalletUpdate | null>(null);
  const [payoutUpdate, setPayoutUpdate] = useState<PayoutUpdate | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Connect to payments WebSocket namespace
    const newSocket = io(`${import.meta.env.VITE_API_URL}/payments`, {
      auth: { token },
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('Connected to payment updates');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from payment updates');
      setConnected(false);
    });

    // Listen for payment updates
    newSocket.on('payment:update', (data: PaymentUpdate) => {
      console.log('Payment update received:', data);
      setPaymentUpdate(data);

      // Show notification
      if (data.message) {
        showNotification('Payment Update', data.message, data.status);
      }
    });

    // Listen for wallet updates
    newSocket.on('wallet:update', (data: WalletUpdate) => {
      console.log('Wallet update received:', data);
      setWalletUpdate(data);

      // Show notification for balance changes
      if (data.lastTransaction) {
        const { type, amount, description } = data.lastTransaction;
        const message = type === 'credit'
          ? `+$${amount.toFixed(2)} - ${description}`
          : `-$${amount.toFixed(2)} - ${description}`;
        showNotification('Wallet Update', message, 'info');
      }
    });

    // Listen for payout updates
    newSocket.on('payout:update', (data: PayoutUpdate) => {
      console.log('Payout update received:', data);
      setPayoutUpdate(data);

      // Show notification
      if (data.message) {
        showNotification('Payout Update', data.message, data.status);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const showNotification = (title: string, message: string, type: string) => {
    // Check if browser supports notifications
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/logo.png',
        badge: '/logo.png',
      });
    }

    // Also show in-app toast notification
    const event = new CustomEvent('show-toast', {
      detail: {
        title,
        message,
        type: type === 'failed' ? 'error' : type === 'completed' ? 'success' : 'info',
      },
    });
    window.dispatchEvent(event);
  };

  const clearPaymentUpdate = useCallback(() => {
    setPaymentUpdate(null);
  }, []);

  const clearWalletUpdate = useCallback(() => {
    setWalletUpdate(null);
  }, []);

  const clearPayoutUpdate = useCallback(() => {
    setPayoutUpdate(null);
  }, []);

  return {
    connected,
    paymentUpdate,
    walletUpdate,
    payoutUpdate,
    clearPaymentUpdate,
    clearWalletUpdate,
    clearPayoutUpdate,
  };
};
