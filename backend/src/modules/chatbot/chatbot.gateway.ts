import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
  namespace: '/chatbot',
})
export class ChatbotGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatbotGateway.name);
  private userSockets = new Map<string, string>(); // userId -> socketId

  constructor(
    private chatbotService: ChatbotService,
    private jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      this.userSockets.set(userId, client.id);
      client.data.userId = userId;

      this.logger.log(`Chatbot client connected: ${userId}`);

      // Send welcome message
      client.emit('connected', {
        message: 'Connected to chatbot',
        userId,
      });
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      this.userSockets.delete(userId);
      this.logger.log(`Chatbot client disconnected: ${userId}`);
    }
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @MessageBody() data: { content: string; conversationId?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;

    if (!userId) {
      client.emit('error', { message: 'Unauthorized' });
      return;
    }

    try {
      // Show typing indicator
      client.emit('bot_typing', { isTyping: true });

      const { userMessage, botMessage } = await this.chatbotService.sendMessage(
        userId,
        data.content,
        data.conversationId,
      );

      // Stop typing indicator
      client.emit('bot_typing', { isTyping: false });

      // Send messages back to client
      client.emit('message_received', {
        userMessage: {
          id: userMessage.id,
          content: userMessage.content,
          senderType: 'user',
          createdAt: userMessage.createdAt,
        },
        botMessage: {
          id: botMessage.id,
          content: botMessage.content,
          senderType: 'bot',
          intent: botMessage.intent,
          createdAt: botMessage.createdAt,
        },
      });
    } catch (error) {
      this.logger.error(`Message handling error: ${error.message}`, error.stack);
      client.emit('error', {
        message: 'Failed to process message. Please try again.',
      });
    }
  }

  @SubscribeMessage('get_history')
  async handleGetHistory(
    @MessageBody() data: { conversationId: string; limit?: number },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;

    if (!userId) {
      client.emit('error', { message: 'Unauthorized' });
      return;
    }

    try {
      const messages = await this.chatbotService.getConversationHistory(
        data.conversationId,
        userId,
        data.limit,
      );

      client.emit('history_loaded', {
        messages: messages.map(msg => ({
          id: msg.id,
          content: msg.content,
          senderType: msg.senderType,
          intent: msg.intent,
          createdAt: msg.createdAt,
        })),
      });
    } catch (error) {
      this.logger.error(`History loading error: ${error.message}`);
      client.emit('error', { message: 'Failed to load history' });
    }
  }

  @SubscribeMessage('close_conversation')
  async handleCloseConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;

    if (!userId) {
      client.emit('error', { message: 'Unauthorized' });
      return;
    }

    try {
      await this.chatbotService.closeConversation(data.conversationId, userId);
      client.emit('conversation_closed', { conversationId: data.conversationId });
    } catch (error) {
      this.logger.error(`Close conversation error: ${error.message}`);
      client.emit('error', { message: 'Failed to close conversation' });
    }
  }
}
