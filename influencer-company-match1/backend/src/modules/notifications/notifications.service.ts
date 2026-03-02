import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { User, UserRole } from '../auth/entities/user.entity';
import { InfluencerProfile } from '../auth/entities/influencer-profile.entity';
import { CompanyProfile } from '../auth/entities/company-profile.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(InfluencerProfile)
    private influencerProfileRepository: Repository<InfluencerProfile>,
    @InjectRepository(CompanyProfile)
    private companyProfileRepository: Repository<CompanyProfile>,
  ) {}

  async createNotification(data: {
    recipientId: string;
    senderId: string;
    type: NotificationType;
    content: string;
    metadata?: any;
  }) {
    const notification = this.notificationRepository.create(data);
    return this.notificationRepository.save(notification);
  }

  async create(data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: any;
  }) {
    const notification = this.notificationRepository.create({
      recipientId: data.userId,
      senderId: data.userId, // System notification
      type: data.type as NotificationType,
      content: data.message,
      metadata: { title: data.title, ...data.data },
    });
    return this.notificationRepository.save(notification);
  }

  async getNotifications(userId: string, limit = 20) {
    const notifications = await this.notificationRepository.find({
      where: { recipientId: userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });

    // Load sender data for each notification
    const notificationsWithSender = await Promise.all(
      notifications.map(async (notification) => {
        const sender = await this.userRepository.findOne({
          where: { id: notification.senderId },
        });

        if (!sender) {
          return { ...notification, sender: null };
        }

        // Load profile based on role
        let profile = null;
        if (sender.role === UserRole.INFLUENCER) {
          profile = await this.influencerProfileRepository.findOne({
            where: { userId: sender.id },
          });
        } else if (sender.role === UserRole.COMPANY) {
          profile = await this.companyProfileRepository.findOne({
            where: { userId: sender.id },
          });
        }

        return {
          ...notification,
          sender: {
            id: sender.id,
            email: sender.email,
            role: sender.role,
            influencerProfile: sender.role === UserRole.INFLUENCER && profile ? {
              name: profile.name,
              avatarUrl: profile.avatarUrl,
            } : undefined,
            companyProfile: sender.role === UserRole.COMPANY && profile ? {
              name: profile.name,
              logoUrl: profile.avatarUrl,
            } : undefined,
          },
        };
      })
    );

    return notificationsWithSender;
  }

  async getUnreadCount(userId: string) {
    return this.notificationRepository.count({
      where: { recipientId: userId, isRead: false },
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    await this.notificationRepository.update(
      { id: notificationId, recipientId: userId },
      { isRead: true },
    );
  }

  async markAllAsRead(userId: string) {
    await this.notificationRepository.update(
      { recipientId: userId, isRead: false },
      { isRead: true },
    );
  }
}
