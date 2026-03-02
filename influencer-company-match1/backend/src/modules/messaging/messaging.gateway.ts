import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagingService } from './messaging.service';
import { JwtService } from '@nestjs/jwt';
import { CreateMessageDto } from './dto/create-message.dto';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/messaging',
})
export class MessagingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, string> = new Map(); // userId -> socketId

  constructor(
    private messagingService: MessagingService,
    private jwtService: JwtService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      client.userId = payload.sub;
      
      if (client.userId) {
        this.userSockets.set(client.userId, client.id);
        console.log(`User ${client.userId} connected to messaging`);
      }
    } catch (error) {
      console.error('WebSocket authentication failed:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.userSockets.delete(client.userId);
      console.log(`User ${client.userId} disconnected from messaging`);
    }
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: CreateMessageDto,
  ) {
    if (!client.userId) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const message = await this.messagingService.createMessage(client.userId, data);
      
      // Send to recipient if online
      this.emitNewMessageToRecipient(data.recipientId, message);

      // Send confirmation to sender
      return { success: true, message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('typing_start')
  handleTypingStart(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { recipientId: string },
  ) {
    if (!client.userId) return;

    const recipientSocketId = this.userSockets.get(data.recipientId);
    if (recipientSocketId) {
      this.server.to(recipientSocketId).emit('user_typing', {
        userId: client.userId,
        isTyping: true,
      });
    }
  }

  @SubscribeMessage('typing_stop')
  handleTypingStop(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { recipientId: string },
  ) {
    if (!client.userId) return;

    const recipientSocketId = this.userSockets.get(data.recipientId);
    if (recipientSocketId) {
      this.server.to(recipientSocketId).emit('user_typing', {
        userId: client.userId,
        isTyping: false,
      });
    }
  }

  @SubscribeMessage('mark_read')
  async handleMarkRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string },
  ) {
    if (!client.userId) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      await this.messagingService.markConversationAsRead(data.conversationId, client.userId);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Profile update broadcasting
  broadcastProfileUpdate(userId: string, fields: string[], profileCompletion: number) {
    this.server.emit('profile:updated', {
      userId,
      fields,
      profileCompletion,
      timestamp: Date.now(),
    });
  }

  // Get online users count
  getOnlineUsersCount(): number {
    return this.userSockets.size;
  }

  // Check if user is online
  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId);
  }

  /**
   * Emit a new_message event to the specified recipient if they are online.
   * Used by both the WebSocket send_message handler and the HTTP controller path
   * to ensure consistent real-time delivery behavior.
   */
  emitNewMessageToRecipient(recipientId: string, message: any) {
    const recipientSocketId = this.userSockets.get(recipientId);
    if (!recipientSocketId) {
      return;
    }

    this.server.to(recipientSocketId).emit('new_message', message);
  }
}
