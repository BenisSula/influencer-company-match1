import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { User, UserRole } from '../../auth/entities/user.entity';
import { InfluencerProfile } from '../../auth/entities/influencer-profile.entity';
import { CompanyProfile } from '../../auth/entities/company-profile.entity';
import { AuditLog, AuditAction } from '../entities/audit-log.entity';
import { CacheService } from '../../../cache/cache.service';
import * as bcrypt from 'bcrypt';

export interface UserFilters {
  role?: UserRole;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  tenantId?: string; // Add tenant filtering
}

@Injectable()
export class UserManagementService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(InfluencerProfile)
    private influencerProfileRepository: Repository<InfluencerProfile>,
    @InjectRepository(CompanyProfile)
    private companyProfileRepository: Repository<CompanyProfile>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
    private cacheService: CacheService,
  ) {}

  async findAll(filters: UserFilters) {
    const { role, isActive, search, page = 1, limit = 20, tenantId } = filters;
    const query = this.userRepository.createQueryBuilder('user');

    // TODO: Step 3.2 - Tenant isolation will be implemented when tenantId field is added to User entity
    // For now, skip tenant filtering as the column doesn't exist yet
    // if (tenantId && tenantId !== 'default') {
    //   query.andWhere('user.tenantId = :tenantId', { tenantId });
    // }

    if (role) {
      query.andWhere('user.role = :role', { role });
    }

    if (isActive !== undefined) {
      query.andWhere('user.isActive = :isActive', { isActive });
    }

    if (search) {
      query.andWhere('(user.email LIKE :search)', {
        search: `%${search}%`,
      });
    }

    query
      .orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [users, total] = await query.getManyAndCount();

    // Load profiles for each user
    const usersWithProfiles = await Promise.all(
      users.map(async (user) => {
        let profile = null;
        if (user.role === UserRole.INFLUENCER) {
          profile = await this.influencerProfileRepository.findOne({
            where: { userId: user.id },
          });
        } else if (user.role === UserRole.COMPANY) {
          profile = await this.companyProfileRepository.findOne({
            where: { userId: user.id },
          });
        }
        return { ...user, profile };
      }),
    );

    return {
      data: usersWithProfiles,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    let profile = null;
    if (user.role === UserRole.INFLUENCER) {
      profile = await this.influencerProfileRepository.findOne({
        where: { userId: user.id },
      });
    } else if (user.role === UserRole.COMPANY) {
      profile = await this.companyProfileRepository.findOne({
        where: { userId: user.id },
      });
    }

    return { ...user, profile };
  }

  async getUserProfile(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    let profileData = null;
    let avatarUrl = user.avatarUrl; // Start with user's avatar as fallback
    
    if (user.role === UserRole.INFLUENCER) {
      const influencerProfile = await this.influencerProfileRepository.findOne({
        where: { userId: user.id },
      });
      if (influencerProfile) {
        profileData = {
          type: 'influencer',
          fullName: influencerProfile.name,
          ...influencerProfile,
        };
        // Prioritize profile avatar over user avatar
        if (influencerProfile.avatarUrl) {
          avatarUrl = influencerProfile.avatarUrl;
        }
      }
    } else if (user.role === UserRole.COMPANY) {
      const companyProfile = await this.companyProfileRepository.findOne({
        where: { userId: user.id },
      });
      if (companyProfile) {
        profileData = {
          type: 'company',
          fullName: companyProfile.name,
          ...companyProfile,
        };
        // Prioritize profile avatar over user avatar
        if (companyProfile.avatarUrl) {
          avatarUrl = companyProfile.avatarUrl;
        }
      }
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      profileCompleted: user.profileCompleted,
      profileCompletionPercentage: user.profileCompletionPercentage,
      emailVerified: user.emailVerified,
      avatarUrl: avatarUrl, // This now contains the prioritized avatar
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      profileData,
    };
  }

  async updateUser(id: string, updateData: Partial<User>, adminUserId: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const oldData = { ...user };
    Object.assign(user, updateData);
    const updatedUser = await this.userRepository.save(user);

    // Log the change
    await this.logAction(adminUserId, AuditAction.UPDATE, 'User', id, {
      before: oldData,
      after: updatedUser,
    });

    // Invalidate analytics cache
    await this.invalidateAnalyticsCache();

    return updatedUser;
  }

  async toggleUserStatus(id: string, adminUserId: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isActive = !user.isActive;
    const updatedUser = await this.userRepository.save(user);

    await this.logAction(
      adminUserId,
      user.isActive ? AuditAction.UNBAN : AuditAction.BAN,
      'User',
      id,
      { isActive: user.isActive },
    );

    // Invalidate analytics cache
    await this.invalidateAnalyticsCache();

    return updatedUser;
  }

  async deleteUser(id: string, adminUserId: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.remove(user);

    await this.logAction(adminUserId, AuditAction.DELETE, 'User', id, {
      deletedUser: user.email,
    });

    // Invalidate analytics cache
    await this.invalidateAnalyticsCache();

    return { message: 'User deleted successfully' };
  }

  async bulkDelete(ids: string[], adminUserId: string) {
    const users = await this.userRepository.find({ where: { id: In(ids) } });
    if (users.length === 0) {
      throw new NotFoundException('No users found');
    }

    await this.userRepository.remove(users);

    await this.logAction(adminUserId, AuditAction.DELETE, 'User', 'bulk', {
      deletedCount: users.length,
      userIds: ids,
    });

    // Invalidate analytics cache
    await this.invalidateAnalyticsCache();

    return { message: `${users.length} users deleted successfully` };
  }

  async bulkUpdateStatus(ids: string[], isActive: boolean, adminUserId: string) {
    await this.userRepository.update({ id: In(ids) }, { isActive });

    await this.logAction(adminUserId, AuditAction.UPDATE, 'User', 'bulk', {
      updatedCount: ids.length,
      userIds: ids,
      isActive,
    });

    // Invalidate analytics cache
    await this.invalidateAnalyticsCache();

    return { message: `${ids.length} users updated successfully` };
  }

  // Helper method to invalidate analytics cache
  private async invalidateAnalyticsCache() {
    // Note: Redis del() doesn't support wildcards
    // For now, we'll just flush specific known keys
    // In production, consider using Redis SCAN or a cache key registry
    try {
      // Just skip cache invalidation for now - cache will expire naturally
      // Or implement proper key tracking if needed
    } catch (error) {
      // Silently fail - cache invalidation is not critical
    }
  }

  async exportUsers(filters: UserFilters) {
    const { data } = await this.findAll({ ...filters, limit: 10000 });
    
    return data.map((user) => {
      const profile = user.profile;
      return {
        id: user.id,
        email: user.email,
        fullName: profile?.fullName || profile?.name || '',
        role: user.role,
        status: user.isActive ? 'Active' : 'Inactive',
        profileCompleted: user.profileCompleted ? 'Yes' : 'No',
        emailVerified: user.emailVerified ? 'Yes' : 'No',
        // Profile-specific fields
        bio: profile?.bio || profile?.description || '',
        location: profile?.location || '',
        website: profile?.website || '',
        // Influencer-specific fields
        platforms: profile?.platforms ? JSON.stringify(profile.platforms) : '',
        totalFollowers: profile?.totalFollowers || profile?.followers || 0,
        // Company-specific fields
        industry: profile?.industry || '',
        companySize: profile?.companySize || '',
        budget: profile?.budget || '',
        // Timestamps
        createdAt: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : '',
        lastLoginAt: 'N/A', // Field not yet implemented in User entity
        updatedAt: user.updatedAt ? new Date(user.updatedAt).toISOString().split('T')[0] : '',
      };
    });
  }

  async createUser(createData: any, adminUserId: string, tenantId?: string) {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createData.email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Create user with default password
    const defaultPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const user = this.userRepository.create({
      email: createData.email,
      password: hashedPassword,
      role: createData.role || UserRole.INFLUENCER,
      isActive: createData.isActive ?? true,
      profileCompleted: false,
      // TODO: Add tenantId when field is added to User entity
    });

    const savedUser = await this.userRepository.save(user);

    // Create profile based on role
    if (savedUser.role === UserRole.INFLUENCER) {
      const profile = this.influencerProfileRepository.create({
        userId: savedUser.id,
        name: createData.fullName || '',
        bio: '',
        platforms: [],
      });
      await this.influencerProfileRepository.save(profile);
    } else if (savedUser.role === UserRole.COMPANY) {
      const profile = this.companyProfileRepository.create({
        userId: savedUser.id,
        name: createData.fullName || '',
        description: '',
        industry: '',
      });
      await this.companyProfileRepository.save(profile);
    }

    // Log audit
    const auditLog = this.auditLogRepository.create({
      adminUserId,
      action: AuditAction.CREATE,
      entityType: 'User',
      entityId: savedUser.id,
      changes: { email: savedUser.email, role: savedUser.role },
    });
    await this.auditLogRepository.save(auditLog);

    // Invalidate cache
    await this.invalidateAnalyticsCache();

    return {
      ...savedUser,
      temporaryPassword: defaultPassword, // Return this so admin can share with user
    };
  }

  async getUserStats(tenantId?: string) {
    // Build base query with optional tenant filtering
    // TODO: Step 3.2 - Implement tenant filtering when tenantId is added to User entity
    const buildQuery = (baseQuery: any) => {
      // For now, just return the base query without tenant filtering
      return baseQuery;
    };

    const [
      totalUsers,
      activeUsers,
      influencers,
      companies,
      admins,
      newUsersThisMonth,
    ] = await Promise.all([
      // TODO: Step 3.2 - Add tenant filtering when tenantId field is added to User entity
      this.userRepository.count(),
      this.userRepository.count({ where: { isActive: true } }),
      this.userRepository.count({ where: { role: UserRole.INFLUENCER } }),
      this.userRepository.count({ where: { role: UserRole.COMPANY } }),
      this.userRepository.count({ where: { role: UserRole.ADMIN } }),
      buildQuery(
        this.userRepository
          .createQueryBuilder('user')
          .where('user.createdAt >= :date', {
            date: new Date(new Date().setDate(1)),
          })
      ).getCount(),
    ]);

    return {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      influencers,
      companies,
      admins,
      newUsersThisMonth,
    };
  }

  async getUserActivityLogs(userId: string, page: number = 1, limit: number = 50) {
    const [logs, total] = await this.auditLogRepository.findAndCount({
      where: { entityId: userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['adminUser'],
    });

    return {
      data: logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateUserProfile(id: string, updateData: any, adminUserId: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const oldData: any = { user: { ...user } };

    // Update user table fields
    if (updateData.fullName !== undefined) {
      // Note: fullName is stored in profile, not user table
      // We'll handle this in profile update
    }
    if (updateData.email !== undefined) {
      user.email = updateData.email;
    }
    if (updateData.role !== undefined) {
      user.role = updateData.role;
    }
    if (updateData.isActive !== undefined) {
      user.isActive = updateData.isActive;
    }
    if (updateData.emailVerified !== undefined) {
      user.emailVerified = updateData.emailVerified;
    }
    if (updateData.avatarUrl !== undefined) {
      user.avatarUrl = updateData.avatarUrl;
    }

    await this.userRepository.save(user);

    // Update profile based on role
    let profile = null;
    if (user.role === UserRole.INFLUENCER) {
      profile = await this.influencerProfileRepository.findOne({
        where: { userId: user.id },
      });

      if (profile) {
        oldData.profile = { ...profile };

        // Update influencer profile fields
        if (updateData.fullName !== undefined) profile.name = updateData.fullName;
        if (updateData.bio !== undefined) profile.bio = updateData.bio;
        if (updateData.location !== undefined) profile.location = updateData.location;
        if (updateData.avatarUrl !== undefined) profile.avatarUrl = updateData.avatarUrl;
        if (updateData.niche !== undefined) profile.niche = updateData.niche;
        if (updateData.audienceSize !== undefined) profile.audienceSize = updateData.audienceSize;
        if (updateData.engagementRate !== undefined) profile.engagementRate = updateData.engagementRate;
        if (updateData.platforms !== undefined) profile.platforms = updateData.platforms;
        if (updateData.minBudget !== undefined) profile.minBudget = updateData.minBudget;
        if (updateData.maxBudget !== undefined) profile.maxBudget = updateData.maxBudget;
        if (updateData.portfolioUrl !== undefined) profile.portfolioUrl = updateData.portfolioUrl;
        if (updateData.collaborationPreference !== undefined) profile.collaborationPreference = updateData.collaborationPreference;
        if (updateData.contentType !== undefined) profile.contentType = updateData.contentType;
        if (updateData.verificationStatus !== undefined) profile.verificationStatus = updateData.verificationStatus;

        await this.influencerProfileRepository.save(profile);
      }
    } else if (user.role === UserRole.COMPANY) {
      profile = await this.companyProfileRepository.findOne({
        where: { userId: user.id },
      });

      if (profile) {
        oldData.profile = { ...profile };

        // Update company profile fields
        if (updateData.fullName !== undefined) profile.name = updateData.fullName;
        if (updateData.bio !== undefined) profile.bio = updateData.bio;
        if (updateData.description !== undefined) profile.description = updateData.description;
        if (updateData.location !== undefined) profile.location = updateData.location;
        if (updateData.website !== undefined) profile.website = updateData.website;
        if (updateData.avatarUrl !== undefined) profile.avatarUrl = updateData.avatarUrl;
        if (updateData.industry !== undefined) profile.industry = updateData.industry;
        if (updateData.budget !== undefined) profile.budget = updateData.budget;
        if (updateData.companySize !== undefined) profile.companySize = updateData.companySize;
        if (updateData.minAudienceSize !== undefined) profile.minAudienceSize = updateData.minAudienceSize;
        if (updateData.maxAudienceSize !== undefined) profile.maxAudienceSize = updateData.maxAudienceSize;
        if (updateData.campaignType !== undefined) profile.campaignType = updateData.campaignType;
        if (updateData.preferredInfluencerNiches !== undefined) profile.preferredInfluencerNiches = updateData.preferredInfluencerNiches;
        if (updateData.collaborationDuration !== undefined) profile.collaborationDuration = updateData.collaborationDuration;
        if (updateData.platforms !== undefined) profile.platforms = updateData.platforms;
        if (updateData.verificationStatus !== undefined) profile.verificationStatus = updateData.verificationStatus;

        await this.companyProfileRepository.save(profile);
      }
    }

    // Log the change
    await this.logAction(adminUserId, AuditAction.UPDATE, 'UserProfile', id, {
      before: oldData,
      after: { user, profile },
    });

    // Invalidate analytics cache
    await this.invalidateAnalyticsCache();

    // Return updated user with profile
    return this.getUserProfile(id);
  }

  private async logAction(
    adminUserId: string,
    action: AuditAction,
    entityType: string,
    entityId: string,
    changes?: Record<string, any>,
  ) {
    const log = this.auditLogRepository.create({
      adminUserId,
      action,
      entityType,
      entityId,
      changes,
    });
    await this.auditLogRepository.save(log);
  }
}
