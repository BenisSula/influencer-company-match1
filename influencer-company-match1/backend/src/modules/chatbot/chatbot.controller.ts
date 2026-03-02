import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('conversations')
  @UseGuards(JwtAuthGuard)
  async createConversation(@Request() req) {
    return await this.chatbotService.createConversation(req.user.sub);
  }

  @Get('conversations/active')
  @UseGuards(JwtAuthGuard)
  async getActiveConversation(@Request() req) {
    return await this.chatbotService.getOrCreateConversation(req.user.sub);
  }

  @Get('conversations/:id/messages')
  @UseGuards(JwtAuthGuard)
  async getMessages(
    @Param('id') conversationId: string,
    @Query('limit') limit: number = 50,
    @Request() req,
  ) {
    return await this.chatbotService.getConversationHistory(
      conversationId,
      req.user.sub,
      limit,
    );
  }

  @Post('conversations/:id/close')
  @UseGuards(JwtAuthGuard)
  async closeConversation(@Param('id') conversationId: string, @Request() req) {
    await this.chatbotService.closeConversation(conversationId, req.user.sub);
    return { message: 'Conversation closed successfully' };
  }
}
