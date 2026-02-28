/**
 * Hook for listening to real-time profile updates via WebSocket
 */

import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const useProfileUpdates = () => {
  const { user, refreshProfile } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Initialize socket connection if not already connected
    if (!socket) {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';
      const baseUrl = apiUrl.replace('/api', '');

      socket = io(`${baseUrl}/messaging`, {
        auth: { token },
        transports: ['websocket', 'polling'],
      });

      socket.on('connect', () => {
        console.log('Connected to profile updates');
      });

      socket.on('disconnect', () => {
        console.log('Disconnected from profile updates');
      });
    }

    // Listen for profile updates
    const handleProfileUpdate = (event: {
      userId: string;
      fields: string[];
      profileCompletion: number;
      timestamp: number;
    }) => {
      // If it's our profile or a profile we're viewing, refresh
      if (event.userId === user.id) {
        console.log('Your profile was updated:', event.fields);
        refreshProfile?.();
      }
      
      // Emit custom event for other components to listen
      window.dispatchEvent(new CustomEvent('profile:updated', { detail: event }));
    };

    socket.on('profile:updated', handleProfileUpdate);

    return () => {
      if (socket) {
        socket.off('profile:updated', handleProfileUpdate);
      }
    };
  }, [user, refreshProfile]);

  return {
    isConnected: socket?.connected || false,
  };
};

/**
 * Hook for components that need to react to any profile update
 */
export const useProfileUpdateListener = (callback: (event: any) => void) => {
  useEffect(() => {
    const handleUpdate = (e: CustomEvent) => {
      callback(e.detail);
    };

    window.addEventListener('profile:updated', handleUpdate as EventListener);

    return () => {
      window.removeEventListener('profile:updated', handleUpdate as EventListener);
    };
  }, [callback]);
};
