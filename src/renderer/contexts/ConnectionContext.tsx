import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { connectionService, ConnectionStatus } from '../services/connection.service';

interface ConnectionContextType {
  connections: Map<string, ConnectionStatus>;
  connect: (userId: string, targetId: string) => void;
  disconnect: (userId: string, targetId: string) => void;
  getStatus: (userId: string, targetId: string) => ConnectionStatus;
  getConnectionCount: (userId: string) => number;
}

const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined);

export const useConnection = () => {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error('useConnection must be used within ConnectionProvider');
  }
  return context;
};

interface ConnectionProviderProps {
  children: React.ReactNode;
}

export const ConnectionProvider: React.FC<ConnectionProviderProps> = ({ children }) => {
  const [connections, setConnections] = useState<Map<string, ConnectionStatus>>(new Map());

  // Load initial connections from localStorage
  useEffect(() => {
    const loadConnections = () => {
      const connectionsData = localStorage.getItem('connections');
      if (connectionsData) {
        const parsed = JSON.parse(connectionsData);
        setConnections(new Map(Object.entries(parsed)));
      }
    };
    loadConnections();
  }, []);

  const connect = useCallback((userId: string, targetId: string) => {
    connectionService.connect(userId, targetId);
    const key = `${userId}-${targetId}`;
    setConnections((prev) => new Map(prev).set(key, 'pending'));
  }, []);

  const disconnect = useCallback((userId: string, targetId: string) => {
    connectionService.disconnect(userId, targetId);
    const key = `${userId}-${targetId}`;
    setConnections((prev) => {
      const newMap = new Map(prev);
      newMap.delete(key);
      return newMap;
    });
  }, []);

  const getStatus = useCallback(
    (userId: string, targetId: string): ConnectionStatus => {
      return connectionService.getConnectionStatus(userId, targetId);
    },
    []
  );

  const getConnectionCount = useCallback((userId: string): number => {
    let count = 0;
    connections.forEach((status, key) => {
      if (key.startsWith(`${userId}-`) && status === 'connected') {
        count++;
      }
    });
    return count;
  }, [connections]);

  return (
    <ConnectionContext.Provider
      value={{ connections, connect, disconnect, getStatus, getConnectionCount }}
    >
      {children}
    </ConnectionContext.Provider>
  );
};
