// Connection service for managing user connections
export interface Connection {
  id: string;
  userId: string;
  connectedUserId: string;
  status: 'pending' | 'connected' | 'rejected';
  createdAt: string;
}

export class ConnectionService {
  private readonly STORAGE_KEY = 'user_connections';

  getConnections(): Connection[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  getConnectionStatus(currentUserId: string, targetUserId: string): 'none' | 'pending' | 'connected' | 'rejected' {
    const connections = this.getConnections();
    const connection = connections.find(
      c => (c.userId === currentUserId && c.connectedUserId === targetUserId) ||
           (c.userId === targetUserId && c.connectedUserId === currentUserId)
    );
    return connection ? connection.status : 'none';
  }

  connect(currentUserId: string, targetUserId: string): Connection {
    const connections = this.getConnections();
    
    // Check if connection already exists
    const existing = connections.find(
      c => (c.userId === currentUserId && c.connectedUserId === targetUserId) ||
           (c.userId === targetUserId && c.connectedUserId === currentUserId)
    );

    if (existing) {
      return existing;
    }

    const newConnection: Connection = {
      id: `conn-${Date.now()}`,
      userId: currentUserId,
      connectedUserId: targetUserId,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    connections.push(newConnection);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(connections));
    
    return newConnection;
  }

  disconnect(currentUserId: string, targetUserId: string): void {
    const connections = this.getConnections();
    const filtered = connections.filter(
      c => !((c.userId === currentUserId && c.connectedUserId === targetUserId) ||
            (c.userId === targetUserId && c.connectedUserId === currentUserId))
    );
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
  }

  acceptConnection(connectionId: string): void {
    const connections = this.getConnections();
    const connection = connections.find(c => c.id === connectionId);
    if (connection) {
      connection.status = 'connected';
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(connections));
    }
  }
}

export const connectionService = new ConnectionService();
