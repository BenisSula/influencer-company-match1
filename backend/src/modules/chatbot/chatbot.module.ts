import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ChatbotService } from './chatbot.service';
import { ChatbotAIService } from './chatbot-ai.service';
import { ChatbotGateway } from './chatbot.gateway';
import { ChatbotController } from './chatbot.controller';
import { ChatbotConversation } from './entities/chatbot-conversation.entity';
import { ChatbotMessage } from './entities/chatbot-message.entity';
import { ChatbotIntent } from './entities/chatbot-intent.entity';

/**
 * Consolidated Chatbot Module
 * 
 * Removed unused entities:
 * - ChatbotAnalytics (use main analytics module instead)
 * - ChatbotEmailQueue (use main email module instead)
 * - ChatbotFaq (implement when needed)
 * 
 * Core entities only:
 * - ChatbotConversation: User conversation sessions
 * - ChatbotMessage: Individual messages
 * - ChatbotIntent: Intent definitions (synced from ML service)
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChatbotConversation,
      ChatbotMessage,
      ChatbotIntent,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [ChatbotController],
  providers: [ChatbotService, ChatbotAIService, ChatbotGateway],
  exports: [ChatbotService, ChatbotAIService],
})
export class ChatbotModule {}
