import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatbotConversation } from './entities/chatbot-conversation.entity';
import { ChatbotMessage } from './entities/chatbot-message.entity';
import { ChatbotAIService } from './chatbot-ai.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);

  constructor(
    @InjectRepository(ChatbotConversation)
    private conversationRepo: Repository<ChatbotConversation>,
    @InjectRepository(ChatbotMessage)
    private messageRepo: Repository<ChatbotMessage>,
    private aiService: ChatbotAIService,
  ) {}

  /**
   * Create a new conversation for a user
   */
  async createConversation(userId: string): Promise<ChatbotConversation> {
    const sessionId = `session_${uuidv4()}`;
    
    const conversation = this.conversationRepo.create({
      userId,
      sessionId,
      status: 'active',
      context: {},
      metadata: {},
    });

    return await this.conversationRepo.save(conversation);
  }

  /**
   * Get active conversation or create new one
   */
  async getOrCreateConversation(userId: string): Promise<ChatbotConversation> {
    let conversation = await this.conversationRepo.findOne({
      where: { userId, status: 'active' },
      order: { createdAt: 'DESC' },
    });

    if (!conversation) {
      conversation = await this.createConversation(userId);
    }

    return conversation;
  }

  /**
   * Process user message and generate bot response
   * Single source of truth for message handling
   */
  async sendMessage(
    userId: string,
    content: string,
    conversationId?: string,
  ): Promise<{ userMessage: ChatbotMessage; botMessage: ChatbotMessage }> {
    // Get or create conversation
    let conversation: ChatbotConversation;
    
    if (conversationId) {
      conversation = await this.conversationRepo.findOne({
        where: { id: conversationId, userId },
      });
    }
    
    if (!conversation) {
      conversation = await this.getOrCreateConversation(userId);
    }

    // Save user message
    const userMessage = await this.saveMessage(
      conversation.id,
      'user',
      content,
    );

    // Generate AI response (single source - delegates to ML service)
    const aiResponse = await this.aiService.generateResponse(
      content,
      {
        userId,
        conversationId: conversation.id,
        context: conversation.context,
      },
    );
    
    const { response, intent, confidence } = aiResponse;

    // Save bot message
    const botMessage = await this.saveMessage(
      conversation.id,
      'bot',
      response,
      intent,
      confidence,
    );

    // Update conversation context
    await this.updateConversationContext(conversation, intent);

    return { userMessage, botMessage };
  }

  /**
   * Save message with PII protection
   */
  private async saveMessage(
    conversationId: string,
    senderType: 'user' | 'bot',
    content: string,
    intent?: string,
    confidence?: number,
  ): Promise<ChatbotMessage> {
    // Check for sensitive information
    const isSensitive = this.containsSensitiveInfo(content);
    
    // Redact PII if sensitive
    const sanitizedContent = isSensitive 
      ? this.redactPII(content) 
      : content;

    const message = this.messageRepo.create({
      conversationId,
      senderType,
      content: sanitizedContent,
      intent,
      confidence,
      isSensitive,
      metadata: {},
    });

    return await this.messageRepo.save(message);
  }

  /**
   * Update conversation context after each message
   */
  private async updateConversationContext(
    conversation: ChatbotConversation,
    intent: string,
  ): Promise<void> {
    const messageCount = (conversation.context['messageCount'] as number) || 0;
    
    const updatedContext = {
      ...conversation.context,
      lastIntent: intent,
      messageCount: messageCount + 2,
    };
    
    await this.conversationRepo.update(conversation.id, {
      lastMessageAt: new Date(),
      context: updatedContext as any,
    });
  }

  /**
   * PII Detection - Single source of truth for sensitive patterns
   */
  private containsSensitiveInfo(text: string): boolean {
    const patterns = {
      email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
      phone: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/,
      creditCard: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/,
      ssn: /\b\d{3}-\d{2}-\d{4}\b/,
    };

    return Object.values(patterns).some(pattern => pattern.test(text));
  }

  /**
   * PII Redaction - Single source of truth for redaction rules
   */
  private redactPII(text: string): string {
    const patterns = {
      email: { regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, replacement: '[EMAIL_REDACTED]' },
      phone: { regex: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, replacement: '[PHONE_REDACTED]' },
      creditCard: { regex: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, replacement: '[CARD_REDACTED]' },
      ssn: { regex: /\b\d{3}-\d{2}-\d{4}\b/g, replacement: '[SSN_REDACTED]' },
    };

    let redacted = text;
    for (const { regex, replacement } of Object.values(patterns)) {
      redacted = redacted.replace(regex, replacement);
    }

    return redacted;
  }

  /**
   * Get conversation history
   */
  async getConversationHistory(
    conversationId: string,
    userId: string,
    limit: number = 50,
  ): Promise<ChatbotMessage[]> {
    return await this.messageRepo.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
      take: limit,
    });
  }

  /**
   * Close conversation
   */
  async closeConversation(conversationId: string, userId: string): Promise<void> {
    await this.conversationRepo.update(
      { id: conversationId, userId },
      { status: 'closed' },
    );
  }
}
