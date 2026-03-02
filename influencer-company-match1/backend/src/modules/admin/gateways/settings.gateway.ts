import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
@WebSocketGateway({
  namespace: '/settings',
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
})
export class SettingsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(SettingsGateway.name);
  private connectedClients = new Set<Socket>();

  handleConnection(client: Socket) {
    this.connectedClients.add(client);
    this.logger.log(`Settings client connected: ${client.id} (Total: ${this.connectedClients.size})`);
  }

  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client);
    this.logger.log(`Settings client disconnected: ${client.id} (Total: ${this.connectedClients.size})`);
  }

  // Broadcast single setting change to all clients
  broadcastSettingChange(key: string, value: any, category: string) {
    const payload = {
      key,
      value,
      category,
      timestamp: new Date().toISOString(),
    };
    
    this.server.emit('setting-changed', payload);
    this.logger.log(`Broadcasted setting change: ${key} to ${this.connectedClients.size} clients`);
  }

  // Broadcast multiple settings changes (bulk update)
  broadcastSettingsChange(settings: Array<{key: string, value: any, category: string}>) {
    const payload = {
      settings,
      timestamp: new Date().toISOString(),
    };
    
    this.server.emit('settings-changed', payload);
    this.logger.log(`Broadcasted ${settings.length} setting changes to ${this.connectedClients.size} clients`);
  }

  // Broadcast branding changes specifically
  broadcastBrandingChange(brandingData: any) {
    const payload = {
      branding: brandingData,
      timestamp: new Date().toISOString(),
    };
    
    this.server.emit('branding-changed', payload);
    this.logger.log(`Broadcasted branding change to ${this.connectedClients.size} clients`);
  }

  // Broadcast feature flag changes
  broadcastFeatureFlagChange(flagKey: string, enabled: boolean) {
    const payload = {
      flagKey,
      enabled,
      timestamp: new Date().toISOString(),
    };
    
    this.server.emit('feature-flag-changed', payload);
    this.logger.log(`Broadcasted feature flag change: ${flagKey}=${enabled}`);
  }

  // Broadcast maintenance mode
  broadcastMaintenanceMode(enabled: boolean, message?: string) {
    const payload = {
      enabled,
      message,
      timestamp: new Date().toISOString(),
    };
    
    this.server.emit('maintenance-mode-changed', payload);
    this.logger.log(`Broadcasted maintenance mode: ${enabled}`);
  }

  // Get connection stats
  getConnectionStats() {
    return {
      totalConnections: this.connectedClients.size,
      timestamp: new Date().toISOString(),
    };
  }
}
