import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContentFlag } from '../entities/content-flag.entity';
import { UserBan } from '../entities/user-ban.entity';
import { User } from '../../auth/entities/user.entity';
import { FeedPost } from '../../feed/entities/feed-post.entity';
import { PostComment } from '../../feed/entities/post-comment.entity';

@Injectable()
export class ModerationService {
  constructor(
    @InjectRepository(ContentFlag)
    private contentFlagRepository: Repository<ContentFlag>,
    @InjectRepository(UserBan)
    private userBanRepository: Repository<UserBan>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(FeedPost)
    private feedPostRepository: Repository<FeedPost>,
    @InjectRepository(PostComment)
    private commentRepository: Repository<PostComment>,
  ) {}

  async getFlaggedContent(filters?: {
    status?: string;
    contentType?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Number(filters?.page) || 1;
    const limit = Number(filters?.limit) || 20;
    const skip = (page - 1) * limit;

    // Ensure skip and limit are valid numbers
    if (isNaN(skip) || isNaN(limit) || skip < 0 || limit < 1) {
      return {
        data: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      };
    }

    const query = this.contentFlagRepository
      .createQueryBuilder('flag')
      .leftJoinAndSelect('flag.reporter', 'reporter')
      .leftJoinAndSelect('flag.reviewedBy', 'reviewedBy')
      .orderBy('flag.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (filters?.status) {
      query.andWhere('flag.status = :status', { status: filters.status });
    }

    if (filters?.contentType) {
      query.andWhere('flag.contentType = :contentType', {
        contentType: filters.contentType,
      });
    }

    const [flags, total] = await query.getManyAndCount();

    // Fetch content details for each flag
    const flagsWithContent = await Promise.all(
      flags.map(async (flag) => {
        let content = null;
        try {
          if (flag.contentType === 'POST') {
            content = await this.feedPostRepository.findOne({
              where: { id: flag.contentId },
              relations: ['author'],
            });
          } else if (flag.contentType === 'COMMENT') {
            content = await this.commentRepository.findOne({
              where: { id: flag.contentId },
              relations: ['author'],
            });
          }
        } catch (error) {
          console.error('Error fetching content:', error);
        }

        return {
          ...flag,
          content,
        };
      }),
    );

    return {
      data: flagsWithContent,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async reviewFlag(
    flagId: string,
    adminId: string,
    decision: 'APPROVED' | 'REJECTED' | 'REMOVED',
    notes?: string,
  ) {
    const flag = await this.contentFlagRepository.findOne({
      where: { id: flagId },
    });

    if (!flag) {
      throw new NotFoundException('Flag not found');
    }

    flag.status = decision;
    flag.reviewedById = adminId;
    flag.reviewedAt = new Date();
    flag.reviewNotes = notes;

    // If content is removed, take action
    if (decision === 'REMOVED') {
      await this.removeContent(flag.contentType, flag.contentId);
    }

    return await this.contentFlagRepository.save(flag);
  }

  private async removeContent(contentType: string, contentId: string) {
    try {
      if (contentType === 'POST') {
        await this.feedPostRepository.delete(contentId);
      } else if (contentType === 'COMMENT') {
        await this.commentRepository.delete(contentId);
      }
    } catch (error) {
      console.error('Error removing content:', error);
    }
  }

  async getReportedUsers(filters?: { page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    // Get users with multiple reports
    const query = this.contentFlagRepository
      .createQueryBuilder('flag')
      .select('flag.reporterId', 'userId')
      .addSelect('COUNT(*)', 'reportCount')
      .groupBy('flag.reporterId')
      .having('COUNT(*) > 0')
      .orderBy('reportCount', 'DESC')
      .offset(skip)
      .limit(limit);

    const results = await query.getRawMany();

    const userIds = results.map((r) => r.userId);
    const users = await this.userRepository.findByIds(userIds);

    const usersWithReports = results.map((result) => {
      const user = users.find((u) => u.id === result.userId);
      return {
        user,
        reportCount: parseInt(result.reportCount),
      };
    });

    return {
      data: usersWithReports,
      page,
      limit,
    };
  }

  async banUser(
    userId: string,
    adminId: string,
    reason: string,
    type: 'TEMPORARY' | 'PERMANENT',
    expiresAt?: Date,
    notes?: string,
  ) {
    // Check if user is already banned
    const existingBan = await this.userBanRepository.findOne({
      where: { userId, isActive: true },
    });

    if (existingBan) {
      throw new Error('User is already banned');
    }

    const ban = this.userBanRepository.create({
      userId,
      bannedById: adminId,
      reason,
      type,
      expiresAt,
      notes,
      isActive: true,
    });

    // Deactivate user account
    await this.userRepository.update(userId, { isActive: false });

    return await this.userBanRepository.save(ban);
  }

  async unbanUser(userId: string) {
    const ban = await this.userBanRepository.findOne({
      where: { userId, isActive: true },
    });

    if (!ban) {
      throw new NotFoundException('Active ban not found');
    }

    ban.isActive = false;
    await this.userBanRepository.save(ban);

    // Reactivate user account
    await this.userRepository.update(userId, { isActive: true });

    return { message: 'User unbanned successfully' };
  }

  async getBannedUsers(filters?: { page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const [bans, total] = await this.userBanRepository.findAndCount({
      where: { isActive: true },
      relations: ['user', 'bannedBy'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data: bans,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getModerationStats() {
    const pendingFlags = await this.contentFlagRepository.count({
      where: { status: 'PENDING' },
    });

    const totalFlags = await this.contentFlagRepository.count();

    const activeBans = await this.userBanRepository.count({
      where: { isActive: true },
    });

    const flagsByType = await this.contentFlagRepository
      .createQueryBuilder('flag')
      .select('flag.contentType', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('flag.contentType')
      .getRawMany();

    const flagsByReason = await this.contentFlagRepository
      .createQueryBuilder('flag')
      .select('flag.reason', 'reason')
      .addSelect('COUNT(*)', 'count')
      .groupBy('flag.reason')
      .getRawMany();

    return {
      pendingFlags,
      totalFlags,
      activeBans,
      flagsByType,
      flagsByReason,
    };
  }

  async createFlag(data: {
    contentType: string;
    contentId: string;
    reporterId: string;
    reason: string;
    description?: string;
  }) {
    const flag = this.contentFlagRepository.create(data);
    return await this.contentFlagRepository.save(flag);
  }
}
