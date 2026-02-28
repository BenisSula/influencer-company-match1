import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { Connection, ConnectionStatus } from '../matching/entities/connection.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class MessagingService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(Connection)
    private connectionRepository: Repository<Connection>,
    private settingsService: SettingsService,
  ) {}

  async getOrCreateConversation(user1Id: string, user2Id: string): Promise<Conversation> {
    // Ensure consistent ordering
    const [smallerId, largerId] = [user1Id, user2Id].sort();
    
    let conversation = await this.conversationRepository.findOne({
      where: [
        { user1Id: smallerId, user2Id: largerId },
      ],
    });

    if (!conversation) {
      conversation = this.conversationRepository.create({
        user1Id: smallerId,
        user2Id: largerId,
      });
      await this.conversationRepository.save(conversation);
      
      // Reload to get the saved conversation
      conversation = await this.conversationRepository.findOne({
        where: { id: conversation.id },
      });
    }

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return conversation;
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    const conversations = await this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.messages', 'lastMessage')
      .where('conversation.user1Id = :userId OR conversation.user2Id = :userId', { userId })
      .orderBy('conversation.lastMessageAt', 'DESC', 'NULLS LAST')
      .addOrderBy('conversation.createdAt', 'DESC')
      .getMany();

    // Get only the last message for each conversation
    for (const conversation of conversations) {
      if (conversation.messages && conversation.messages.length > 0) {
        conversation.messages = [conversation.messages[conversation.messages.length - 1]];
      }
    }

    // Collect all unique user IDs from conversations
    const allUserIds = new Set<string>();
    for (const conversation of conversations) {
      allUserIds.add(conversation.user1Id);
      allUserIds.add(conversation.user2Id);
    }

    // Batch-load all users
    const users = await this.conversationRepository.manager
      .createQueryBuilder()
      .select(['user.id as id', 'user.email as email', 'user.role as role'])
      .from('users', 'user')
      .where('user.id IN (:...userIds)', { userIds: Array.from(allUserIds) })
      .getRawMany();

    const userMap = new Map<string, any>();
    for (const user of users) {
      userMap.set(user.id, user);
    }

    // Batch-load profile data for all participants to avoid N+1 queries.
    const influencerUserIds = new Set<string>();
    const companyUserIds = new Set<string>();

    for (const user of users) {
      if (user.role === 'INFLUENCER') {
        influencerUserIds.add(user.id);
      } else if (user.role === 'COMPANY') {
        companyUserIds.add(user.id);
      }
    }

    const influencerProfiles = new Map<string, any>();
    const companyProfiles = new Map<string, any>();

    if (influencerUserIds.size > 0) {
      const rows = await this.conversationRepository.manager
        .createQueryBuilder()
        .select([
          'profile.userId as userId',
          'profile.name as fullName',
          'profile.avatarUrl as avatarUrl',
          'profile.bio as bio',
        ])
        .from('influencer_profiles', 'profile')
        .where('profile.userId IN (:...userIds)', { userIds: Array.from(influencerUserIds) })
        .getRawMany();

      for (const row of rows) {
        influencerProfiles.set(row.userId, {
          fullName: row.fullName || 'Influencer',
          avatarUrl: row.avatarUrl,
          bio: row.bio,
        });
      }
    }

    if (companyUserIds.size > 0) {
      const rows = await this.conversationRepository.manager
        .createQueryBuilder()
        .select([
          'profile.userId as userId',
          'profile.name as fullName',
          'profile.avatarUrl as avatarUrl',
          'profile.description as bio',
        ])
        .from('company_profiles', 'profile')
        .where('profile.userId IN (:...userIds)', { userIds: Array.from(companyUserIds) })
        .getRawMany();

      for (const row of rows) {
        companyProfiles.set(row.userId, {
          fullName: row.fullName || 'Company',
          avatarUrl: row.avatarUrl,
          bio: row.bio,
        });
      }
    }

    // Attach user data and profiles to conversations
    for (const conversation of conversations) {
      const user1Data = userMap.get(conversation.user1Id);
      const user2Data = userMap.get(conversation.user2Id);

      if (user1Data) {
        conversation.user1 = user1Data;
        if (user1Data.role === 'INFLUENCER') {
          conversation.user1.profile =
            influencerProfiles.get(user1Data.id) ??
            (await this.getUserProfile(user1Data.id, user1Data.role));
        } else if (user1Data.role === 'COMPANY') {
          conversation.user1.profile =
            companyProfiles.get(user1Data.id) ??
            (await this.getUserProfile(user1Data.id, user1Data.role));
        }
      }

      if (user2Data) {
        conversation.user2 = user2Data;
        if (user2Data.role === 'INFLUENCER') {
          conversation.user2.profile =
            influencerProfiles.get(user2Data.id) ??
            (await this.getUserProfile(user2Data.id, user2Data.role));
        } else if (user2Data.role === 'COMPANY') {
          conversation.user2.profile =
            companyProfiles.get(user2Data.id) ??
            (await this.getUserProfile(user2Data.id, user2Data.role));
        }
      }
    }

    return conversations;
  }

  private async getUserProfile(userId: string, role: string): Promise<any> {
    try {
      if (role === 'INFLUENCER') {
        const profile = await this.conversationRepository.manager
          .createQueryBuilder()
          .select([
            'profile.name as fullName',
            'profile.avatarUrl as avatarUrl',
            'profile.bio as bio'
          ])
          .from('influencer_profiles', 'profile')
          .where('profile.userId = :userId', { userId })
          .getRawOne();
        
        if (profile) {
          return {
            fullName: profile.fullName || 'Influencer',
            avatarUrl: profile.avatarUrl,
            bio: profile.bio,
          };
        }
      } else if (role === 'COMPANY') {
        const profile = await this.conversationRepository.manager
          .createQueryBuilder()
          .select([
            'profile.name as fullName', // ✅ Changed from companyName
            'profile.avatarUrl as avatarUrl',
            'profile.description as bio'
          ])
          .from('company_profiles', 'profile')
          .where('profile.userId = :userId', { userId })
          .getRawOne();
        
        if (profile) {
          return {
            fullName: profile.fullName || 'Company',
            avatarUrl: profile.avatarUrl,
            bio: profile.bio,
          };
        }
      }
    } catch (error) {
      console.error('[MessagingService] Failed to load user profile:', error);
    }
    
    // Fallback
    return {
      fullName: role === 'INFLUENCER' ? 'Influencer' : 'Company',
      avatarUrl: null,
      bio: null,
    };
  }

  async getConversationMessages(
    conversationId: string,
    userId: string,
    limit = 50,
    before?: string,
  ): Promise<{ messages: Message[]; nextCursor: string | null }> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Verify user is part of conversation
    if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
      throw new NotFoundException('Conversation not found');
    }

    const where: any = { conversationId };

    // Normalize and cap page size to a safe range
    const safeLimit = Math.min(Math.max(limit || 50, 1), 100);

    // When a cursor is provided, only load messages older than that point
    if (before) {
      const beforeMessage = await this.messageRepository.findOne({
        where: { id: before, conversationId },
      });

      if (beforeMessage) {
        where.createdAt = LessThan(beforeMessage.createdAt);
      }
    }

    const messagesDesc = await this.messageRepository.find({
      where,
      relations: ['sender'],
      order: { createdAt: 'DESC' },
      take: safeLimit,
    });

    const messages = messagesDesc.reverse();
    const nextCursor =
      messagesDesc.length === safeLimit
        ? messagesDesc[messagesDesc.length - 1]?.id ?? null
        : null;

    return { messages, nextCursor };
  }

  private async checkMessagePermission(
    senderId: string,
    recipientId: string
  ): Promise<{ allowed: boolean; reason?: string }> {
    try {
      const settings = await this.settingsService.getSettings(recipientId);
      
      // Check if messaging is completely disabled
      if (settings.messagePermission === 'none') {
        return {
          allowed: false,
          reason: 'This user has disabled all messages'
        };
      }
      
      // Check if only connections can message
      if (settings.messagePermission === 'connections') {
        const connection = await this.connectionRepository.findOne({
          where: [
            { requesterId: senderId, recipientId, status: ConnectionStatus.ACCEPTED }, // ✅ Fixed from CONNECTED
            { requesterId: recipientId, recipientId: senderId, status: ConnectionStatus.ACCEPTED } // ✅ Fixed from CONNECTED
          ]
        });
        
        if (!connection) {
          return {
            allowed: false,
            reason: 'This user only accepts messages from connections'
          };
        }
      }
      
      // Default: everyone can message
      return { allowed: true };
    } catch (error) {
      console.error('Failed to check message permission:', error);
      // Default to allowing if check fails
      return { allowed: true };
    }
  }

  async createMessage(senderId: string, createMessageDto: CreateMessageDto): Promise<Message> {
    // Check permission first
    const permission = await this.checkMessagePermission(senderId, createMessageDto.recipientId);
    
    if (!permission.allowed) {
      throw new ForbiddenException(permission.reason || 'Cannot send message to this user');
    }
    
    const conversation = await this.getOrCreateConversation(senderId, createMessageDto.recipientId);

    const message = this.messageRepository.create({
      conversationId: conversation.id,
      senderId,
      content: createMessageDto.content,
      attachmentUrl: createMessageDto.attachmentUrl,
    });

    await this.messageRepository.save(message);

    // Update conversation - FIX: Use proper TypeORM update
    const isUser1 = conversation.user1Id === senderId;
    const updateData: any = {
      lastMessageAt: new Date(),
      lastMessage: createMessageDto.content.substring(0, 100), // ✅ Store first 100 chars as preview
    };
    
    // Increment unread count for the recipient
    if (isUser1) {
      updateData.unreadCount2 = conversation.unreadCount2 + 1;
    } else {
      updateData.unreadCount1 = conversation.unreadCount1 + 1;
    }
    
    await this.conversationRepository.update(conversation.id, updateData);

    // Automatically mark connection as "connected" when first message is sent
    await this.updateConnectionStatus(senderId, createMessageDto.recipientId);

    // Load sender relation
    const savedMessage = await this.messageRepository.findOne({
      where: { id: message.id },
      relations: ['sender'],
    });

    if (!savedMessage) {
      throw new NotFoundException('Message not found');
    }

    // ✅ Serialize dates to ISO strings
    return {
      ...savedMessage,
      readAt: savedMessage.readAt?.toISOString(),
      createdAt: savedMessage.createdAt.toISOString(),
    } as any;
  }

  private async updateConnectionStatus(user1Id: string, user2Id: string): Promise<void> {
    try {
      console.log('[MessagingService] Updating connection status:', {
        user1Id,
        user2Id,
        timestamp: new Date().toISOString()
      });
      
      // Find existing connection
      const connection = await this.connectionRepository.findOne({
        where: [
          { requesterId: user1Id, recipientId: user2Id },
          { requesterId: user2Id, recipientId: user1Id }
        ]
      });

      console.log('[MessagingService] Connection found:', {
        found: !!connection,
        currentStatus: connection?.status,
        connectionId: connection?.id
      });

      if (connection && connection.status !== ConnectionStatus.ACCEPTED) {
        // Update to accepted
        connection.status = ConnectionStatus.ACCEPTED; // ✅ Changed from CONNECTED
        await this.connectionRepository.save(connection);
        console.log('[MessagingService] Connection status updated to ACCEPTED');
      } else if (!connection) {
        // Create new connection if it doesn't exist
        const newConnection = this.connectionRepository.create({
          requesterId: user1Id,
          recipientId: user2Id,
          status: ConnectionStatus.ACCEPTED // ✅ Changed from CONNECTED
        });
        await this.connectionRepository.save(newConnection);
        console.log('[MessagingService] New connection created with ACCEPTED status');
      } else {
        console.log('[MessagingService] Connection already CONNECTED, no update needed');
      }
    } catch (error) {
      // Don't fail message sending if connection update fails
      console.error('[MessagingService] Failed to update connection status:', error);
    }
  }

  async markConversationAsRead(conversationId: string, userId: string): Promise<void> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Verify user is part of conversation
    if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
      throw new NotFoundException('Conversation not found');
    }

    const isUser1 = conversation.user1Id === userId;
    await this.conversationRepository.update(conversationId, {
      ...(isUser1 ? { unreadCount1: 0 } : { unreadCount2: 0 }),
    });

    // Mark all messages as read
    await this.messageRepository
      .createQueryBuilder()
      .update(Message)
      .set({ readAt: new Date() })
      .where('conversationId = :conversationId', { conversationId })
      .andWhere('senderId != :userId', { userId })
      .andWhere('readAt IS NULL')
      .execute();
  }

  async getTotalUnreadCount(userId: string): Promise<number> {
    const conversations = await this.conversationRepository
      .createQueryBuilder('conversation')
      .where('conversation.user1Id = :userId OR conversation.user2Id = :userId', { userId })
      .getMany();

    let total = 0;
    for (const conv of conversations) {
      if (conv.user1Id === userId) {
        total += conv.unreadCount1;
      } else {
        total += conv.unreadCount2;
      }
    }
    
    return total;
  }
}
