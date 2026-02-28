import { Controller, Get, Post, Body, Param, Patch, UseGuards, Request, Query } from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MessagingGateway } from './messaging.gateway';

@Controller('messaging')
@UseGuards(JwtAuthGuard)
export class MessagingController {
  constructor(
    private readonly messagingService: MessagingService,
    private readonly messagingGateway: MessagingGateway,
  ) {}

  @Get('conversations')
  async getConversations(@Request() req: any) {
    return this.messagingService.getUserConversations(req.user.sub);
  }

  @Get('conversations/:id/messages')
  async getMessages(
    @Param('id') id: string,
    @Request() req: any,
    @Query('limit') limit?: string,
    @Query('before') before?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : undefined;
    return this.messagingService.getConversationMessages(id, req.user.sub, parsedLimit, before);
  }

  @Post('messages')
  async sendMessage(@Body() createMessageDto: CreateMessageDto, @Request() req: any) {
    const message = await this.messagingService.createMessage(req.user.sub, createMessageDto);

    // Ensure recipients receive real-time updates even when messages are sent via HTTP
    this.messagingGateway.emitNewMessageToRecipient(createMessageDto.recipientId, message);

    return message;
  }

  @Patch('conversations/:id/read')
  async markAsRead(@Param('id') id: string, @Request() req: any) {
    await this.messagingService.markConversationAsRead(id, req.user.sub);
    return { success: true };
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req: any) {
    const count = await this.messagingService.getTotalUnreadCount(req.user.sub);
    return { count };
  }
}
