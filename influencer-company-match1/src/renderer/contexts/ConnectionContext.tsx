import React, { createContext, useContext, useState, useCallback } from 'react';
import { apiClient } from '../services/api-client';

type ConnectionStatus = 'none' | 'pending' | 'accepted' | 'rejected';

interface Connection {
  id: string;
  requesterId: string;
  recipientId: string;
  status: ConnectionStatus;
  createdAt: string;
}

interface ConnectionContextType {
  connections: Map<string, Connection>;
  getStatus: (userId: string, otherUserId: string) => ConnectionStatus;
  connect: (userId: string, recipientId: string) => Promise<Connection>;
  disconnect: (userId: string, otherUserId: string) => Promise<void>;
  refreshConnections: () => Promise<void>;
  refreshConnectionStatus: (userId: string, otherUserId: string) => Promise<{ status: ConnectionStatus; connection: Connection | null }>;
  updateConnectionStatus: (userId: string, otherUserId: string, status: ConnectionStatus) => void;
}

const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined);

export const ConnectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connections, setConnections] = useState<Map<string, Connection>>(new Map());

  const getConnectionKey = (userId: string, otherUserId: string) => {
    // Create a consistent key regardless of order
    return [userId, otherUserId].sort().join('-');
  };

  const getStatus = useCallback((userId: string, otherUserId: string): ConnectionStatus => {
    const key = getConnectionKey(userId, otherUserId);
    const connection = connections.get(key);
    return connection?.status || 'none';
  }, [connections]);

  const connect = useCallback(async (userId: string, recipientId: string) => {
    console.log('[ConnectionContext] Creating connection:', {
      userId,
      recipientId,
      timestamp: new Date().toISOString()
    });
    
    try {
      const response = await apiClient.post<Connection>('/connections', { recipientId });
      console.log('[ConnectionContext] Connection created:', response);
      
      const key = getConnectionKey(userId, recipientId);
      setConnections(prev => {
        const newMap = new Map(prev);
        newMap.set(key, response);
        return newMap;
      });
      
      return response;
    } catch (error: any) {
      console.error('[ConnectionContext] Failed to create connection:', error);
      // If connection already exists, fetch its status
      if (error.response?.status === 400) {
        console.log('[ConnectionContext] Connection already exists, fetching status...');
        await refreshConnectionStatus(userId, recipientId);
      }
      throw error;
    }
  }, []);

  const disconnect = useCallback(async (userId: string, otherUserId: string) => {
    try {
      const key = getConnectionKey(userId, otherUserId);
      const connection = connections.get(key);
      
      if (connection) {
        await apiClient.delete(`/connections/${connection.id}`);
        
        setConnections(prev => {
          const newMap = new Map(prev);
          newMap.delete(key);
          return newMap;
        });
      }
    } catch (error) {
      console.error('Failed to disconnect:', error);
      throw error;
    }
  }, [connections]);

  const refreshConnectionStatus = async (userId: string, otherUserId: string) => {
    try {
      const response = await apiClient.get<{ status: ConnectionStatus; connection: Connection | null }>(
        `/connections/status/${otherUserId}`
      );
      
      const key = getConnectionKey(userId, otherUserId);
      if (response.connection) {
        setConnections(prev => {
          const newMap = new Map(prev);
          newMap.set(key, response.connection!);
          return newMap;
        });
      } else {
        // If no connection exists, remove it from the map
        setConnections(prev => {
          const newMap = new Map(prev);
          newMap.delete(key);
          return newMap;
        });
      }
      
      return response;
    } catch (error) {
      console.debug('Could not refresh connection status (this is normal for new matches):', otherUserId);
      // Return a safe default instead of throwing
      return { status: 'none' as ConnectionStatus, connection: null };
    }
  };

  const refreshConnections = useCallback(async () => {
    // This would fetch all connections for the current user
    // For now, we'll rely on individual status checks
  }, []);

  const updateConnectionStatus = useCallback((userId: string, otherUserId: string, status: ConnectionStatus) => {
    const key = getConnectionKey(userId, otherUserId);
    setConnections(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(key);
      if (existing) {
        newMap.set(key, { ...existing, status });
      } else {
        // Create a new connection entry
        newMap.set(key, {
          id: key,
          requesterId: userId,
          recipientId: otherUserId,
          status,
          createdAt: new Date().toISOString(),
        });
      }
      return newMap;
    });
    
    // Dispatch a custom event to notify all components
    window.dispatchEvent(new CustomEvent('connectionStatusChanged', {
      detail: { userId, otherUserId, status }
    }));
  }, []);

  const value: ConnectionContextType = {
    connections,
    getStatus,
    connect,
    disconnect,
    refreshConnections,
    refreshConnectionStatus,
    updateConnectionStatus,
  };

  return (
    <ConnectionContext.Provider value={value}>
      {children}
    </ConnectionContext.Provider>
  );
};

export const useConnection = () => {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error('useConnection must be used within a ConnectionProvider');
  }
  return context;
};
