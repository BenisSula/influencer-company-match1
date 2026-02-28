import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { LandingActivity } from './entities/landing-activity.entity';

@WebSocketGateway({
  namespace: '/landing',
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
})
export class LandingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(LandingGateway.name);
  private connectedClients = new Map<string, { socket: Socket; joinedAt: Date }>();
  private rateLimitMap = new Map<string, { count: number; resetTime: number }>();

  // Rate limiting configuration
  private readonly RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
  private readonly RATE_LIMIT_MAX_EVENTS = 10; // Max 10 events per minute per client

  handleConnection(client: Socket) {
    const clientId = client.id;
    this.connectedClients.set(clientId, {
      socket: client,
      joinedAt: new Date(),
    });
    
    this.logger.log(`Landing client connected: ${clientId}`);
    
    // Send current connection count to all clients
    this.broadcastConnectionCount();
  }

  handleDisconnect(client: Socket) {
    const clientId = client.id;
    this.connectedClients.delete(clientId);
    this.rateLimitMap.delete(clientId);
    
    this.logger.log(`Landing client disconnected: ${clientId}`);
    
    // Send updated connection count
    this.broadcastConnectionCount();
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(@ConnectedSocket() client: Socket) {
    const clientId = client.id;
    
    // Join the activity feed room
    client.join('activity-feed');
    
    this.logger.debug(`Client ${clientId} subscribed to activity feed`);
    
    // Send confirmation
    client.emit('subscribed', {
      message: 'Successfully subscribed to activity feed',
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(@ConnectedSocket() client: Socket) {
    const clientId = client.id;
    
    // Leave the activity feed room
    client.leave('activity-feed');
    
    this.logger.debug(`Client ${clientId} unsubscribed from activity feed`);
    
    // Send confirmation
    client.emit('unsubscribed', {
      message: 'Successfully unsubscribed from activity feed',
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('pong', {
      timestamp: new Date().toISOString(),
      clientId: client.id,
    });
  }

  // Event listener for new activities
  @OnEvent('landing.activity.created')
  handleActivityCreated(activity: LandingActivity) {
    // Apply rate limiting before broadcasting
    if (this.shouldBroadcast()) {
      this.broadcastActivity(activity);
    }
  }

  // Broadcast new activity to all subscribed clients
  private broadcastActivity(activity: LandingActivity) {
    const payload = {
      id: activity.id,
      type: activity.activityType,
      userName: activity.userName,
      userRole: activity.userRole,
      description: activity.description,
      timestamp: activity.createdAt,
      metadata: activity.metadata,
    };

    // Broadcast to all clients in the activity-feed room
    this.server.to('activity-feed').emit('new-activity', payload);
    
    this.logger.debug(`Broadcasted activity: ${activity.activityType}`);
  }

  // Broadcast current connection count
  private broadcastConnectionCount() {
    const count = this.connectedClients.size;
    
    this.server.emit('connection-count', {
      count,
      timestamp: new Date().toISOString(),
    });
  }

  // Rate limiting for broadcasts
  private shouldBroadcast(): boolean {
    const now = Date.now();
    const key = 'global-broadcast';
    
    let rateLimit = this.rateLimitMap.get(key);
    
    if (!rateLimit || now > rateLimit.resetTime) {
      // Reset or create new rate limit window
      rateLimit = {
        count: 1,
        resetTime: now + this.RATE_LIMIT_WINDOW,
      };
      this.rateLimitMap.set(key, rateLimit);
      return true;
    }
    
    if (rateLimit.count < this.RATE_LIMIT_MAX_EVENTS) {
      rateLimit.count++;
      return true;
    }
    
    // Rate limit exceeded
    this.logger.warn('Activity broadcast rate limit exceeded');
    return false;
  }

  // Get current statistics for connected clients
  getConnectionStats() {
    return {
      totalConnections: this.connectedClients.size,
      activeSubscriptions: this.server.sockets.adapter.rooms.get('activity-feed')?.size || 0,
      rateLimitedEvents: Array.from(this.rateLimitMap.values()).reduce(
        (sum, limit) => sum + limit.count,
        0
      ),
    };
  }

  // Manual broadcast method (for testing or admin use)
  manualBroadcast(activity: any) {
    this.broadcastActivity(activity);
  }

  // Cleanup method for rate limit map
  private cleanupRateLimits() {
    const now = Date.now();
    for (const [key, limit] of this.rateLimitMap.entries()) {
      if (now > limit.resetTime) {
        this.rateLimitMap.delete(key);
      }
    }
  }

  // Periodic cleanup (called by a cron job or similar)
  performMaintenance() {
    this.cleanupRateLimits();
    this.logger.debug('Gateway maintenance completed');
  }
}
