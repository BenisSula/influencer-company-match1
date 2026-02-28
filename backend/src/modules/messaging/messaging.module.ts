import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { MessagingService } from './messaging.service';
import { MessagingController } from './messaging.controller';
import { MessagingGateway } from './messaging.gateway';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { Connection } from '../matching/entities/connection.entity';
import { AuthModule } from '../auth/auth.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, Message, Connection]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      signOptions: { expiresIn: '7d' },
    }),
    forwardRef(() => AuthModule),
    SettingsModule,
  ],
  controllers: [MessagingController],
  providers: [
    MessagingService,
    MessagingGateway,
    {
      provide: 'MessagingGateway',
      useExisting: MessagingGateway,
    },
  ],
  exports: [MessagingService, MessagingGateway, 'MessagingGateway'],
})
export class MessagingModule {}
