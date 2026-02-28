import { Injectable, UnauthorizedException, ConflictException, Inject, forwardRef, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InfluencerProfile } from './entities/influencer-profile.entity';
import { CompanyProfile } from './entities/company-profile.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AccountLockoutService } from '../../common/guards/account-lockout.guard';
import { StripeConnectService } from '../payments/services/stripe-connect.service';
import { LandingService } from '../landing/landing.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private accountLockout: AccountLockoutService;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(InfluencerProfile)
    private influencerProfileRepository: Repository<InfluencerProfile>,
    @InjectRepository(CompanyProfile)
    private companyProfileRepository: Repository<CompanyProfile>,
    @Inject(forwardRef(() => StripeConnectService))
    private stripeConnectService: StripeConnectService,
    @Inject(forwardRef(() => LandingService))
    private landingService: LandingService,
  ) {
    this.accountLockout = new AccountLockoutService();
  }

  async register(registerDto: RegisterDto): Promise<{ user: User; token: string }> {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email }
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = this.userRepository.create({
      email: registerDto.email,
      password: hashedPassword,
      role: registerDto.role,
    });

    await this.userRepository.save(user);

    // Create profile based on role
    if (registerDto.role === 'INFLUENCER') {
      const profileData: any = {
        userId: user.id,
        name: registerDto.name, // ✅ Always set from registration
      };
      
      // Add role-specific fields from Step 2
      if (registerDto.niche) profileData.niche = registerDto.niche;
      if (registerDto.primaryPlatform) {
        profileData.platforms = [registerDto.primaryPlatform];
      }
      if (registerDto.audienceSizeRange) {
        profileData.audienceSize = this.mapAudienceSizeRange(registerDto.audienceSizeRange);
      }
      if (registerDto.location) profileData.location = registerDto.location;
      if (registerDto.bio) profileData.bio = registerDto.bio;
      
      const profile = this.influencerProfileRepository.create(profileData);
      await this.influencerProfileRepository.save(profile);
    } else if (registerDto.role === 'COMPANY') {
      const profileData: any = {
        userId: user.id,
        name: registerDto.name, // ✅ Always set from registration
      };
      
      // Add role-specific fields from Step 2
      if (registerDto.industry) profileData.industry = registerDto.industry;
      if (registerDto.companySize) profileData.companySize = registerDto.companySize;
      if (registerDto.budgetRange) {
        profileData.budget = this.mapBudgetRange(registerDto.budgetRange);
      }
      if (registerDto.location) profileData.location = registerDto.location;
      if (registerDto.bio) profileData.bio = registerDto.bio;
      
      const profile = this.companyProfileRepository.create(profileData);
      await this.companyProfileRepository.save(profile);
    }

    // Create Stripe account asynchronously (don't block registration)
    // This runs in the background and won't fail registration if Stripe is down
    this.stripeConnectService.createStripeAccountForUser(user).catch((error) => {
      console.error('Failed to create Stripe account during registration:', error);
    });

    // Log activity for landing page feed
    this.landingService.logActivity('signup', user.id, {
      role: registerDto.role,
      source: 'registration',
      timestamp: Date.now()
    }).catch((error) => {
      this.logger.warn('Failed to log signup activity:', error);
    });

    const token = this.generateToken(user);
    const userWithProfile = await this.getUserWithProfile(user.id);

    if (!userWithProfile) {
      throw new UnauthorizedException('Failed to create user');
    }

    delete userWithProfile.password;
    return { user: userWithProfile, token };
  }

  async login(loginDto: LoginDto): Promise<{ user: User; token: string }> {
    const email = loginDto.email.toLowerCase();

    // Check if account is locked
    if (this.accountLockout.isLocked(email)) {
      const lockedUntil = this.accountLockout.getLockedUntil(email);
      const minutesRemaining = lockedUntil 
        ? Math.ceil((lockedUntil - Date.now()) / 60000)
        : 30;
      
      throw new UnauthorizedException(
        `Account temporarily locked due to multiple failed login attempts. Please try again in ${minutesRemaining} minutes.`
      );
    }

    const user = await this.userRepository.findOne({
      where: { email: loginDto.email }
    });

    if (!user) {
      this.accountLockout.recordFailedAttempt(email);
      const remaining = this.accountLockout.getRemainingAttempts(email);
      
      if (remaining > 0) {
        throw new UnauthorizedException(
          `Invalid credentials. ${remaining} attempts remaining before account lockout.`
        );
      }
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password || '');

    if (!isPasswordValid) {
      this.accountLockout.recordFailedAttempt(email);
      const remaining = this.accountLockout.getRemainingAttempts(email);
      
      if (remaining > 0) {
        throw new UnauthorizedException(
          `Invalid credentials. ${remaining} attempts remaining before account lockout.`
        );
      }
      throw new UnauthorizedException('Invalid credentials');
    }

    // Successful login - clear lockout
    this.accountLockout.recordSuccessfulLogin(email);

    const token = this.generateToken(user);
    const userWithProfile = await this.getUserWithProfile(user.id);

    if (!userWithProfile) {
      throw new UnauthorizedException('User not found');
    }

    delete userWithProfile.password;
    return { user: userWithProfile, token };
  }

  async getCurrentUser(userId: string): Promise<User> {
    const user = await this.getUserWithProfile(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    delete user.password;
    return user;
  }

  private async getUserWithProfile(userId: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      return null;
    }

    // Load profile data based on role using unified method
    const unifiedProfile = await this.getUnifiedProfileData(user);
    
    // Merge unified profile data into user object
    Object.assign(user, unifiedProfile);

    return user;
  }

  /**
   * NEW: Unified Profile Data Method
   * Returns consistent profile structure regardless of role
   * This eliminates the need for fallback logic in frontend
   */
  private async getUnifiedProfileData(user: User): Promise<any> {
    if (user.role === 'INFLUENCER') {
      const profile = await this.influencerProfileRepository.findOne({
        where: { userId: user.id }
      });
      
      if (!profile) {
        return {
          name: '',
          bio: '',
          avatarUrl: user.avatarUrl || '',
          profileCompletionPercentage: 0,
          profileCompleted: false,
        };
      }

      // Standardized influencer profile structure
      return {
        name: profile.name || '',
        bio: profile.bio || '',
        niche: profile.niche || '',
        audienceSize: profile.audienceSize || 0,
        engagementRate: profile.engagementRate ? parseFloat(profile.engagementRate.toString()) : 0,
        platforms: profile.platforms || [],
        location: profile.location || '',
        avatarUrl: profile.avatarUrl || user.avatarUrl || '',
        portfolioUrl: profile.portfolioUrl || '',
        minBudget: profile.minBudget || 0,
        maxBudget: profile.maxBudget || 0,
        collaborationPreference: profile.collaborationPreference || '',
        profileCompletionPercentage: this.calculateProfileCompletion(user.role, profile),
        profileCompleted: this.calculateProfileCompletion(user.role, profile) === 100,
        // Unified profile object for consistent access
        profile: {
          name: profile.name || '',
          type: 'influencer',
          bio: profile.bio || '',
          niche: profile.niche || '',
          audienceSize: profile.audienceSize || 0,
          engagementRate: profile.engagementRate ? parseFloat(profile.engagementRate.toString()) : 0,
          platforms: profile.platforms || [],
          location: profile.location || '',
          avatarUrl: profile.avatarUrl || user.avatarUrl || '',
          portfolioUrl: profile.portfolioUrl || '',
        },
      };
    } else if (user.role === 'COMPANY') {
      const profile = await this.companyProfileRepository.findOne({
        where: { userId: user.id }
      });
      
      if (!profile) {
        return {
          name: '',
          bio: '',
          avatarUrl: user.avatarUrl || '',
          profileCompletionPercentage: 0,
          profileCompleted: false,
        };
      }

      // Standardized company profile structure
      return {
        name: profile.name || '', // ✅ Changed from companyName
        bio: profile.bio || '',
        industry: profile.industry || '',
        budget: profile.budget || 0,
        platforms: profile.platforms || [],
        location: profile.location || '',
        avatarUrl: profile.avatarUrl || user.avatarUrl || '',
        website: profile.website || '',
        companySize: profile.companySize || '',
        campaignType: profile.campaignType || [],
        preferredInfluencerNiches: profile.preferredInfluencerNiches || '',
        collaborationDuration: profile.collaborationDuration || '',
        minAudienceSize: profile.minAudienceSize || 0,
        maxAudienceSize: profile.maxAudienceSize || 0,
        profileCompletionPercentage: this.calculateProfileCompletion(user.role, profile),
        profileCompleted: this.calculateProfileCompletion(user.role, profile) === 100,
        // Unified profile object for consistent access
        profile: {
          name: profile.name || '', // ✅ Changed from companyName
          type: 'company',
          bio: profile.bio || '',
          industry: profile.industry || '',
          budget: profile.budget || 0,
          platforms: profile.platforms || [],
          location: profile.location || '',
          avatarUrl: profile.avatarUrl || user.avatarUrl || '',
          website: profile.website || '',
          companySize: profile.companySize || '',
          campaignType: profile.campaignType || [],
          preferredInfluencerNiches: profile.preferredInfluencerNiches || '',
          collaborationDuration: profile.collaborationDuration || '',
          minAudienceSize: profile.minAudienceSize || 0,
          maxAudienceSize: profile.maxAudienceSize || 0,
          verificationStatus: profile.verificationStatus || false,
        },
      };
    }

    return {
      name: '',
      bio: '',
      avatarUrl: user.avatarUrl || '',
      profileCompletionPercentage: 0,
      profileCompleted: false,
    };
  }

  private calculateProfileCompletion(role: string, profile: any): number {
    if (!profile) return 0;

    const requiredFields = role === 'INFLUENCER' 
      ? ['name', 'niche', 'bio', 'audienceSize', 'platforms', 'location']
      : ['name', 'industry', 'bio', 'budget', 'location']; // ✅ Changed from companyName to name
    
    const filledFields = requiredFields.filter(field => {
      const value = profile[field];
      if (value === null || value === undefined) return false;
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'string') return value.trim().length > 0;
      if (typeof value === 'number') return value > 0;
      return true;
    });
    
    return Math.round((filledFields.length / requiredFields.length) * 100);
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Update profile based on role
    if (user.role === 'INFLUENCER') {
      let profile = await this.influencerProfileRepository.findOne({
        where: { userId: user.id }
      });
      
      if (!profile) {
        profile = this.influencerProfileRepository.create({ userId: user.id });
      }

      // Update influencer-specific fields
      if (updateProfileDto.name !== undefined) profile.name = updateProfileDto.name;
      if (updateProfileDto.niche !== undefined) profile.niche = updateProfileDto.niche;
      if (updateProfileDto.bio !== undefined) profile.bio = updateProfileDto.bio;
      if (updateProfileDto.audienceSize !== undefined) profile.audienceSize = updateProfileDto.audienceSize;
      if (updateProfileDto.engagementRate !== undefined) profile.engagementRate = updateProfileDto.engagementRate;
      if (updateProfileDto.location !== undefined) profile.location = updateProfileDto.location;
      if (updateProfileDto.platforms !== undefined) profile.platforms = updateProfileDto.platforms;
      if (updateProfileDto.minBudget !== undefined) profile.minBudget = updateProfileDto.minBudget;
      if (updateProfileDto.maxBudget !== undefined) profile.maxBudget = updateProfileDto.maxBudget;
      if (updateProfileDto.portfolioUrl !== undefined) profile.portfolioUrl = updateProfileDto.portfolioUrl;
      if (updateProfileDto.collaborationPreference !== undefined) profile.collaborationPreference = updateProfileDto.collaborationPreference;
      if (updateProfileDto.avatarUrl !== undefined) profile.avatarUrl = updateProfileDto.avatarUrl;

      await this.influencerProfileRepository.save(profile);
      
      // Also update user table avatarUrl
      if (updateProfileDto.avatarUrl !== undefined) {
        await this.syncAvatarUrl(userId, updateProfileDto.avatarUrl); // ✅ Use helper method
      }
    } else if (user.role === 'COMPANY') {
      let profile = await this.companyProfileRepository.findOne({
        where: { userId: user.id }
      });
      
      if (!profile) {
        profile = this.companyProfileRepository.create({ userId: user.id });
      }

      // Update company-specific fields
      if (updateProfileDto.name !== undefined) profile.name = updateProfileDto.name; // ✅ Changed from companyName
      if (updateProfileDto.bio !== undefined) profile.bio = updateProfileDto.bio;
      if (updateProfileDto.industry !== undefined) profile.industry = updateProfileDto.industry;
      if (updateProfileDto.budget !== undefined) profile.budget = updateProfileDto.budget;
      if (updateProfileDto.location !== undefined) profile.location = updateProfileDto.location;
      if (updateProfileDto.platforms !== undefined) profile.platforms = updateProfileDto.platforms;
      if (updateProfileDto.companySize !== undefined) profile.companySize = updateProfileDto.companySize;
      if (updateProfileDto.website !== undefined) profile.website = updateProfileDto.website;
      if (updateProfileDto.minAudienceSize !== undefined) profile.minAudienceSize = updateProfileDto.minAudienceSize;
      if (updateProfileDto.maxAudienceSize !== undefined) profile.maxAudienceSize = updateProfileDto.maxAudienceSize;
      if (updateProfileDto.avatarUrl !== undefined) profile.avatarUrl = updateProfileDto.avatarUrl;
      
      // Handle campaignType array
      if (updateProfileDto.campaignType !== undefined) {
        profile.campaignType = updateProfileDto.campaignType;
      }
      
      // Handle preferredInfluencerNiches (can be string or array)
      if (updateProfileDto.preferredInfluencerNiches !== undefined) {
        profile.preferredInfluencerNiches = updateProfileDto.preferredInfluencerNiches;
      } else if (updateProfileDto.preferredNiches !== undefined) {
        profile.preferredInfluencerNiches = updateProfileDto.preferredNiches.join(',');
      }
      
      // Handle collaborationDuration
      if (updateProfileDto.collaborationDuration !== undefined) {
        profile.collaborationDuration = updateProfileDto.collaborationDuration;
      }

      await this.companyProfileRepository.save(profile);
      
      // Also update user table avatarUrl
      if (updateProfileDto.avatarUrl !== undefined) {
        await this.syncAvatarUrl(userId, updateProfileDto.avatarUrl); // ✅ Use helper method
      }
    }

    const updatedUser = await this.getUserWithProfile(userId);
    
    if (!updatedUser) {
      throw new UnauthorizedException('User not found');
    }

    delete updatedUser.password;
    
    // Broadcast profile update via WebSocket
    try {
      // WebSocket broadcasting is optional - don't fail if not available
      // This will be handled by the messaging gateway when it's available
    } catch (error) {
      // Don't fail the update if broadcast fails
      console.error('Failed to broadcast profile update:', error);
    }
    
    return updatedUser;
  }

  async completeProfile(userId: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Mark profile as completed
    user.profileCompleted = true;
    user.profileCompletionPercentage = 100;
    await this.userRepository.save(user);

    return { message: 'Profile completed successfully' };
  }

  async findById(userId: string): Promise<User | null> {
    const user = await this.getUserWithProfile(userId);
    
    if (user) {
      delete user.password;
    }
    
    return user;
  }

  private generateToken(user: User): string {
    const jwtSecret = process.env.JWT_SECRET;
    
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, jwtSecret, {
      expiresIn: '7d',
    });
  }

  async verifyToken(token: string): Promise<any> {
    const jwtSecret = process.env.JWT_SECRET;
    
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }

    try {
      return jwt.verify(token, jwtSecret) as any;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  /**
   * ✅ Helper method to sync avatar URL across all three tables
   */
  private async syncAvatarUrl(userId: string, avatarUrl: string): Promise<void> {
    try {
      // Update user table
      await this.userRepository.update(userId, { avatarUrl });
      
      // Update influencer profile if exists
      await this.influencerProfileRepository.update({ userId }, { avatarUrl });
      
      // Update company profile if exists
      await this.companyProfileRepository.update({ userId }, { avatarUrl });
      
      console.log('[AuthService] Avatar URL synced across all tables for user:', userId);
    } catch (error) {
      console.error('[AuthService] Failed to sync avatar URL:', error);
      throw error;
    }
  }

  /**
   * Map audience size range to numeric value (midpoint)
   */
  private mapAudienceSizeRange(range?: string): number | null {
    if (!range) return null;
    
    const mapping: { [key: string]: number } = {
      '<10K': 5000,
      '10K-50K': 30000,
      '50K-100K': 75000,
      '100K-500K': 300000,
      '500K+': 750000,
    };
    
    return mapping[range] || null;
  }

  /**
   * Map budget range to numeric value (midpoint)
   */
  private mapBudgetRange(range?: string): number | null {
    if (!range) return null;
    
    const mapping: { [key: string]: number } = {
      '<$1K': 500,
      '$1K-$5K': 3000,
      '$5K-$10K': 7500,
      '$10K-$50K': 30000,
      '$50K+': 75000,
    };
    
    return mapping[range] || null;
  }
}
